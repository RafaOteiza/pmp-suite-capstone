import test, { mock } from "node:test";
import assert from "node:assert/strict";

const ids = {
  admin: "00000000-0000-4000-8000-000000000001",
  manager: "00000000-0000-4000-8000-000000000002",
  logistica: "00000000-0000-4000-8000-000000000003",
  qa: "00000000-0000-4000-8000-000000000004",
  lab: "00000000-0000-4000-8000-000000000005",
  terreno: "00000000-0000-4000-8000-000000000006",
  inactive: "00000000-0000-4000-8000-000000000007"
};

function user(id, email, role, active = true) {
  return {
    id,
    nombre: role,
    apellido: "Prueba",
    correo: email,
    rol: role,
    activo: active
  };
}

const usersByEmail = new Map([
  ["admin@test.local", user(ids.admin, "admin@test.local", "admin")],
  ["manager@test.local", user(ids.manager, "manager@test.local", "gerente")],
  ["logistica@test.local", user(ids.logistica, "logistica@test.local", "logistica")],
  ["qa@test.local", user(ids.qa, "qa@test.local", "qa")],
  ["lab@test.local", user(ids.lab, "lab@test.local", "tecnico_laboratorio")],
  ["terreno@test.local", user(ids.terreno, "terreno@test.local", "tecnico_terreno")],
  ["inactive@test.local", user(ids.inactive, "inactive@test.local", "qa", false)]
]);

const tokenClaims = new Map([
  ["admin-token", { uid: "admin-uid", email: "admin@test.local", rol: "admin" }],
  ["manager-claim-admin-token", { uid: "manager-uid", email: "manager@test.local", rol: "admin" }],
  ["logistica-token", { uid: "logistica-uid", email: "logistica@test.local", rol: "logistica" }],
  ["qa-token", { uid: "qa-uid", email: "qa@test.local", rol: "qa" }],
  ["lab-token", { uid: "lab-uid", email: "lab@test.local", rol: "tecnico_laboratorio" }],
  ["terreno-token", { uid: "terreno-uid", email: "terreno@test.local", rol: "tecnico_terreno" }],
  ["inactive-token", { uid: "inactive-uid", email: "inactive@test.local", rol: "qa" }],
  ["missing-db-token", { uid: "missing-uid", email: "missing@test.local", rol: "admin" }]
]);

const firebaseCalls = [];
const dbCalls = [];

const fakeFirebaseAuth = {
  async verifyIdToken(token) {
    const decoded = tokenClaims.get(token);
    if (!decoded) throw new Error("invalid token");
    return decoded;
  },
  async updateUser(uid, payload) {
    firebaseCalls.push({ operation: "updateUser", uid, payload });
    return { uid };
  },
  async createUser(payload) {
    firebaseCalls.push({ operation: "createUser", payload });
    return { uid: payload.uid };
  },
  async generatePasswordResetLink(email) {
    firebaseCalls.push({ operation: "generatePasswordResetLink", email });
    return `https://reset.test/${encodeURIComponent(email)}`;
  },
  async getUserByEmail(email) {
    firebaseCalls.push({ operation: "getUserByEmail", email });
    return { uid: `uid-for-${email}`, email };
  },
  async setCustomUserClaims(uid, claims) {
    firebaseCalls.push({ operation: "setCustomUserClaims", uid, claims });
  }
};

function result(rows = [], rowCount = rows.length) {
  return { rows, rowCount };
}

async function fakeQuery(sql, params = []) {
  const text = String(sql);
  dbCalls.push({ text, params });

  if (text.includes("WHERE lower(correo) = lower($1)")) {
    const found = usersByEmail.get(String(params[0]).toLowerCase());
    return found ? result([found]) : result([]);
  }

  if (text.includes("WITH filtered AS") && text.includes("json_agg(paged")) {
    return result([{ items: [], total: 0 }]);
  }

  if (text.includes("lab_pending") && text.includes("qa_pending")) {
    return result([{ lab_pending: 0, lab_dispatch: 0, bodega_pending: 0, qa_pending: 0 }]);
  }

  if (text.includes("total_laboratorio") && text.includes("sin_asignar")) {
    return result([{ total_laboratorio: 0, sin_asignar: 0, listos_para_despacho: 0 }]);
  }

  if (/SELECT\s+COUNT\(\*\)/i.test(text)) {
    return result([{ count: "0" }]);
  }

  if (text.includes("WHERE o.codigo_os = $1") && text.includes("JOIN pmp.estados")) {
    return result([{
      codigo_os: params[0],
      tipo_equipo: "VALIDADOR",
      estado_nombre: "PRUEBA",
      serie: "SERIE-PRUEBA"
    }]);
  }

  if (text.includes("UPDATE pmp.ordenes_servicio") && text.includes("RETURNING")) {
    return result([], 0);
  }

  return result([]);
}

