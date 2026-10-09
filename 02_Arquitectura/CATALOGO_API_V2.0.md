# Catálogo de API — PMP Suite V2.0

**Versión:** V2.0  
**Base URL habitual:** `http://localhost:4000/api`  
**Actualización:** 09-10-2026

## 1. Convenciones

- Autenticación: Bearer token Firebase.
- Rol efectivo: PostgreSQL.
- JSON como formato principal.
- Errores de dominio: `401`, `403`, `404`, `409`, `422`.
- `500` reservado para fallos no controlados.
- Las rutas operacionales sensibles aplican `authorize(action)` y validaciones adicionales de recurso/ciclo/evidencia.

## 2. Autenticación

| Método | Ruta | Función |
|---|---|---|
| GET | `/auth/me` | identidad y rol efectivo |
| POST | `/auth/reset-password-link` | recuperación administrativa/autorizada |
| POST | `/auth/my/reset-password-link` | recuperación propia |
| POST | `/auth/password` | cambio de contraseña propia |

## 3. Usuarios

| Método | Ruta | Permiso | Función |
|---|---|---|---|
| GET | `/users` | users.manage | listar usuarios |
| GET | `/users/:id` | self/admin | detalle autorizado |
| PATCH | `/users/:id` | users.manage | actualización administrativa |
| POST | `/users/:id/password` | users.manage | contraseña administrativa |
| POST | `/admin/users` | users.manage | crear usuario |
| PUT | `/admin/users/:id` | users.manage | editar usuario |
| PATCH | `/admin/users/:id/activar` | users.manage | activar |
| PATCH | `/admin/users/:id/desactivar` | users.manage | desactivar |
| POST | `/admin/users/:id/reset-password-link` | users.manage | enlace reset |
| POST | `/admin/users/:id/set-password` | users.manage | establecer contraseña |

Controles: último Admin, autoedición de privilegios, conflicto identidad.

## 4. Activos

| Método | Ruta | Acción |
|---|---|---|
| GET | `/activos` | buscar activos registrados |
| POST | `/activos` | alta de maestro |
| POST | `/activos/recepcion/validar` | validar captura inicial |
| POST | `/activos/recepcion` | confirmar recepción inicial |

GET usa `assets.read`; escrituras usan `assets.register`.

## 5. Requerimientos

| Método | Ruta | Acción |
|---|---|---|
| GET | `/requerimientos` | listar casos |
| GET | `/requerimientos/:id` | detalle |
| POST | `/requerimientos` | crear caso + OS |
| POST | `/requerimientos/:id/pod` | registrar intervención PoD |
| GET | catálogos/búsquedas del módulo | activos/buses/maestros permitidos |

Crear corresponde a Logística.

## 6. Órdenes / Terreno

| Método | Ruta | Acción |
|---|---|---|
| GET | `/os/activos-operativos` | activos en operación para Terreno |
| GET | `/os/pendientes-retiro` | pendientes para asignación |
| POST | `/os/asignar-retiro` | asignar técnico |
| POST | `/os/validar-identidad-retiro` | validar equipo físico |
| POST | `/os/discrepancia-retiro` | registrar discrepancia |
| POST | `/os/confirmar-retiro` | confirmar retiro físico |
| GET | `/os` | consulta global autorizada |
| POST | `/os/crear` | reportar falla |
| POST | `/os/completar-instalacion` | completar instalación |
| GET | `/os/mis-ordenes` | órdenes propias |
| GET | `/os/:id` | detalle autorizado |

## 7. Bodega / Logística

| Método | Ruta | Acción |
|---|---|---|
| GET | `/bodega/inventario` | proyección de inventario |
| GET | `/bodega/despacho/destinos` | destinos/contexto de instalación |
| POST | `/bodega/despacho/validar` | validar equipo para despacho |
| POST | `/bodega/despacho/confirmar` | confirmar despacho + crear IN |
| POST | `/bodega/recepcion-terreno/validar` | validar recepción Terreno |
| GET | `/bodega/queue` | cola operacional |
| PUT | `/bodega/receive` | confirmar recepción |
| POST | `/bodega/dispatch-lab/validar` | validar salida Lab |
| PUT | `/bodega/dispatch-lab` | confirmar salida Lab |
| POST | `/bodega/dispatch-qa/validar` | validar salida QA |
| PUT | `/bodega/dispatch-qa` | confirmar salida QA |
| GET | `/bodega/stock` | stock elegible |
| GET | `/bodega/repuestos` | repuestos |
| PUT | `/bodega/solicitudes/:id/entregar` | entregar repuesto |
| GET | `/bodega/tecnicos` | técnicos Terreno |
| GET | `/bodega/dashboard` | KPI Bodega |

