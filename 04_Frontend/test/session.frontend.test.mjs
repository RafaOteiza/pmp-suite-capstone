import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  getApiErrorMessage,
  isReadOnlyRoleError,
  READ_ONLY_ROLE_MESSAGE
} from "../src/api/errors.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = (path) => readFile(resolve(root, path), "utf8");

test("READ_ONLY_ROLE se interpreta con el mensaje empresarial", () => {
  const error = { response: { data: { error: "READ_ONLY_ROLE", message: READ_ONLY_ROLE_MESSAGE } } };
  assert.equal(isReadOnlyRoleError(error), true);
  assert.equal(getApiErrorMessage(error), READ_ONLY_ROLE_MESSAGE);
  assert.equal(getApiErrorMessage({ response: { data: { error: "READ_ONLY_ROLE" } } }), READ_ONLY_ROLE_MESSAGE);
});

test("el caché nunca se transforma en usuario autenticado inicial", async () => {
  const session = await source("src/app/session.ts");
  assert.match(session, /status:\s*token\s*\?\s*"loading"\s*:\s*"unauthenticated"/);
  assert.match(session, /me:\s*null/);
  assert.match(session, /previewMe:\s*token\s*\?\s*cachedMe\s*:\s*null/);
});

test("ProtectedRoute espera /api/auth/me y no consulta localStorage", async () => {
  const [route, context] = await Promise.all([
    source("src/components/ProtectedRoute.tsx"),
    source("src/app/SessionContext.tsx")
  ]);
  assert.match(route, /status === "loading"/);
  assert.match(route, /aria-live="polite"/);
  assert.match(route, /isOfficialRole\(me\.rol\)/);
  assert.match(route, /required\.every/);
  assert.doesNotMatch(route, /localStorage|getCachedMe/);
  assert.ok(context.indexOf('setStatus("loading")') < context.indexOf("await loadMeOrNull()"));
});

test("cerrar sesión invalida token, caché e identidad en memoria", async () => {
  const [context, http] = await Promise.all([
    source("src/app/SessionContext.tsx"), source("src/api/http.ts")
  ]);
  assert.match(context, /clearToken\(\)/);
  assert.match(context, /clearCachedMe\(\)/);
  assert.match(context, /setMe\(null\)/);
  assert.match(context, /setStatus\("unauthenticated"\)/);
  assert.match(context, /SESSION_INVALIDATED_EVENT/);
  assert.match(http, /status === 401/);
  assert.match(http, /SESSION_INVALIDATED_EVENT/);
});
