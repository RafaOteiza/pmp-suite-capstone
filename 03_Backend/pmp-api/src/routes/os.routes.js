import { Router } from "express";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { requireAnyRole } from "../middleware/requireAnyRole.js";
import { enforceReadOnlyRole } from "../middleware/readOnlyRole.js";
// import { changeState } from "../services/osStateMachine.js"; // Comentado si no tienes este archivo aun
import { ROLES } from "../constants/roles.js";

const router = Router();
const osReadRoles = [ROLES.ADMIN, ROLES.GERENTE, ROLES.TECNICO_LAB, ROLES.TECNICO_TERRENO];
const osWriteRoles = [ROLES.ADMIN, ROLES.TECNICO_LAB, ROLES.TECNICO_TERRENO];

router.use(firebaseAuth, ensureUser, enforceReadOnlyRole);

/**
 * GET /api/os
 * Listado global de ordenes de servicio para administracion y gerencia.
 */
router.get("/", requireAnyRole(ROLES.ADMIN, ROLES.GERENTE), async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const tipoEquipo = typeof req.query.tipo_equipo === "string"
      ? req.query.tipo_equipo.trim().toUpperCase()
      : "";
    const estadoIdRaw = req.query.estado_id;
    const estadoIdText = estadoIdRaw === undefined ? "" : String(estadoIdRaw).trim();
    const estadoId = estadoIdRaw === undefined ? null : Number(estadoIdText);
    const limitText = String(req.query.limit ?? "50").trim();
    const offsetText = String(req.query.offset ?? "0").trim();

    if (q.length > 100) {
      return res.status(400).json({ error: "q excede el maximo de 100 caracteres" });
    }
    if (tipoEquipo && !["CONSOLA", "VALIDADOR"].includes(tipoEquipo)) {
      return res.status(400).json({ error: "tipo_equipo invalido" });
    }
    if (estadoIdRaw !== undefined && (!/^\d+$/.test(estadoIdText) || !Number.isSafeInteger(estadoId) || estadoId < 1)) {
      return res.status(400).json({ error: "estado_id invalido" });
    }
    const requestedLimit = Number(limitText);
    const requestedOffset = Number(offsetText);
    if (!/^\d+$/.test(limitText) || !Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
      return res.status(400).json({ error: "limit invalido" });
    }
    if (!/^\d+$/.test(offsetText) || !Number.isSafeInteger(requestedOffset)) {
      return res.status(400).json({ error: "offset invalido" });
    }

    const limit = Math.min(requestedLimit, 100);
    const offset = requestedOffset;

    const filters = [];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      filters.push(`(
        o.codigo_os ILIKE $${params.length}
        OR COALESCE(o.ticket_aranda, '') ILIKE $${params.length}
        OR COALESCE(o.bus_ppu, '') ILIKE $${params.length}
        OR COALESCE(o.validador_serie, o.consola_serie, '') ILIKE $${params.length}
      )`);
    }
    if (tipoEquipo) {
      params.push(tipoEquipo);
      filters.push(`o.tipo_equipo = $${params.length}`);
    }
    if (estadoId !== null) {
      params.push(estadoId);
      filters.push(`o.estado_id = $${params.length}`);
    }

    params.push(limit, offset);
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const sql = `
      WITH filtered AS (
        SELECT
          o.codigo_os,
          o.fecha,
          o.actualizado_en,
          o.tipo_equipo,
          o.falla,
          o.bus_ppu,
          o.ticket_aranda,
          o.estado_id,
          e.nombre AS estado_nombre,
          o.ubicacion_id,
          ub.nombre AS ubicacion_nombre,
          COALESCE(o.validador_serie, o.consola_serie) AS serie,
          NULLIF(CONCAT_WS(' ', terreno.nombre, terreno.apellido), '') AS tecnico_terreno,
          NULLIF(CONCAT_WS(' ', laboratorio.nombre, laboratorio.apellido), '') AS tecnico_laboratorio
        FROM pmp.ordenes_servicio o
        JOIN pmp.estados e ON e.id = o.estado_id
        LEFT JOIN pmp.ubicaciones ub ON ub.id = o.ubicacion_id
        LEFT JOIN pmp.usuarios terreno ON terreno.id = o.tecnico_terreno_id
        LEFT JOIN pmp.usuarios laboratorio ON laboratorio.id = o.tecnico_laboratorio_id
        ${where}
      ),
      paged AS (
        SELECT *
        FROM filtered
        ORDER BY fecha DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      )
      SELECT
        COALESCE(json_agg(paged ORDER BY fecha DESC), '[]'::json) AS items,
        (SELECT COUNT(*)::int FROM filtered) AS total
      FROM paged
    `;

    const { rows } = await pool.query(sql, params);
    const items = Array.isArray(rows[0]?.items) ? rows[0].items : [];
    const total = Number.parseInt(rows[0]?.total ?? 0, 10);

    return res.json({ items, pagination: { total, limit, offset } });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/os/crear
 * Crea una nueva Orden de Servicio en pmp.ordenes_servicio
 */
