# PMP Suite — Fase 1.5 de verificación y saneamiento RBAC

Fecha de verificación: 6 de agosto de 2026  
Alcance: backend `03_Backend/pmp-api` y auditoría de datos en PostgreSQL.  
Fuera de alcance y sin cambios: frontend, rol de Jorge Castillo, Firebase Custom Claims y umbrales de IA.

## Dictamen

**Fase 1 aprobable después del saneamiento incluido en esta Fase 1.5.**

Se comprobó que PostgreSQL es la autoridad efectiva del rol, que todas las rutas autenticadas instalan la cadena de seguridad en el orden correcto y que `gerente` no puede realizar escrituras operacionales. Las excepciones de contraseña sólo operan sobre la identidad autenticada. `admin` conserva escritura en todos los módulos solicitados y los otros roles no presentan regresiones en la matriz probada.

El único límite de la verificación real es deliberado: todavía no existe un usuario `gerente` en la base principal porque se prohibió cambiar el rol de Jorge. Por ello, la matriz HTTP de `gerente`, incluidos los casos de Firebase Claim `admin` + PostgreSQL `gerente`, usuario ausente e inactivo, se ejecutó sobre una instancia aislada de la aplicación real con Firebase y PostgreSQL simulados. Los cinco roles que sí existen se comprobaron contra el backend y la base reales.

## 1. Revisión del diff de Fase 1

El directorio local contiene una carpeta `.git` sin metadatos utilizables. Para obtener un diff verificable se clonó como línea base el repositorio público `RafaOteiza/Capstone_V1`, commit `2859405` (`Add files via upload`), y se comparó el backend completo ignorando sólo diferencias de fin de línea.

Se revisaron íntegramente estos 21 archivos de Fase 1:

1. `03_Backend/pmp-api/package.json`
2. `03_Backend/pmp-api/src/constants/roles.js`
3. `03_Backend/pmp-api/src/middleware/ensureUser.js`
4. `03_Backend/pmp-api/src/middleware/readOnlyRole.js`
5. `03_Backend/pmp-api/src/middleware/requireAnyRole.js`
6. `03_Backend/pmp-api/src/middleware/requireRole.js`
7. `03_Backend/pmp-api/src/routes/admin.routes.js`
8. `03_Backend/pmp-api/src/routes/admin.users.routes.js`
9. `03_Backend/pmp-api/src/routes/ai.routes.js`
10. `03_Backend/pmp-api/src/routes/auth.routes.js`
11. `03_Backend/pmp-api/src/routes/badges.routes.js`
12. `03_Backend/pmp-api/src/routes/bodega.routes.js`
13. `03_Backend/pmp-api/src/routes/dashboard.routes.js`
14. `03_Backend/pmp-api/src/routes/lab.routes.js`
15. `03_Backend/pmp-api/src/routes/master.routes.js`
16. `03_Backend/pmp-api/src/routes/os.routes.js`
17. `03_Backend/pmp-api/src/routes/qa.routes.js`
18. `03_Backend/pmp-api/src/routes/users.routes.js`
19. `03_Backend/pmp-api/test/app.phase1.smoke.test.js`
20. `03_Backend/pmp-api/test/rbac.phase1.test.js`
21. `03_Backend/pmp-api/test/roles.phase1.test.js`

La revisión no detectó cambios de negocio o de IA mezclados en el diff. `requireAnyRole` tiene una sola implementación canónica. `requireRole` permanece como middleware distinto para el caso de un solo rol.

### Saneamiento aplicado en Fase 1.5

Se corrigieron tres defectos defensivos de `GET /api/os`:

- `parseInt` aceptaba entradas parciales como `1abc`; ahora todos los enteros se validan de manera estricta.
- el total podía ser cero si el `offset` excedía la última página; ahora el total permanece correcto y `items` es un arreglo vacío;
- se exponían UUID internos de técnicos sin necesidad; ahora se devuelven nombres legibles y no esos identificadores.