const fakePool = {
  query: fakeQuery,
  async connect() {
    return {
      query: fakeQuery,
      release() {}
    };
  }
};

mock.module(new URL("../src/firebase.js", import.meta.url).href, {
  exports: { default: { auth: () => fakeFirebaseAuth } }
});
mock.module(new URL("../src/db.js", import.meta.url).href, {
  exports: { pool: fakePool }
});
mock.module("child_process", {
  exports: {
    exec(command, callback) {
      callback(null, "[]", "");
    }
  }
});

const { default: app } = await import("../src/app.js");

async function request(baseUrl, token, method, path, body) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}${path}`, {
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

function writeQueryCount() {
  return dbCalls.filter(({ text }) => /^\s*(INSERT|UPDATE|DELETE)/i.test(text)).length;
}

test("HTTP aislado Fase 1.5: matriz RBAC completa", async (t) => {
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const noToken = await request(baseUrl, null, "GET", "/api/admin/stats");
  assert.equal(noToken.status, 401);

  const missing = await request(baseUrl, "missing-db-token", "GET", "/api/dashboard/summary");
  assert.equal(missing.status, 403);
  assert.equal(missing.data.error, "Usuario no habilitado");

  const inactive = await request(baseUrl, "inactive-token", "GET", "/api/dashboard/summary");
  assert.equal(inactive.status, 403);
  assert.equal(inactive.data.error, "Usuario inactivo");

  const managerReads = [
    "/api/auth/me",
    "/api/dashboard/summary",
    "/api/dashboard/equipos-operativos",
    "/api/dashboard/global-search",
    "/api/dashboard/badges",
    "/api/admin/stats",
    "/api/admin/dispatch-queue",
    "/api/os?limit=999&offset=0",
    "/api/os/RBAC-DETAIL",
    "/api/lab/technicians",
    "/api/lab/queue/VALIDADOR",
    "/api/lab/parts",
    "/api/lab/completed",
    "/api/qa/queue",
    "/api/bodega/queue",
    "/api/bodega/stock",
    "/api/bodega/repuestos",
    "/api/bodega/tecnicos",
    "/api/bodega/dashboard",
    "/api/master/terminales",
    "/api/master/psts",
    "/api/ai/predictive-report"
  ];

  for (const path of managerReads) {
    const response = await request(baseUrl, "manager-claim-admin-token", "GET", path);
    assert.equal(response.status, 200, `gerente GET ${path}`);
    if (path.startsWith("/api/os?")) {
      assert.equal(response.data.pagination.limit, 100);
      assert.equal(response.data.pagination.offset, 0);
    }
  }

  for (const path of [
    "/api/os?estado_id=1abc",
    "/api/os?offset=-1",
    "/api/os?limit=10abc",
    "/api/os?tipo_equipo=OTRO",
    `/api/os?q=${"x".repeat(101)}`
  ]) {
    const response = await request(baseUrl, "manager-claim-admin-token", "GET", path);
    assert.equal(response.status, 400, path);
  }

  const writeCountBeforeManager = writeQueryCount();
  const managerWrites = [
    ["POST", "/api/admin/dispatch", { codigos_os: ["RBAC-1"] }],
    ["PUT", "/api/bodega/receive", { codigo_os: "RBAC-1" }],
    ["PATCH", `/api/users/${ids.admin}`, { nombre: "No cambiar" }],
    ["DELETE", "/api/os/RBAC-1", undefined]
  ];

  for (const [method, path, body] of managerWrites) {
    const response = await request(baseUrl, "manager-claim-admin-token", method, path, body);
    assert.equal(response.status, 403, `${method} ${path}`);
    assert.equal(response.data.error, "READ_ONLY_ROLE");
  }
  assert.equal(writeQueryCount(), writeCountBeforeManager, "gerente no alcanza consultas SQL de escritura");

  firebaseCalls.length = 0;
  const ownPassword = await request(
    baseUrl,
    "manager-claim-admin-token",
    "POST",
    "/api/auth/password?uid=admin-uid",
    { password: "PasswordSegura123", user_id: ids.admin, email: "admin@test.local" }
  );
  assert.equal(ownPassword.status, 200);
  assert.deepEqual(firebaseCalls.at(-1), {
    operation: "updateUser",
    uid: "manager-uid",
    payload: { password: "PasswordSegura123" }
  });

  const ownReset = await request(
    baseUrl,
    "manager-claim-admin-token",
    "POST",
    "/api/auth/reset-password-link?email=admin@test.local",
    { email: "admin@test.local", user_id: ids.admin }
  );
  assert.equal(ownReset.status, 200);
  assert.equal(firebaseCalls.at(-1).operation, "generatePasswordResetLink");
  assert.equal(firebaseCalls.at(-1).email, "manager@test.local");

  for (const path of [
    `/api/users/${ids.admin}/password`,
    `/api/admin/users/${ids.admin}/set-password`,
    `/api/admin/users/${ids.admin}/reset-password-link`
  ]) {
    const response = await request(
      baseUrl,
      "manager-claim-admin-token",
      "POST",
      path,
      { password: "PasswordAjena123" }
    );
    assert.equal(response.status, 403, path);
    assert.equal(response.data.error, "READ_ONLY_ROLE", path);
  }

  const adminDispatch = await request(
    baseUrl,
    "admin-token",
    "POST",
    "/api/admin/dispatch",
    { codigos_os: ["RBAC-1"] }
  );
  assert.equal(adminDispatch.status, 200);

  for (const token of ["manager-claim-admin-token", "qa-token", "lab-token", "logistica-token", "terreno-token"]) {
    const response = await request(
      baseUrl,
      token,
      "POST",
      "/api/admin/dispatch",
      { codigos_os: ["RBAC-1"] }
    );
    assert.equal(response.status, 403, token);
  }

  const adminWriteChecks = [
    ["POST", "/api/os/crear", { tipo: "INVALIDO" }],
    ["PUT", "/api/lab/assign", { codigo_os: "RBAC-NO-EXISTE", tecnico_id: ids.lab }],
    ["POST", "/api/qa/process", { codigo_os: "RBAC-NO-EXISTE", accion: "APROBAR" }],
    ["PUT", "/api/bodega/receive", { codigo_os: "RBAC-NO-EXISTE" }],
    ["PATCH", `/api/users/${ids.admin}`, {}],
    ["POST", "/api/admin/users", {}]
  ];
  for (const [method, path, body] of adminWriteChecks) {
    const response = await request(baseUrl, "admin-token", method, path, body);
    assert.notEqual(response.status, 401, `${method} ${path}`);
    assert.notEqual(response.status, 403, `${method} ${path}`);
  }

  const roleRegressionChecks = [
    ["logistica-token", "GET", "/api/bodega/queue", undefined],
    ["logistica-token", "PUT", "/api/bodega/receive", { codigo_os: "RBAC-NO-EXISTE" }],
    ["qa-token", "GET", "/api/qa/queue", undefined],
    ["qa-token", "POST", "/api/qa/process", { codigo_os: "RBAC-NO-EXISTE", accion: "APROBAR" }],
    ["lab-token", "GET", "/api/lab/queue/VALIDADOR", undefined],
    ["lab-token", "PUT", "/api/lab/assign", { codigo_os: "RBAC-NO-EXISTE", tecnico_id: ids.lab }],
    ["terreno-token", "GET", "/api/os/mis-ordenes", undefined],
    ["terreno-token", "POST", "/api/os/crear", { tipo: "INVALIDO" }]
  ];
  for (const [token, method, path, body] of roleRegressionChecks) {
    const response = await request(baseUrl, token, method, path, body);
    assert.notEqual(response.status, 401, `${token} ${method} ${path}`);
    assert.notEqual(response.status, 403, `${token} ${method} ${path}`);
  }
});
