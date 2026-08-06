import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { requireAnyRole } from "../middleware/requireAnyRole.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { enforceReadOnlyRole } from "../middleware/readOnlyRole.js";
import { ROLES } from "../constants/roles.js";

const router = Router();
const qaReadRoles = [ROLES.ADMIN, ROLES.GERENTE, ROLES.QA];
const qaWriteRoles = [ROLES.ADMIN, ROLES.QA];

router.use(firebaseAuth, ensureUser, enforceReadOnlyRole);

// GET: Obtener cola de QA (Solo estado 6 = EN_QA)
router.get("/queue", requireAnyRole(...qaReadRoles), async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        o.codigo_os, 
        o.tipo_equipo,
        o.fecha, 
        o.falla, 
        o.bus_ppu, 
        COALESCE(o.validador_serie, o.consola_serie) as serie,
        u_tec.nombre || ' ' || u_tec.apellido as tecnico_reparador
      FROM pmp.ordenes_servicio o
      LEFT JOIN pmp.usuarios u_tec ON o.tecnico_laboratorio_id = u_tec.id
      WHERE o.estado_id = 6 
      ORDER BY o.actualizado_en ASC
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST: Procesar QA (Aprobar o Rechazar)
router.post("/process", requireAnyRole(...qaWriteRoles), async (req, res, next) => {
  const { codigo_os, accion, comentario } = req.body; // accion: 'APROBAR' | 'RECHAZAR'
  
  try {
    const client = await pool.connect();
    try {
        let esAprobadoQa = accion === 'APROBAR';
        let nuevoEstado = 11; // Siempre vuelve a Bodega (EN_TRAYECTO_BODEGA) antes de ser listo o volver a taller
        let ubicacionId = 1;  // Bodega Central Mersan (ID 1)
        let evento = esAprobadoQa ? 'QA_APPROVED' : 'QA_REJECTED';

        // 1. Actualizar OS (Estado + Ubicación + es_aprobado_qa)
        await client.query(
            `UPDATE pmp.ordenes_servicio 
             SET estado_id = $1, ubicacion_id = $2, es_aprobado_qa = $3, actualizado_en = NOW() 
             WHERE codigo_os = $4`,
            [nuevoEstado, ubicacionId, esAprobadoQa, codigo_os]
        );

        await client.query('COMMIT');
        res.json({ success: true, message: `OS ${codigo_os} procesada (${accion})` });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Error en QA process:", e);
        res.status(500).json({ error: e.message });
    } finally {
        client.release();
    }
  } catch (err) {
    next(err);
  }
});

export default router;
