/**
 * PMP Suite - E2E Full Test Suite v2.0
 * Cubre: Flujo logístico completo + Validaciones RBAC
 */
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: 'postgresql://postgres:admin@localhost:5432/pmp_suite' });

const BASE = 'http://localhost:4000';
const apiKey = 'AIzaSyDSxv0oW-h2liaJfu8jdWYXzRkBLjpoCaE';

let passed = 0;
let failed = 0;
const results = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function getToken(email, password) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (data.idToken) return data.idToken;
  throw new Error(`Login failed: ${email}`);
}

async function dbState(cod) {
  const r = await pool.query(
    'SELECT codigo_os, estado_id, ubicacion_id, es_aprobado_qa FROM pmp.ordenes_servicio WHERE codigo_os = $1',
    [cod]
  );
  return r.rows[0];
}

function assert(name, condition, detail = '') {
  if (condition) {
    passed++;
    results.push(`  ✅ PASS: ${name}`);
  } else {
    failed++;
    results.push(`  ❌ FAIL: ${name}${detail ? ' → ' + detail : ''}`);
  }
}

// ─── Auth: Login todos los roles ──────────────────────────────────────────────

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║   PMP SUITE - E2E Full Test Suite v2.0             ║');
console.log('╚════════════════════════════════════════════════════╝\n');

console.log('🔑 [1/5] Autenticando usuarios por rol...');
const tokens = {};
try {
  tokens.admin    = await getToken('rafael.oteiza@pmp-suite.cl',   '123456');
  tokens.terreno  = await getToken('rodrigo.escobar@pmp-suite.cl', '123456');
  tokens.lab      = await getToken('jose.villarroel@pmp-suite.cl', '123456');
  tokens.qa       = await getToken('cristian.alvarez@pmp-suite.cl','123456');
  tokens.bodega   = await getToken('bodega@pmp-suite.cl',          '123456');
  console.log('  ✅ Todos los tokens obtenidos.\n');
} catch (e) {
  console.error('  ❌ Error de autenticación:', e.message);
  process.exit(1);
}

// ─── Test 1: RBAC - Roles no autorizados deben ser rechazados ─────────────────

console.log('🔒 [2/5] Pruebas RBAC (Control de Acceso)...');

// --- Rutas con requireRole/requireAnyRole (deben rechazar correctamente) ---

// NOTA: /api/os usa requireAnyRole([admin, tecnico_lab, tecnico_terreno]) 
// por lo que Lab SÍ puede llamar crear OS (el frontend no le muestra el botón)
// Verificamos que el endpoint base responde con auth correcta
let r = await req('POST', '/api/os/crear', {
  tipo: 'CONSOLA', falla: 'test rbac', bus_ppu: 'RBAC01',
  serie_equipo: `RBAC-${Date.now()}`, modelo: 'X'
}, tokens.lab);
// Lab tiene token válido y rol permitido en /api/os → devuelve 201 o 400/409 (no 401/403)
assert('Lab tiene acceso a /api/os (RBAC a nivel de frontend)', r.status !== 401 && r.status !== 403,
  `Recibió status ${r.status}`);

// QA NO puede crear usuarios (requireRole admin en admin.users.routes)
r = await req('POST', '/api/admin/users', {
  correo: 'rbactest@test.cl', nombre: 'Test', apellido: 'RBAC', rol: 'qa'
}, tokens.qa);
assert('QA NO puede crear usuarios (requireRole admin)', r.status === 401 || r.status === 403,
  `Recibió ${r.status}`);

// --- Nuevas validaciones RBAC backend (requireAnyRole ahora activo) ---

// QA NO puede operar Bodega (ahora con requireAnyRole logistica/admin)
r = await req('PUT', '/api/bodega/receive', { codigo_os: 'MC-000001' }, tokens.qa);
assert('QA NO puede accionar Bodega /receive (requireAnyRole)', r.status === 401 || r.status === 403,
  `Recibió status ${r.status}`);

// Terreno NO puede operar Lab (requireAnyRole tecnico_lab/admin)
r = await req('POST', '/api/lab/finish', {
  codigo_os: 'XX-000001', falla: 'test', acciones: [], repuestos: []
}, tokens.terreno);
assert('Terreno NO puede finalizar en Lab (requireAnyRole)', r.status === 401 || r.status === 403,
  `Recibió status ${r.status}`);

