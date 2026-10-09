# Backend PMP Suite V2.0

**Versión documental:** V2.0  
**Stack:** Node.js + Express + PostgreSQL + Firebase Admin  
**Actualización:** 09-10-2026

## 1. Rol del Backend

Es la capa autoritativa de reglas, seguridad, transacciones, evidencia y persistencia.

No delega reglas críticas a Web/Mobile.

## 2. Inicio

```powershell
cd 03_Backend\pmp-api
npm install
npm run dev
```

- API habitual: `http://localhost:4000`
- Health: `GET /api/health`
- Swagger: `/docs`

## 3. Carpetas

| Ruta | Uso |
|---|---|
| `src/routes` | endpoints |
| `src/services` | dominio/SQL |
| `src/security` | POLICY/RBAC |
| `src/middleware` | auth/usuario/guards |
| `src/constants` | roles |
| `test` | unitarias/contratos |
| `verification` | E2E/escenarios |
| `tools` | PostgreSQL efímero/utilidades |

## 4. Cadena de seguridad

```text
Firebase
→ ensureUser
→ rol PostgreSQL
→ authorize(action)
→ resource scope
→ service
```

Admin no tiene wildcard.

## 5. Dominios

- usuarios;
- activos;
- requerimientos;
- Terreno;
- Bodega;
- Laboratorio;
- QA;
- repuestos;
- evidencia física;
- Bridge;
- trazabilidad;
- dashboards;
- IA.

## 6. Transacciones e idempotencia

Se usan `BEGIN/COMMIT/ROLLBACK`, locks de filas/advisory locks, fingerprints y eventos para impedir carreras/dobles movimientos.

## 7. Errores

Los errores de negocio se transforman en HTTP controlado. Casos de estado/evidencia suelen utilizar 409/422; permisos 403; autenticación 401.

## 8. Base de datos

Esquema `pmp`.

Detalle:

- `02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md`
- `05_BaseDatos/migraciones/`

## 9. API

Catálogo completo:

`02_Arquitectura/CATALOGO_API_V2.0.md`.

## 10. Pruebas

```powershell
npm test
```

Última línea documentada: **118/118**.

E2E de escritura usan PostgreSQL efímero.

## 11. Reglas de seguridad para desarrollo

- nunca versionar service account;
- nunca registrar token/password;
- no ejecutar stress/reset sobre base habitual;
- nueva ruta de mutación debe declarar acción RBAC;
- toda mutación física debe definir idempotencia/evidencia.

## 12. Documentación

Arquitectura Backend detallada:

`02_Arquitectura/Arquitectura_02_Backend_V2.0.md`.
