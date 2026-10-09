import 'dotenv/config';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pool} from '../src/db.js';
// A dry run is the default. --apply commits the additive migration only after
// comparing every pre-existing operational table inside the same transaction.
const apply=process.argv.includes('--apply');
const client=await pool.connect();
try {
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout='5s'");
  const tables=(await client.query("SELECT tablename FROM pg_tables WHERE schemaname='pmp' ORDER BY tablename")).rows.map(r=>r.tablename);
  for(const table of tables){assert.match(table,/^[a-z_]+$/);await client.query(`LOCK TABLE pmp.${table} IN SHARE MODE`);}
  const snapshot=async()=>{
    const result={};
    for(const table of tables){
      const value=table==='flujo_eventos'?"to_jsonb(t)-'tipo_equipo'-'serie'":table==='ordenes_servicio'?"to_jsonb(t)-'stock_origen_evento'":'to_jsonb(t)';
      result[table]=(await client.query(`SELECT count(*)::int AS registros,
        md5(COALESCE(string_agg((${value})::text,'' ORDER BY (${value})::text),'')) AS firma FROM pmp.${table} t`)).rows[0];
    }
    return result;
  };
  const before=await snapshot();
  const sql=await readFile(new URL('../../../05_BaseDatos/migraciones/requerimientos/006_recepcion_inicial_sin_os.sql',import.meta.url),'utf8');
  await client.query(sql.replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,''));
  assert.deepEqual(await snapshot(),before,'No se permite alterar datos históricos');
  await client.query(sql.replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,''));
  assert.deepEqual(await snapshot(),before,'La segunda aplicación debe ser idempotente');
  await client.query(apply?'COMMIT':'ROLLBACK');
  console.log(JSON.stringify({ok:true,applied:apply,dryRun:!apply,idempotent:true,historicalRowsUnchanged:true,tables:before},null,2));
}catch(error){await client.query('ROLLBACK');throw error;}
finally{client.release();await pool.end();}
