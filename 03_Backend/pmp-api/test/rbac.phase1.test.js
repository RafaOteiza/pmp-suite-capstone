import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { ROLES } from "../src/constants/roles.js";
import { createEnsureUser } from "../src/middleware/ensureUser.js";
import { requireAnyRole } from "../src/middleware/requireAnyRole.js";
import { enforceReadOnlyRole } from "../src/middleware/readOnlyRole.js";
import { installMockFirebaseCredential } from "./helpers/mockFirebaseCredential.js";

const removeMockFirebaseCredential = installMockFirebaseCredential();
test.after(removeMockFirebaseCredential);

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

function fakePoolWith(rows) {
  return {
    async query() {
      return { rowCount: rows.length, rows };
    }
  };
}

function activeUser(role) {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    nombre: "Usuario",
    apellido: "Prueba",
    correo: `${role}@pmp-suite.cl`,
    rol: role,
    activo: true
  };
}

async function source(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("sin token, firebaseAuth responde 401", async () => {
  const { firebaseAuth } = await import("../src/middleware/firebaseAuth.js");
  const res = responseRecorder();
  let nextCalled = false;

  await firebaseAuth({ headers: {} }, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("usuario ausente en PostgreSQL responde 403", async () => {
  const ensureUser = createEnsureUser(fakePoolWith([]));
  const res = responseRecorder();

  await ensureUser(
    { firebase: { uid: "firebase-uid", email: "ausente@pmp-suite.cl" } },
    res,
    () => assert.fail("no debe continuar")
  );

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, "Usuario no habilitado");
});

test("usuario inactivo en PostgreSQL responde 403", async () => {
  const ensureUser = createEnsureUser(fakePoolWith([{ ...activeUser(ROLES.GERENTE), activo: false }]));
  const res = responseRecorder();

  await ensureUser(
    { firebase: { uid: "firebase-uid", email: "gerente@pmp-suite.cl" } },
    res,
    () => assert.fail("no debe continuar")
  );

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, "Usuario inactivo");
});

test("gerente ejecutando un GET autorizado obtiene 200", async () => {
  const ensureUser = createEnsureUser(fakePoolWith([activeUser(ROLES.GERENTE)]));
  const req = {
    method: "GET",
    baseUrl: "/api/dashboard",
    path: "/summary",
    firebase: { uid: "firebase-uid", email: "gerente@pmp-suite.cl" }
  };
  const res = responseRecorder();

  await ensureUser(req, res, () => {
    enforceReadOnlyRole(req, res, () => {
      requireAnyRole(ROLES.ADMIN, ROLES.GERENTE)(req, res, () => {
        res.status(200).json({ ok: true });
      });
    });
  });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
});

test("gerente recibe READ_ONLY_ROLE para POST, PUT, PATCH y DELETE", () => {
  const originalWarn = console.warn;
  const logs = [];
  console.warn = (...args) => logs.push(args);

  try {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const req = {
        method,
        baseUrl: "/api/operacion",
        path: "/dato-sensible/123",
        headers: { authorization: "Bearer token-que-no-debe-registrarse" },
        body: { secreto: "no-registrar" },
        user: activeUser(ROLES.GERENTE)
      };
      const res = responseRecorder();

      enforceReadOnlyRole(req, res, () => assert.fail(`${method} no debe continuar`));

      assert.equal(res.statusCode, 403, method);
      assert.deepEqual(res.body, {
        error: "READ_ONLY_ROLE",
        message: "El rol gerente posee acceso de solo lectura"
      });
    }
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(logs.length, 4);
  for (const [, metadata] of logs) {
    assert.equal(metadata.role, ROLES.GERENTE);
    assert.equal(metadata.routeGroup, "/api/operacion");
    assert.equal("headers" in metadata, false);
    assert.equal("body" in metadata, false);
  }
});

test("gerente conserva las excepciones de contraseña propia", () => {
  const paths = [
    "/password",
    "/reset-password-link",
    "/my/reset-password-link"
  ];

  for (const path of paths) {
    const req = {
      method: "POST",
      baseUrl: "/api/auth",
      path,
      user: activeUser(ROLES.GERENTE)
    };
    const res = responseRecorder();
    let nextCalled = false;

    enforceReadOnlyRole(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true, path);
    assert.equal(res.statusCode, 200, path);
  }
});

test("un claim Firebase admin no prevalece sobre PostgreSQL gerente", async () => {
  const ensureUser = createEnsureUser(fakePoolWith([activeUser(ROLES.GERENTE)]));
  const req = {
    method: "POST",
    baseUrl: "/api/admin",
    path: "/dispatch",
    firebase: {
      uid: "firebase-uid",
      email: "gerente@pmp-suite.cl",
      rol: ROLES.ADMIN
    }
  };
  const res = responseRecorder();
  const originalWarn = console.warn;
  console.warn = () => {};

  try {
    await ensureUser(req, res, () => {
      enforceReadOnlyRole(req, res, () => assert.fail("el claim no debe elevar permisos"));
    });
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(req.user.rol, ROLES.GERENTE);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, "READ_ONLY_ROLE");
});

test("admin y los roles operativos conservan sus permisos de escritura", () => {
  const permissionCases = [
    ["admin en OS", ROLES.ADMIN, [ROLES.ADMIN, ROLES.TECNICO_LAB, ROLES.TECNICO_TERRENO]],
    ["admin en laboratorio", ROLES.ADMIN, [ROLES.ADMIN, ROLES.TECNICO_LAB]],
    ["admin en QA", ROLES.ADMIN, [ROLES.ADMIN, ROLES.QA]],
    ["admin en bodega", ROLES.ADMIN, [ROLES.ADMIN, ROLES.LOGISTICA]],
    ["logistica en bodega", ROLES.LOGISTICA, [ROLES.ADMIN, ROLES.LOGISTICA]],
    ["qa en QA", ROLES.QA, [ROLES.ADMIN, ROLES.QA]],
    ["tecnico_laboratorio en laboratorio", ROLES.TECNICO_LAB, [ROLES.ADMIN, ROLES.TECNICO_LAB]],
    ["tecnico_terreno en OS", ROLES.TECNICO_TERRENO, [ROLES.ADMIN, ROLES.TECNICO_LAB, ROLES.TECNICO_TERRENO]]
  ];

  for (const [name, role, allowed] of permissionCases) {
    const req = { user: activeUser(role) };
    const res = responseRecorder();
    let nextCalled = false;

    requireAnyRole(...allowed)(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true, name);
    assert.equal(res.statusCode, 200, name);
  }
});

test("las matrices de rutas mantienen admin global y escritores operativos", async () => {
  const os = await source("src/routes/os.routes.js");
  const lab = await source("src/routes/lab.routes.js");
  const qa = await source("src/routes/qa.routes.js");
  const bodega = await source("src/routes/bodega.routes.js");

  assert.match(os, /const osWriteRoles = \[ROLES\.ADMIN, ROLES\.TECNICO_LAB, ROLES\.TECNICO_TERRENO\]/);
  assert.match(lab, /const labWriteRoles = \[ROLES\.ADMIN, ROLES\.TECNICO_LAB\]/);
  assert.match(qa, /const qaWriteRoles = \[ROLES\.ADMIN, ROLES\.QA\]/);
  assert.match(bodega, /const bodegaWriteRoles = \[ROLES\.ADMIN, ROLES\.LOGISTICA\]/);
});

test("laboratorio usa el usuario PostgreSQL autorizado también para admin", async () => {
  const text = await source("src/routes/lab.routes.js");
  assert.match(text, /const tecnicoId = req\.user\.id/);
  assert.doesNotMatch(text, /WHERE firebase_uid = \$1/);
});

test("las rutas protegidas instalan autenticación, usuario PostgreSQL y solo lectura en ese orden", async () => {
  const routeFiles = [
    "src/routes/auth.routes.js",
    "src/routes/admin.routes.js",
    "src/routes/admin.users.routes.js",
    "src/routes/users.routes.js",
    "src/routes/os.routes.js",
    "src/routes/lab.routes.js",
    "src/routes/qa.routes.js",
    "src/routes/bodega.routes.js",
    "src/routes/dashboard.routes.js",
    "src/routes/ai.routes.js",
    "src/routes/master.routes.js",
    "src/routes/badges.routes.js"
  ];

  for (const routeFile of routeFiles) {
    const text = await source(routeFile);
    assert.match(
      text,
      /router\.use\(firebaseAuth, ensureUser, enforceReadOnlyRole\)/,
      routeFile
    );
  }
});

test("admin dispatch exige admin y sus GET permiten admin o gerente", async () => {
  const text = await source("src/routes/admin.routes.js");

  assert.match(text, /const adminReadRoles = \[ROLES\.ADMIN, ROLES\.GERENTE\]/);
  assert.match(text, /router\.get\("\/stats", requireAnyRole\(\.\.\.adminReadRoles\)/);
  assert.match(text, /router\.get\("\/dispatch-queue", requireAnyRole\(\.\.\.adminReadRoles\)/);
  assert.match(text, /router\.post\("\/dispatch", requireAnyRole\(ROLES\.ADMIN\)/);
  assert.doesNotMatch(text, /router\.post\("\/dispatch", firebaseAuth/);
});

test("GET /api/os es global y exclusivo de admin o gerente", async () => {
  const text = await source("src/routes/os.routes.js");
  assert.match(
    text,
    /router\.get\("\/", requireAnyRole\(ROLES\.ADMIN, ROLES\.GERENTE\)/
  );
  assert.match(text, /pagination: \{ total, limit, offset \}/);
});

test("requireAnyRole posee una sola implementación canónica", async () => {
  const canonical = await source("src/middleware/requireAnyRole.js");
  const requireRole = await source("src/middleware/requireRole.js");

  assert.match(canonical, /export function requireAnyRole/);
  assert.doesNotMatch(requireRole, /export function requireAnyRole/);
});
