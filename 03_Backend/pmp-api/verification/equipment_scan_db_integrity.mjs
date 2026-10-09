import "dotenv/config";
import assert from "node:assert/strict";
import pg from "pg";
import { expectedSeriesForAmid, isValidUpcA } from "../src/services/equipmentScan.js";

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL no está configurada");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const report = { ok: false, mode: "READ ONLY", checks: {}, findings: [] };

const requiredColumns = [
  "ordenes_servicio.qa_asignado_en",
  "ordenes_servicio.qa_asignado_por",
  "ordenes_servicio.qa_usuario_id",
  "validadores.amid"
];
const canonicalRoles = new Set(["admin", "gerente", "logistica", "qa", "tecnico_laboratorio", "tecnico_terreno"]);

function finding(code, count, detail = undefined) {
  if (Number(count) > 0) report.findings.push({ code, count: Number(count), ...(detail === undefined ? {} : { detail }) });
}

const client = await pool.connect();
try {
  await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");

  const columns = await client.query(`
    SELECT table_name, column_name
      FROM information_schema.columns
     WHERE table_schema = 'pmp'
       AND ((table_name = 'validadores' AND column_name = 'amid')
         OR (table_name = 'ordenes_servicio' AND column_name IN ('qa_usuario_id','qa_asignado_por','qa_asignado_en')))
  `);
  const presentColumns = new Set(columns.rows.map((row) => `${row.table_name}.${row.column_name}`));
  const missingColumns = requiredColumns.filter((column) => !presentColumns.has(column));
  report.checks.requiredColumns = { expected: requiredColumns.length, present: presentColumns.size, missing: missingColumns };
  finding("MISSING_REQUIRED_COLUMN", missingColumns.length, missingColumns);

  const structures = await client.query(`
    SELECT
      to_regclass('pmp.escaneos_equipos') IS NOT NULL AS scan_table,
      to_regclass('pmp.uq_validadores_amid') IS NOT NULL AS amid_unique_index,
      EXISTS (
        SELECT 1 FROM pg_trigger t
         JOIN pg_class c ON c.oid = t.tgrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'pmp' AND c.relname = 'escaneos_equipos'
          AND NOT t.tgisinternal AND t.tgenabled <> 'D'
      ) AS scan_append_only_trigger
  `);
  report.checks.structures = structures.rows[0];
  for (const [name, enabled] of Object.entries(structures.rows[0])) {
    if (!enabled) finding("MISSING_REQUIRED_STRUCTURE", 1, name);
  }

  const users = await client.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE activo)::int AS active,
      COUNT(*) FILTER (WHERE NOT activo)::int AS inactive,
      COUNT(*) FILTER (WHERE rol::text NOT IN ('admin','gerente','logistica','qa','tecnico_laboratorio','tecnico_terreno'))::int AS invalid_roles,
      COUNT(*) FILTER (WHERE rol::text = 'qa' AND activo)::int AS active_qa
    FROM pmp.usuarios
  `);
  report.checks.users = users.rows[0];
  finding("UNKNOWN_USER_ROLE", users.rows[0].invalid_roles);

  const roleRows = await client.query("SELECT DISTINCT rol::text AS rol FROM pmp.usuarios");
  const unexpectedRoles = roleRows.rows.map((row) => row.rol).filter((role) => !canonicalRoles.has(role));
  finding("UNKNOWN_USER_ROLE_VALUE", unexpectedRoles.length, unexpectedRoles);

  const duplicates = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM (SELECT lower(correo) FROM pmp.usuarios GROUP BY lower(correo) HAVING COUNT(*) > 1) d) AS email,
      (SELECT COUNT(*)::int FROM (SELECT firebase_uid FROM pmp.usuarios WHERE firebase_uid IS NOT NULL GROUP BY firebase_uid HAVING COUNT(*) > 1) d) AS firebase_uid,
      (SELECT COUNT(*)::int FROM (SELECT amid FROM pmp.validadores WHERE amid IS NOT NULL GROUP BY amid HAVING COUNT(*) > 1) d) AS amid
  `);
  report.checks.duplicateKeys = duplicates.rows[0];
  finding("DUPLICATE_USER_EMAIL", duplicates.rows[0].email);
  finding("DUPLICATE_FIREBASE_UID", duplicates.rows[0].firebase_uid);
  finding("DUPLICATE_AMID", duplicates.rows[0].amid);

  const identifiers = await client.query("SELECT serie, amid FROM pmp.validadores WHERE amid IS NOT NULL ORDER BY serie");
  const invalidIdentifiers = identifiers.rows.filter(({ serie, amid }) => !isValidUpcA(amid) || expectedSeriesForAmid(amid) !== serie);
  report.checks.validatorIdentifiers = {
    withAmid: identifiers.rowCount,
    valid: identifiers.rowCount - invalidIdentifiers.length,
    invalid: invalidIdentifiers.map(({ serie, amid }) => ({ serie, amid }))
  };
  finding("INVALID_VALIDATOR_AMID", invalidIdentifiers.length, invalidIdentifiers);

  const operational = await client.query(`
    SELECT
      (SELECT COUNT(*)::int FROM pmp.ordenes_servicio
        WHERE estado_id NOT IN (8,12,13)
          AND num_nonnulls(validador_serie, consola_serie) <> 1) AS invalid_equipment_reference,
      (SELECT COUNT(*)::int FROM (
        SELECT tipo_equipo, COALESCE(validador_serie, consola_serie)
          FROM pmp.ordenes_servicio
         WHERE estado_id NOT IN (8,12,13)
           AND COALESCE(validador_serie, consola_serie) IS NOT NULL
         GROUP BY tipo_equipo, COALESCE(validador_serie, consola_serie)
        HAVING COUNT(*) > 1
      ) d) AS equipment_with_multiple_active_orders,
      (SELECT COUNT(*)::int FROM pmp.ordenes_servicio o
        LEFT JOIN pmp.usuarios q ON q.id = o.qa_usuario_id
       WHERE o.estado_id = 6
         AND (q.id IS NULL OR q.rol::text <> 'qa' OR NOT q.activo)) AS qa_orders_without_active_assignee
  `);
  report.checks.operationalOrders = operational.rows[0];
  finding("INVALID_ACTIVE_ORDER_EQUIPMENT", operational.rows[0].invalid_equipment_reference);
  finding("MULTIPLE_ACTIVE_ORDERS_PER_EQUIPMENT", operational.rows[0].equipment_with_multiple_active_orders);
  finding("QA_ORDER_WITHOUT_ACTIVE_ASSIGNEE", operational.rows[0].qa_orders_without_active_assignee);

  const scans = await client.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE s.resultado = 'VALIDADO')::int AS validated,
      COUNT(*) FILTER (WHERE s.resultado = 'RECHAZADO')::int AS rejected,
      COUNT(*) FILTER (WHERE s.resultado = 'VALIDADO' AND (
        o.codigo_os IS NULL OR o.tipo_equipo <> s.tipo_equipo
        OR COALESCE(o.validador_serie, o.consola_serie) <> s.serie
      ))::int AS invalid_validated_links
    FROM pmp.escaneos_equipos s
    LEFT JOIN pmp.ordenes_servicio o ON o.codigo_os = s.codigo_os
  `);
  report.checks.scans = scans.rows[0];
  finding("INVALID_VALIDATED_SCAN_LINK", scans.rows[0].invalid_validated_links);

  const constraints = await client.query(`
    SELECT COUNT(*) FILTER (WHERE NOT convalidated)::int AS not_validated
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
     WHERE n.nspname = 'pmp'
  `);
  report.checks.constraints = constraints.rows[0];
  finding("UNVALIDATED_DATABASE_CONSTRAINT", constraints.rows[0].not_validated);

  await client.query("ROLLBACK");
  report.transaction = "ROLLBACK";
  report.ok = report.findings.length === 0;
} catch (error) {
  try { await client.query("ROLLBACK"); } catch {}
  report.error = { name: error.name, code: error.code || null, message: error.message };
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}

assert.equal(report.transaction, "ROLLBACK", "La verificación no terminó mediante ROLLBACK");
if (!report.ok && !report.error) process.exitCode = 2;
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