También se añadieron artefactos reproducibles de inspección, pruebas HTTP, auditoría de datos y el SQL de limpieza con `ROLLBACK`.

## 2. Orden de middleware y cobertura

La inspección dinámica de los routers Express confirmó esta cadena compartida en todos los grupos autenticados:

```text
firebaseAuth
→ ensureUserMiddleware
→ enforceReadOnlyRole
→ requireAnyRole / requireRole / requireSelfOrAdmin
→ handler
```

Grupos auditados: `/api/auth`, `/api/ai`, `/api/os`, `/api/users`, `/api/admin/users`, `/api/dashboard`, `/api/lab`, `/api/qa`, `/api/bodega`, `/api/admin`, `/api/master` y badges bajo `/api/dashboard`.

Resultado del inspector: **0 violaciones**. No existe ningún endpoint autenticado sin `ensureUser` o `enforceReadOnlyRole`. Sólo `/docs` y `/api/health` son públicos de forma intencional.

Las rutas de autenticación personal no requieren un guard adicional por rol, pero sí ejecutan los tres middleware compartidos antes del handler.

## 3. Fuente del rol y seguridad central

`firebaseAuth` valida el token y entrega UID/correo. Luego `ensureUser` consulta con parámetro `$1` a `pmp.usuarios`, verifica existencia y estado activo y construye `req.user.rol` desde PostgreSQL. Los Custom Claims no participan en la decisión de autorización.

Casos comprobados:

- sin token: `401`;
- usuario no presente en PostgreSQL: `403`;
- usuario inactivo: `403`;
- Claim Firebase `admin` + rol PostgreSQL `gerente`: las escrituras retornan `403 READ_ONLY_ROLE`;
- el rechazo registra sólo rol, método, grupo de ruta y fecha; no registra token, body, query ni datos sensibles.

## 4. Matriz final de rutas y permisos

| Grupo | Lectura | Escritura |
|---|---|---|
| Auth personal | Todo usuario activo, incluido gerente | Todo usuario activo sólo sobre su propia identidad |
| Admin stats/cola | `admin`, `gerente` | No aplica |
| Admin dispatch | No aplica | Sólo `admin` |
| Usuarios | Listado: `admin`; detalle: propio o `admin` | Sólo `admin` en rutas administrativas |
| OS global `/api/os` | `admin`, `gerente` | No aplica |
| OS detalle/mis órdenes | `admin`, `gerente`, `tecnico_laboratorio`, `tecnico_terreno` | No aplica |
| OS crear/completar instalación | No aplica | `admin`, `tecnico_laboratorio`, `tecnico_terreno` |
| Laboratorio | `admin`, `gerente`, `tecnico_laboratorio` | `admin`, `tecnico_laboratorio` |
| QA | `admin`, `gerente`, `qa` | `admin`, `qa` |
| Bodega | `admin`, `gerente`, `logistica` | `admin`, `logistica` |
| Dashboard resumen/búsqueda/badges | Todos los roles oficiales | No aplica |
| Dashboard equipos operativos | `admin`, `gerente`, `logistica` | No aplica |
| Maestros e IA | Todos los roles oficiales | No aplica |
| Administración de usuarios | No aplica | Sólo `admin` |

### Escritura real de admin

Los guards de laboratorio, QA, bodega y OS incluyen explícitamente `admin`. Las rutas de usuarios y despacho administrativo exigen explícitamente `admin`. Las pruebas HTTP verificaron que `admin` atraviesa el guard y llega al handler en:

- `POST /api/os/crear`;
- `PUT /api/lab/assign`;
- `POST /api/qa/process`;
- `PUT /api/bodega/receive`;
- `POST /api/admin/users`;
- `POST /api/admin/dispatch`.

Se usaron payloads inválidos o referencias inexistentes para no crear ni cambiar datos durante esta fase. Las pruebas aisladas verificaron además el camino exitoso de los handlers simulando la persistencia.

