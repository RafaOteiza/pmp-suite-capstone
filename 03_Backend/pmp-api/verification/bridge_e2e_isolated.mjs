import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import pg from "pg";

const { Pool } = pg;
const PREFIX = "E2E_BRIDGE_TEST";
const sourceUrl = process.env.DATABASE_URL;
if (!sourceUrl) throw new Error("DATABASE_URL no está configurada");

const source = new URL(sourceUrl);
const suffix = `${process.pid}_${randomBytes(3).toString("hex")}`;
const temporaryDatabase = `pmp_suite_e2e_bridge_${suffix}`.toLowerCase();
assert.match(temporaryDatabase, /^pmp_suite_e2e_bridge_[a-z0-9_]+$/);

const postgresBinCandidates = [
  process.env.POSTGRES_BIN,
  "C:\\Program Files\\PostgreSQL\\18\\bin",
  "C:\\Program Files\\PostgreSQL\\17\\bin",
  "C:\\Program Files\\PostgreSQL\\16\\bin"
].filter(Boolean);
const postgresBin = postgresBinCandidates.find((candidate) =>
  existsSync(`${candidate}\\pg_dump.exe`) && existsSync(`${candidate}\\psql.exe`)
);
if (!postgresBin) throw new Error("No se encontraron pg_dump.exe y psql.exe");

const pgEnvironment = (url) => {
  const parsed = new URL(url);
  return {
    ...process.env,
    PGHOST: parsed.hostname,
    PGPORT: parsed.port || "5432",
    PGUSER: decodeURIComponent(parsed.username),
    PGPASSWORD: decodeURIComponent(parsed.password),
    PGDATABASE: parsed.pathname.replace(/^\//, "")
  };
};

const sourcePool = new Pool({ connectionString: sourceUrl });
let testPool;
let server;
let temporaryUrl;
let temporaryRoot;
let temporaryData;
let temporaryClusterStarted = false;
const report = {
  ok: false,
  isolation: {
    method: "clúster PostgreSQL efímero con schema-only y fixtures propios",
    database: "postgres en servidor local efímero",
    firebaseUsersCreated: false,
    sourceDatabaseWritten: false
  },
  steps: [],
  positive: [],
  negative: [],
  cleanup: null
};

function markProgress(message) {
  console.error(`[bridge-e2e] ${message}`);
  if (temporaryRoot && existsSync(temporaryRoot)) {
    appendFileSync(join(temporaryRoot, "progress.log"), `${new Date().toISOString()} ${message}\n`);
  }
}

const users = Object.freeze({
  admin: {
    id: "e2e00000-0000-4000-8000-000000000001",
    email: "e2e_bridge_test_admin@pmp-suite.test",
    role: "admin"
  },
  gerente: {
    id: "e2e00000-0000-4000-8000-000000000002",
    email: "e2e_bridge_test_gerente@pmp-suite.test",
    role: "gerente"
  },
  logistica: {
    id: "e2e00000-0000-4000-8000-000000000003",
    email: "e2e_bridge_test_logistica@pmp-suite.test",
    role: "logistica"
  },
  terrenoA: {
    id: "e2e00000-0000-4000-8000-000000000004",
    email: "e2e_bridge_test_terreno_a@pmp-suite.test",
    role: "tecnico_terreno"
  },
  terrenoB: {
    id: "e2e00000-0000-4000-8000-000000000005",
    email: "e2e_bridge_test_terreno_b@pmp-suite.test",
    role: "tecnico_terreno"
  },
  labA: {
    id: "e2e00000-0000-4000-8000-000000000006",
    email: "e2e_bridge_test_lab_a@pmp-suite.test",
    role: "tecnico_laboratorio"
  },
  labB: {
    id: "e2e00000-0000-4000-8000-000000000007",
    email: "e2e_bridge_test_lab_b@pmp-suite.test",
    role: "tecnico_laboratorio"
  },
  qaA: {
    id: "e2e00000-0000-4000-8000-000000000008",
    email: "e2e_bridge_test_qa_a@pmp-suite.test",
    role: "qa"
  },
  qaB: {
    id: "e2e00000-0000-4000-8000-000000000009",
    email: "e2e_bridge_test_qa_b@pmp-suite.test",
    role: "qa"
  }
});

const GOOD_EQUIPMENT = `${PREFIX}_GOOD`;
const BAD_EQUIPMENT = `${PREFIX}_BAD`;
const TEST_BUS = "E2EBT001";
const TEST_PST = "E2E_BRIDGE_TEST_PST";

function runProgram(executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    maxBuffer: 25 * 1024 * 1024,
    ...options
  });
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString("utf8")
      : String(result.stderr || "");
    throw new Error(`${executable} terminó con código ${result.status}: ${stderr.trim()}`);
  }
  return result;
}

async function availablePort() {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close((error) => error ? reject(error) : resolvePort(address.port));
    });
  });
}

async function createIsolatedDatabase() {
  temporaryRoot = mkdtempSync(join(tmpdir(), "pmp-suite-bridge-e2e-"));
  temporaryData = join(temporaryRoot, "data");
  const port = await availablePort();
  runProgram(
    `${postgresBin}\\initdb.exe`,
    ["--pgdata", temporaryData, "--auth", "trust", "--username", "postgres", "--encoding", "UTF8", "--no-locale"],
    { encoding: "utf8" }
  );
  runProgram(
    `${postgresBin}\\pg_ctl.exe`,
    ["--pgdata", temporaryData, "--options", `-h 127.0.0.1 -p ${port}`, "--wait", "start"],
    { encoding: "utf8", stdio: "ignore" }
  );
  temporaryClusterStarted = true;
  temporaryUrl = `postgresql://postgres@127.0.0.1:${port}/postgres`;

  const dump = runProgram(
    `${postgresBin}\\pg_dump.exe`,
    ["--schema-only", "--no-owner", "--no-privileges"],
    { env: pgEnvironment(sourceUrl), encoding: null }
  );
  runProgram(
    `${postgresBin}\\psql.exe`,
    ["--set", "ON_ERROR_STOP=1", "--quiet"],
    { env: pgEnvironment(temporaryUrl), input: dump.stdout, encoding: null }
  );
}