router.post("/crear", requireAnyRole(...osWriteRoles), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { 
        tipo,           // "CONSOLA" o "VALIDADOR"
        es_pod, 
        falla, 
        bus_ppu, 
        serie_equipo, 
        modelo, 
        marca,
        // Nuevos campos requeridos por la DB:
        terminal_id,    
        pst_codigo,
        ticket_aranda
    } = req.body;

    // 1. Validaciones básicas
    if (!["CONSOLA", "VALIDADOR"].includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser CONSOLA o VALIDADOR" });
    }
    if (!bus_ppu || !serie_equipo || !falla) {
      return res.status(400).json({ error: "Faltan datos obligatorios (ppu, serie, falla)" });
    }

    await client.query("BEGIN");

    // 2. Asegurar que el equipo existe en el inventario (Upsert)
    const tablaEquipo = tipo === "CONSOLA" ? "pmp.consolas" : "pmp.validadores";
    await client.query(
      `INSERT INTO ${tablaEquipo} (serie, modelo, marca)
       VALUES ($1, $2, $3)
       ON CONFLICT (serie) DO UPDATE SET modelo = EXCLUDED.modelo, marca = EXCLUDED.marca`,
      [serie_equipo, modelo || 'Genérico', marca || 'Genérico']
    );

    // 3. Asegurar que el bus existe (sino falla la FK)
    await client.query(
        `INSERT INTO pmp.buses (ppu) VALUES ($1) ON CONFLICT DO NOTHING`,
        [bus_ppu]
    );

    // 4. Determinar columnas dinámicas según tipo
    const colSerie = tipo === "CONSOLA" ? "consola_serie" : "validador_serie";
    
    // NOTA: Usamos valores por defecto para Terminal/PST si no vienen, 
    // para evitar error de NOT NULL en esta demo. 
    // En prod, deberías enviarlos desde el front.
    const terminalIdFinal = terminal_id || 1; // 1 = El Conquistador (según seed)
    const pstCodigoFinal = pst_codigo || 'U7'; // U7 = STP (según seed)
    
    // Estado inicial: 2 = EN_TRANSITO (Asumiendo que falla en terreno y viaja a lab)
    const estadoInicialId = 2; 

    // 5. Insertar la OS (El Trigger generará el codigo_os automáticamente)
    const insertQuery = `
      INSERT INTO pmp.ordenes_servicio (
        tipo_equipo, 
        es_pod, 
        falla,
        bus_ppu, 
        ${colSerie}, 
        estado_id,
        terminal_id,
        pst_codigo,
        tecnico_terreno_id,
        ticket_aranda
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const values = [
        tipo, 
        es_pod || false, 
        falla, 
        bus_ppu, 
        serie_equipo, 
        estadoInicialId,
        terminalIdFinal,
        pstCodigoFinal,
        req.user.id, // ID del usuario logueado (UUID)
        ticket_aranda || null
    ];

    const { rows } = await client.query(insertQuery, values);
    const nuevaOS = rows[0];

    // 6. Registrar Evento en Historial (Opcional pero recomendado)
    // Nota: Como no creamos la tabla 'os_eventos' en el script de correccion anterior, 
    // omito este paso para que no falle. Si la creaste, descomenta lo siguiente:
    /*
    await client.query(
        `INSERT INTO pmp.os_eventos (os_id, evento_tipo, usuario_id, comentario) VALUES ($1, 'CREACION', $2, 'OS creada desde Terreno')`,
        [nuevaOS.codigo_os, req.user.id] // Ojo: os_eventos usaba ID serial o codigo_os según tu diseño.
    );
    */

    await client.query("COMMIT");
    
    res.status(201).json({ 
        message: "Orden de Servicio creada exitosamente",
        os: nuevaOS 
    });

  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error creando OS:", e);
    // Manejo de error específico del trigger de validación
    if (e.message && e.message.includes("Operador") && e.message.includes("no autorizado")) {
        return res.status(409).json({ error: e.message }); // 409 Conflict
    }
    next(e);
  } finally {
    client.release();
  }
});

/**
 * POST /api/os/completar-instalacion
 * Procesa el resultado de una instalación en bus
 */
router.post("/completar-instalacion", requireAnyRole(...osWriteRoles), async (req, res, next) => {
  const { codigo_os, operativo, comentario, bus_ppu } = req.body;
  
  try {
    // 13 = CERRADA (Éxito), 11 = EN_TRAYECTO_BODEGA (Falla/Devolución)
    const nuevoEstado = operativo ? 13 : 11;
    
    // Si es operativo y viene un bus_ppu, actualizamos el bus de la OS 
    // (Útil para órdenes IN- que nacen en STOCK)
    const setBus = operativo && bus_ppu ? ", bus_ppu = $3" : "";
    const params = [nuevoEstado, codigo_os];
    if (operativo && bus_ppu) params.push(bus_ppu);

    const sql = `
      UPDATE pmp.ordenes_servicio 
      SET 
        estado_id = $1, 
        actualizado_en = NOW()
        ${setBus}
      WHERE codigo_os = $2
      RETURNING *
    `;
    
    const { rows } = await pool.query(sql, params);
    
    if (rows.length === 0) return res.status(404).json({ error: "OS no encontrada" });

    res.json({ 
        success: true, 
        message: operativo ? "Instalación completada exitosamente" : "Equipo reportado con falla, en retorno a bodega",
        os: rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/os/mis-ordenes
 * Lista las OS asociadas al técnico de terreno autenticado
 */
router.get("/mis-ordenes", requireAnyRole(...osReadRoles), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT 
        o.codigo_os, 
        o.tipo_equipo, 
        o.falla, 
        o.estado_id, 
        e.nombre as estado_nombre,
        o.fecha,
        o.bus_ppu,
        COALESCE(o.validador_serie, o.consola_serie) as serie
      FROM pmp.ordenes_servicio o
      JOIN pmp.estados e ON o.estado_id = e.id
      WHERE o.tecnico_terreno_id = $1
      ORDER BY o.fecha DESC
      LIMIT 20
    `;
    const { rows } = await pool.query(sql, [userId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/os/:id
 * Obtiene el detalle de una OS por su código (ej: MC-000001)
 */
router.get("/:id", requireAnyRole(...osReadRoles), async (req, res, next) => {
  try {
    const { id } = req.params; // Esto es el codigo_os (string)

    const sql = `
        SELECT 
            o.*, 
            e.nombre as estado_nombre,
            u.nombre || ' ' || u.apellido as tecnico_nombre
        FROM pmp.ordenes_servicio o
        JOIN pmp.estados e ON o.estado_id = e.id
        LEFT JOIN pmp.usuarios u ON o.tecnico_terreno_id = u.id
        WHERE o.codigo_os = $1
    `;
    
    const { rows } = await pool.query(sql, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "OS no encontrada" });

    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

export default router;
