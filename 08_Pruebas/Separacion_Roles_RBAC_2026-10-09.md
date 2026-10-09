> **Adenda de activación manual — 09-10-2026:** después de la ejecución documentada en este informe, se verificó manualmente una cuenta Administrador independiente, se incorporaron cuentas adicionales de Admin/Gerencia y la cuenta de Rafael Oteiza fue transferida a `jefe_laboratorio` mediante la interfaz de Usuarios. La comprobación visual confirmó el nuevo rol. Esta adenda no altera los resultados automatizados originales ni publica credenciales/UID.

# Separación RBAC — Gerencia, Administración y Jefatura de Laboratorio

Fecha: 09-10-2026. Estado: **implementado y probado en código; activación de cuentas reales pendiente**.

Esta entrega incorpora `jefe_laboratorio`. No migra usuarios ni modifica Firebase, OS, activos o custodia de la base habitual. No reemplaza los documentos Capstone v2.0 ni sus evidencias históricas.

## Auditoría y matriz anterior / nueva

La API autentica con Firebase y resuelve identidad, cuenta activa y rol desde `pmp.usuarios` en cada solicitud. Los claims, el cuerpo y los parámetros del cliente no conceden permisos. Se conserva `IDENTITY_CONFLICT`; los roles desconocidos y las cuentas sin estado activo confirmado se deniegan.

`usuarios.rol` es texto, sin enum, CHECK ni FK que impida el nuevo valor. **No se necesita ni se aplicó una migración.** La consulta local encontró seis cuentas activas con vínculo UID presente. Esto verifica el modelo PostgreSQL; no constituye una nueva validación remota de esas identidades en Firebase.

| Rol | Antes | Nueva autorización |
| --- | --- | --- |
| Gerente | Consultas globales y excepciones API para contraseña propia | Consultas ejecutivas, indicadores, reportes y trazabilidad ya autorizados. Sin gestión de cuentas/configuración/credenciales ni mutaciones operacionales. Sin excepciones de escritura en API. |
| Admin | Gestión de usuarios y supervisión, más recepción/asignación/salida Lab, operaciones de Bodega, alta/requerimientos y correlación | Gestión de cuentas/roles y funciones administrativas existentes; supervisión y trazabilidad global. Sin recepción, despacho, asignación operativa, alta de activos, requerimientos, reparación, QA o movimientos de stock. |
| Jefe Laboratorio | No existía formalmente; funciones ejecutadas como Admin | Resumen/reportes de Lab, recepción física, asignación/reasignación, supervisión por técnico/SLA, validadores/consolas y salida a Bodega. Antecedentes técnicos de solo lectura. Sin cuentas, stock/Bodega, QA, Terreno, reparación técnica ni configuración global. |
| Logística | Operaciones de Bodega, inventario, requerimientos, retiros y correlación | Conservadas. La asignación no confirma custodia ni sustituye evidencia física. |
| Técnico Laboratorio | Trabajo técnico sobre su carga | Conservado; se mantiene validación de asignación y recepción física antes de abrir/ejecutar trabajo. |
| QA | Recepción, trabajo, dictamen y despacho propios de QA | Conservados; no obtiene atribuciones de otros departamentos. |
| Técnico Terreno | Requerimientos/intervenciones, instalación/retiro asignados e historial técnico | Conservados; no obtiene historial administrativo ni operaciones de otras áreas. |

La pantalla existente de configuración corresponde a seguridad personal, no a un configurador global nuevo. Jefatura mantiene ese autoservicio propio; no administra otras cuentas. No se creó un módulo nuevo de administración/configuración/auditoría ajeno al alcance.

## Backend: acciones y recursos

`src/security/authorization.js` centraliza las concesiones de acciones sensibles, sin wildcard de Admin y con denegación por defecto. Los guards comunes existentes para perfil propio y catálogos continúan aplicándose. Los servicios conservan sus comprobaciones de propietario, asignación, estación, ciclo, evidencia y transacción.

