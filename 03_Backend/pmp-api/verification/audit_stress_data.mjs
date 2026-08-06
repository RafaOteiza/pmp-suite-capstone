import "dotenv/config";
import { pool } from "../src/db.js";

const WINDOW_START = "2026-08-06T15:33:00.000Z";
const WINDOW_END = "2026-08-06T15:34:00.000Z";

function quoteIdentifier(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

const ordersResult = await pool.query(
  `
    SELECT
      codigo_os,
      fecha,
      actualizado_en,
      estado_id,
      ubicacion_id,
      es_instalacion,
      tipo_equipo,
      bus_ppu,
      COALESCE(validador_serie, consola_serie) AS serie
    FROM pmp.ordenes_servicio
    WHERE fecha >= $1::timestamptz
      AND fecha < $2::timestamptz
      AND COALESCE(validador_serie, consola_serie) SIMILAR TO '(STRESS|RACE|FULL)-%'
    ORDER BY fecha, codigo_os
  `,
  [WINDOW_START, WINDOW_END]
);

const orders = ordersResult.rows;
const orderCodes = orders.map((row) => row.codigo_os);
const series = [...new Set(orders.map((row) => row.serie).filter(Boolean))];
const busPpus = [...new Set(orders.map((row) => row.bus_ppu).filter((ppu) => ppu && ppu !== "STOCK"))];

const [validators, consoles, buses, repairs, partRequests, requestItems, guideDetails, constraints, tables, relatedTableNames, roleSnapshot] = await Promise.all([
  pool.query("SELECT * FROM pmp.validadores WHERE serie = ANY($1::text[]) ORDER BY serie", [series]),
  pool.query("SELECT * FROM pmp.consolas WHERE serie = ANY($1::text[]) ORDER BY serie", [series]),
  pool.query("SELECT * FROM pmp.buses WHERE ppu = ANY($1::text[]) ORDER BY ppu", [busPpus]),
  pool.query(
    "SELECT * FROM pmp.registro_reparaciones WHERE codigo_os = ANY($1::text[]) ORDER BY codigo_os, fecha_registro",
    [orderCodes]
  ),
  pool.query(
    "SELECT * FROM pmp.solicitudes_repuestos WHERE codigo_os = ANY($1::text[]) ORDER BY codigo_os",
    [orderCodes]
  ),
  pool.query(`
    SELECT item.*
    FROM pmp.solicitud_items item
    JOIN pmp.solicitudes_repuestos request ON request.id = item.solicitud_id
    WHERE request.codigo_os = ANY($1::text[])
    ORDER BY request.codigo_os, item.solicitud_id
  `, [orderCodes]),
  pool.query(`
    SELECT *
    FROM pmp.guia_detalle
    WHERE codigo_os = ANY($1::text[])
      OR validador_serie = ANY($2::text[])
      OR consola_serie = ANY($2::text[])
      OR bus_ppu = ANY($3::text[])
    ORDER BY guia_numero
  `, [orderCodes, series, busPpus]),
  pool.query(`
    SELECT
      child_ns.nspname AS child_schema,
      child.relname AS child_table,
      child_col.attname AS child_column,
      parent_ns.nspname AS parent_schema,
      parent.relname AS parent_table,
      parent_col.attname AS parent_column,
      CASE constraint_row.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
      END AS delete_rule
    FROM pg_constraint constraint_row
    JOIN pg_class child ON child.oid = constraint_row.conrelid
    JOIN pg_namespace child_ns ON child_ns.oid = child.relnamespace
    JOIN pg_class parent ON parent.oid = constraint_row.confrelid
    JOIN pg_namespace parent_ns ON parent_ns.oid = parent.relnamespace
    JOIN LATERAL unnest(constraint_row.conkey) WITH ORDINALITY child_key(attnum, ord) ON TRUE
    JOIN LATERAL unnest(constraint_row.confkey) WITH ORDINALITY parent_key(attnum, ord)
      ON parent_key.ord = child_key.ord
    JOIN pg_attribute child_col ON child_col.attrelid = child.oid AND child_col.attnum = child_key.attnum
    JOIN pg_attribute parent_col ON parent_col.attrelid = parent.oid AND parent_col.attnum = parent_key.attnum
    WHERE constraint_row.contype = 'f'
      AND (child_ns.nspname = 'pmp' OR parent_ns.nspname = 'pmp')
    ORDER BY parent_table, child_table, child_column
  `),
  pool.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'pmp'
      AND column_name IN ('codigo_os', 'validador_serie', 'consola_serie', 'bus_ppu')
    ORDER BY table_name, column_name
  `),
  pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'pmp'
      AND table_type = 'BASE TABLE'
      AND (
        table_name ILIKE '%evento%'
        OR table_name ILIKE '%guia%'
        OR table_name ILIKE '%despach%'
        OR table_name ILIKE '%instal%'
      )
    ORDER BY table_name
  `),
  pool.query(`
    SELECT nombre, apellido, correo, rol, activo
    FROM pmp.usuarios
    WHERE correo IN (
      'rafael.oteiza@pmp-suite.cl',
      'jorge.castillo@pmp-suite.cl',
      'bodega@pmp-suite.cl',
      'cristian.alvarez@pmp-suite.cl',
      'jose.villarroel@pmp-suite.cl',
      'rodrigo.escobar@pmp-suite.cl'
    )
    ORDER BY correo
  `)
]);

