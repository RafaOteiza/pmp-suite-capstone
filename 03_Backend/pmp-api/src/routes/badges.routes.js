import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { enforceReadOnlyRole } from "../middleware/readOnlyRole.js";
import { requireAnyRole } from "../middleware/requireAnyRole.js";
import { VALID_ROLES } from "../constants/roles.js";

const router = Router();
router.use(firebaseAuth, ensureUser, enforceReadOnlyRole);

/**
 * GET /api/dashboard/badges
 * Retorna los contadores de pendientes para el Sidebar
 */
router.get("/badges", requireAnyRole(...VALID_ROLES), async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) FILTER (WHERE estado_id IN (4, 5, 9) AND tecnico_laboratorio_id IS NULL) as lab_pending,
        COUNT(*) FILTER (WHERE estado_id = 10) as lab_dispatch,
        COUNT(*) FILTER (WHERE estado_id IN (2, 11)) as bodega_pending,
        COUNT(*) FILTER (WHERE estado_id = 6) as qa_pending
      FROM pmp.ordenes_servicio
      WHERE estado_id NOT IN (8, 12, 13)
    `;

    const result = await pool.query(sql);
    const counts = result.rows[0];

    res.json({
        lab: parseInt(counts.lab_pending || 0, 10),
        lab_dispatch: parseInt(counts.lab_dispatch || 0, 10),
        bodega: parseInt(counts.bodega_pending || 0, 10),
        qa: parseInt(counts.qa_pending || 0, 10)
    });

  } catch (err) {
    console.error("Badges Error:", err);
    next(err);
  }
});

export default router;