| Acción | Roles autorizados |
| --- | --- |
| Supervisión global | Admin, Gerente |
| Lectura Lab | Admin, Gerente, Jefe Laboratorio, Técnico Lab; técnico limitado a su asignación |
| Recepción/listado y resumen de supervisión Lab | Admin, Gerente, Jefe Laboratorio |
| Custodia y asignación Lab | Jefe Laboratorio |
| Trabajo/reparación Lab | Técnico Lab asignado |
| Consultas Bodega | Admin, Gerente, Logística |
| Movimientos Bodega / stock / alta y recepción inicial | Logística |
| Crear requerimientos / asignar retiro | Logística |
| Retiro e instalación | Técnico Terreno asignado |
| Consulta QA | Admin, Gerente, QA |
| Ejecución QA | QA, con sus restricciones actuales |
| Correlación Bridge | Logística |
| Gestión de usuarios y roles | Admin |

### Endpoints afectados

- `/api/lab`: recepción, cola, técnicos, terminados, custodia por OS, asignación, trabajo, movimientos, cierre y solicitudes de repuestos usan acciones explícitas. El detalle de custodia de Jefatura rechaza una OS que no está en camino o físicamente disponible en Lab.
- **Nuevo GET `/api/lab/supervision`**: proyección exclusiva de Lab (`updatedAt`, `lab`, `labWorkload`, `labTechnicians`, `labInsights`). No devuelve parque global, stock, cuentas ni métricas QA/Bodega. Reutiliza consultas y definiciones existentes; no modifica SLA.
- `/api/equipment-scan/resolve` y `/confirm`: Admin queda en consulta. Jefatura está limitada a la estación Laboratorio. El lector genérico no sustituye la confirmación específica de custodia.
- `/api/bodega`: consultas separadas de recepciones, validaciones, despachos y entregas. Admin no ejecuta mutaciones.
- `/api/activos` y `/api/requerimientos`: se separa lectura de registro/recepción/creación. No cambian los contratos ni la lógica de esos flujos.
- `/api/os`: consultas globales, tareas propias, asignación, identidad de retiro, confirmación e instalación mantienen ámbitos explícitos.
- `/api/qa`: lecturas de supervisión y ejecución QA separadas; no se habilita QA para Jefatura.
- `/api/bridge`: la correlación requiere Logística. Jefatura usa la proyección técnica existente en `/activos/:tipo/:serie/historial`; no recibe eventos, casos ni metadatos administrativos. Parámetros como `rol=admin` no cambian la respuesta.
- `/api/dashboard/executive`, `/summary`, `/equipos-operativos`, `/badges`, `/api/ai/predictive-report` y consultas legacy `/api/admin`: ámbitos explícitos. Los badges de Jefatura solo devuelven `lab` y `lab_dispatch`.
- `/api/users`, `/api/admin/users` y rutas de edición/activación: exclusivamente Admin. Se conserva lectura del perfil propio en su ruta autorizada.
- `/api/auth`: Gerente queda sujeto al guard global de solo lectura; no hay excepciones de modificación de credenciales.

### Protección de cuentas y auditoría

- Todas las rutas de alta, edición y activación/desactivación usan una transacción y el mismo bloqueo de `pmp.usuarios` antes de comprobar roles. Revalidan que el actor siga siendo Admin activo.
- Se rechaza cambiar el propio rol o desactivar la propia cuenta. Se impide retirar el último Admin activo, incluyendo cambios concurrentes.
- La creación deja de hacer upsert sobre cuentas existentes por correo: responde conflicto. Una identidad Firebase preexistente requiere revisión explícita; no se reutiliza ni reactiva mediante el alta.
- Se preservan los controles de identidad existentes. No se ejecutaron cambios de UID, claims, contraseñas o cuentas reales.
- Las decisiones de autorización se registran como logs estructurados de actor, rol, acción, resultado y fecha, sin body, tokens, contraseñas ni UID Firebase. La auditoría operacional persistida continúa en los eventos existentes. No se agregó una tabla de auditoría; la retención de esos logs depende de la configuración vigente del despliegue.
- La validación de evidencias históricas conserva los roles de sus autores originales. Retirar permisos futuros de Admin no invalida capturas históricas legítimas.