async function seedFixtures() {
  const client = await testPool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      INSERT INTO pmp.estados (id, nombre) VALUES
        (1,'EN_RUTA'), (2,'EN_TRANSITO'), (3,'EN_BODEGA'),
        (4,'EN_DIAGNOSTICO'), (5,'EN_REPARACION'), (6,'EN_QA'),
        (7,'DISPONIBLE'), (8,'RECHAZADO'), (9,'ESPERA_REPUESTO'),
        (10,'FINALIZADO_TALLER'), (11,'EN_TRAYECTO_BODEGA'),
        (12,'INSTALADO'), (13,'CERRADO')
    `);
    await client.query(
      `INSERT INTO pmp.usuarios (id,nombre,apellido,correo,rol,activo,firebase_uid)
       SELECT x.id::uuid, $1, x.apellido, x.correo, x.rol, TRUE, NULL
       FROM jsonb_to_recordset($2::jsonb)
         AS x(id text, apellido text, correo text, rol text)`,
      [PREFIX, JSON.stringify(Object.entries(users).map(([key, user]) => ({
        id: user.id,
        apellido: key,
        correo: user.email,
        rol: user.role
      })))]
    );
    await client.query(
      "INSERT INTO pmp.validadores (serie,modelo,marca) VALUES ($1,$3,'E2E'),($2,$3,'E2E')",
      [GOOD_EQUIPMENT, BAD_EQUIPMENT, PREFIX]
    );
    await client.query("INSERT INTO pmp.buses (ppu) VALUES ($1)", [TEST_BUS]);
    await client.query("INSERT INTO pmp.pst (codigo,nombre) VALUES ($1,$2)", [TEST_PST, `${PREFIX} PST`]);
    const terminal = await client.query(
      "INSERT INTO pmp.terminales (nombre) VALUES ($1) RETURNING id",
      [`${PREFIX} TERMINAL`]
    );
    await client.query(
      "INSERT INTO pmp.terminal_pst (terminal_id,pst_codigo) VALUES ($1,$2)",
      [terminal.rows[0].id, TEST_PST]
    );
    const locations = await client.query(
      `INSERT INTO pmp.ubicaciones (nombre,tipo) VALUES
         ($1,'BODEGA'),($2,'LABORATORIO'),($3,'QA')
       RETURNING id,tipo`,
      [`${PREFIX} BODEGA`, `${PREFIX} LABORATORIO`, `${PREFIX} QA`]
    );
    const byType = Object.fromEntries(locations.rows.map((row) => [row.tipo, row.id]));
    await client.query(`
      INSERT INTO pmp.config_estado_ubicacion (estado_id,tipo_ubicacion) VALUES
        (3,'BODEGA'),(4,'LABORATORIO'),(5,'LABORATORIO'),
        (7,'BODEGA'),(9,'LABORATORIO')
    `);
    const stock = await client.query(
      `INSERT INTO pmp.ordenes_servicio (
         tipo_equipo,es_pod,validador_serie,consola_serie,falla,estado_id,
         bus_ppu,terminal_id,pst_codigo,ubicacion_id,es_instalacion
       ) VALUES ('VALIDADOR',FALSE,$1,NULL,$2,7,$3,$4,$5,$6,TRUE)
       RETURNING codigo_os`,
      [GOOD_EQUIPMENT, `${PREFIX} EQUIPO PREPARADO`, TEST_BUS,
        terminal.rows[0].id, TEST_PST, byType.BODEGA]
    );
    await client.query("COMMIT");
    return {
      terminalId: terminal.rows[0].id,
      bodegaId: byType.BODEGA,
      laboratorioId: byType.LABORATORIO,
      qaId: byType.QA,
      preparedOs: stock.rows[0].codigo_os
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function replaceFirebaseAuth(router) {
  const layer = router.stack.find((candidate) => candidate.handle?.name === "firebaseAuthMiddleware");
  assert.ok(layer, "No se encontró firebaseAuthMiddleware en el router de prueba");
  layer.handle = function e2eFirebaseAuth(req, res, next) {
    const actor = req.get("x-e2e-actor");
    const identity = users[actor];
    if (!identity) return res.status(401).json({ error: "E2E_AUTH_REQUIRED" });
    req.firebase = {
      uid: `fixture-${actor}`,
      email: identity.email,
      name: `${PREFIX} ${actor}`
    };
    return next();
  };
}

async function startHarness() {
  process.env.DATABASE_URL = temporaryUrl;
  const [{ default: express }, { pool }, { default: bridgeRouter }, { default: bodegaRouter }] = await Promise.all([
    import("express"),
    import("../src/db.js"),
    import("../src/routes/bridge.routes.js"),
    import("../src/routes/bodega.routes.js")
  ]);
  testPool = pool;
  replaceFirebaseAuth(bridgeRouter);
  replaceFirebaseAuth(bodegaRouter);

  const app = express();
  app.use(express.json());
  app.use("/api/bridge", bridgeRouter);
  app.use("/api/bodega", bodegaRouter);
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    return res.status(error.status || 500).json({ error: error.message });
  });
  server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    instance.once("error", reject);
  });
  const address = server.address();
  return {
    pool,
    baseUrl: `http://127.0.0.1:${address.port}`
  };
}

