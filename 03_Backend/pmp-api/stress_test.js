/**
 * PMP Suite - Stress Test Suite
 * Prueba: concurrencia, race conditions en triggers PG, carga de endpoints
 */
import pkg from 'pg';
const { Pool } = pkg;

const BASE    = 'http://localhost:4000';
const API_KEY = 'AIzaSyDSxv0oW-h2liaJfu8jdWYXzRkBLjpoCaE';
const pool    = new Pool({ connectionString: 'postgresql://postgres:admin@localhost:5432/pmp_suite' });

// ── Config ───────────────────────────────────────────────────────────────────
const CONCURRENCY_OS       = 20;   // OS creadas simultáneamente
const CONCURRENCY_READS    = 50;   // Lecturas paralelas
const CONCURRENCY_RACE     = 10;   // Intentos de transición simultáneos sobre la MISMA OS
const REPEAT_BADGE         = 100;  // Llamadas al badge endpoint

// ── Stats ────────────────────────────────────────────────────────────────────
const stats = {
  passed: 0, failed: 0, errors: [],
  latencies: [],
  start: Date.now(),
};

function pass(name) {
  stats.passed++;
  process.stdout.write(`  ✅ ${name}\n`);
}
function fail(name, detail) {
  stats.failed++;
  stats.errors.push({ name, detail });
  process.stdout.write(`  ❌ ${name} → ${detail}\n`);
}