## Navegación y presentación

- **Gerente:** Dashboard ejecutivo, OS, equipos, trazabilidad, reportes y consultas de supervisión. Sin administración ni ejecución.
- **Admin:** Supervisión global, usuarios y configuración autorizada; consultas de Lab/Bodega/QA. Sin enlaces operacionales de recepción/asignación/despacho.
- **Jefe Laboratorio:** inicio en Resumen Laboratorio; Recepción de equipos, Asignar carga, Validadores, Consolas, Despacho a Bodega, Reportes y Antecedentes técnicos.
- Los otros cuatro roles conservan su navegación. Las rutas directas también se protegen mediante `ProtectedRoute` y capacidades.
- El buscador global de Jefatura resuelve activos sin pedir casos administrativos. La trazabilidad de Jefatura muestra únicamente antecedentes técnicos agrupados por OS.
- Se reutilizan `PageHeader`, `StatCard`, `StatusBadge`, `EmptyState`, `FeedbackBanner`, botones, tablas, grillas de detalle, tokens y estilos PMP. Se aplicaron UI Styling y UI UX Pro Max como criterio; no se instalaron dependencias.

## Verificación ejecutada

| Verificación | Resultado real |
| --- | --- |
| Backend `npm test` | **118/118 aprobadas** |
| Web `npm test` | **176/177 aprobadas**. Persiste el fallo previo del fixture `requirements.frontend.test.mjs`: el mock usado por `AssetHistoryScreen` no exporta `useAuth`. No se modificó código Mobile para ocultarlo. |
| Mobile `node --test test/*.test.mjs` | **210/210 aprobadas**, con mocks. Incluye el adaptador de las regresiones operacionales compartidas y su mock de sesión. |
| TypeScript + build Web `npm run build` | **Aprobados** |
| `verification/roles_e2e.mjs` | **99 solicitudes HTTP aprobadas**; Firebase simulado, PostgreSQL efímero; consultas/denegaciones, body/query/claim falsificado, cuenta independiente simulada, transferencia aislada, token anterior y último Admin concurrente |
| `verification/admin_lab_e2e.mjs` | **Aprobado**: recepción física, asignación, propietario, SLA, ciclos, evidencia independiente, idempotencia, historial técnico limitado y custodia por recurso |
| `verification/initial_installation_empty_e2e.mjs --consolidation` | **10 bloques aprobados**: alta, IN, instalación, falla/retiro, Bodega, Lab, QA/rechazo/reingreso, PoD, repuestos/stock, concurrencia y rollback |
| Navegación/renderizado Web | **110 renderizados aprobados** (10 páginas, Dashboard en dos roles, dos temas, cinco anchos); nueva revisión de las cuatro combinaciones de página/rol ajustadas: **40 renderizados aprobados** |
| Accesos directos y búsqueda | **8 rutas denegadas correctamente** y búsqueda de Jefatura sin consulta administrativa; cero escrituras de la prueba visual |
| Integridad local | Huellas de todas las tablas y secuencias iguales; cuentas y datos operacionales intactos |

Los E2E levantan únicamente un proceso de prueba local de puerto efímero y PostgreSQL descartable; ambos se cierran. No son demos ni entornos de trabajo paralelos. Se verificó la integridad de la base habitual antes/después. Los mensajes de rollback inyectado que aparecen en la regresión integral son escenarios esperados y verificados.

La revisión visual usa Chrome con API e identidades simuladas: anchos 320, 390, 768, 1024 y 1440 px, temas claro/oscuro, sin overflow horizontal. No representa una prueba nativa iOS/Android ni un login real de las nuevas cuentas.

