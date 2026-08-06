import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = (path) => readFile(resolve(root, path), "utf8");

test("todas las rutas sensibles declaran una capacidad", async () => {
  const app = await source("src/App.tsx");
  const expected = new Map([
    ["/admin/users", "USERS_VIEW"], ["/admin/despacho", "DISPATCH_VIEW"],
    ["/operacion/os", "OS_VIEW"], ["/operacion/ingreso", "OS_CREATE"],
    ["/lab/asignacion", "LAB_ASSIGN"], ["/lab/despacho-qa", "LAB_DISPATCH"],
    ["/qa", "QA_VIEW"], ["/bodega", "BODEGA_VIEW"],
    ["/trazabilidad", "TRACE_VIEW"], ["/ia/predicciones", "AI_VIEW"]
  ]);
  for (const [path, permission] of expected) {
    assert.match(app, new RegExp(`path="${path.replaceAll("/", "\\/")}"[^\\n]+PERMISSIONS\\.${permission}`), path);
  }
  assert.doesNotMatch(app, /roles=|jefe_taller|jefe_laboratorio|contador/);
});

test("Sidebar deriva navegación de capacidades y oculta menús transaccionales al gerente", async () => {
  const sidebar = await source("src/components/Sidebar.tsx");
  assert.match(sidebar, /can\(me, PERMISSIONS\.OS_VIEW\)/);
  assert.match(sidebar, /can\(me, PERMISSIONS\.LAB_ASSIGN\)/);
  assert.match(sidebar, /can\(me, PERMISSIONS\.DISPATCH_WRITE\)/);
  assert.match(sidebar, /isReadOnlyRole\(me\)/);
  assert.doesNotMatch(sidebar, /jefe_taller|jefe_laboratorio|contador|rol === ['"]bodega['"]/);
});

test("páginas operacionales separan lectura y escritura", async () => {
  const files = await Promise.all([
    source("src/pages/QaPage.tsx"),
    source("src/pages/LabValidadoresPage.tsx"),
    source("src/pages/LabConsolasPage.tsx"),
    source("src/pages/BodegaPage.tsx"),
    source("src/pages/BodegaModulosPage.tsx"),
    source("src/pages/BodegaRepuestosPage.tsx"),
    source("src/pages/AdminDespachoPage.tsx")
  ]);
  assert.match(files[0], /PERMISSIONS\.QA_WRITE/);
  assert.match(files[1], /PERMISSIONS\.LAB_WRITE/);
  assert.match(files[2], /PERMISSIONS\.LAB_WRITE/);
  for (const file of files.slice(3, 6)) assert.match(file, /PERMISSIONS\.BODEGA_WRITE/);
  assert.match(files[6], /PERMISSIONS\.DISPATCH_WRITE/);
  for (const file of files) assert.match(file, /canWrite|canDispatch/);
});

test("rutas manuales no conceden acceso por caché ni arrays de roles", async () => {
  const [app, protectedRoute] = await Promise.all([
    source("src/App.tsx"), source("src/components/ProtectedRoute.tsx")
  ]);
  assert.match(app, /ProtectedRoute permission=/);
  assert.match(protectedRoute, /Navigate to="\/403"/);
  assert.doesNotMatch(protectedRoute, /roles|localStorage|pmp_me_cache/);
});

test("catálogo administrativo contiene sólo los seis roles oficiales", async () => {
  const adminUsers = await source("src/api/adminUsers.ts");
  assert.match(adminUsers, /\["admin", "gerente", "logistica", "qa", "tecnico_laboratorio", "tecnico_terreno"\]/);
  assert.doesNotMatch(adminUsers, /jefe_taller|jefe_laboratorio|contador|"bodega"/);
});
