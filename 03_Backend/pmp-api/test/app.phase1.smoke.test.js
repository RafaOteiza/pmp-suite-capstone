import test from "node:test";
import assert from "node:assert/strict";
import { installMockFirebaseCredential } from "./helpers/mockFirebaseCredential.js";

const removeMockFirebaseCredential = installMockFirebaseCredential();
test.after(removeMockFirebaseCredential);

const { default: app } = await import("../src/app.js");

test("smoke HTTP: health funciona y admin rechaza solicitudes sin token", async (t) => {
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((err) => err ? reject(err) : resolve());
  }));

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);

  const stats = await fetch(`${baseUrl}/api/admin/stats`);
  assert.equal(stats.status, 401);

  const dispatch = await fetch(`${baseUrl}/api/admin/dispatch`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ codigos_os: ["NO-DEBE-EJECUTARSE"] })
  });
  assert.equal(dispatch.status, 401);
});
