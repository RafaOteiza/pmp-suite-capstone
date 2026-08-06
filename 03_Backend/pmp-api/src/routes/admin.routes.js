import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { enforceReadOnlyRole } from "../middleware/readOnlyRole.js";
import { requireAnyRole } from "../middleware/requireAnyRole.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
const adminReadRoles = [ROLES.ADMIN, ROLES.GERENTE];

router.use(firebaseAuth, ensureUser, enforceReadOnlyRole);

// ==========================================
// 1. DASHBOARD GENERAL (KPIs)
// ==========================================
router.get("/stats", requireAnyRole(...adminReadRoles), async (req, res, next) => {
  try {
    // Cuenta equipos en Laboratorio (Ubicación 2)
    // Filtra: Totales, Sin Asignar y Listos (Estado 10)
    const sql = `
        SELECT 
            COUNT(*) FILTER (WHERE estado_id IN (4,5,9,10)) as total_laboratorio,
            COUNT(*) FILTER (WHERE tecnico_laboratorio_id IS NULL AND estado_id IN (4,5)) as sin_asignar,
            COUNT(*) FILTER (WHERE estado_id = 10) as listos_para_despacho
        FROM pmp.ordenes_servicio
        WHERE ubicacion_id = 2 
    `;
    const result = await pool.query(sql);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. LISTA DE DESPACHO (Equipos Finalizados)
// ==========================================
router.get("/dispatch-queue", requireAnyRole(...adminReadRoles), async (req, res, next) => {
  try {
    // Busca equipos en Estado 10 (FINALIZADO_TALLER)
    // Trae datos del equipo, la falla y quién lo reparó
    const sql = `
      SELECT 
        o.codigo_os, 
        o.fecha, 
        o.falla,
        o.tipo_equipo,
        o.bus_ppu, 
        COALESCE(o.validador_serie, o.consola_serie) as serie,
        u.nombre || ' ' || u.apellido as tecnico_reparador,
        r.fecha_registro as fecha_reparacion,
        r.accion_realizada
      FROM pmp.ordenes_servicio o
      LEFT JOIN pmp.usuarios u ON o.tecnico_laboratorio_id = u.id
      LEFT JOIN pmp.registro_reparaciones r ON r.codigo_os = o.codigo_os
      WHERE o.estado_id = 10 
      ORDER BY r.fecha_registro DESC
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. DESPACHAR A BODEGA
// ==========================================
router.post("/dispatch", requireAnyRole(ROLES.ADMIN), async (req, res, next) => {
    const { codigos_os } = req.body; // Array de códigos ['OS-1', 'OS-2']
    
    if (!codigos_os || codigos_os.length === 0) {
        return res.status(400).json({ error: "No hay equipos seleccionados." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Mueve los equipos seleccionados al estado 11 (EN_TRAYECTO_BODEGA)
        // Y actualiza la ubicación a 1 (Bodega Central Mersan)
        const sql = `
            UPDATE pmp.ordenes_servicio 
            SET estado_id = 11, ubicacion_id = 1, actualizado_en = NOW() 
            WHERE codigo_os = ANY($1::text[])
        `;
        
        await client.query(sql, [codigos_os]);
        
        await client.query('COMMIT');
        res.json({ success: true, message: "Despacho registrado correctamente." });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Error en despacho:", e);
        next(e);
    } finally {
        client.release();
    }
});

export default router;