async function request(baseUrl, actor, method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    signal: AbortSignal.timeout(10_000),
    headers: {
      "content-type": "application/json",
      "x-e2e-actor": actor
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
  }
  return { status: response.status, data };
}

async function endPoolWithin(pool, milliseconds, label) {
  let timeout;
  const ended = await Promise.race([
    pool.end().then(() => true),
    new Promise((resolveTimeout) => {
      timeout = setTimeout(() => resolveTimeout(false), milliseconds);
    })
  ]);
  if (timeout) clearTimeout(timeout);
  if (!ended) {
    report.cleanupWarnings ??= [];
    report.cleanupWarnings.push(`${label} no confirmó cierre dentro de ${milliseconds} ms`);
  }
}

function expectStatus(response, expected, label) {
  assert.equal(
    response.status,
    expected,
    `${label}: se esperaba HTTP ${expected}, se recibió ${response.status} (${JSON.stringify(response.data)})`
  );
  return response.data;
}

async function databaseSnapshot(pool, bridgeCode, maintenanceCode) {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM pmp.bridges WHERE codigo_bridge=$1) bridges,
       (SELECT COUNT(*)::int FROM pmp.bridge_mantenimiento WHERE bridge_codigo=$1) relaciones,
       (SELECT COUNT(*)::int FROM pmp.ordenes_servicio WHERE codigo_os=$2) mantenimientos,
       (SELECT COUNT(*)::int FROM pmp.instalaciones_equipos WHERE bridge_codigo=$1) instalaciones,
       (SELECT COUNT(*)::int FROM pmp.flujo_eventos WHERE bridge_codigo=$1) eventos,
       (SELECT COUNT(*)::int FROM pmp.qa_inspecciones WHERE codigo_os=$2) qa,
       (SELECT COUNT(*)::int FROM pmp.registro_reparaciones WHERE codigo_os=$2) reparaciones,
       (SELECT COUNT(*)::int FROM pmp.solicitudes_repuestos WHERE codigo_os=$2) solicitudes`,
    [bridgeCode, maintenanceCode]
  );
  return result.rows[0];
}

async function executeFlow(pool, baseUrl, fixture) {
  const bridgeBody = {
    tipo_equipo: "VALIDADOR",
    equipo_preparado_serie: GOOD_EQUIPMENT,
    tecnico_terreno_id: users.terrenoA.id,
    bus_esperado: TEST_BUS,
    terminal_esperado_id: fixture.terminalId,
    pst_esperado_codigo: TEST_PST,
    motivo: `${PREFIX} FALLA EN TERRENO`,
    observacion_logistica: `${PREFIX} REEMPLAZO PREPARADO`
  };

  const forbiddenCreation = await request(baseUrl, "terrenoA", "POST", "/api/bridge", bridgeBody);
  expectStatus(forbiddenCreation, 403, "Terreno no crea Bridge");
  report.negative.push({ test: "terreno crea Bridge", status: forbiddenCreation.status });

  const created = expectStatus(
    await request(baseUrl, "logistica", "POST", "/api/bridge", bridgeBody),
    201,
    "Logística crea Bridge"
  );
  const bridgeCode = created.bridge.codigo_bridge;
  assert.equal(created.bridge.estado, "ASIGNADA");
  assert.equal(created.bridge.origen, "PMP");
  assert.equal(created.bridge.sistema_externo, null);
  assert.equal(created.bridge.referencia_externa, null);
  assert.equal(created.bridge.tecnico_terreno_id, users.terrenoA.id);
  const creationEvents = await pool.query(
    "SELECT tipo,usuario_id,rol,fecha FROM pmp.flujo_eventos WHERE bridge_codigo=$1 ORDER BY id",
    [bridgeCode]
  );
  assert.deepEqual(creationEvents.rows.map((row) => row.tipo), ["BRIDGE_CREADA", "BRIDGE_ASIGNADA_TERRENO"]);
  assert.ok(creationEvents.rows.every((row) => row.usuario_id === users.logistica.id && row.rol === "logistica" && row.fecha));
  report.steps.push("Bridge creada y asignada por logística");

  expectStatus(
    await request(baseUrl, "admin", "PATCH", `/api/bridge/${bridgeCode}/asignar-terreno`, {
      tecnico_terreno_id: users.terrenoB.id
    }),
    200,
    "Admin reasigna terreno"
  );
  expectStatus(
    await request(baseUrl, "logistica", "PATCH", `/api/bridge/${bridgeCode}/asignar-terreno`, {
      tecnico_terreno_id: users.terrenoA.id
    }),
    200,
    "Logística devuelve asignación a terreno A"
  );

  expectStatus(
    await request(baseUrl, "terrenoA", "GET", `/api/bridge/${bridgeCode}`),
    200,
    "Terreno A consulta Bridge propia"
  );
  expectStatus(
    await request(baseUrl, "terrenoB", "GET", `/api/bridge/${bridgeCode}`),
    404,
    "Terreno B no consulta Bridge ajena"
  );
  const beforeForeignAttempt = await pool.query(
    "SELECT estado,iniciado_en FROM pmp.bridges WHERE codigo_bridge=$1",
    [bridgeCode]
  );
  const foreignStart = await request(baseUrl, "terrenoB", "POST", `/api/bridge/${bridgeCode}/iniciar`, {});
  expectStatus(foreignStart, 403, "Terreno B no inicia Bridge ajena");
  const foreignComplete = await request(baseUrl, "terrenoB", "POST", `/api/bridge/${bridgeCode}/completar`, {
    equipo_retirado_serie: BAD_EQUIPMENT,
    equipo_instalado_serie: GOOD_EQUIPMENT,
    bus_confirmado: TEST_BUS,
    terminal_confirmada_id: fixture.terminalId,
    pst_confirmado_codigo: TEST_PST,
    intervencion_en: new Date().toISOString(),
    observacion_terreno: `${PREFIX} INTENTO AJENO`,
    evidencia_url: `https://example.invalid/${PREFIX}`
  });
  expectStatus(foreignComplete, 403, "Terreno B no completa Bridge ajena");
  const afterForeignAttempt = await pool.query(
    "SELECT estado,iniciado_en FROM pmp.bridges WHERE codigo_bridge=$1",
    [bridgeCode]
  );
  assert.deepEqual(afterForeignAttempt.rows[0], beforeForeignAttempt.rows[0]);
  report.negative.push({ test: "ownership terreno ajeno", statuses: [foreignStart.status, foreignComplete.status], modified: false });

  const adminTechnical = await request(baseUrl, "admin", "POST", `/api/bridge/${bridgeCode}/iniciar`, {});
  expectStatus(adminTechnical, 403, "Admin no inicia terreno");

  const started = expectStatus(
    await request(baseUrl, "terrenoA", "POST", `/api/bridge/${bridgeCode}/iniciar`, {}),
    200,
    "Terreno A inicia intervención"
  );
  assert.equal(started.bridge.estado, "EN_TERRENO");
  assert.ok(started.bridge.iniciado_en);
  const beforeCompletion = await pool.query(
    "SELECT COUNT(*)::int AS count FROM pmp.bridge_mantenimiento WHERE bridge_codigo=$1",
    [bridgeCode]
  );
  assert.equal(beforeCompletion.rows[0].count, 0);
  report.steps.push("Intervención iniciada por terreno A sin mantenimiento anticipado");

  const interventionAt = new Date(Date.now() - 60_000).toISOString();
  const completionBody = {
    equipo_retirado_serie: BAD_EQUIPMENT,
    equipo_instalado_serie: GOOD_EQUIPMENT,
    bus_confirmado: TEST_BUS,
    terminal_confirmada_id: fixture.terminalId,
    pst_confirmado_codigo: TEST_PST,
    intervencion_en: interventionAt,
    observacion_terreno: `${PREFIX} CAMBIO EJECUTADO`,
    evidencia_url: `https://example.invalid/${PREFIX}/evidencia`,
    resultado: "EXITOSA"
  };
  const completed = expectStatus(
    await request(baseUrl, "terrenoA", "POST", `/api/bridge/${bridgeCode}/completar`, completionBody),
    201,
    "Terreno A completa Bridge"
  );
  const maintenanceCode = completed.mantenimiento.codigo_os;
  assert.equal(completed.bridge_codigo, bridgeCode);
  assert.equal(completed.mantenimiento.estado_id, 2);
  assert.equal(completed.mantenimiento.validador_serie, BAD_EQUIPMENT);

  const completedState = await pool.query(
    `SELECT b.*,bm.codigo_os,i.equipo_retirado_serie,i.equipo_instalado_serie,
            i.bus_ppu,i.terminal_id,i.pst_codigo,
            prepared.estado_id AS prepared_estado,maintenance.estado_id AS maintenance_estado
     FROM pmp.bridges b
     JOIN pmp.bridge_mantenimiento bm ON bm.bridge_codigo=b.codigo_bridge
     JOIN pmp.instalaciones_equipos i ON i.bridge_codigo=b.codigo_bridge
     JOIN pmp.ordenes_servicio maintenance ON maintenance.codigo_os=bm.codigo_os
     JOIN pmp.ordenes_servicio prepared ON prepared.codigo_os=$2
     WHERE b.codigo_bridge=$1`,
    [bridgeCode, fixture.preparedOs]
  );
  assert.equal(completedState.rowCount, 1);
  const completedRow = completedState.rows[0];
  assert.equal(completedRow.estado, "COMPLETADA");
  assert.equal(completedRow.equipo_retirado_serie, BAD_EQUIPMENT);
  assert.equal(completedRow.equipo_instalado_serie, GOOD_EQUIPMENT);
  assert.equal(completedRow.prepared_estado, 12);
  assert.equal(completedRow.maintenance_estado, 2);
  report.steps.push("Bridge completada atómicamente y una OS de mantenimiento generada");

  const countsBeforeRetry = await databaseSnapshot(pool, bridgeCode, maintenanceCode);
  const retried = await request(baseUrl, "terrenoA", "POST", `/api/bridge/${bridgeCode}/completar`, completionBody);
  expectStatus(retried, 409, "Segunda finalización es idempotente");
  const countsAfterRetry = await databaseSnapshot(pool, bridgeCode, maintenanceCode);
  assert.deepEqual(countsAfterRetry, countsBeforeRetry);
  report.positive.push({ test: "idempotencia", status: retried.status, countsUnchanged: true });

  const historicalBefore = await pool.query("SELECT * FROM pmp.bridges WHERE codigo_bridge=$1", [bridgeCode]);
  for (const [actor, operation] of [
    ["admin", "PATCH"],
    ["logistica", "PATCH"]
  ]) {
    const denied = await request(baseUrl, actor, operation, `/api/bridge/${bridgeCode}/asignar-terreno`, {
      tecnico_terreno_id: users.terrenoB.id
    });
    expectStatus(denied, 409, `${actor} no reasigna Bridge cerrada`);
  }
  for (const actor of ["admin", "logistica", "labA", "qaA"]) {
    const denied = await request(baseUrl, actor, "POST", `/api/bridge/${bridgeCode}/completar`, {
      ...completionBody,
      observacion_terreno: `${PREFIX} ALTERACIÓN ${actor}`
    });
    expectStatus(denied, 403, `${actor} no sobrescribe terreno`);
  }
  const directFields = {
    tecnico_terreno_id: users.terrenoB.id,
    equipo_retirado_serie: GOOD_EQUIPMENT,
    equipo_instalado_serie: BAD_EQUIPMENT,
    bus_confirmado: "ALTERADO",
    terminal_confirmada_id: fixture.terminalId,
    observacion_terreno: `${PREFIX} ALTERADO`,
    evidencia_url: "https://example.invalid/alterado",
    intervencion_en: new Date(0).toISOString()
  };
  const immutableCodes = [];
  for (const [field, value] of Object.entries(directFields)) {
    try {
      await pool.query(`UPDATE pmp.bridges SET ${field}=$2 WHERE codigo_bridge=$1`, [bridgeCode, value]);
      assert.fail(`La base permitió alterar ${field}`);
    } catch (error) {
      if (error.code === "ERR_ASSERTION") throw error;
      immutableCodes.push(error.code);
    }
  }
  assert.ok(immutableCodes.every((code) => code === "P0001"));
  const historicalAfter = await pool.query("SELECT * FROM pmp.bridges WHERE codigo_bridge=$1", [bridgeCode]);
  assert.deepEqual(historicalAfter.rows[0], historicalBefore.rows[0]);
  report.positive.push({ test: "inmutabilidad terreno", fields: Object.keys(directFields), databaseCode: "P0001" });

  const labReceive = await request(baseUrl, "labA", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/recibir-terreno`, {
    equipo_serie: BAD_EQUIPMENT,
    ubicacion_id: fixture.bodegaId
  });
  expectStatus(labReceive, 403, "Laboratorio no recibe desde terreno");
  expectStatus(
    await request(baseUrl, "logistica", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/recibir-terreno`, {
      equipo_serie: BAD_EQUIPMENT,
      ubicacion_id: fixture.bodegaId,
      condicion: `${PREFIX} RECIBIDO SIN DAÑO ADICIONAL`
    }),
    200,
    "Logística recibe desde terreno"
  );
  let maintenance = await pool.query("SELECT * FROM pmp.ordenes_servicio WHERE codigo_os=$1", [maintenanceCode]);
  assert.equal(maintenance.rows[0].estado_id, 3);
  assert.equal(maintenance.rows[0].ubicacion_id, fixture.bodegaId);
  assert.equal((await pool.query("SELECT COUNT(*)::int count FROM pmp.registro_reparaciones WHERE codigo_os=$1", [maintenanceCode])).rows[0].count, 0);

  expectStatus(
    await request(baseUrl, "admin", "PATCH", `/api/bridge/mantenimiento/${maintenanceCode}/asignar-lab`, {
      tecnico_laboratorio_id: users.labA.id
    }),
    200,
    "Admin asigna laboratorio A"
  );
  expectStatus(
    await request(baseUrl, "labA", "GET", `/api/bridge/mantenimiento/${maintenanceCode}`),
    200,
    "Laboratorio A consulta carga propia"
  );
  expectStatus(
    await request(baseUrl, "labB", "GET", `/api/bridge/mantenimiento/${maintenanceCode}`),
    404,
    "Laboratorio B no consulta carga ajena"
  );
  const labBStart = await request(baseUrl, "labB", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/iniciar-reparacion`, {});
  expectStatus(labBStart, 403, "Laboratorio B no trabaja carga ajena");

  expectStatus(
    await request(baseUrl, "logistica", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/despachar-lab`, {
      ubicacion_id: fixture.laboratorioId
    }),
    200,
    "Logística despacha a laboratorio"
  );
  const logisticsDiagnose = await request(baseUrl, "logistica", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/iniciar-reparacion`, {});
  expectStatus(logisticsDiagnose, 403, "Logística no diagnostica");
  expectStatus(
    await request(baseUrl, "labA", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/iniciar-reparacion`, {}),
    200,
    "Laboratorio A inicia reparación"
  );

  const stockBefore = await pool.query("SELECT COALESCE(SUM(stock),0)::int stock FROM pmp.repuestos");
  const partRequest = expectStatus(
    await request(baseUrl, "labA", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/solicitar-repuesto`, {
      repuesto: `${PREFIX} REPUESTO`,
      comentario: `${PREFIX} SOLICITUD CONTROLADA`
    }),
    201,
    "Laboratorio solicita repuesto"
  );
  const stockAfterRequest = await pool.query("SELECT COALESCE(SUM(stock),0)::int stock FROM pmp.repuestos");
  assert.equal(stockAfterRequest.rows[0].stock, stockBefore.rows[0].stock);
  expectStatus(
    await request(baseUrl, "logistica", "PUT", `/api/bodega/solicitudes/${partRequest.solicitud.id}/entregar`, {}),
    200,
    "Logística entrega repuesto"
  );

  expectStatus(
    await request(baseUrl, "labA", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/completar-reparacion`, {
      diagnostico: `${PREFIX} DIAGNÓSTICO INICIAL`,
      reparacion: `${PREFIX} REPARACIÓN INICIAL`,
      prueba: `${PREFIX} PRUEBA FUNCIONAL`,
      resultado_prueba: "OBSERVADO",
      repuestos_usados: `${PREFIX} REPUESTO`,
      comentario: `${PREFIX} ENVÍO A QA`
    }),
    200,
    "Laboratorio finaliza reparación"
  );
  maintenance = await pool.query("SELECT * FROM pmp.ordenes_servicio WHERE codigo_os=$1", [maintenanceCode]);
  assert.equal(maintenance.rows[0].estado_id, 6);

  expectStatus(
    await request(baseUrl, "admin", "PATCH", `/api/bridge/mantenimiento/${maintenanceCode}/asignar-qa`, {
      qa_usuario_id: users.qaA.id
    }),
    200,
    "Admin asigna QA A"
  );
  expectStatus(
    await request(baseUrl, "qaA", "GET", `/api/bridge/mantenimiento/${maintenanceCode}`),
    200,
    "QA A consulta asignación propia"
  );
  expectStatus(
    await request(baseUrl, "qaB", "GET", `/api/bridge/mantenimiento/${maintenanceCode}`),
    404,
    "QA B no consulta asignación ajena"
  );
  const qaBAction = await request(baseUrl, "qaB", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/qa`, {
    accion: "APROBAR",
    comentario: `${PREFIX} INTENTO AJENO`
  });
  expectStatus(qaBAction, 403, "QA B no procesa asignación ajena");
  const qaRepair = await request(baseUrl, "qaA", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/completar-reparacion`, {
    diagnostico: `${PREFIX} ALTERACIÓN`, reparacion: `${PREFIX} ALTERACIÓN`,
    prueba: `${PREFIX} ALTERACIÓN`, resultado_prueba: "ALTERADO"
  });
  expectStatus(qaRepair, 403, "QA no altera reparación");

  expectStatus(
    await request(baseUrl, "qaA", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/qa`, {
      accion: "RECHAZAR",
      comentario: `${PREFIX} RECHAZO POR PRUEBA INESTABLE`,
      certificacion: `${PREFIX} QA-REJECT`
    }),
    200,
    "QA A rechaza con motivo"
  );
  maintenance = await pool.query("SELECT * FROM pmp.ordenes_servicio WHERE codigo_os=$1", [maintenanceCode]);
  assert.equal(maintenance.rows[0].estado_id, 5);
  assert.equal(maintenance.rows[0].tecnico_laboratorio_id, users.labA.id);
  const afterReject = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM pmp.qa_inspecciones WHERE codigo_os=$1 AND resultado='RECHAZADO') rechazadas,
       (SELECT COUNT(*)::int FROM pmp.registro_reparaciones WHERE codigo_os=$1) reparaciones`,
    [maintenanceCode]
  );
  assert.deepEqual(afterReject.rows[0], { rechazadas: 1, reparaciones: 1 });
  report.steps.push("QA rechazó y devolvió a retrabajo conservando historial y laboratorio A");

  expectStatus(
    await request(baseUrl, "labA", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/completar-reparacion`, {
      diagnostico: `${PREFIX} DIAGNÓSTICO RETRABAJO`,
      reparacion: `${PREFIX} AJUSTE DE RETRABAJO`,
      prueba: `${PREFIX} PRUEBA REPETIDA`,
      resultado_prueba: "CONFORME",
      comentario: `${PREFIX} RETRABAJO COMPLETADO`
    }),
    200,
    "Laboratorio A completa retrabajo"
  );
  expectStatus(
    await request(baseUrl, "admin", "PATCH", `/api/bridge/mantenimiento/${maintenanceCode}/asignar-qa`, {
      qa_usuario_id: users.qaA.id
    }),
    200,
    "Admin reasigna QA A"
  );
  expectStatus(
    await request(baseUrl, "qaA", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/qa`, {
      accion: "APROBAR",
      comentario: `${PREFIX} APROBACIÓN FINAL`,
      certificacion: `${PREFIX} CERTIFICADO`
    }),
    200,
    "QA A aprueba retrabajo"
  );
  maintenance = await pool.query("SELECT * FROM pmp.ordenes_servicio WHERE codigo_os=$1", [maintenanceCode]);
  assert.equal(maintenance.rows[0].estado_id, 11);
  assert.equal(maintenance.rows[0].ubicacion_id, null);
  const inspections = await pool.query(
    "SELECT resultado,qa_usuario_id,comentario,fecha FROM pmp.qa_inspecciones WHERE codigo_os=$1 ORDER BY fecha,id",
    [maintenanceCode]
  );
  assert.deepEqual(inspections.rows.map((row) => row.resultado), ["RECHAZADO", "APROBADO"]);
  assert.ok(inspections.rows.every((row) => row.qa_usuario_id === users.qaA.id && row.comentario && row.fecha));

  const qaPhysicalMove = await request(baseUrl, "qaA", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/recibir-qa`, {
    equipo_serie: BAD_EQUIPMENT,
    ubicacion_id: fixture.bodegaId
  });
  expectStatus(qaPhysicalMove, 403, "QA no mueve físicamente a bodega");
  maintenance = await pool.query("SELECT estado_id,ubicacion_id FROM pmp.ordenes_servicio WHERE codigo_os=$1", [maintenanceCode]);
  assert.deepEqual(maintenance.rows[0], { estado_id: 11, ubicacion_id: null });
  expectStatus(
    await request(baseUrl, "logistica", "POST", `/api/bridge/mantenimiento/${maintenanceCode}/recibir-qa`, {
      equipo_serie: BAD_EQUIPMENT,
      ubicacion_id: fixture.bodegaId,
      comentario: `${PREFIX} RECEPCIÓN FINAL`
    }),
    200,
    "Logística recibe desde QA"
  );
  maintenance = await pool.query("SELECT * FROM pmp.ordenes_servicio WHERE codigo_os=$1", [maintenanceCode]);
  assert.equal(maintenance.rows[0].estado_id, 7);
  assert.equal(maintenance.rows[0].ubicacion_id, fixture.bodegaId);

  const managerBridge = await request(baseUrl, "gerente", "GET", `/api/bridge/${bridgeCode}`);
  expectStatus(managerBridge, 200, "Gerente consulta trazabilidad Bridge");
  const managerMaintenance = await request(baseUrl, "gerente", "GET", `/api/bridge/mantenimiento/${maintenanceCode}`);
  expectStatus(managerMaintenance, 200, "Gerente consulta mantenimiento Bridge");
  const managerWrite = await request(baseUrl, "gerente", "POST", `/api/bridge/${bridgeCode}/cancelar`, {
    motivo: `${PREFIX} INTENTO GERENTE`
  });
  expectStatus(managerWrite, 403, "Gerente no escribe en flujo");
  assert.equal(managerWrite.data.error, "READ_ONLY_ROLE");

  const eventResult = await pool.query(
    `SELECT e.id,e.tipo,e.usuario_id,e.rol,e.fecha,e.bridge_codigo,e.codigo_os,u.rol AS user_role
     FROM pmp.flujo_eventos e
     JOIN pmp.usuarios u ON u.id=e.usuario_id
     WHERE e.bridge_codigo=$1 ORDER BY e.fecha,e.id`,
    [bridgeCode]
  );
  const events = eventResult.rows;
  assert.ok(events.every((event) => event.rol === event.user_role));
  assert.ok(events.every((event) => event.bridge_codigo === bridgeCode));
  assert.ok(events.every((event, index) => index === 0 || Number(event.id) > Number(events[index - 1].id)));
  assert.ok(events.every((event, index) => index === 0 || new Date(event.fecha) >= new Date(events[index - 1].fecha)));
  const expectedSequence = [
    "BRIDGE_CREADA", "BRIDGE_ASIGNADA_TERRENO", "INTERVENCION_INICIADA",
    "INTERVENCION_COMPLETADA", "MANTENIMIENTO_GENERADO",
    "LOGISTICA_RECIBE_DESDE_TERRENO", "MANTENIMIENTO_ASIGNADO_LAB",
    "LOGISTICA_DESPACHA_A_LAB", "LAB_REPARACION_INICIADA",
    "LAB_REPARACION_COMPLETADA", "MANTENIMIENTO_ASIGNADO_QA",
    "QA_RECHAZADO_RETRABAJO", "LAB_REPARACION_COMPLETADA",
    "MANTENIMIENTO_ASIGNADO_QA", "QA_APROBADO", "LOGISTICA_RECIBE_DESDE_QA"
  ];
  let cursor = -1;
  for (const type of expectedSequence) {
    cursor = events.findIndex((event, index) => index > cursor && event.tipo === type);
    assert.notEqual(cursor, -1, `Falta el evento ${type}`);
  }
  const eventCounts = Object.fromEntries(
    [...new Set(events.map((event) => event.tipo))].map((type) => [type, events.filter((event) => event.tipo === type).length])
  );
  assert.equal(eventCounts.BRIDGE_CREADA, 1);
  assert.equal(eventCounts.INTERVENCION_COMPLETADA, 1);
  assert.equal(eventCounts.MANTENIMIENTO_GENERADO, 1);
  assert.equal(eventCounts.LOGISTICA_RECIBE_DESDE_TERRENO, 1);
  assert.equal(eventCounts.QA_RECHAZADO_RETRABAJO, 1);
  assert.equal(eventCounts.QA_APROBADO, 1);
  assert.equal(eventCounts.LOGISTICA_RECIBE_DESDE_QA, 1);

  const integrity = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM pmp.bridges WHERE motivo LIKE $1) bridges,
       (SELECT COUNT(*)::int FROM pmp.bridge_mantenimiento bm JOIN pmp.bridges b ON b.codigo_bridge=bm.bridge_codigo WHERE b.motivo LIKE $1) relations,
       (SELECT COUNT(*)::int FROM pmp.instalaciones_equipos WHERE bridge_codigo=$2) installations,
       (SELECT COUNT(*)::int FROM pmp.qa_inspecciones WHERE codigo_os=$3) qa_history,
       (SELECT COUNT(*)::int FROM pmp.registro_reparaciones WHERE codigo_os=$3) repair_history,
       (SELECT COUNT(*)::int FROM pmp.flujo_eventos WHERE bridge_codigo=$2) events,
       (SELECT COUNT(*)::int FROM pmp.bridge_mantenimiento bm LEFT JOIN pmp.bridges b ON b.codigo_bridge=bm.bridge_codigo LEFT JOIN pmp.ordenes_servicio o ON o.codigo_os=bm.codigo_os WHERE b.codigo_bridge IS NULL OR o.codigo_os IS NULL) orphan_relations,
       (SELECT COUNT(*)::int FROM pmp.flujo_eventos e LEFT JOIN pmp.usuarios u ON u.id=e.usuario_id WHERE u.id IS NULL) orphan_events,
       (SELECT COUNT(*)::int FROM pmp.qa_inspecciones q LEFT JOIN pmp.ordenes_servicio o ON o.codigo_os=q.codigo_os LEFT JOIN pmp.usuarios u ON u.id=q.qa_usuario_id WHERE o.codigo_os IS NULL OR u.id IS NULL) orphan_qa,
       (SELECT COUNT(*)::int FROM pmp.repuestos WHERE stock < 0) negative_stock`,
    [`${PREFIX}%`, bridgeCode, maintenanceCode]
  );
  assert.deepEqual(integrity.rows[0], {
    bridges: 1,
    relations: 1,
    installations: 1,
    qa_history: 2,
    repair_history: 2,
    events: events.length,
    orphan_relations: 0,
    orphan_events: 0,
    orphan_qa: 0,
    negative_stock: 0
  });
  const finalRelation = await pool.query(
    `SELECT bm.bridge_codigo,bm.codigo_os,o.estado_id,o.ubicacion_id,
            o.tecnico_laboratorio_id,o.qa_usuario_id,b.estado
     FROM pmp.bridge_mantenimiento bm
     JOIN pmp.bridges b ON b.codigo_bridge=bm.bridge_codigo
     JOIN pmp.ordenes_servicio o ON o.codigo_os=bm.codigo_os
     WHERE bm.bridge_codigo=$1`,
    [bridgeCode]
  );
  assert.deepEqual(finalRelation.rows[0], {
    bridge_codigo: bridgeCode,
    codigo_os: maintenanceCode,
    estado_id: 7,
    ubicacion_id: fixture.bodegaId,
    tecnico_laboratorio_id: users.labA.id,
    qa_usuario_id: users.qaA.id,
    estado: "COMPLETADA"
  });

  report.positive.push(
    { test: "flujo completo", bridgeCode, maintenanceCode, finalState: "DISPONIBLE" },
    { test: "QA histórico", results: inspections.rows.map((row) => row.resultado) },
    { test: "recepción logística", fromField: true, fromQa: true },
    { test: "trazabilidad", events: events.map((event) => event.tipo) },
    { test: "integridad", ...integrity.rows[0] }
  );
  report.negative.push(
    { test: "gerente escritura", status: managerWrite.status, code: managerWrite.data.error },
    { test: "admin ejecución técnica", status: adminTechnical.status },
    { test: "lab ajeno", status: labBStart.status },
    { test: "QA ajeno", status: qaBAction.status },
    { test: "QA movimiento físico", status: qaPhysicalMove.status },
    { test: "logística diagnóstico", status: logisticsDiagnose.status }
  );
  report.flow = {
    bridgeCode,
    maintenanceCode,
    finalState: 7,
    location: fixture.bodegaId,
    eventCount: events.length
  };
}

