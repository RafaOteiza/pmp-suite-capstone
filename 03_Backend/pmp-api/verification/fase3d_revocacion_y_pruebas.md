# Fase 3D: revocación y validación final

Este procedimiento se prepara para una ejecución futura expresamente autorizada. No debe ejecutarse durante la preparación de la Fase 3D.

## Orden seguro posterior a la migración

1. Confirmar que PostgreSQL ya devuelve `gerente` para Jorge y que el backend aplica `READ_ONLY_ROLE`, incluso antes de sincronizar el claim.
2. Ejecutar `node verification/fase3d_sync_jorge_claim.mjs --apply` sólo con autorización explícita.
3. Comprobar por Firebase Admin que el claim `rol` es `gerente` y que los demás claims se conservaron.
4. Revocar exclusivamente los refresh tokens del UID `Mv16HimaOnPuwU4cPMpiZpvQoNy2` mediante `admin.auth().revokeRefreshTokens(uid)` en un proceso administrativo controlado.
5. En el navegador de Jorge, ejecutar el cierre de sesión normal de Firebase, eliminar únicamente `pmp_me_cache` de `localStorage` y redirigir al login.
6. Iniciar una sesión nueva de Jorge; no reutilizar el ID token anterior.
7. Proporcionar el token nuevo sólo mediante la variable temporal `JORGE_FIREBASE_ID_TOKEN` y ejecutar `node verification/fase3d_verify_jorge.mjs --expected-role=gerente`.
8. No registrar, copiar ni guardar el token en archivos, comandos compartidos o documentación.

## Matriz final

| Identidad | Prueba | Resultado esperado |
|---|---|---|
| Rafael | `/api/auth/me` | `admin`, activo |
| Rafael | Lecturas globales | Permitidas |
| Rafael | Escrituras globales controladas | Permitidas |
| Jorge | `/api/auth/me` | `gerente`, activo |
| Jorge | Consultas `GET`, `HEAD`, `OPTIONS` autorizadas | Permitidas |
| Jorge | `POST` operacional | `403 READ_ONLY_ROLE` |
| Jorge | `PUT` operacional | `403 READ_ONLY_ROLE` |
| Jorge | `PATCH` operacional | `403 READ_ONLY_ROLE` |
| Jorge | `DELETE` operacional | `403 READ_ONLY_ROLE` |
| Jorge | `POST /api/admin/dispatch` | `403 READ_ONLY_ROLE` |
| Jorge | Cambio de contraseña propia | Permitido |
| Jorge | Cambio de contraseña ajena | Bloqueado |
| Jorge | Acciones transaccionales en React | Ocultas o deshabilitadas |
| Jorge | Rutas transaccionales directas | `403` |

## Rollback futuro

Si una validación posterior falla, detener el proceso. La reversión de PostgreSQL y la ejecución de `fase3d_rollback_jorge_claim.mjs --apply` requieren autorizaciones nuevas y separadas. Después de cualquier rollback de claim se deben revocar nuevamente sólo los tokens de Jorge y exigir un login nuevo.
