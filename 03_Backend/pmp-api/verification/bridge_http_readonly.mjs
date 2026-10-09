import "dotenv/config";
import assert from "node:assert/strict";
import fs from "node:fs";
import dotenv from "dotenv";
import pg from "pg";
import admin from "../src/firebase.js";

const frontendEnv = dotenv.parse(fs.readFileSync(new URL("../../../04_Frontend/.env", import.meta.url), "utf8"));
const apiKey = frontendEnv.VITE_FB_API_KEY;
assert.ok(apiKey, "VITE_FB_API_KEY no está configurada");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function idTokenFor(email) {
  const firebaseUser = await admin.auth().getUserByEmail(email);
  const customToken = await admin.auth().createCustomToken(firebaseUser.uid);
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true })
  });
  const data = await response.json();
  assert.equal(response.status, 200, data?.error?.message || "No fue posible obtener el ID token de verificación");
  return data.idToken;
}

async function status(token, path) {
  const response = await fetch(`http://127.0.0.1:4000${path}`, { headers: { authorization: `Bearer ${token}` } });
  await response.arrayBuffer();
  return response.status;
}

try {
  const users = await pool.query(
    `SELECT rol, correo FROM pmp.usuarios
     WHERE activo=TRUE AND rol IN ('admin','logistica','tecnico_terreno','tecnico_laboratorio','qa')`
  );
  const byRole = Object.fromEntries(users.rows.map((user) => [user.rol, user.correo]));
  const results = [];
  for (const [role, checks] of Object.entries({
    admin: [["/api/bridge", 200], ["/api/bridge/mantenimiento/listado", 200]],
    logistica: [["/api/bridge/catalogos", 200], ["/api/bridge", 200], ["/api/bridge/mantenimiento/listado", 200]],
    tecnico_terreno: [["/api/bridge/catalogos", 200], ["/api/bridge/mis-trabajos", 200], ["/api/bridge", 403]],
    tecnico_laboratorio: [["/api/bridge/mantenimiento/listado", 200], ["/api/bridge", 403]],
    qa: [["/api/bridge/mantenimiento/listado", 200], ["/api/bridge", 403]]
  })) {
    assert.ok(byRole[role], `No existe usuario activo para ${role}`);
    const token = await idTokenFor(byRole[role]);
    for (const [path, expected] of checks) {
      const actual = await status(token, path);
      assert.equal(actual, expected, `${role} ${path}`);
      results.push({ role, path, status: actual });
    }
  }
  console.log(JSON.stringify({ ok: true, checks: results }, null, 2));
} finally {
  await pool.end();
  await admin.app().delete();
}