Evidencias: [carpeta de ejecución](../.local/pmp-verification/roles-2026-10-09/), [RBAC HTTP](../.local/pmp-verification/roles-2026-10-09/rbac-e2e.json), [Lab](../.local/pmp-verification/roles-2026-10-09/lab-e2e.json), [regresión integral](../.local/pmp-verification/roles-2026-10-09/consolidation-e2e.json), [renderizados](../.local/pmp-verification/roles-2026-10-09/visual/report.json), [rutas directas](../.local/pmp-verification/roles-2026-10-09/visual/direct-routes.json).

Capturas representativas: [Recepción Jefatura oscuro](../.local/pmp-verification/roles-2026-10-09/visual/jefe_laboratorio-LabReceptionPage-dark-1440.png), [Admin claro](../.local/pmp-verification/roles-2026-10-09/visual/admin-DashboardPage-light-1440.png), [antecedentes técnicos móvil claro](../.local/pmp-verification/roles-2026-10-09/visual/jefe_laboratorio-TrazabilidadPage-light-390.png), [reportes móvil oscuro](../.local/pmp-verification/roles-2026-10-09/visual/jefe_laboratorio-LabReportesPage-dark-390.png).

### Hallazgos anteriores no intervenidos

- El reporte legacy de Admin/Gerente consulta `/api/lab/reportes`, endpoint que no existe. Se conserva su comportamiento y no se declara reparado. El reporte del rol nuevo usa `/api/lab/supervision` con datos reales autorizados.
- El fallo del fixture Web descrito arriba es anterior a esta entrega. Por tanto, no se declara toda la suite Web aprobada.

## Compatibilidad, activación y reversión

No hay migraciones, instalaciones de dependencias ni cambios de contrato de escritura operacional. Los clientes antiguos que intenten operar Lab o Bodega como Admin recibirán 403 después de desplegar esta versión. Los permisos se consultan desde PostgreSQL por petición; un claim antiguo de Admin no mantiene el privilegio tras una transferencia.

**No se reiniciaron servicios habituales ni se activaron cuentas.** El despliegue y la activación deben coordinarse: al desplegar, Rafael seguirá siendo Admin pero ya no podrá ejecutar custodia/asignación Lab hasta la transferencia autorizada.

Estado real conservado: Jorge Castillo = Gerente; Rafael Oteiza = Admin, único administrador activo. No existe una cuenta nueva creada por esta intervención.

Pasos pendientes, con aprobación explícita antes de escribir cuentas reales:

1. Definir correo institucional e identidad de la cuenta administradora independiente. Usar el alta administrativa existente; no reutilizar una cuenta ni reconstruir UID.
2. Preparar respaldo privado puntual de las filas implicadas y sus vínculos; registrar valores anteriores. La reversión debe ser condicional a que no hayan cambiado desde la intervención autorizada.
3. Solicitar aprobación para crear la cuenta; crearla solo después. Su propietario debe completar acceso/recuperación y verificar un login real.
4. Verificar desde esa cuenta `/api/auth/me`, administración de usuarios, supervisión y denegación de movimientos físicos. Confirmar que está activa y correctamente vinculada.
5. Solicitar aprobación explícita para transferir a Rafael. Ejecutarlo desde la nueva cuenta administradora, nunca mediante autoedición ni desactivando restricciones. Jorge ya tiene el rol objetivo.
6. Verificar Rafael como Jefe Laboratorio, la nueva cuenta como Admin, acceso efectivo y al menos un Admin activo. No usar equipos/OS protegidos para ensayar movimientos.
7. Si procede revertir una activación futura, restaurar exclusivamente los roles respaldados bajo condiciones de concurrencia y manteniendo un Admin activo. No cambiar UID ni contraseña.

Reversión de código de esta entrega: usar el inventario con hashes y las copias previas de `.local/pmp-verification/roles-2026-10-09/before/`. Verificar primero que cada archivo siga teniendo el hash de esta entrega; restaurar solo su delta. Los archivos nuevos se retirarían únicamente si no tienen cambios posteriores. No usar `git reset` sobre el repositorio, que ya tenía trabajo anterior. El ajuste del fixture efímero solo añade el séptimo rol a su lista de usuarios sintéticos. No hay datos reales que restaurar por esta entrega.