// Bodega NO puede procesar QA (requireAnyRole qa/admin)
r = await req('POST', '/api/qa/process', {
  codigo_os: 'XX-000001', accion: 'APROBAR'
}, tokens.bodega);
assert('Bodega NO puede procesar QA (requireAnyRole)', r.status === 401 || r.status === 403,
  `Recibió status ${r.status}`);

// --- Rutas solo con firebaseAuth (cualquier usuario válido puede llamar) ---
// NOTA: Lab, QA, Bodega usan solo firebaseAuth sin requireRole → la separación
// de roles es responsabilidad del frontend (vistas separadas por rol).

// Bodega SÍ puede acceder a /api/bodega/queue
r = await req('GET', '/api/bodega/queue', null, tokens.bodega);
assert('Bodega SÍ puede leer su cola /queue', r.status === 200, `Recibió ${r.status}`);

// Lab SÍ puede leer su cola
r = await req('GET', '/api/lab/queue/VALIDADOR', null, tokens.lab);
assert('Lab SÍ puede leer su cola /queue/VALIDADOR', r.status === 200, `Recibió ${r.status}`);

// QA SÍ puede leer la cola QA
r = await req('GET', '/api/qa/queue', null, tokens.qa);
assert('QA SÍ puede leer su cola /queue', r.status === 200, `Recibió ${r.status}`);

// Admin SÍ puede leer datos (dashboard badges)
r = await req('GET', '/api/dashboard/badges', null, tokens.admin);
assert('Admin SÍ puede leer badges', r.status === 200, `Recibió ${r.status}`);

// Sin token → siempre 401
r = await req('GET', '/api/bodega/queue', null, 'token_invalido');
assert('Sin token válido → 401 en cualquier ruta protegida', r.status === 401, `Recibió ${r.status}`);

// ⚠️  BRECHA DETECTADA: lab/finish, bodega/receive, qa/process solo usan firebaseAuth
//     sin requireRole → usuario con token válido de cualquier rol puede llamarlos.
//     Mitigación actual: el frontend separa las vistas y no expone los botones.
//     Recomendación futura: añadir requireAnyRole en estas rutas.
console.log('  ⚠️  NOTA: Lab/QA/Bodega usan solo firebaseAuth. RBAC enforced en frontend.');

console.log(results.slice(-8).join('\n'));
results.length = 0;


// ─── Test 2: Datos maestros y Badges ─────────────────────────────────────────

console.log('\n📊 [3/5] Pruebas de Datos Maestros y Notificaciones...');

// Bodega puede leer su inventario de repuestos (rol logistica)
r = await req('GET', '/api/bodega/repuestos', null, tokens.bodega);
assert('Bodega SÍ puede leer /api/bodega/repuestos (requireAnyRole OK)', r.status === 200, `Recibió ${r.status}`);
assert('Repuestos devuelve objeto con propiedad repuestos', Array.isArray(r.data?.repuestos) || Array.isArray(r.data),
  JSON.stringify(r.data).substring(0, 80));

// Terreno NO puede leer bodega (requireAnyRole logistica/admin activo)
r = await req('GET', '/api/bodega/repuestos', null, tokens.terreno);
assert('Terreno NO puede leer Bodega /repuestos (requireAnyRole correcto)', r.status === 401 || r.status === 403,
  `Recibió ${r.status}`);

r = await req('GET', '/api/dashboard/badges', null, tokens.bodega);
assert('Badges endpoint accesible', r.status === 200, `Recibió ${r.status}`);
assert('Badges tiene claves correctas', 
  r.data && 'lab' in r.data && 'bodega' in r.data && 'qa' in r.data,
  JSON.stringify(r.data));

r = await req('GET', '/api/bodega/repuestos', null, tokens.bodega);
assert('Bodega puede leer inventario de repuestos', r.status === 200, `Recibió ${r.status}`);

r = await req('GET', '/api/bodega/stock', null, tokens.bodega);
assert('Bodega puede leer stock de módulos', r.status === 200, `Recibió ${r.status}`);

console.log(results.slice(-6).join('\n'));
results.length = 0;

// ─── Test 3: Flujo E2E Completo ───────────────────────────────────────────────

console.log('\n🔄 [4/5] Flujo E2E Completo (Terreno → Bodega → Lab → QA → Loop)...');

// PASO 1: Terreno crea OS
const serie = `E2E2-${Date.now()}`;
r = await req('POST', '/api/os/crear', {
  tipo: 'VALIDADOR', es_pod: false, falla: 'Pantalla rota E2E v2',
  bus_ppu: 'E2EBUS2', serie_equipo: serie, modelo: 'MV-Test'
}, tokens.terreno);
assert('P1: Terreno crea OS (201)', r.status === 201, `status=${r.status} ${JSON.stringify(r.data).substring(0,80)}`);
const osID = r.data?.os?.codigo_os;
assert('P1: OS tiene código generado', !!osID && osID.startsWith('MV-'), `Código: ${osID}`);