const relatedCounts = [];
for (const { table_name: tableName, column_name: columnName } of tables.rows) {
  const values = columnName === "codigo_os"
    ? orderCodes
    : columnName === "bus_ppu"
      ? busPpus
      : series;

  const sql = `
    SELECT COUNT(*)::int AS total
    FROM ${quoteIdentifier("pmp")}.${quoteIdentifier(tableName)}
    WHERE ${quoteIdentifier(columnName)} = ANY($1::text[])
  `;
  const result = await pool.query(sql, [values]);
  relatedCounts.push({ table: tableName, column: columnName, total: result.rows[0].total });
}

const report = {
  auditWindow: { start: WINDOW_START, end: WINDOW_END },
  counts: {
    orders: orders.length,
    installationOrders: orders.filter((row) => row.es_instalacion).length,
    validators: validators.rowCount,
    consoles: consoles.rowCount,
    buses: buses.rowCount,
    repairs: repairs.rowCount,
    partRequests: partRequests.rowCount,
    requestItems: requestItems.rowCount,
    guideDetails: guideDetails.rowCount
  },
  orders,
  validators: validators.rows,
  consoles: consoles.rows,
  buses: buses.rows,
  repairs: repairs.rows,
  partRequests: partRequests.rows,
  requestItems: requestItems.rows,
  guideDetails: guideDetails.rows,
  relatedCounts,
  relatedTableNames: relatedTableNames.rows.map((row) => row.table_name),
  foreignKeys: constraints.rows,
  roleSnapshot: roleSnapshot.rows
};

const output = process.argv.includes("--counts")
  ? {
      auditWindow: report.auditWindow,
      counts: report.counts,
      roleSnapshot: report.roleSnapshot
    }
  : process.argv.includes("--summary")
    ? {
      auditWindow: report.auditWindow,
      counts: report.counts,
      orders: report.orders.map(({ codigo_os, serie, bus_ppu, es_instalacion, estado_id }) => ({
        codigo_os,
        serie,
        bus_ppu,
        es_instalacion,
        estado_id
      })),
      validatorSeries: report.validators.map((row) => row.serie),
      consoleSeries: report.consoles.map((row) => row.serie),
      busPpus: report.buses.map((row) => row.ppu),
      repairs: report.repairs.map((row) => ({ id: row.id, codigo_os: row.codigo_os })),
      relatedCounts: report.relatedCounts,
      relatedTableNames: report.relatedTableNames,
      roleSnapshot: report.roleSnapshot
      }
    : report;

console.log(JSON.stringify(output, null, 2));
await pool.end();