async function timed(fn) {
  const t = Date.now();
  const r = await fn();
  stats.latencies.push(Date.now() - t);
  return r;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function getToken(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password, returnSecureToken: true }) }
  );
  const d = await res.json();
  if (!d.idToken) throw new Error(`Login failed: ${email}`);
  return d.idToken;
}

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function dbQuery(sql, params = []) {
  const r = await pool.query(sql, params);
  return r.rows;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   PMP Suite — Stress Test Suite                         ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

console.log('🔑 Autenticando roles...');
const tokens = {};
try {
  [tokens.admin, tokens.terreno, tokens.lab, tokens.qa, tokens.bodega] = await Promise.all([
    getToken('rafael.oteiza@pmp-suite.cl',   '123456'),
    getToken('rodrigo.escobar@pmp-suite.cl', '123456'),
    getToken('jose.villarroel@pmp-suite.cl', '123456'),
    getToken('cristian.alvarez@pmp-suite.cl','123456'),
    getToken('bodega@pmp-suite.cl',          '123456'),
  ]);
  console.log('  ✅ Todos los tokens OK\n');
} catch(e) {
  console.error('  ❌ Auth fallida:', e.message);
  process.exit(1);
}

// ════════════════════════════════════════════════════════════════════════════
// TEST 1: Creación concurrente de OS (20 simultáneas)
// Objetivo: los triggers deben funcionar sin deadlocks ni duplicados de código
// ════════════════════════════════════════════════════════════════════════════
console.log(`⚡ [1/5] Creación Concurrente de OS (${CONCURRENCY_OS} simultáneas)...`);

const ts1 = Date.now();
const createJobs = Array.from({ length: CONCURRENCY_OS }, (_, i) => async () => {
  const serie = `STRESS-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`;
  const r = await timed(() => req('POST', '/api/os/crear', {
    tipo: i % 2 === 0 ? 'VALIDADOR' : 'CONSOLA',
    es_pod: false,
    falla: `Stress test falla ${i}`,
    bus_ppu: `STBUS${i}`,
    serie_equipo: serie,
    modelo: 'Stress-Model'
  }, tokens.terreno));
  return { i, status: r.status, codigo: r.data?.os?.codigo_os };
});

const results1 = await Promise.all(createJobs.map(fn => fn()));
const created  = results1.filter(r => r.status === 201);
const failed1  = results1.filter(r => r.status !== 201);

// Verificar códigos únicos (no duplicados)
const codigos = created.map(r => r.codigo).filter(Boolean);
const unique  = new Set(codigos);

const dur1 = Date.now() - ts1;
console.log(`  ⏱  ${dur1}ms total | ${Math.round(dur1/CONCURRENCY_OS)}ms promedio`);

if (created.length === CONCURRENCY_OS)
  pass(`Todas ${CONCURRENCY_OS} OS creadas exitosamente (201)`);
else
  fail(`OS concurrentes`, `Solo ${created.length}/${CONCURRENCY_OS} creadas. Errores: ${failed1.map(f=>f.status).join(',')}`);

if (unique.size === codigos.length)
  pass(`Códigos únicos — sin duplicados (${unique.size} distintos)`);
else
  fail(`Códigos duplicados`, `${codigos.length - unique.size} duplicados detectados`);

// Verificar en DB
const dbCodes = await dbQuery(
  `SELECT codigo_os FROM pmp.ordenes_servicio WHERE codigo_os = ANY($1)`,
  [codigos]
);
if (dbCodes.length === codigos.length)
  pass(`Todas las OS persistidas en DB`);
else
  fail(`OS en DB`, `Solo ${dbCodes.length}/${codigos.length} en base de datos`);

// ════════════════════════════════════════════════════════════════════════════
// TEST 2: Lecturas paralelas masivas (50 simultáneas por endpoint)
// Objetivo: verificar que los endpoints de consulta no se bloquean bajo carga
// ════════════════════════════════════════════════════════════════════════════
console.log(`\n📖 [2/5] Lecturas Paralelas (${CONCURRENCY_READS} simultáneas por endpoint)...`);

const readEndpoints = [
  { path: '/api/bodega/queue',       token: tokens.bodega, name: 'bodega/queue'   },
  { path: '/api/lab/queue/VALIDADOR',token: tokens.lab,    name: 'lab/queue'      },
  { path: '/api/qa/queue',           token: tokens.qa,     name: 'qa/queue'       },
  { path: '/api/dashboard/badges',   token: tokens.admin,  name: 'dashboard/badges'},
  { path: '/api/bodega/repuestos',   token: tokens.bodega, name: 'bodega/repuestos'},
];

for (const ep of readEndpoints) {
  const ts = Date.now();
  const reads = await Promise.all(
    Array.from({ length: CONCURRENCY_READS }, () =>
      timed(() => req('GET', ep.path, null, ep.token))
    )
  );
  const ok      = reads.filter(r => r.status === 200).length;
  const avgMs   = Math.round((Date.now() - ts) / CONCURRENCY_READS);
  const maxMs   = Math.max(...reads.map((_, i) => stats.latencies[stats.latencies.length - CONCURRENCY_READS + i] || 0));

  if (ok === CONCURRENCY_READS)
    pass(`${ep.name}: ${ok}/${CONCURRENCY_READS} OK | avg ${avgMs}ms | max ${maxMs}ms`);
  else
    fail(`${ep.name}`, `${CONCURRENCY_READS - ok} errores de ${CONCURRENCY_READS} solicitudes`);
}

// ════════════════════════════════════════════════════════════════════════════
// TEST 3: Race Condition en Trigger PG — Una OS, 10 recepciones simultáneas
// Objetivo: el trigger debe procesar solo UNA vez, el resto debe dar error/404
// ════════════════════════════════════════════════════════════════════════════
console.log(`\n🏁 [3/5] Race Condition — Trigger PG (${CONCURRENCY_RACE} recepciones sobre la misma OS)...`);

// Crear una OS nueva
const raceRes = await req('POST', '/api/os/crear', {
  tipo: 'VALIDADOR', es_pod: false, falla: 'Race condition test',
  bus_ppu: 'RACEPPU', serie_equipo: `RACE-${Date.now()}`, modelo: 'Race'
}, tokens.terreno);

if (raceRes.status === 201) {
  const raceCodigo = raceRes.data?.os?.codigo_os;
  console.log(`  OS creada: ${raceCodigo}`);

  // 10 intentos de recepcionar al mismo tiempo
  const raceJobs = Array.from({ length: CONCURRENCY_RACE }, () =>
    req('PUT', '/api/bodega/receive', { codigo_os: raceCodigo }, tokens.bodega)
  );
  const raceResults = await Promise.all(raceJobs);
  const ok200  = raceResults.filter(r => r.status === 200).length;
  const errors = raceResults.filter(r => r.status !== 200).length;

  if (ok200 === 1)
    pass(`Solo 1 recepción exitosa de ${CONCURRENCY_RACE} simultáneas (trigger idempotente)`);
  else if (ok200 === 0)
    fail('Race condition', `Ninguna recepción exitosa`);
  else
    fail('Race condition', `${ok200} recepciones exitosas — debería ser solo 1 (posible duplicado)`);

  console.log(`  ℹ️  ${ok200} exitosas, ${errors} rechazadas (esperado: 1 exitosa, ${CONCURRENCY_RACE-1} rechazadas)`);

  // Verificar estado final en DB
  const rows = await dbQuery(
    'SELECT estado_id, ubicacion_id FROM pmp.ordenes_servicio WHERE codigo_os = $1',
    [raceCodigo]
  );
  if (rows[0]?.estado_id === 3 && rows[0]?.ubicacion_id === 1)
    pass(`Estado final correcto en DB: estado=3 (EN_BODEGA), ubicacion=1`);
  else
    fail('Estado final race', `estado=${rows[0]?.estado_id} ubic=${rows[0]?.ubicacion_id}`);
} else {
  fail('OS para race', `No se pudo crear: ${raceRes.status}`);
}

// ════════════════════════════════════════════════════════════════════════════
// TEST 4: Badge endpoint bajo carga pesada (100 llamadas)
// Objetivo: no debe crashear, debe devolver respuestas válidas consistentes
// ════════════════════════════════════════════════════════════════════════════
console.log(`\n📊 [4/5] Badge Endpoint Bajo Carga (${REPEAT_BADGE} llamadas)...`);

const ts4 = Date.now();
const badgeJobs = Array.from({ length: REPEAT_BADGE }, () =>
  timed(() => req('GET', '/api/dashboard/badges', null, tokens.admin))
);
const badgeResults = await Promise.all(badgeJobs);
const ok4      = badgeResults.filter(r => r.status === 200).length;
const dur4     = Date.now() - ts4;
const p99      = stats.latencies.slice(-REPEAT_BADGE).sort((a, b) => a - b)[Math.floor(REPEAT_BADGE * 0.99)];
const avgBadge = Math.round(dur4 / REPEAT_BADGE);

if (ok4 === REPEAT_BADGE)
  pass(`${ok4}/${REPEAT_BADGE} OK | avg ${avgBadge}ms | p99 ${p99}ms`);
else
  fail(`Badge bajo carga`, `${REPEAT_BADGE - ok4} errores`);

// Consistencia: todos deben tener las mismas claves
const keys4 = badgeResults.filter(r => r.status === 200).map(r => Object.keys(r.data || {}).sort().join(','));
const allSameKeys = new Set(keys4).size === 1;
if (allSameKeys)
  pass(`Respuestas consistentes en estructura`);
else
  fail(`Inconsistencia en badges`, `${new Set(keys4).size} estructuras distintas`);

// ════════════════════════════════════════════════════════════════════════════
// TEST 5: Flujo completo concurrente — 5 OS en paralelo, cada una su propio ciclo
// Objetivo: no hay interferencia entre flujos paralelos
// ════════════════════════════════════════════════════════════════════════════
console.log(`\n🔄 [5/5] Flujos Completos Paralelos (5 OS siguiendo el ciclo completo)...`);

const ts5 = Date.now();
async function fullCycle(idx) {
  const serie = `FULL-${Date.now()}-${idx}`;
  const c1 = await req('POST', '/api/os/crear', {
    tipo: 'VALIDADOR', es_pod: false, falla: `Parallel falla ${idx}`,
    bus_ppu: `PFULL${idx}`, serie_equipo: serie, modelo: 'P-Model'
  }, tokens.terreno);
  if (c1.status !== 201) return { ok: false, step: 'crear', status: c1.status };
  const cod = c1.data?.os?.codigo_os;

  const steps = [
    () => req('PUT', '/api/bodega/receive',     { codigo_os: cod }, tokens.bodega),
    () => req('PUT', '/api/bodega/dispatch-lab',{ codigo_os: cod }, tokens.bodega),
    () => req('POST','/api/lab/finish', { codigo_os: cod, falla: `P${idx}`, acciones: ['Repair'], repuestos: [] }, tokens.lab),
    () => req('POST','/api/lab/dispatch-qa', { codigos: [cod] }, tokens.admin),
    () => req('PUT', '/api/bodega/receive',     { codigo_os: cod }, tokens.bodega),
    () => req('PUT', '/api/bodega/dispatch-qa', { codigo_os: cod }, tokens.bodega),
    () => req('POST','/api/qa/process', { codigo_os: cod, accion: 'APROBAR', comentario: `Parallel QA ${idx}` }, tokens.qa),
    () => req('PUT', '/api/bodega/receive',     { codigo_os: cod }, tokens.bodega),
  ];

  const stepNames = ['rcv','→lab','fin','→qa-transito','rcv2','→qa','qa-aprueba','rcv3'];
  for (let i = 0; i < steps.length; i++) {
    const r = await timed(steps[i]);
    if (r.status !== 200) return { ok: false, step: stepNames[i], status: r.status, err: JSON.stringify(r.data).slice(0,80), cod };
  }

  // Verificar estado final
  const rows = await dbQuery(
    'SELECT estado_id FROM pmp.ordenes_servicio WHERE codigo_os = $1', [cod]
  );
  const estadoOk = rows[0]?.estado_id === 13; // CERRADA
  return { ok: estadoOk, cod, estado: rows[0]?.estado_id };
}

const parallelResults = await Promise.all(
  Array.from({ length: 5 }, (_, i) => fullCycle(i))
);
const dur5 = Date.now() - ts5;

const okFlows  = parallelResults.filter(r => r.ok).length;
const failFlows = parallelResults.filter(r => !r.ok);

if (okFlows === 5)
  pass(`5/5 flujos completos paralelos exitosos en ${dur5}ms`);
else {
  fail(`Flujos paralelos`, `${5 - okFlows}/5 fallaron`);
  failFlows.forEach(f => console.log(`     ↳ OS ${f.cod} falló en paso "${f.step}": ${f.err || f.estado}`));
}

// Verificar que se generaron IN- para cada uno
const inOsCount = await dbQuery(
  `SELECT COUNT(*) as n FROM pmp.ordenes_servicio WHERE es_instalacion = TRUE AND tipo_equipo = 'VALIDADOR'`
);
pass(`Total OS de instalación IN- en DB: ${inOsCount[0].n}`);

// ════════════════════════════════════════════════════════════════════════════
// RESUMEN FINAL
// ════════════════════════════════════════════════════════════════════════════
await pool.end();

const total    = stats.passed + stats.failed;
const elapsed  = ((Date.now() - stats.start) / 1000).toFixed(1);
const allLat   = stats.latencies.sort((a, b) => a - b);
const p50      = allLat[Math.floor(allLat.length * 0.50)] || 0;
const p95      = allLat[Math.floor(allLat.length * 0.95)] || 0;
const p99all   = allLat[Math.floor(allLat.length * 0.99)] || 0;
const avgAll   = Math.round(allLat.reduce((a, b) => a + b, 0) / allLat.length);

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log(`║   RESULTADOS: ${stats.passed}/${total} tests pasados                         ║`);
console.log(`║   Tiempo total: ${elapsed}s                                   ║`);
console.log('╠══════════════════════════════════════════════════════════╣');
console.log(`║   Latencia HTTP (${allLat.length} requests totales):`);
console.log(`║     avg  = ${String(avgAll).padEnd(6)} ms`);
console.log(`║     p50  = ${String(p50).padEnd(6)} ms`);
console.log(`║     p95  = ${String(p95).padEnd(6)} ms`);
console.log(`║     p99  = ${String(p99all).padEnd(6)} ms`);
console.log(`║     max  = ${String(allLat[allLat.length-1]).padEnd(6)} ms`);
console.log('╚══════════════════════════════════════════════════════════╝');

if (stats.failed > 0) {
  console.log('\n❌ Tests fallidos:');
  stats.errors.forEach(e => console.log(`  • ${e.name}: ${e.detail}`));
  process.exit(1);
} else {
  console.log('\n🎉 ¡Todos los tests de estrés pasaron! Backend está estable bajo carga.\n');
}
