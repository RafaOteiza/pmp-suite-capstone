# Fase 3E — endurecimiento de autenticación y revocación

## Objetivo

Rechazar de forma inmediata tokens Firebase revocados, expirados o inválidos y cuentas Firebase deshabilitadas, sin alterar el RBAC aprobado. PostgreSQL continúa siendo la única autoridad efectiva del usuario, su estado activo y su rol. Los Custom Claims no conceden permisos.

## Respuestas de autenticación

| Condición | HTTP | `code` | Mensaje del backend |
| --- | ---: | --- | --- |
| Bearer token ausente | 401 | `AUTH_REQUIRED` | Se requiere autenticación. |
| Token revocado | 401 | `TOKEN_REVOKED` | La sesión fue revocada. Inicia sesión nuevamente. |
| Token expirado | 401 | `TOKEN_EXPIRED` | La sesión expiró. Inicia sesión nuevamente. |
| Cuenta Firebase deshabilitada | 403 | `USER_DISABLED` | La cuenta está deshabilitada. |
| Token malformado, firma inválida o argumento inválido | 401 | `INVALID_TOKEN` | La sesión no es válida. |
| Firebase Admin no puede comprobar la sesión | 503 | `AUTH_SERVICE_UNAVAILABLE` | No fue posible validar la sesión. |

Las respuestas no incluyen tokens, UID, stack traces, rutas locales ni detalles internos de Firebase.

## Flujo del backend

1. `firebaseAuth` obtiene el Bearer token.
2. Firebase Admin ejecuta `verifyIdToken(token, true)`. No existe fallback a una verificación sin revocación.
3. El middleware adjunta únicamente UID, correo y nombre Firebase a `req.firebase`.
4. `ensureUser` busca el correo en PostgreSQL, exige un usuario activo y crea `req.user` con el rol almacenado en `pmp.usuarios`.
5. `enforceReadOnlyRole` y la autorización específica de la ruta aplican el RBAC.

Los rechazos Firebase registran únicamente código normalizado, ruta, método, fecha e identificador de solicitud cuando está disponible. Nunca se registra el Bearer token.

## Flujo del frontend

- Firebase Authentication conserva la persistencia de la sesión.
- El interceptor de solicitudes obtiene `fbAuth.currentUser.getIdToken()` para cada solicitud. PMP Suite no guarda ID tokens manualmente en `localStorage`, `sessionStorage`, IndexedDB propio ni `pmp_me_cache`.
- El interceptor global sólo invalida la sesión ante `TOKEN_REVOKED`, `TOKEN_EXPIRED`, `INVALID_TOKEN` o `USER_DISABLED`.
- Una invalidación ejecuta `signOut`, elimina únicamente `pmp_me_cache`, limpia la identidad en memoria, muestra el mensaje asociado mediante la ruta de login y evita duplicar cierres concurrentes.
- Sólo se conserva una ruta explícitamente catalogada como lectura; nunca se reintenta automáticamente una escritura.
- La clave heredada `pmp_token` se elimina una vez al iniciar y ya no se lee ni se escribe.

`READ_ONLY_ROLE`, otros 403, 404, 409, errores de validación, errores de negocio y errores 500 no disparan el cierre de sesión.

## Comportamiento de `READ_ONLY_ROLE`

El gerente continúa conectado cuando una escritura operacional devuelve:

```json
{
  "error": "READ_ONLY_ROLE",
  "message": "El rol gerente posee acceso de solo lectura"
}
```

La interfaz conserva la sesión y `pmp_me_cache`, muestra el aviso de solo lectura y permite continuar navegando por las consultas autorizadas.

## Pruebas automatizadas

- Backend: 28 pruebas aprobadas, incluidas las 16 pruebas RBAC existentes y escenarios simulados de token válido, ausente, inválido, expirado, revocado, usuario Firebase deshabilitado y falla temporal de Firebase Admin. También se cubren usuario PostgreSQL ausente/inactivo, gerente GET/escritura y admin escritura.
- Frontend: 23 pruebas aprobadas, incluidas las 13 pruebas existentes. Se cubren los cuatro códigos de invalidación, exclusiones de cierre, limpieza selectiva, concurrencia, ausencia de bucle y conservación segura de ruta.
- Build: TypeScript y Vite completan correctamente. Vite mantiene una advertencia no bloqueante por un chunk mayor de 500 kB, ajena a autenticación.

Todas las condiciones de revocación se prueban con mocks. No se revocó ninguna sesión real.

## Validaciones HTTP autenticadas reales

Ejecutadas manualmente el 10 de agosto de 2026 contra el backend oficial reiniciado, usando sesiones Firebase normales y sin imprimir ni almacenar los ID tokens:

| Usuario | Comprobación | Resultado |
| --- | --- | --- |
| Jorge Castillo | `/api/auth/me` | 200, `gerente`, activo |
| Jorge Castillo | GET `/api/dashboard/summary` | 200 |
| Jorge Castillo | POST `/api/admin/dispatch` con lista vacía | 403 `READ_ONLY_ROLE` |
| Jorge Castillo | `/api/auth/me` posterior | 200; la sesión permaneció activa |
| Rafael Oteiza | `/api/auth/me` | 200, `admin`, activo |
| Rafael Oteiza | GET `/api/admin/stats` | 200 |
| Rafael Oteiza | POST `/api/admin/dispatch` con lista vacía | 400 de validación; alcanzó el handler y no fue bloqueado por RBAC |
| Rafael Oteiza | `/api/auth/me` posterior | 200; la sesión permaneció activa |

El cuerpo vacío de despacho no generó operaciones. Estas validaciones no cambiaron PostgreSQL, roles, Custom Claims, contraseñas ni sesiones.

## Costo y latencia

`verifyIdToken(token, true)` valida la firma del JWT y además consulta a Firebase Authentication para comprobar revocación y estado deshabilitado. Esa comprobación remota agrega una llamada y latencia a cada solicitud autenticada, y hace que una indisponibilidad administrativa o de red cierre el acceso de forma segura con 503. En esta fase no se implementa una caché propia, porque reduciría la inmediatez de la revocación y agregaría estado de seguridad adicional.

## Procedimiento futuro para una prueba real de revocación

Este procedimiento requiere autorización explícita y debe realizarse preferentemente con una cuenta de prueba, no con Rafael ni Jorge:

1. Confirmar que la cuenta de prueba está activa en Firebase y PostgreSQL.
2. Iniciar sesión y conservar temporalmente el ID token sólo en memoria, sin imprimirlo ni guardarlo.
3. Confirmar que una ruta GET protegida responde 200.
4. Ejecutar `revokeRefreshTokens` exclusivamente para el UID de prueba autorizado.
5. Repetir la ruta con el token anterior y confirmar `401 TOKEN_REVOKED`.
6. Confirmar en el navegador un único `signOut`, eliminación de `pmp_me_cache`, mensaje de seguridad y redirección única al login.
7. Iniciar una sesión nueva y confirmar que el token nuevo vuelve a ser aceptado si el usuario PostgreSQL continúa activo.
8. Registrar sólo resultados y códigos normalizados; destruir cualquier token temporal al finalizar.

No se debe deshabilitar usuarios, cambiar roles o claims, ni revocar sesiones productivas como parte de una prueba rutinaria.
