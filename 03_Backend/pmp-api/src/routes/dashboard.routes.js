import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { requireAnyRole } from "../middleware/requireAnyRole.js";
import { enforceReadOnlyRole } from "../middleware/readOnlyRole.js";
import { ROLES, VALID_ROLES } from "../constants/roles.js";

const router = Router();
router.use(firebaseAuth, ensureUser, enforceReadOnlyRole);

router.get("/summary", requireAnyRole(...VALID_ROLES), async (req, res, next) => {
  try {
    const client = await pool.connect();
    try {
        // 1. OBTENER INVENTARIO TOTAL
        const totalValidadoresRes = await client.query("SELECT COUNT(*) FROM pmp.validadores");
        const totalConsolasRes = await client.query("SELECT COUNT(*) FROM pmp.consolas");
        
        const totalValidadores = parseInt(totalValidadoresRes.rows[0].count, 10);
        const totalConsolas = parseInt(totalConsolasRes.rows[0].count, 10);
        const totalFlota = totalValidadores + totalConsolas;

        // 2. OBTENER ORDENES DE SERVICIO ACTIVAS
        const osSql = `
          SELECT 
            o.tipo_equipo as tipo, 
            o.estado_id,
            e.nombre as estado_actual, 
            o.es_pod, 
            COUNT(*) as total
          FROM pmp.ordenes_servicio o
          JOIN pmp.estados e ON o.estado_id = e.id
          WHERE o.estado_id NOT IN (8, 12, 13)
          GROUP BY o.tipo_equipo, o.estado_id, e.nombre, o.es_pod
        `;

        const { rows: osRows } = await client.query(osSql);

        // 3. PROCESAR METRICAS
        let conteoEnTaller = 0;   
        let conteoDisponibles = 0; 
        let conteoFallaRuta = 0;   
        let conteoEnBodega = 0;   
        let conteoEnTransito = 0; 
        
        // Contadores específicos para subtítulos de Taller
        let consolasEnTaller = 0;
        let validadoresEnTaller = 0;

        let podsTotalesEnProceso = 0;
        let podsRecuperados = 0;

        osRows.forEach(r => {
            const { tipo, estado_id, estado_actual, es_pod, total } = r;
            const nTotal = parseInt(total, 10);
            const sId = parseInt(estado_id, 10);

            // PODs
            if (es_pod) {
                podsTotalesEnProceso += nTotal;
                if (sId === 7) podsRecuperados += nTotal; // 7 = DISPONIBLE
            }

            // Clasificación por Ubicación/Estado (Workflow oficial por ID)
            if (sId === 7) { // DISPONIBLE
                conteoDisponibles += nTotal;
            } else if (estado_actual === 'EN_RUTA') { 
                conteoFallaRuta += nTotal;
            } else if (sId === 2 || sId === 11) { // 2=EN_TRANSITO, 11=EN_TRAYECTO_BODEGA
                conteoEnTransito += nTotal;
            } else if (sId === 3) { // 3=RECIBIDO_BODEGA
                conteoEnBodega += nTotal;
            } else if ([4, 5, 9, 10].includes(sId)) { // 4=DIAG, 5=REPAR, 9=REPUESTO, 10=FINALIZADO
                conteoEnTaller += nTotal;
                if (tipo === 'CONSOLA') consolasEnTaller += nTotal;
                if (tipo === 'VALIDADOR') validadoresEnTaller += nTotal;
            }
        });

        // 4. CALCULAR OPERATIVOS REALES
        const totalConIncidencia = conteoEnTaller + conteoDisponibles + conteoFallaRuta + conteoEnBodega + conteoEnTransito;
        const totalOperativosReales = totalFlota - totalConIncidencia;
        const operativosFinal = totalOperativosReales < 0 ? 0 : totalOperativosReales;

        // 5. DATOS PARA GRÁFICOS
        const pieData = [
            { name: 'En Taller', value: conteoEnTaller },
            { name: 'En Bodega', value: conteoEnBodega },
            { name: 'En Tránsito', value: conteoEnTransito }
        ].filter(d => d.value > 0);

        const barData = [
            { name: 'Operativos OK', cantidad: operativosFinal },
            { name: 'En Logística', cantidad: conteoEnBodega + conteoEnTransito },
            { name: 'En Taller', cantidad: conteoEnTaller },
            { name: 'Saldos Ruta', cantidad: conteoFallaRuta }
        ];

        res.json({
            kpis: {
                totalEnProceso: conteoEnTaller, // Lo que realmente está en Lab
                consolasEnLab: consolasEnTaller,
                validadoresEnLab: validadoresEnTaller,
                totalReparadosLab: osRows.filter(r => parseInt(r.estado_id, 10) === 10).reduce((a, b) => a + parseInt(b.total, 10), 0),
                totalEnQa: osRows.filter(r => parseInt(r.estado_id, 10) === 6).reduce((a, b) => a + parseInt(b.total, 10), 0),

                totalReparados: conteoDisponibles,
                totalOperativos: operativosFinal,
                totalEnBodega: conteoEnBodega,   // <--- NUEVO
                totalEnTransito: conteoEnTransito, // <--- NUEVO
                totalPods: podsTotalesEnProceso,
                podsReparados: podsRecuperados,
                tiempoPromedio: 18.5
            },
            charts: {
                pieData,
                barData
            }
        });

    } finally {
        client.release();
    }
  } catch (err) {
    console.error("Dashboard Error:", err);
    next(err);
  }
});