### Lecturas y bloqueo de gerente

Se verificaron 22 lecturas representativas: perfil, dashboard, equipos, búsqueda, badges, stats y cola administrativa, listado/detalle de OS, laboratorio, QA, bodega, maestros e IA. Todas retornaron `200` para `gerente` en la instancia aislada.

`POST`, `PUT`, `PATCH` y `DELETE` retornan exactamente:

```json
{
  "error": "READ_ONLY_ROLE",
  "message": "El rol gerente posee acceso de solo lectura"
}
```

## 5. Excepciones personales de contraseña

Las únicas excepciones al modo lectura son rutas exactas bajo `/api/auth`:

- `POST /api/auth/password`;
- `POST /api/auth/reset-password-link`;
- `POST /api/auth/my/reset-password-link`.

La actualización usa exclusivamente `req.firebase.uid`, obtenido del token verificado. Los enlaces usan exclusivamente `req.user.correo`, obtenido del usuario PostgreSQL autenticado. Ninguna ruta acepta un usuario objetivo desde body, query o parámetro.

Se enviaron deliberadamente UID, correo e ID ajenos en body y query: fueron ignorados y la operación se mantuvo en la identidad autenticada. Los intentos de gerente contra `/api/users/:id/password` y las rutas administrativas de contraseña fueron bloqueados con `403 READ_ONLY_ROLE`.

## 6. Revisión de `GET /api/os`

- Autorización: sólo `admin` y `gerente`.
- Parámetros SQL: todos los valores de filtros viajan como `$1`, `$2`, etc.; los únicos fragmentos dinámicos provienen de lógica interna controlada.
- `limit`: entero estricto entre 1 y 100; valores superiores se limitan a 100.
- `offset`: entero estricto mayor o igual a cero.
- `estado_id`: entero estricto positivo.
- `tipo_equipo`: allow-list `VALIDADOR` o `CONSOLA`.
- búsqueda `q`: string de hasta 100 caracteres, parametrizada.
- respuesta: `{ items, pagination: { total, limit, offset } }`, incluso fuera de la última página.
- exposición: no incluye UUID internos de técnicos; conserva sólo datos operacionales necesarios para el listado.

Se probó una cadena semejante a inyección SQL, enteros parciales, offset negativo, tipo desconocido y búsqueda demasiado larga. Los filtros inválidos retornaron `400`; la búsqueda fue tratada como dato parametrizado.

## 7. Reinicio y pruebas ejecutadas

Se detuvo el proceso Node anterior que escuchaba en el puerto 4000. Se inició `node server.js` desde el directorio exacto `03_Backend/pmp-api` con el código saneado.

- Proceso nuevo: PID `27896`.
- Inicio: `2026-08-06 11:52:17` hora de Chile.
- Puerto: `4000`.
- `GET /api/health`: `200`, `{ "status": "ok", "service": "PMP AI Engine" }`.

### `npm test`

Comando configurado:

```text
node --test test/roles.phase1.test.js test/rbac.phase1.test.js test/app.phase1.smoke.test.js
```

Resultado: **16 aprobadas, 0 fallidas**. Sólo se descubrieron los tres archivos autorizados. `stress_test.js` y `e2e_full_v2.js` no fueron ejecutados ni pueden entrar por descubrimiento automático de `npm test`.

### HTTP aislado con aplicación real

Resultado: **1 suite aprobada, 0 fallidas**. La suite cubre usuario ausente/inactivo, gerente, Claim divergente, excepciones propias, intentos sobre contraseñas ajenas, todas las lecturas globales, los cuatro verbos bloqueados, dispatch y regresiones de roles.

### HTTP contra backend reiniciado y servicios reales

Resultado: **42 comprobaciones aprobadas, 0 fallidas**.

