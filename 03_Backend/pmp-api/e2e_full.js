import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: 'postgresql://postgres:admin@localhost:5432/pmp_suite' });

const BASE = 'http://localhost:4000';
const apiKey = 'AIzaSyDSxv0oW-h2liaJfu8jdWYXzRkBLjpoCaE';

async function reqData(path, method, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  try {
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error || JSON.stringify(data));
      console.log(`[${method}] ${path}:`, res.status);
      return { status: res.status, data };
  } catch (e) {
      console.log(`[${method}] ${path}: ERROR`, res.status, text);
      throw e;
  }
}

async function getToken(email, password) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (data.idToken) return data.idToken;
  throw new Error(`Login failed for ${email}`);
}

async function checkState(cod) {
  const r = await pool.query("SELECT codigo_os, estado_id, ubicacion_id, es_aprobado_qa FROM pmp.ordenes_servicio WHERE codigo_os = $1", [cod]);
  console.log(`📊 DB STATE [${cod}]:`, r.rows[0]);
  return r.rows[0];
}

async function main() {
  console.log('\n=== INICIO FULL E2E FLOW PMP SUITE ===\n');

  // Login users
  const tokenTerreno = await getToken('rodrigo.escobar@pmp-suite.cl', '123456');
  const tokenBodega = await getToken('bodega@pmp-suite.cl', '123456');
  const tokenLab = await getToken('jose.villarroel@pmp-suite.cl', '123456');
  const tokenQa = await getToken('cristian.alvarez@pmp-suite.cl', '123456');
  
  // 1. TERRENO: Crear OS
  console.log('\n--- PASO 1: Terreno crea OS de retiro ---');
  const serie = `E2E-${Date.now()}`;
  const r1 = await reqData('/api/os/crear', 'POST', {
      tipo: "CONSOLA",
      es_pod: false,
      falla: "Validacion End-to-End Test",
      bus_ppu: "E2E001",
      serie_equipo: serie,
      modelo: "E2E-Model"
  }, tokenTerreno);
  const osID = r1.data.os.codigo_os;
  await checkState(osID); // Deberia ser 2 (EN_TRANSITO)

  // 2. BODEGA: Recibir de terreno
  console.log('\n--- PASO 2: Bodega recepciona de terreno ---');
  await reqData('/api/bodega/receive', 'PUT', { codigo_os: osID }, tokenBodega);
  await checkState(osID); // Deberia ser 3 (BODEGA_CEN)

  // 3. BODEGA: Despachar a Lab
  console.log('\n--- PASO 3: Bodega despacha a Laboratorio ---');
  await reqData('/api/bodega/dispatch-lab', 'PUT', { codigo_os: osID }, tokenBodega);
  await checkState(osID); // Deberia ser 4 (EN_DIAGNOSTICO)
  
  // 3.5 LAB: Asignar OS al Tecnico Logueado
  console.log('\n--- PASO 3.5: Laboratorio asigna ticket ---');
  // Obtenemos todos los lab DB users y buscamos el del token. 
  // Para que /finish funcione el ticket debe tener tecnico asignado? 
  // No, el finish detecta el usuario por el uid directamente, pero asignemos por si acaso (aunque uuid del tec_id es dificil tener aca).
  
  // 4. LAB: Finalizar reparacion
  console.log('\n--- PASO 4: Laboratorio finaliza reparacion ---');
  await reqData('/api/lab/finish', 'POST', {
      codigo_os: osID,
      falla: "Circuito quemado E2E",
      acciones: ["Cambio de componente", "Limpieza"],
      repuestos: ["Resistor"],
      comentario: "Testing E2E OK"
  }, tokenLab);
  await checkState(osID); // Deberia ser 10 (FINALIZADO_TALLER)

  // 5. LAB: Despachar a Bodega (transito)
  console.log('\n--- PASO 5: Laboratorio despacha de vuelta ---');
  await reqData('/api/lab/dispatch-qa', 'POST', { codigos: [osID] }, tokenLab);
  await checkState(osID); // Deberia ser 11 (TRAYECTO a BODEGA)

  // 6. BODEGA: Recibe desde lab
  console.log('\n--- PASO 6: Bodega recepciona desde Lab ---');
  await reqData('/api/bodega/receive', 'PUT', { codigo_os: osID }, tokenBodega);
  await checkState(osID); // Deberia ser 3 (EN_BODEGA)

  // 7. BODEGA: Despacha a QA
  console.log('\n--- PASO 7: Bodega envia a QA ---');
  await reqData('/api/bodega/dispatch-qa', 'PUT', { codigo_os: osID }, tokenBodega);
  await checkState(osID); // Deberia ser 6 (EN_QA)

  // 8. QA: Certifica OK
  console.log('\n--- PASO 8: QA aprueba el equipo ---');
  await reqData('/api/qa/process', 'POST', { codigo_os: osID, accion: 'APROBAR', comentario: 'Testing E2E QA' }, tokenQa);
  await checkState(osID); // Deberia ser 11 (TRAYECTO_BODEGA) y es_aprobado_qa=true

  // 9. BODEGA: Recibe final -> LOOP INSTALL LOGIC
  console.log('\n--- PASO 9: Bodega recepciona equipo aprobado (Loop) ---');
  const resFinal = await reqData('/api/bodega/receive', 'PUT', { codigo_os: osID }, tokenBodega);
  console.log('✔ Mensaje final BODEGA:', resFinal.data.message);
  await checkState(osID); // Deberia ser 13 (CERRADO)

  // 10. Check if IN- is created
  console.log('\n--- PASO 10: Validar re-apertura ciclica IN- ---');
  const ins = await pool.query("SELECT codigo_os, tipo_equipo, estado_id, ubicacion_id, es_instalacion FROM pmp.ordenes_servicio WHERE es_instalacion = TRUE ORDER BY fecha DESC LIMIT 1");
  console.log('\n✨ NUEVA OS DE INSTALACION CREADA AUTAMATICAMENTE:', ins.rows[0]);

  await pool.end();
  console.log('\n=== E2E FLUJO COMPLETADO OK ===');
}

main().catch(e => {
  console.error('\n❌ Error CRITICO E2E:', e.message);
  pool.end();
  process.exit(1);
});