**Integridad:** no se modificaron `7490004`, `MV-000210`, `IN-000269` ni `INT-000001`; tampoco usuarios, UID, contraseñas, stock o eventos de la base habitual.

## Archivos modificados

La lista siguiente corresponde al delta de esta intervención, comparado con la instantánea de inicio; no atribuye los cambios preexistentes del repositorio a esta tarea. El [manifiesto de hashes](../.local/pmp-verification/roles-2026-10-09/changed-files.json) permite comprobarlo.


### Backend y pruebas backend

| Archivo | Cambio |
| --- | --- |
| `03_Backend/pmp-api/package.json` | Incluye las nuevas pruebas de autorización en la suite backend. |
| `03_Backend/pmp-api/src/constants/roles.js` | Catálogo oficial con Jefe Laboratorio. |
| `03_Backend/pmp-api/src/middleware/ensureUser.js` | Rol oficial y estado activo confirmado desde PostgreSQL. |
| `03_Backend/pmp-api/src/middleware/readOnlyRole.js` | Gerente sin excepciones de escritura. |
| `03_Backend/pmp-api/src/routes/admin.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/admin.users.routes.js` | Alta sin upsert; edición y activación protegidas. |
| `03_Backend/pmp-api/src/routes/ai.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/assets.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/badges.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/bodega.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/bridge.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/dashboard.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/equipmentScan.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/lab.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/os.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/qa.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/requirements.routes.js` | Aplica acciones de autorización sin cambiar el flujo operacional. |
| `03_Backend/pmp-api/src/routes/users.routes.js` | Protección de la ruta alternativa de edición administrativa. |
| `03_Backend/pmp-api/src/security/authorization.js` | Política central por acción, denegación por defecto y auditoría segura. |
| `03_Backend/pmp-api/src/security/userAdministration.js` | Bloqueo común, revalidación de Admin, autoedición y último administrador. |
| `03_Backend/pmp-api/src/services/assetManagement.js` | Retira autorización operacional implícita de Admin; preserva evidencia histórica. |
| `03_Backend/pmp-api/src/services/equipmentScan.js` | Estación de Laboratorio asociada a Jefatura. |
| `03_Backend/pmp-api/src/services/labCustody.js` | Custodia exclusivamente de Jefatura. |
| `03_Backend/pmp-api/src/services/labSupervision.js` | Proyección de lectura exclusiva de Laboratorio. |
| `03_Backend/pmp-api/src/services/terrainWithdrawal.js` | Retira autorización operacional implícita de Admin; preserva evidencia histórica. |
| `03_Backend/pmp-api/src/services/warehouseEvidence.js` | Retira autorización operacional implícita de Admin; preserva evidencia histórica. |
| `03_Backend/pmp-api/src/services/warehouseLabDispatch.js` | Retira autorización operacional implícita de Admin; preserva evidencia histórica. |
| `03_Backend/pmp-api/src/services/warehouseParts.js` | Retira autorización operacional implícita de Admin; preserva evidencia histórica. |
| `03_Backend/pmp-api/test/authorization.test.js` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `03_Backend/pmp-api/test/bridge.flow.test.js` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `03_Backend/pmp-api/test/equipment.scan.test.js` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `03_Backend/pmp-api/test/rbac.phase1.test.js` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `03_Backend/pmp-api/test/requirements.test.js` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `03_Backend/pmp-api/tools/ephemeral-postgres.mjs` | Añade Jefatura exclusivamente al fixture PostgreSQL efímero. |
| `03_Backend/pmp-api/verification/admin_lab_e2e.mjs` | E2E aislado actualizado a Jefatura; conserva comprobaciones operacionales. |
| `03_Backend/pmp-api/verification/consolidation_scenarios.mjs` | E2E aislado actualizado a Jefatura; conserva comprobaciones operacionales. |
| `03_Backend/pmp-api/verification/initial_installation_empty_e2e.mjs` | E2E aislado actualizado a Jefatura; conserva comprobaciones operacionales. |
| `03_Backend/pmp-api/verification/lab_work_scenarios.mjs` | E2E aislado actualizado a Jefatura; conserva comprobaciones operacionales. |
| `03_Backend/pmp-api/verification/qa_custody_scenarios.mjs` | E2E aislado actualizado a Jefatura; conserva comprobaciones operacionales. |
| `03_Backend/pmp-api/verification/roles_e2e.mjs` | E2E aislado actualizado a Jefatura; conserva comprobaciones operacionales. |