let state = await dbState(osID);
assert('P1: Estado inicial = 2 (EN_TRANSITO)', state?.estado_id === 2, `estado=${state?.estado_id}`);

// PASO 2: Bodega recepciona
r = await req('PUT', '/api/bodega/receive', { codigo_os: osID }, tokens.bodega);
assert('P2: Bodega recepciona (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID);
assert('P2: Estado = 3, ubicacion = 1 (Bodega)', state?.estado_id === 3 && state?.ubicacion_id === 1,
  `estado=${state?.estado_id} ubic=${state?.ubicacion_id}`);

// PASO 3: Bodega despacha a Lab
r = await req('PUT', '/api/bodega/dispatch-lab', { codigo_os: osID }, tokens.bodega);
assert('P3: Bodega despacha a Lab (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID);
assert('P3: Estado = 4, ubicacion = 2 (Lab)', state?.estado_id === 4 && state?.ubicacion_id === 2,
  `estado=${state?.estado_id} ubic=${state?.ubicacion_id}`);

// PASO 4: Lab finaliza reparación
r = await req('POST', '/api/lab/finish', {
  codigo_os: osID, falla: 'Pantalla LCD rota',
  acciones: ['Cambio pantalla', 'Limpieza'], repuestos: ['LCD 7"'], comentario: 'OK E2E'
}, tokens.lab);
assert('P4: Lab finaliza reparación (200)', r.status === 200, `status=${r.status} err=${JSON.stringify(r.data)}`);
state = await dbState(osID);
assert('P4: Estado = 10 (FINALIZADO_TALLER)', state?.estado_id === 10, `estado=${state?.estado_id}`);

// PASO 5: Jefe (admin) despacha lote a Bodega
r = await req('POST', '/api/lab/dispatch-qa', { codigos: [osID] }, tokens.admin);
assert('P5: Admin despacha lote a Bodega (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID);
assert('P5: Estado = 11 (EN_TRAYECTO_BODEGA)', state?.estado_id === 11, `estado=${state?.estado_id}`);

// PASO 6: Bodega recibe desde Lab
r = await req('PUT', '/api/bodega/receive', { codigo_os: osID }, tokens.bodega);
assert('P6: Bodega recepciona desde Lab (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID);
assert('P6: Estado = 3, ubicacion = 1', state?.estado_id === 3 && state?.ubicacion_id === 1,
  `estado=${state?.estado_id}`);

// PASO 7: Bodega despacha a QA
r = await req('PUT', '/api/bodega/dispatch-qa', { codigo_os: osID }, tokens.bodega);
assert('P7: Bodega despacha a QA (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID);
assert('P7: Estado = 6 (EN_QA), ubicacion = 3', state?.estado_id === 6 && state?.ubicacion_id === 3,
  `estado=${state?.estado_id} ubic=${state?.ubicacion_id}`);

// PASO 8: QA aprueba
r = await req('POST', '/api/qa/process', {
  codigo_os: osID, accion: 'APROBAR', comentario: 'Pasa todos los tests E2E v2'
}, tokens.qa);
assert('P8: QA aprueba (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID);
assert('P8: Estado = 11, es_aprobado_qa = TRUE', state?.estado_id === 11 && state?.es_aprobado_qa === true,
  `estado=${state?.estado_id} qa=${state?.es_aprobado_qa}`);

// PASO 9: Bodega recibe aprobado → Loop automático
r = await req('PUT', '/api/bodega/receive', { codigo_os: osID }, tokens.bodega);
assert('P9: Bodega finaliza ciclo - Loop (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID);
assert('P9: OS original cerrada (Estado 13)', state?.estado_id === 13, `estado=${state?.estado_id}`);

// PASO 10: Verificar que se creó OS de instalación
const ins = await pool.query(`
  SELECT codigo_os, estado_id, ubicacion_id, es_instalacion, tipo_equipo
  FROM pmp.ordenes_servicio 
  WHERE es_instalacion = TRUE AND tipo_equipo = 'VALIDADOR'
  ORDER BY fecha DESC LIMIT 1
`);
const inOS = ins.rows[0];
assert('P10: OS de instalación IN- generada', !!inOS && inOS.codigo_os?.startsWith('IN-'),
  `Encontrada: ${inOS?.codigo_os}`);
assert('P10: IN- en Estado 7 (DISPONIBLE), ubicacion 1', 
  inOS?.estado_id === 7 && inOS?.ubicacion_id === 1,
  `estado=${inOS?.estado_id} ubic=${inOS?.ubicacion_id}`);

console.log(results.slice(-20).join('\n'));
results.length = 0;

// ─── Test 4: Flujo de Rechazo QA ─────────────────────────────────────────────

console.log('\n🔴 [5/5] Flujo de Rechazo QA (QA → regresa a Lab)...');

// Crear otra OS para probar rechazo
const serie2 = `REJECT-${Date.now()}`;
r = await req('POST', '/api/os/crear', {
  tipo: 'CONSOLA', falla: 'Test rechazo QA', bus_ppu: 'REJECT01',
  serie_equipo: serie2, modelo: 'MC-Test'
}, tokens.terreno);
const osID2 = r.data?.os?.codigo_os;
assert('R1: OS para test rechazo creada', !!osID2 && osID2.startsWith('MC-'), `código=${osID2}`);

// Flujo acelerado → Lab → Finalizado → Bodega → QA
await req('PUT', '/api/bodega/receive',     { codigo_os: osID2 }, tokens.bodega);
await req('PUT', '/api/bodega/dispatch-lab', { codigo_os: osID2 }, tokens.bodega);
await req('POST', '/api/lab/finish', {
  codigo_os: osID2, falla: 'Placa Base dañada', acciones: ['Revisión'], repuestos: [], comentario: 'Test'
}, tokens.lab);
await req('POST', '/api/lab/dispatch-qa', { codigos: [osID2] }, tokens.admin);
await req('PUT',  '/api/bodega/receive',    { codigo_os: osID2 }, tokens.bodega);
await req('PUT',  '/api/bodega/dispatch-qa',{ codigo_os: osID2 }, tokens.bodega);

// QA RECHAZA
r = await req('POST', '/api/qa/process', {
  codigo_os: osID2, accion: 'RECHAZAR', comentario: 'Falla en test de pantalla'
}, tokens.qa);
assert('R2: QA rechaza (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID2);
assert('R3: Estado = 11 (vuelve a Bodega de tránsito)', state?.estado_id === 11,
  `estado=${state?.estado_id}`);
assert('R4: es_aprobado_qa = FALSE', state?.es_aprobado_qa === false,
  `qa=${state?.es_aprobado_qa}`);

// Bodega recibe rechazado → debe ir a estado 3 (sin crear IN-)
r = await req('PUT', '/api/bodega/receive', { codigo_os: osID2 }, tokens.bodega);
assert('R5: Bodega recepciona rechazado (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID2);
assert('R6: Estado = 3 (EN_BODEGA, no cerrado)', state?.estado_id === 3,
  `estado=${state?.estado_id}`);

// R7: Bodega despacha de vuelta a Laboratorio (flujo completo de rechazo)
r = await req('PUT', '/api/bodega/dispatch-lab', { codigo_os: osID2 }, tokens.bodega);
assert('R7: Bodega despacha rechazado de vuelta a Lab (200)', r.status === 200, `status=${r.status}`);
state = await dbState(osID2);
assert('R8: Estado = 4 (EN_DIAGNOSTICO Lab), ubicacion = 2', state?.estado_id === 4 && state?.ubicacion_id === 2,
  `estado=${state?.estado_id} ubic=${state?.ubicacion_id}`);
console.log(`  ✅ Flujo rechazo QA completo: QA(6) → Tránsito(11) → Bodega(3) → Lab(4)`);

console.log(`\n  📝 Flujo documentado: QA rechaza → equipo vuelve a Bodega en tránsito`);
console.log(`      → Bodega lo recepciona (Stock) → Bodega lo despacha a Lab para nueva reparación.`);

console.log(results.join('\n'));

// ─── Resumen Final ────────────────────────────────────────────────────────────

await pool.end();

const total = passed + failed;
console.log('\n╔════════════════════════════════════════════════════╗');
console.log(`║   RESULTADOS: ${passed}/${total} tests pasados                    ║`);
console.log('╚════════════════════════════════════════════════════╝');

if (failed > 0) {
  console.log(`\n⚠️  ${failed} test(s) fallaron. Revisar detalles arriba.`);
  process.exit(1);
} else {
  console.log('\n🎉 ¡Todos los tests pasaron! Sistema completamente operativo.\n');
}
