import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { requireAnyRole } from "../middleware/requireAnyRole.js";
import { enforceReadOnlyRole } from "../middleware/readOnlyRole.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
const bodegaReadRoles = [ROLES.ADMIN, ROLES.GERENTE, ROLES.LOGISTICA];
const bodegaWriteRoles = [ROLES.ADMIN, ROLES.LOGISTICA];

router.use(firebaseAuth, ensureUser, enforceReadOnlyRole);

// ==========================================
// 1. OBTENER COLA DE BODEGA
// ==========================================
router.get("/queue", requireAnyRole(...bodegaReadRoles), async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        o.codigo_os, 
        o.fecha, 
        o.falla, 
        o.estado_id,
        e.nombre as estado_nombre,
        o.bus_ppu, 
        COALESCE(o.validador_serie, o.consola_serie) as serie,
        o.tipo_equipo,
        o.es_aprobado_qa,
        CASE
          WHEN o.estado_id = 2                          THEN 'terreno'
          WHEN o.estado_id = 11 AND o.es_aprobado_qa = false THEN 'qa_rechazado'
          WHEN o.estado_id = 11                         THEN 'laboratorio'
          ELSE 'terreno'
        END as origen_transito,
        EXISTS (
          SELECT 1 FROM pmp.registro_reparaciones r WHERE r.codigo_os = o.codigo_os
        ) as fue_laboratorio
      FROM pmp.ordenes_servicio o
      JOIN pmp.estados e ON o.estado_id = e.id
      WHERE o.estado_id IN (2, 3, 11) 
      ORDER BY o.fecha ASC
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});


// ==========================================
// 2. RECIBIR EQUIPO EN BODEGA
// ==========================================
router.put("/receive", requireAnyRole(...bodegaWriteRoles), async (req, res, next) => {
  const { codigo_os } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // SELECT FOR UPDATE: bloquea la fila mientras dura la transacción.
    // Cualquier otra transacción concurrente esperará aquí hasta que termine la primera.
    const check = await client.query(`
      SELECT estado_id, es_aprobado_qa, tipo_equipo, es_pod, validador_serie, consola_serie, terminal_id, pst_codigo 
      FROM pmp.ordenes_servicio 
      WHERE codigo_os = $1
      FOR UPDATE
    `, [codigo_os]);

    if (check.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "OS no encontrada" });
    }

    const o = check.rows[0];

    // Guardia de idempotencia: solo procesar si el equipo está en tránsito hacia bodega.
    // Estados válidos para recepcionar: 2 (EN_TRANSITO desde Terreno), 11 (EN_TRAYECTO_BODEGA desde Lab/QA)
    if (o.estado_id !== 2 && o.estado_id !== 11) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: `OS ${codigo_os} ya fue recepcionada (estado actual: ${o.estado_id}). Operación ignorada.`
      });
    }
    
    // Si fue aprobada por QA, cerramos esta OS y abrimos una de Instalación (IN-)
    if (o.es_aprobado_qa === true) {
      // 2a. Cerrar OS Original (Reparación Finalizada)
      await client.query(`
        UPDATE pmp.ordenes_servicio 
        SET estado_id = 13, es_aprobado_qa = NULL, actualizado_en = NOW()
        WHERE codigo_os = $1
      `, [codigo_os]);

      // 2b. Crear Nueva OS de Instalación (IN-)
      const colSerie = o.tipo_equipo === "CONSOLA" ? "consola_serie" : "validador_serie";
      const valSerie = o.tipo_equipo === "CONSOLA" ? o.consola_serie : o.validador_serie;

      await client.query(`
        INSERT INTO pmp.ordenes_servicio (
          tipo_equipo, es_pod, falla, bus_ppu, ${colSerie}, 
          estado_id, terminal_id, pst_codigo, es_instalacion, ubicacion_id
        )
        VALUES ($1, $2, $3, $4, $5, 7, $6, $7, TRUE, 1)
      `, [o.tipo_equipo, o.es_pod, 'EQUIPO LISTO PARA INSTALACION', 'STOCK', valSerie, o.terminal_id, o.pst_codigo]);

      await client.query("COMMIT");
      return res.json({ success: true, message: "Equipo recibido. OS de reparación cerrada y nueva OS de instalación (IN-) generada." });
    } 
    
    // Si no fue aprobada por QA o viene de terreno, simplemente entra a bodega
    await client.query(`
      UPDATE pmp.ordenes_servicio 
      SET estado_id = 3, ubicacion_id = 1, es_aprobado_qa = NULL, actualizado_en = NOW()
      WHERE codigo_os = $1
    `, [codigo_os]);

    await client.query("COMMIT");
    res.json({ success: true, message: "Equipo recibido en Bodega" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});