- autenticación y rol PostgreSQL de los cinco roles existentes;
- dashboard para los cinco roles;
- `GET /api/os`, paginación, validaciones y consulta parametrizada;
- `POST /api/admin/dispatch`: admin llega al handler; los otros cuatro roles reciben `403`;
- admin llega a los handlers de escritura global;
- logística, QA, técnico de laboratorio y técnico de terreno conservan sus lecturas y escrituras autorizadas.

La auditoría posterior confirmó que los conteos de datos accidentales no variaron.

## 8. Datos accidentales de `stress_test.js`

Ventana exacta: `2026-08-06T15:33:00Z` hasta antes de `15:34:00Z`. Criterio adicional: series con prefijo `STRESS-`, `RACE-` o `FULL-`.

Conteos:

| Entidad | Total |
|---|---:|
| Órdenes de servicio | 31 |
| OS de instalación incluidas en las 31 | 5 |
| Validadores | 16 |
| Consolas | 10 |
| Buses | 26 |
| Registros de reparación | 5 |
| Solicitudes de repuestos | 0 |
| Ítems de solicitud | 0 |
| Detalles de guía relacionados | 0 |

No existen tablas independientes de eventos, despacho o instalaciones relacionadas por nombre. Las instalaciones corresponden a las cinco OS `IN-*`. Las únicas tablas asociadas encontradas por nombre son `guias` y `guia_detalle`, sin relaciones para este conjunto.

### Las 31 OS

| Código | Serie | Bus | Instalación | Estado |
|---|---|---|---:|---:|
| MV-000155 | STRESS-1786030394416-0-0o0e | STBUS0 | No | 2 |
| MV-000157 | STRESS-1786030394419-10-zjr5 | STBUS10 | No | 2 |
| MV-000158 | STRESS-1786030394419-12-q73v | STBUS12 | No | 2 |
| MC-000134 | STRESS-1786030394419-11-eo9b | STBUS11 | No | 2 |
| MC-000136 | STRESS-1786030394419-13-frw2 | STBUS13 | No | 2 |
| MC-000137 | STRESS-1786030394419-15-aut2 | STBUS15 | No | 2 |
| MV-000156 | STRESS-1786030394419-16-lmtz | STBUS16 | No | 2 |
| MV-000159 | STRESS-1786030394419-14-nob8 | STBUS14 | No | 2 |
| MC-000135 | STRESS-1786030394420-17-6r2f | STBUS17 | No | 2 |
| MC-000138 | STRESS-1786030394420-19-6ag1 | STBUS19 | No | 2 |
| MV-000160 | STRESS-1786030394420-18-zelc | STBUS18 | No | 2 |
| MC-000139 | STRESS-1786030394417-1-zjbk | STBUS1 | No | 2 |
| MC-000141 | STRESS-1786030394418-5-rde6 | STBUS5 | No | 2 |
| MC-000143 | STRESS-1786030394418-3-0vgj | STBUS3 | No | 2 |
| MV-000161 | STRESS-1786030394418-6-l3fq | STBUS6 | No | 2 |
| MV-000162 | STRESS-1786030394418-4-8t4t | STBUS4 | No | 2 |
| MC-000142 | STRESS-1786030394418-7-nki1 | STBUS7 | No | 2 |
| MC-000140 | STRESS-1786030394419-9-ocvz | STBUS9 | No | 2 |
| MV-000164 | STRESS-1786030394418-8-0soa | STBUS8 | No | 2 |
| MV-000163 | STRESS-1786030394417-2-nhqf | STBUS2 | No | 2 |
| MV-000165 | RACE-1786030395893 | RACEPPU | No | 3 |
| MV-000168 | FULL-1786030396331-0 | PFULL0 | No | 13 |
| MV-000166 | FULL-1786030396332-1 | PFULL1 | No | 13 |
| MV-000169 | FULL-1786030396332-2 | PFULL2 | No | 13 |
| MV-000167 | FULL-1786030396332-3 | PFULL3 | No | 13 |
| MV-000170 | FULL-1786030396332-4 | PFULL4 | No | 13 |
| IN-000239 | FULL-1786030396332-1 | STOCK | Sí | 7 |
| IN-000241 | FULL-1786030396331-0 | STOCK | Sí | 7 |
| IN-000240 | FULL-1786030396332-3 | STOCK | Sí | 7 |
| IN-000242 | FULL-1786030396332-4 | STOCK | Sí | 7 |
| IN-000243 | FULL-1786030396332-2 | STOCK | Sí | 7 |

