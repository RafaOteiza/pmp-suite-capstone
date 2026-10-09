import "dotenv/config";
import assert from "node:assert/strict";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

async function expectRejectedByDatabase(savepoint, statement, params = []) {
  await client.query(`SAVEPOINT ${savepoint}`);
  try {
    await client.query(statement, params);
    assert.fail("La base de datos aceptó una modificación histórica o duplicada");
  } catch (error) {
    await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
    return error.code;
  }
}

try {
  await client.query("BEGIN");
  const context = await client.query(`
    SELECT
      (SELECT id FROM pmp.usuarios WHERE rol='logistica' AND activo=TRUE LIMIT 1) logistica_id,
      (SELECT id FROM pmp.usuarios WHERE rol='tecnico_terreno' AND activo=TRUE LIMIT 1) terreno_id,
      (SELECT id FROM pmp.usuarios WHERE rol='qa' AND activo=TRUE LIMIT 1) qa_id,
      (SELECT ppu FROM pmp.buses ORDER BY ppu LIMIT 1) bus,
      (SELECT terminal_id FROM pmp.terminal_pst ORDER BY terminal_id,pst_codigo LIMIT 1) terminal_id,
      (SELECT pst_codigo FROM pmp.terminal_pst ORDER BY terminal_id,pst_codigo LIMIT 1) pst_codigo,
      (SELECT codigo_os FROM pmp.ordenes_servicio WHERE estado_id=7 ORDER BY actualizado_en DESC LIMIT 1) codigo_os,
      (SELECT tipo_equipo FROM pmp.ordenes_servicio WHERE estado_id=7 ORDER BY actualizado_en DESC LIMIT 1) tipo_equipo,
      (SELECT COALESCE(validador_serie,consola_serie) FROM pmp.ordenes_servicio WHERE estado_id=7 ORDER BY actualizado_en DESC LIMIT 1) serie
  `);
  const c = context.rows[0];
  for (const [key, value] of Object.entries(c)) assert.ok(value, `Falta contexto de prueba: ${key}`);

  await client.query(
    `INSERT INTO pmp.bridges (
       codigo_bridge, estado, origen, tipo_equipo, equipo_preparado_serie,
       motivo, tecnico_terreno_id, creado_por, asignado_por,
       equipo_retirado_serie, equipo_instalado_serie, bus_confirmado,
       terminal_confirmada_id, pst_confirmado_codigo, intervencion_en,
       observacion_terreno, resultado, completado_en
     ) VALUES (
       'BR-VERIFY-000001','COMPLETADA','PMP',$1,$2,'Verificación transaccional',
       $3,$4,$4,$2,$2,$5,$6,$7,now(),'Verificación', 'EXITOSA',now()
     )`,
    [c.tipo_equipo, c.serie, c.terreno_id, c.logistica_id, c.bus, c.terminal_id, c.pst_codigo]
  );
  await client.query(
    `INSERT INTO pmp.bridge_mantenimiento (bridge_codigo,codigo_os)
     VALUES ('BR-VERIFY-000001',$1)`,
    [c.codigo_os]
  );
  await client.query(
    `INSERT INTO pmp.instalaciones_equipos (
       bridge_codigo,tipo_equipo,equipo_retirado_serie,equipo_instalado_serie,
       bus_ppu,terminal_id,pst_codigo,tecnico_terreno_id,intervencion_en,observacion
     ) VALUES ('BR-VERIFY-000001',$1,$2,$2,$3,$4,$5,$6,now(),'Verificación')`,
    [c.tipo_equipo, c.serie, c.bus, c.terminal_id, c.pst_codigo, c.terreno_id]
  );
  await client.query(
    `INSERT INTO pmp.flujo_eventos
       (bridge_codigo,codigo_os,tipo,usuario_id,rol,metadata)
     VALUES ('BR-VERIFY-000001',$1,'VERIFICACION',$2,'logistica','{}')`,
    [c.codigo_os, c.logistica_id]
  );
  const qa = await client.query(
    `INSERT INTO pmp.qa_inspecciones
       (codigo_os,qa_usuario_id,resultado,comentario,certificacion)
     VALUES ($1,$2,'APROBADO','Verificación','VERIFY') RETURNING id`,
    [c.codigo_os, c.qa_id]
  );

  const immutableBridgeCode = await expectRejectedByDatabase(
    "immutable_bridge",
    "UPDATE pmp.bridges SET observacion_terreno='alterada' WHERE codigo_bridge='BR-VERIFY-000001'"
  );
  const immutableQaCode = await expectRejectedByDatabase(
    "immutable_qa",
    "UPDATE pmp.qa_inspecciones SET comentario='alterado' WHERE id=$1",
    [qa.rows[0].id]
  );
  const duplicateLinkCode = await expectRejectedByDatabase(
    "duplicate_link",
    "INSERT INTO pmp.bridge_mantenimiento (bridge_codigo,codigo_os) VALUES ('BR-VERIFY-000001',$1)",
    [c.codigo_os]
  );

  const counts = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM pmp.bridges WHERE codigo_bridge='BR-VERIFY-000001') bridges,
      (SELECT COUNT(*)::int FROM pmp.bridge_mantenimiento WHERE bridge_codigo='BR-VERIFY-000001') relaciones,
      (SELECT COUNT(*)::int FROM pmp.instalaciones_equipos WHERE bridge_codigo='BR-VERIFY-000001') instalaciones,
      (SELECT COUNT(*)::int FROM pmp.flujo_eventos WHERE bridge_codigo='BR-VERIFY-000001') eventos
  `);
  assert.deepEqual(counts.rows[0], { bridges: 1, relaciones: 1, instalaciones: 1, eventos: 1 });

  await client.query("ROLLBACK");
  console.log(JSON.stringify({
    ok: true,
    transaction: "ROLLBACK",
    insideTransaction: counts.rows[0],
    immutableBridgeCode,
    immutableQaCode,
    duplicateLinkCode
  }, null, 2));
} catch (error) {
  try { await client.query("ROLLBACK"); } catch { /* no-op */ }
  console.error(JSON.stringify({ ok: false, error: error.message, code: error.code ?? null }));
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