/**
 * GET /api/dashboard/equipos-operativos
 * Lista detallada de equipos que no tienen una OS activa (operativos en buses)
 */
router.get("/equipos-operativos", requireAnyRole(ROLES.ADMIN, ROLES.GERENTE, ROLES.LOGISTICA), async (req, res, next) => {
    const { q = '', limit = 20, offset = 0 } = req.query;
    console.log(`[EquiposOperativos] BUSCANDO q="${q}" offset=${offset} USER=${req.user?.rol}`); // DEBUG
    try {
        const queryStr = `%${q}%`;
        const sql = `
            WITH AllHardware AS (
                SELECT 'VALIDADOR' as tipo, serie, modelo, marca FROM pmp.validadores
                UNION ALL
                SELECT 'CONSOLA' as tipo, serie, modelo, marca FROM pmp.consolas
            ),
            ActiveOS AS (
                SELECT 
                    COALESCE(validador_serie, consola_serie) as serie
                FROM pmp.ordenes_servicio
                WHERE estado_id NOT IN (8, 12, 13)
            ),
            LatestPPU AS (
                SELECT DISTINCT ON (COALESCE(validador_serie, consola_serie))
                    COALESCE(validador_serie, consola_serie) as serie,
                    bus_ppu,
                    fecha
                FROM pmp.ordenes_servicio
                WHERE bus_ppu != 'STOCK' AND bus_ppu IS NOT NULL
                ORDER BY COALESCE(validador_serie, consola_serie), fecha DESC
            )
            SELECT 
                h.*,
                lp.bus_ppu,
                lp.fecha as ultima_operacion,
                COUNT(*) OVER() as total_count
            FROM AllHardware h
            LEFT JOIN ActiveOS a ON h.serie = a.serie
            LEFT JOIN LatestPPU lp ON h.serie = lp.serie
            WHERE a.serie IS NULL
              AND (
                h.serie ILIKE $1 OR 
                COALESCE(lp.bus_ppu, '') ILIKE $1 OR 
                h.modelo ILIKE $1 OR
                h.tipo ILIKE $1
              )
            ORDER BY lp.fecha DESC NULLS LAST, h.serie ASC
            LIMIT $2 OFFSET $3
        `;
        
        const { rows } = await pool.query(sql, [queryStr, limit, offset]);
        
        const totalCount = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
        const data = rows.map(r => {
            const { total_count, ...rest } = r;
            return rest;
        });

        res.json({
            data,
            pagination: {
                total: totalCount,
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10)
            }
        });
    } catch (err) {
        console.error("Error Equipos Operativos:", err);
        next(err);
    }
});
/**
 * GET /api/dashboard/global-search
 * Búsqueda global (Trazabilidad) por código OS o ID de Aranda.
 */
router.get("/global-search", requireAnyRole(...VALID_ROLES), async (req, res, next) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const queryStr = `%${q}%`;
        const sql = `
            SELECT 
                o.codigo_os,
                o.ticket_aranda,
                o.tipo_equipo,
                COALESCE(o.validador_serie, o.consola_serie) as serie,
                e.nombre as estado,
                ub.nombre as ubicacion,
                o.fecha,
                o.bus_ppu,
                u.nombre || ' ' || u.apellido as tecnico_creador
            FROM pmp.ordenes_servicio o
            JOIN pmp.estados e ON o.estado_id = e.id
            JOIN pmp.ubicaciones ub ON o.ubicacion_id = ub.id
            LEFT JOIN pmp.usuarios u ON o.tecnico_terreno_id = u.id
            WHERE o.codigo_os ILIKE $1 OR o.ticket_aranda ILIKE $1 OR COALESCE(o.validador_serie, o.consola_serie) ILIKE $1
            ORDER BY o.fecha DESC
            LIMIT 10
        `;
        const { rows } = await pool.query(sql, [queryStr]);
        res.json(rows);
    } catch (err) {
        console.error("Global Search Error:", err);
        next(err);
    }
});

export default router;