// ==========================================
// 3. DESPACHAR A LABORATORIO
// ==========================================
router.put("/dispatch-lab", requireAnyRole(...bodegaWriteRoles), async (req, res, next) => {
  const { codigo_os } = req.body;
  try {
    // Cambia a estado 4 (EN_DIAGNOSTICO)
    // Y cambia ubicacion_id a 2 (LABORATORIO)
    const sql = `
      UPDATE pmp.ordenes_servicio 
      SET estado_id = 4, ubicacion_id = 2, actualizado_en = NOW()
      WHERE codigo_os = $1
      RETURNING *
    `;
    const result = await pool.query(sql, [codigo_os]);
    res.json({ success: true, message: "Equipo despachado a Laboratorio" });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. DESPACHAR A QA
// ==========================================
router.put("/dispatch-qa", requireAnyRole(...bodegaWriteRoles), async (req, res, next) => {
  const { codigo_os } = req.body;
  try {
    // Cambia a estado 6 (EN_QA)
    // Y cambia ubicacion_id a 3 (Certificación Sonda - QA)
    const sql = `
      UPDATE pmp.ordenes_servicio 
      SET estado_id = 6, ubicacion_id = 3, actualizado_en = NOW()
      WHERE codigo_os = $1
      RETURNING *
    `;
    const result = await pool.query(sql, [codigo_os]);
    res.json({ success: true, message: "Equipo despachado a QA" });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. OBTENER STOCK Y EQUIPOS DISPONIBLES
// ==========================================
router.get("/stock", requireAnyRole(...bodegaReadRoles), async (req, res, next) => {
  try {
    // 1. Equipos listos para instalar (Estado 7 = DISPONIBLE)
    const sqlListos = `
      SELECT 
        o.codigo_os, 
        o.fecha, 
        o.falla, 
        o.estado_id,
        e.nombre as estado_nombre,
        o.bus_ppu, 
        COALESCE(o.validador_serie, o.consola_serie) as serie,
        o.tipo_equipo
      FROM pmp.ordenes_servicio o
      JOIN pmp.estados e ON o.estado_id = e.id
      WHERE o.estado_id = 7
      ORDER BY o.fecha DESC
    `;
    const resultListos = await pool.query(sqlListos);

    // 2. Inventario físico global en base de datos
    const resultVali = await pool.query("SELECT COUNT(*) FROM pmp.validadores");
    const resultCons = await pool.query("SELECT COUNT(*) FROM pmp.consolas");

    res.json({
        listos: resultListos.rows,
        inventario: {
            validadores: parseInt(resultVali.rows[0].count, 10),
            consolas: parseInt(resultCons.rows[0].count, 10),
            total: parseInt(resultVali.rows[0].count, 10) + parseInt(resultCons.rows[0].count, 10)
        }
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 6. INVENTARIO DE REPUESTOS
// ==========================================
router.get("/repuestos", requireAnyRole(...bodegaReadRoles), async (req, res, next) => {
  try {
    // Inventario de repuestos
    const sqlRepuestos = `
      SELECT 
        r.id,
        r.nombre,
        r.categoria,
        r.stock,
        r.stock_critico,
        (r.stock - COALESCE(r.stock_critico, 0)) as diferencia
      FROM pmp.repuestos r
      ORDER BY r.categoria, r.nombre
    `;

    // Solicitudes pendientes de repuestos
    const sqlSolicitudes = `
      SELECT 
        sr.id,
        sr.codigo_os,
        sr.estado,
        sr.fecha_solicitud
      FROM pmp.solicitudes_repuestos sr
      WHERE sr.estado NOT IN ('ENTREGADO', 'CANCELADO')
      ORDER BY sr.fecha_solicitud DESC
      LIMIT 20
    `;

    const [resRep, resSolic] = await Promise.all([
        pool.query(sqlRepuestos).catch(() => ({ rows: [] })),
        pool.query(sqlSolicitudes).catch(() => ({ rows: [] }))
    ]);

    res.json({
        repuestos: resRep.rows,
        solicitudes: resSolic.rows
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 7. ACTUALIZAR STOCK REPUESTO
// ==========================================
router.put("/repuestos/:id/stock", requireAnyRole(...bodegaWriteRoles), async (req, res, next) => {
  const { id } = req.params;
  const { nuevo_stock } = req.body;
  try {
    await pool.query('UPDATE pmp.repuestos SET stock = $1 WHERE id = $2', [nuevo_stock, id]);
    res.json({ success: true, message: "Stock actualizado correctamente" });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 8. ENTREGAR RESPUESTO (SOLICITUD)
// ==========================================
router.put("/solicitudes/:id/entregar", requireAnyRole(...bodegaWriteRoles), async (req, res, next) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const upd = await client.query(
        "UPDATE pmp.solicitudes_repuestos SET estado = 'ENTREGADO', fecha_despacho = NOW() WHERE id = $1 RETURNING codigo_os", 
        [id]
      );
      if (upd.rowCount > 0) {
        const os = upd.rows[0].codigo_os;
        // Vuelve a taller en estado "En Reparación"
        await client.query(
          "UPDATE pmp.ordenes_servicio SET estado_id = 5, actualizado_en = NOW() WHERE codigo_os = $1", 
          [os]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true, message: "Repuesto entregado. OS devuelta a laboratorio." });
    } catch(e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 9. OBTENER TÉCNICOS DE TERRENO
// ==========================================
router.get("/tecnicos", requireAnyRole(...bodegaReadRoles), async (req, res, next) => {
  try {
    const r = await pool.query("SELECT id, nombre, apellido FROM pmp.usuarios WHERE rol = 'tecnico_terreno' AND activo = true");
    res.json(r.rows);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 10. ASIGNAR EQUIPO A TERRENO
// ==========================================
router.put("/asignar", requireAnyRole(...bodegaWriteRoles), async (req, res, next) => {
  const { codigo_os, tecnico_terreno_id, bus_ppu } = req.body;
  
  if (!codigo_os || !tecnico_terreno_id || !bus_ppu) {
    return res.status(400).json({ error: "Faltan datos obligatorios (OS, Técnico o PPU)" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Asegurar que el bus existe (lo inserta si no, omitiendo si ya existe)
    await client.query(`
      INSERT INTO pmp.buses (ppu) 
      VALUES ($1) 
      ON CONFLICT (ppu) DO NOTHING
    `, [bus_ppu]);

    // 2. Asignar el equipo al técnico y bus
    const sql = `
      UPDATE pmp.ordenes_servicio 
      SET 
        estado_id = 1, 
        ubicacion_id = NULL, 
        tecnico_terreno_id = $1, 
        bus_ppu = $2, 
        actualizado_en = NOW()
      WHERE codigo_os = $3 AND estado_id = 7
      RETURNING *
    `;
    const result = await client.query(sql, [tecnico_terreno_id, bus_ppu, codigo_os]);
    
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Equipo no disponible para asignar (Debe estar en Bodega DISPONIBLE)" });
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Equipo asignado al técnico e iniciado en ruta." });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// ==========================================
// 11. KPI DASHBOARD BODEGA
// ==========================================
router.get("/dashboard", requireAnyRole(...bodegaReadRoles), async (req, res, next) => {
  try {
    const rep_criticos = await pool.query("SELECT COUNT(*) FROM pmp.repuestos WHERE stock <= COALESCE(stock_critico, 0)");
    
    const tickets = await pool.query(`
      SELECT e.nombre as name, COUNT(o.codigo_os) as value, e.id as estado_id
      FROM pmp.estados e
      LEFT JOIN pmp.ordenes_servicio o ON o.estado_id = e.id AND o.estado_id NOT IN (8, 12, 13)
      GROUP BY e.id, e.nombre
      ORDER BY e.id
    `);

    const asignados = await pool.query("SELECT COUNT(*) FROM pmp.ordenes_servicio WHERE estado_id = 1");

    res.json({
        alertasStock: parseInt(rep_criticos.rows[0].count, 10),
        distribucionEstados: tickets.rows.map(r => ({ name: r.name, value: parseInt(r.value, 10), estado_id: r.estado_id })),
        equiposEnRuta: parseInt(asignados.rows[0].count, 10)
    });
  } catch (err) {
    next(err);
  }
});

export default router;