### Frontend y pruebas Web

| Archivo | Cambio |
| --- | --- |
| `04_Frontend/src/App.tsx` | Inicio propio de Jefatura y reutilización de rutas protegidas. |
| `04_Frontend/src/api/adminUsers.ts` | Catálogo administrativo de siete roles. |
| `04_Frontend/src/api/executive.ts` | Contrato del resumen de Laboratorio autorizado. |
| `04_Frontend/src/app/navigation.ts` | Navegación ejecutiva, administrativa y de Jefatura separada. |
| `04_Frontend/src/app/rbac.ts` | Capacidades independientes para los siete roles. |
| `04_Frontend/src/components/AppLayout.tsx` | Mismos estilos compartidos de supervisión para Jefatura. |
| `04_Frontend/src/components/LabSupervisionReport.tsx` | Reporte técnico del nuevo rol con métricas reales. |
| `04_Frontend/src/components/LabTechnicalHistory.tsx` | Vista de antecedentes técnicos con DTO limitado. |
| `04_Frontend/src/components/ScanOperationalActions.tsx` | Acciones Lab para Jefatura; reparación exclusiva de técnico. |
| `04_Frontend/src/components/TopBar.tsx` | Búsqueda de Jefatura sin casos administrativos y título Admin coherente. |
| `04_Frontend/src/components/UserMenu.tsx` | Acceso a configuración condicionado a capacidad. |
| `04_Frontend/src/pages/AdminUsersPage.tsx` | Bloqueo visual de cambio de rol/desactivación propia. |
| `04_Frontend/src/pages/BridgeFlowPage.tsx` | Vinculación operacional solo para Logística. |
| `04_Frontend/src/pages/DashboardPage.tsx` | Supervisión Admin; enlaces de consulta sin ejecución. |
| `04_Frontend/src/pages/EquipmentScanPage.tsx` | Estación de Jefatura y acciones según capacidad. |
| `04_Frontend/src/pages/LabDashboardPage.tsx` | Resumen limitado a Lab mediante el endpoint autorizado. |
| `04_Frontend/src/pages/LabReportesPage.tsx` | Reporte específico de Jefatura, conserva vistas anteriores. |
| `04_Frontend/src/pages/TrazabilidadPage.tsx` | Selecciona proyección técnica para Jefatura. |
| `04_Frontend/test/admin-lab.frontend.test.mjs` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `04_Frontend/test/equipment-scan.frontend.test.mjs` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `04_Frontend/test/navigation-kpi.frontend.test.mjs` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `04_Frontend/test/rbac.frontend.test.mjs` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `04_Frontend/test/requirements.frontend.test.mjs` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `04_Frontend/test/role-experience.frontend.test.mjs` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `04_Frontend/test/roles.browser.mjs` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |
| `04_Frontend/test/routes.frontend.test.mjs` | Ajusta o verifica matriz RBAC, navegación, mocks y regresiones relacionadas. |

### Documentación

- `08_Pruebas/Separacion_Roles_RBAC_2026-10-09.md`: matriz, endpoints, pruebas, evidencias, integridad y activación/reversión.
- No se modificaron archivos de producción de Mobile, esquema, migraciones ni configuración de servicios.