async function verifySourceUntouched() {
  const result = await sourcePool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM pmp.usuarios WHERE correo LIKE 'e2e_bridge_test_%') users,
       (SELECT COUNT(*)::int FROM pmp.validadores WHERE serie LIKE 'E2E_BRIDGE_TEST%') equipment,
       (SELECT COUNT(*)::int FROM pmp.buses WHERE ppu='E2EBT001') buses,
       (SELECT COUNT(*)::int FROM pmp.terminales WHERE nombre LIKE 'E2E_BRIDGE_TEST%') terminals,
       (SELECT COUNT(*)::int FROM pmp.pst WHERE codigo LIKE 'E2E_BRIDGE_TEST%') pst,
       (SELECT COUNT(*)::int FROM pmp.bridges WHERE motivo LIKE 'E2E_BRIDGE_TEST%') bridges,
       (SELECT COUNT(*)::int FROM pmp.ordenes_servicio WHERE COALESCE(validador_serie,consola_serie) LIKE 'E2E_BRIDGE_TEST%') service_orders,
       (SELECT COUNT(*)::int FROM pg_database WHERE datname=$1) temporary_databases`,
    [temporaryDatabase]
  );
  const expected = {
    users: 0,
    equipment: 0,
    buses: 0,
    terminals: 0,
    pst: 0,
    bridges: 0,
    service_orders: 0,
    temporary_databases: 0
  };
  assert.deepEqual(result.rows[0], expected);
  return result.rows[0];
}

async function cleanup() {
  markProgress("cleanup:http");
  if (server) {
    const currentServer = server;
    server = null;
    currentServer.closeAllConnections?.();
    currentServer.close();
  }
  markProgress("cleanup:test-pool");
  if (testPool) {
    await endPoolWithin(testPool, 5_000, "testPool");
    testPool = null;
  }
  markProgress("cleanup:postgres");
  if (temporaryClusterStarted) {
    runProgram(
      `${postgresBin}\\pg_ctl.exe`,
      ["--pgdata", temporaryData, "--mode", "fast", "--wait", "stop"],
      { encoding: "utf8", stdio: "ignore" }
    );
    temporaryClusterStarted = false;
  }
  markProgress("cleanup:files");
  if (temporaryRoot) {
    const root = resolve(temporaryRoot);
    const systemTemp = `${resolve(tmpdir())}${sep}`;
    assert.ok(root.startsWith(systemTemp));
    assert.ok(basename(root).startsWith("pmp-suite-bridge-e2e-"));
    rmSync(root, { recursive: true, force: true });
    temporaryRoot = null;
  }
  markProgress("cleanup:source-verification");
  report.cleanup = await verifySourceUntouched();
  report.cleanup.temporaryFiles = 0;
  markProgress("cleanup:done");
}

try {
  markProgress("isolated-database:start");
  await createIsolatedDatabase();
  markProgress("isolated-database:ready");
  const harness = await startHarness();
  markProgress("http-harness:ready");
  const fixture = await seedFixtures();
  markProgress("fixtures:ready");
  report.isolation.fixture = {
    prefix: PREFIX,
    busAlias: TEST_BUS,
    users: Object.keys(users).length,
    usesOperationalRows: false
  };
  await executeFlow(harness.pool, harness.baseUrl, fixture);
  markProgress("flow:done");
  report.ok = true;
} catch (error) {
  report.error = {
    name: error.name,
    message: error.message,
    code: error.code || null
  };
  process.exitCode = 1;
} finally {
  try {
    await cleanup();
  } catch (cleanupError) {
    report.cleanupError = {
      message: cleanupError.message,
      code: cleanupError.code || null
    };
    process.exitCode = 1;
  }
  await endPoolWithin(sourcePool, 5_000, "sourcePool");
  const exitCode = process.exitCode || 0;
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`, () => process.exit(exitCode));
}