### Equipos y buses

Validadores: las cinco series `FULL-*`, `RACE-1786030395893` y las diez series `STRESS-*` con índices pares 0, 2, 4, 6, 8, 10, 12, 14, 16 y 18.

Consolas: las diez series `STRESS-*` con índices impares 1, 3, 5, 7, 9, 11, 13, 15, 17 y 19.

Buses: `PFULL0` a `PFULL4`, `RACEPPU` y `STBUS0` a `STBUS19`.

### Reparaciones

| ID | OS |
|---|---|
| e6b659d5-8c41-4d43-8408-65425646295b | MV-000166 |
| 95ffcbbd-70dc-41c6-918e-2e5268e6b890 | MV-000167 |
| a6daa760-e02f-44ac-b352-25980bf923cf | MV-000168 |
| 85887628-daa2-435f-b870-fc725315bb80 | MV-000169 |
| 39e96bbc-082e-4744-b579-c9e4c71bd36d | MV-000170 |

## 9. Script SQL de limpieza

Archivo: `05_BaseDatos/cleanup_stress_20260806_rollback.sql`.

El script:

- inicia con `BEGIN`;
- reconstruye el conjunto exacto por ventana y prefijo;
- muestra conteos previos;
- aborta si los conteos difieren de 31/16/10/26/5 y ceros dependientes;
- elimina en orden seguro: ítems, solicitudes, reparaciones, detalles de guía, OS, validadores, consolas y buses sin referencias;
- muestra conteos posteriores;
- termina obligatoriamente en `ROLLBACK`;
- no contiene `COMMIT`.

**El script no fue ejecutado**, ni siquiera en modo rollback. La razón es respetar literalmente la prohibición de ejecutar la limpieza. Antes de una futura ejecución, debe revisarse especialmente la eliminación de buses: esa tabla no tiene fecha de creación y el origen sólo puede inferirse por sus PPU determinísticas y relaciones actuales.

## 10. Problemas y riesgos residuales

1. La carpeta `.git` local no permite historial ni `git status`; conviene restaurar correctamente el clon antes de versionar estos cambios.
2. No hay todavía un usuario PostgreSQL `gerente`, por decisión explícita. La evidencia de ese rol es aislada hasta la futura migración aprobada.
3. Las pruebas reales de escritura usan entradas inválidas para no mutar producción. Confirman autorización y llegada al handler, no una transacción real persistida de cada módulo.
4. El SQL de limpieza está preparado, pero necesita revisión humana y respaldo antes de cualquier futura sustitución de `ROLLBACK` por `COMMIT`.

## 11. Criterio de aprobación

| Criterio | Resultado |
|---|---|
| `npm test` 100% | Cumple: 16/16 |
| Backend reiniciado con código nuevo | Cumple: PID 27896, health 200 |
| `POST /api/admin/dispatch` protegido | Cumple |
| Gerente GET 200 | Cumple en instancia aislada, 22 lecturas |
| Gerente POST/PUT/PATCH/DELETE 403 | Cumple |
| Contraseña propia permitida | Cumple |
| Contraseña ajena bloqueada | Cumple |
| Admin escritura global | Cumple por guards y llegada a handlers |
| Otros roles sin regresiones | Cumple contra backend real |
| Datos de stress identificados | Cumple |
| SQL preparado y no ejecutado | Cumple |

**Recomendación final: aprobar Fase 1 y mantener pendiente, como actividad separada y autorizada, la migración del usuario gerente y la revisión/ejecución futura de la limpieza.**