Rutas legacy de asignación directa retornan conflicto/410 cuando corresponde.

## 8. Laboratorio

| Método | Ruta | Permiso | Acción |
|---|---|---|---|
| GET | `/lab/supervision` | lab.supervise | resumen/carga/SLA |
| GET | `/lab/reception` | lab.supervise | bandeja recepción |
| GET | `/lab/custody/:code` | lab.custody | contexto custodia |
| POST | `/lab/custody/:code/RECEPCION/validar` | lab.custody | validar recepción |
| POST | `/lab/custody/:code/RECEPCION/confirmar` | lab.custody | confirmar recepción |
| POST | `/lab/custody/:code/SALIDA/validar` | lab.custody | validar salida |
| POST | `/lab/custody/:code/SALIDA/confirmar` | lab.custody | confirmar salida |
| GET | `/lab/technicians` | lab.read | técnicos |
| PUT | `/lab/assign` | lab.assign | asignar/reasignar |
| GET | `/lab/queue/:type` | lab.read | cola por tipo |
| PUT | `/lab/move` | lab.work | iniciar cambio técnico |
| GET | `/lab/work/:codigoOs` | lab.work | trabajo técnico |
| PUT | `/lab/work/:codigoOs` | lab.work | guardar avance |
| POST | `/lab/finish` | lab.work | cierre técnico |
| POST | `/lab/request-part` | lab.work | solicitar necesidad |
| GET | `/lab/parts` | warehouse.read | consulta logística |
| GET | `/lab/completed` | lab.read | completados |

`/lab/dispatch-qa` legacy retorna 410 y obliga a custodia explícita.

## 9. QA

| Método | Ruta | Acción |
|---|---|---|
| GET | `/qa/dashboard` | dashboard/etapas |
| GET | `/qa/queue` | cola |
| GET | `/qa/incoming` | entradas |
| GET | `/qa/:code/work` | detalle |
| POST | `/qa/:code/:purpose/validar` | validar evidencia física |
| POST | `/qa/:code/actions/:action` | comando de etapa |

Las rutas `/qa/assign`, `/qa/start` y `/qa/process` retornan 410 para impedir el flujo legacy.

## 10. Escaneo físico

| Método | Ruta | Acción |
|---|---|---|
| GET | `/equipment-scan/resolve` | resolver identificador |
| POST | `/equipment-scan/confirm` | confirmar captura autorizada |

Las estaciones válidas dependen del rol.

## 11. Bridge / referencias

| Método | Ruta | Acción |
|---|---|---|
| GET | `/bridge/buscar` | buscar referencia/activo/OS |
| GET | `/bridge/activos/:tipo/:serie/historial` | historial |
| GET | `/bridge` | listar correlaciones |
| POST | `/bridge` | crear correlación |

Bridge no ejecuta movimientos.

## 12. Dashboards y búsqueda

| Método | Ruta | Acción |
|---|---|---|
| GET | `/dashboard/executive` | dashboard ejecutivo |
| GET | `/dashboard/summary` | resumen |
| GET | `/dashboard/equipos-operativos` | activos operativos |
| GET | `/dashboard/global-search` | búsqueda transversal |
| GET | `/dashboard/badges` | badges operacionales |
| GET | `/admin/stats` | estadísticas autorizadas |
| GET | `/admin/dispatch-queue` | cola de consulta |

## 13. Maestros

| Método | Ruta |
|---|---|
| GET | `/master/terminales` |
| GET | `/master/psts` |

## 14. IA

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/ai/predictive-report` | supervision.read |

## 15. Health / documentación

- `GET /api/health`
- Swagger UI: `/docs`

## 16. Contrato de errores

| HTTP | Uso |
|---:|---|
| 400 | petición malformada puntual |
| 401 | autenticación ausente/inválida |
| 403 | rol/scope no autorizado |
| 404 | recurso inexistente |
| 409 | estado/custodia/evidencia/conflicto |
| 410 | flujo legacy retirado |
| 422 | validación de negocio/campos |
| 500 | error inesperado |

## 17. Principio de idempotencia

Movimientos físicos y cierres relevantes almacenan evidencia/firma/contexto. Un reintento idéntico puede devolverse como duplicado; un reintento con contexto distinto se rechaza.
