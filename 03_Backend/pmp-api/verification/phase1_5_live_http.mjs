const BASE_URL = process.env.PHASE15_BASE_URL || "http://127.0.0.1:4000";
const FIREBASE_API_KEY = process.env.PHASE15_FIREBASE_API_KEY;
const TEST_PASSWORD = process.env.PHASE15_TEST_PASSWORD;

if (!FIREBASE_API_KEY || !TEST_PASSWORD) {
  throw new Error("Faltan PHASE15_FIREBASE_API_KEY o PHASE15_TEST_PASSWORD");
}

const accounts = {
  admin: "rafael.oteiza@pmp-suite.cl",
  logistica: "bodega@pmp-suite.cl",
  qa: "cristian.alvarez@pmp-suite.cl",
  tecnico_laboratorio: "jose.villarroel@pmp-suite.cl",
  tecnico_terreno: "rodrigo.escobar@pmp-suite.cl"
};

const results = [];

function check(name, condition, detail = "") {
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ""}`);
  results.push({ name, status: "PASS" });
}

async function login(email) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: TEST_PASSWORD, returnSecureToken: true })
    }
  );
  const data = await response.json();
  if (!response.ok || !data.idToken) throw new Error(`No fue posible autenticar ${email}`);
  return data.idToken;
}

async function request(token, method, path, body) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: response.status, data };
}

const tokens = {};
for (const [expectedRole, email] of Object.entries(accounts)) {
  tokens[expectedRole] = await login(email);
  const me = await request(tokens[expectedRole], "GET", "/api/auth/me");
  check(`${expectedRole}: autenticacion y rol PostgreSQL`, me.status === 200 && me.data?.user?.rol === expectedRole);
}

const noToken = await request(null, "GET", "/api/admin/stats");
check("sin token: 401", noToken.status === 401, `status ${noToken.status}`);

for (const [role, token] of Object.entries(tokens)) {
  const dashboard = await request(token, "GET", "/api/dashboard/summary");
  check(`${role}: dashboard GET 200`, dashboard.status === 200, `status ${dashboard.status}`);
}

const globalOrders = await request(tokens.admin, "GET", "/api/os?limit=999&offset=0");
check("admin: GET /api/os 200", globalOrders.status === 200, `status ${globalOrders.status}`);
check("GET /api/os limita a 100", globalOrders.data?.pagination?.limit === 100);
check("GET /api/os offset no negativo", globalOrders.data?.pagination?.offset === 0);
check("GET /api/os respuesta consistente", Array.isArray(globalOrders.data?.items) && Number.isInteger(globalOrders.data?.pagination?.total));
check(
  "GET /api/os no expone UUID de tecnicos",
  globalOrders.data.items.every((item) => !("tecnico_terreno_id" in item) && !("tecnico_laboratorio_id" in item))
);

const beyondLastPage = await request(tokens.admin, "GET", "/api/os?limit=1&offset=999999");
check("GET /api/os mantiene total fuera de pagina", beyondLastPage.status === 200 && beyondLastPage.data.pagination.total > 0);
check("GET /api/os pagina vacia consistente", Array.isArray(beyondLastPage.data.items) && beyondLastPage.data.items.length === 0);

for (const path of [
  "/api/os?estado_id=1abc",
  "/api/os?offset=-1",
  "/api/os?limit=10abc",
  "/api/os?tipo_equipo=OTRO",
  `/api/os?q=${"x".repeat(101)}`
]) {
  const invalid = await request(tokens.admin, "GET", path);
  check(`filtro invalido rechazado ${path}`, invalid.status === 400, `status ${invalid.status}`);
}

const injectionLikeSearch = await request(tokens.admin, "GET", "/api/os?q=%25%27%20OR%201%3D1%20--&limit=1");
check("busqueda tipo SQL injection se procesa parametrizada", injectionLikeSearch.status === 200);

const adminDispatch = await request(tokens.admin, "POST", "/api/admin/dispatch", { codigos_os: [] });
check("admin alcanza handler /api/admin/dispatch", adminDispatch.status === 400, `status ${adminDispatch.status}`);

for (const [role, token] of Object.entries(tokens)) {
  if (role === "admin") continue;
  const denied = await request(token, "POST", "/api/admin/dispatch", { codigos_os: ["RBAC-NO-EXISTE"] });
  check(`${role}: admin dispatch 403`, denied.status === 403, `status ${denied.status}`);
}

const adminWrites = [
  ["POST", "/api/os/crear", { tipo: "INVALIDO" }],
  ["PUT", "/api/lab/assign", { codigo_os: "RBAC-NO-EXISTE", tecnico_id: "00000000-0000-4000-8000-000000000001" }],
  ["POST", "/api/qa/process", { codigo_os: "RBAC-NO-EXISTE", accion: "APROBAR" }],
  ["PUT", "/api/bodega/receive", { codigo_os: "RBAC-NO-EXISTE" }],
  ["POST", "/api/admin/users", {}]
];
for (const [method, path, body] of adminWrites) {
  const response = await request(tokens.admin, method, path, body);
  check(`admin autorizado ${method} ${path}`, response.status !== 401 && response.status !== 403, `status ${response.status}`);
}

const operationalChecks = [
  ["logistica", "GET", "/api/bodega/queue", undefined],
  ["logistica", "PUT", "/api/bodega/receive", { codigo_os: "RBAC-NO-EXISTE" }],
  ["qa", "GET", "/api/qa/queue", undefined],
  ["qa", "POST", "/api/qa/process", { codigo_os: "RBAC-NO-EXISTE", accion: "APROBAR" }],
  ["tecnico_laboratorio", "GET", "/api/lab/queue/VALIDADOR", undefined],
  ["tecnico_laboratorio", "PUT", "/api/lab/assign", { codigo_os: "RBAC-NO-EXISTE", tecnico_id: "00000000-0000-4000-8000-000000000001" }],
  ["tecnico_terreno", "GET", "/api/os/mis-ordenes", undefined],
  ["tecnico_terreno", "POST", "/api/os/crear", { tipo: "INVALIDO" }]
];
for (const [role, method, path, body] of operationalChecks) {
  const response = await request(tokens[role], method, path, body);
  check(`${role} conserva ${method} ${path}`, response.status !== 401 && response.status !== 403, `status ${response.status}`);
}

console.log(JSON.stringify({ passed: results.length, failed: 0, results }, null, 2));
