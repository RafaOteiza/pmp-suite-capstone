# Consolidación de seguridad, identidad y UX — PMP Suite

Fecha: **08-10-2026**. Revisión sobre el árbol existente, conservando cambios anteriores. No constituye certificación comercial ni prueba de hardware.

## 1. Alcance y conservación

Se consolidaron controles backend de custodia, autorización por objeto, identidad de activos, sesión web/Mobile y presentación transversal. No se agregaron migraciones, estados, versiones mayores, Docker ni otra demo. No se regeneraron artefactos Capstone v2.0 ni evidencias fechadas anteriores.

Línea base de esta intervención: 82 pruebas backend y 182 frontend aprobadas antes de editar; hashes de 317 archivos y copia de su código. Las cifras finales no reemplazan resultados históricos.

La comparación PostgreSQL confirmó **26 tablas, 19 secuencias y estructura sin cambios**. Se conservaron seis usuarios, 347 buses, catálogos y 24 repuestos con stock cero. No se registró ningún activo, OS, caso, reparación, QA o movimiento en `pmp_suite`. No se restauró, limpió ni sembró nuevamente. Tampoco se modificaron contraseñas, UID o claims reales ni se enviaron correos.

Conexiones verificadas mediante TCP/`pg_stat_activity`, módulo servido por Vite y bundle servido por Expo: **web 5173 → API 4000 → PostgreSQL 5432/pmp_suite**, **Mobile 8081 → API 4000** local/LAN. API/web se iniciaron en sus rutas y puertos habituales. No hay servicios demo 4100/5175/8082/55435.

**Identidades reales pendientes:** `/api/auth/me` con Firebase/middleware reales devuelve 200 para admin, técnico terreno, técnico laboratorio y gerente. Logística y QA devuelven **403 IDENTITY_CONFLICT** por vinculación UID/correo inconsistente. Ambos registros/cuentas se preservaron. Conciliarlos requiere autorización específica; no se permitió una coincidencia ambigua para obtener acceso. No se afirma que los seis usuarios estén operativos.

## 2. Skills, diseño y referencias

Skills leídas/aplicadas: [UI Styling](../.agents/skills/ui-styling/SKILL.md) y [UI Ux Pro Max](../.agents/skills/ui-ux-pro-max/SKILL.md). Se usaron para jerarquía, accesibilidad, interacción y revisión, subordinadas a PMP; no se instaló otro framework.

Marca: `09_BrandKit/07_Guia_y_Tokens`, `04_Frontend/src/styles/tokens.css` y constantes Mobile. Navy #0D1B2A, azul #1565C0, teal #00B4B0 y colores semánticos existentes, mediante tokens. Tipografía/logos conservados.

Reutilizados: **PageHeader, StatCard, StatusBadge, FeedbackBanner, EmptyState, InlineFeedback**, tablas responsive, botones, inputs, Lucide y paneles operacionales. Mobile reutiliza navegación/safe area/tema; `PmpUi` agrupa botones, feedback e identidad. No se creó otro modal operacional. CSS corregido en declaraciones existentes, sin bloques de overrides repetidos.

Sesión: SDK instalado `getIdToken`/`onIdTokenChanged`; renovación coordinada, PostgreSQL decide permisos. Referencias oficiales consultadas: [User/getIdToken](https://firebase.google.com/docs/reference/js/auth.user#usergetidtoken), [verificación ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [gestión de usuarios](https://firebase.google.com/docs/auth/admin/manage-users).

## 3. Matriz de hallazgos

| Hallazgo / entrada | Reproducción / causa inicial | Corrección y evidencia |
|---|---|---|
| Recepción Lab por código | Confirmación genérica sin evidencia propia | `labCustody`: validar/confirmar separados; falta de prueba, usuario/rol/ciclo incorrecto bloqueados en E2E |
| Salida Lab y Control de salida | Rutas masivas/lectura histórica, llegada anticipada | Servicio/página únicos; lectura nueva; tránsito sin ubicación Bodega; rutas antiguas 410 |
| Fecha/SLA Lab | Lectura preliminar podía considerarse llegada | Recepción confirmada del ciclo; envío no inicia SLA; reingreso/legacy probados |
| Nueva IN/asignación antigua | `/bodega/asignar` evitaba contrato moderno | 410 y consumidor migrado; nueva/vinculada IN, rollback/concurrencia en E2E |
| Recepción usada como despacho | Inventario podía presentar recepción inicial como validación de salida | Contexto DESPACHO_TERRENO; recepción inicial no sustituye evidencia nueva |
| Rechazo QA no PoD | Antecedentes ocultos por condición PoD | Dictamen/motivo/pruebas/observaciones/autor/fecha/ciclo visibles antes del trabajo, independiente de PoD |
| Acceso operacional por ID | Detalle OS sin comprobar asignación | Terreno/Lab solo su OS; trazabilidad autorizada conservada |
| Contraseña compartida | Fallback fijo y creación implícita al editar | Fallback eliminado; recuperación/vinculación explícita; ninguna cuenta real creada ni modificada |
| UID/rol | Correo podía ocultar vinculación contradictoria | Coincidencia única, activo y rol PostgreSQL; tests inactivo/ambigüedad/claims; dos conflictos reales pendientes |
| Edición directa stock | Sobrescritura sin contrato de movimiento | 409; consumidor retirado. Política de ajustes legítimos pendiente |
| Reintento entrega | Debía distinguir actor/payload compatible | Auditoría v2, bloqueo, stock anterior/final; una salida; incompatible/legacy sin auditoría 409 |
| Sesión | Token móvil capturado, refresh/errores podían perder contexto | SDK vigente compartido; solo GET/HEAD se repiten; red preserva borrador; cambio identidad limpia contexto |
| Modelo/marca | Captura libre y lecturas incompletas | Regla compartida autoritativa al alta; readonly; fixtures 72/74/75/consola y contradicciones |
| Terreno/Bridge | Redigitación y defaults de terminal/PST | Activo operativo seleccionado completa contexto; Bridge propone OS del maestro, sin cambiar correlación |
| KPI/vacíos | Cero o vacío ante fallo; error Bodega temporal | Error persistente, medición no disponible y reintento; IA sin resultados inventados |
| Responsive | Cabecera/mínimos grid/input superaban ancho | Componentes compartidos corregidos; 350 renders sin overflow |
| Terreno→Bodega y QA moderno | Controles propios ya existentes | Conservados y regresados, sin reemplazarlos por confirmación genérica |

## 4. Entradas y permisos

**95 entradas HTTP montadas**, incluidos alias, rechazan falta de autenticación con middleware real antes del acceso operacional. Health/documentación conservan su acceso previsto. El E2E de negocio usa actores de prueba sobre API/PostgreSQL aislados; no se presenta como login Firebase.

| Entrada | Contrato vigente |
|---|---|
| GET `/api/equipment-scan/resolve` | Consulta; abre operación específica, no movimiento |
| POST `/api/equipment-scan/confirm` | 409 EXPLICIT_CUSTODY_REQUIRED; sin consumidor operacional web |
| GET `/api/lab/custody/:code` | Contexto de lectura de jefatura |
| POST `/api/lab/custody/:code/:purpose/validar` y `/confirmar` | Admin; evidencia RECEPCION/SALIDA por ciclo/revisión, transacción e idempotencia |
| POST `/api/lab/dispatch-qa`, `/api/admin/dispatch` | Retirados 410; vistas reutilizan custodia |
| PUT `/api/bodega/asignar` | Retirado 410; nueva/vinculada IN pasan por despacho moderno |
| POST `/api/bodega/despacho/validar`, `/confirmar` | Admin/logística; contexto, técnico/destino, identidad, stock y salida propia |
| PUT `/api/bodega/repuestos/:id/stock` | 409 STOCK_ADJUSTMENT_POLICY_REQUIRED |
| PUT `/api/bodega/solicitudes/:id/entregar` | Admin/logística; entrega auditada una sola vez |
| GET `/api/os/:id` | Admin/gerente consulta; técnicos solo asignación correspondiente |
| GET `/api/os/activos-operativos` | Terreno, búsqueda operativa existente y acotada; no crea maestro |
| Bridge | Correlación/historia; sin asignación, retiro, stock ni creación OS |
| QA | QA opera responsabilidad/ciclo internos; Admin consulta/administra rol, no opera QA |

Búsquedas/historia mantienen consultas legítimas de los seis roles. Las pruebas de objeto/rol se concentran en comandos/lecturas del circuito. Las 95 entradas acreditan bloqueo anónimo, no todas las combinaciones imaginables de rol/payload. El inventario de rutas al final identifica fuentes y guards.

## 5. Evidencia y custodia

| Movimiento | Evidencia propia | Resultado confirmado |
|---|---|---|
| Recepción inicial | Tipo+serie sin OS, captura explícita y conformidad, admin/logística | RECEPCION_INICIAL/HABILITADO_INSTALACION, sin MV ni bus ficticio |
| Terreno→Bodega | Técnico asignado, identidad, decisión PoD y confirmación | Retiro, tránsito; sin llegada Bodega |
| Recepción Bodega | Captura nueva de destino | Recepción transaccional; no reutiliza retiro |
| Bodega→Lab | Salida específica, destino/ciclo/elegibilidad | SALIDA_BODEGA_LABORATORIO; tránsito, sin asignación/SLA |
| Recepción Lab | RECEPCION por OS/activo/actor/ciclo/revisión | RECEPCION_LABORATORIO_CONFIRMADA; Lab, estado 4, elegible asignación/SLA |
| Lab→Bodega | SALIDA nueva, equipo terminado (10) | SALIDA_LABORATORIO_BODEGA; estado 11, ubicación llegada no anticipada |
| Bodega→QA→Bodega | QA autónomo por ciclo/propósito | Recepción, Ambiente, pruebas, dictamen y salida separados; Bodega recibe antes de stock |
| Bodega→Terreno | NUEVA/VINCULADA, DESPACHO_TERRENO, técnico/destino/stock válidos | IN y SALIDA_BODEGA_TERRENO solo al confirmar; asociación al bus después en Terreno |

Lab conserva usuario/rol, código, identidad esperada/encontrada, resultado, método, fecha servidor, propósito, origen/destino, ciclo/revisión. Cambiar contexto o leer después invalida evidencia anterior. Consultar/validar/cancelar no mueve. Reintento equivalente retorna el evento confirmado; incompatible da conflicto. Falla de evento/auditoría provoca rollback.

**Límite keyboard-wedge:** se comprueba secuencia/Enter y se rechaza digitación/pegado ordinarios en UI; backend valida el contrato de prueba. No autentica infaliblemente hardware: un cliente manipulado puede fabricar metadatos temporales. MANUAL_AUTORIZADO mantiene su origen y condiciones del movimiento, nunca se guarda como SCANNER.

## 6. Identidad y autollenado

| Tipo / serie real | Modelo | Marca |
|---|---|---|
| VALIDADOR 72… | CVB35 | Mikroelektronika |
| VALIDADOR 74… / 75… | CVB45 | Mikroelektronika |
| CONSOLA, incluida serie alfanumérica | N9715 | Waysion |

`shared/assetIdentity.js` alimenta API/web/Mobile; `requireAssetIdentity` deriva omitidos/rechaza contradicciones. Serie parcial espera; prefijo desconocido bloquea. QR/AMID se resuelve a serie real antes de usar identidad, nunca desde PPU/OS/texto bruto.

Lecturas desde maestros en activos, requerimientos, retiros, inventario, OS, Lab, QA, Bridge e historia. Reportes agregados no fabrican identidades. Snapshots históricos se conservan; GET no modifica datos. No hay edición libre de tipo/serie persistidos. Cero incompatibilidades en maestro habitual (continúa vacío).

Terreno web/Mobile buscan activos EN OPERACIÓN por serie/PPU y completan instalación, terminal/operador readonly. Ante varios candidatos se elige explícitamente. Se retiró el default silencioso de terminal/PST. Bridge propone las OS del activo seleccionado; seleccionar/navegar no escribe correlación. Autollenado no completa presencia física, pruebas ni dictamen.

## 7. Definiciones KPI

| Indicador / unidad | Fuente/filtro | Permisos y tratamiento |
|---|---|---|
| Dashboard OS activas (OS) | `/dashboard/summary`, no finales | Admin/gerente; separado de activos; error sin KPI |
| En operación (activos) | `operatingAssetsSql`, instalación operativa tipo+serie | Consulta autorizada; nunca stock asignable |
| Disponible instalación (activos) | Inicial conforme + reparado QA recibido en Bodega | No basta asignación o lectura |
| Asignados sin salida (activos) | `assignedWithoutDispatchSql` | Distinto de En ruta |
| En ruta (activos) | `terrainDispatchSql`, salida a Terreno confirmada | No aumenta al elegir técnico/validar |
| Otros tránsitos | Proyección logística/custodia por OS o activo según vista | No son stock ni carga Lab recibida |
| Inventario (activos) | Maestros validadores+consolas | No equivale a disponibles; error no es cero |
| Badge Bodega (OS) | `warehouseQueueSql`, unión de Recepcionar 2/11, Para Lab y Para QA 3; excluye retiro pendiente y tránsito a Lab | Mismo conjunto que tres bandejas; error sin badge medido |
| Gestión carga Lab (OS) | `/lab/queue`, recibidas 4/5/9; sin técnico/asignadas/unión | Admin gestiona; técnico carga propia; tránsito excluido |
| Tickets Lab (OS) | Resumen: recibidas activas 4/5/9 + terminadas 10 | Terminadas señaladas aparte, sin sumarlas dos veces |
| Badge Lab (OS) | Recibidas 4/5/9 sin técnico; `lab_dispatch` recibidas 10 | No equivale al total del resumen |
| SLA Lab (horas y OS) | Última recepción confirmada del ciclo; mismos umbrales | Sin llegada no inicia; asignar no cambia fecha; legacy explícito |
| QA (OS/ciclo) | Cuatro etapas excluyentes, Por verificar separado | QA opera; Admin consulta; error no presenta cero |
| Retiros (OS) | `listPendingWithdrawals`, sin técnico/asignados pendientes | Admin/logística; asignar no retira |
| Alertas stock (repuestos) | Stock bajo umbral configurado | Se conservan 24 alertas de stock cero |
| Mis OS/Mi carga (OS) | Carga autorizada; terreno recientes+pendientes, Lab recibidas asignadas | Alcance rotulado; error no equivale a ausencia |
| Reportes Lab (OS, horas, %) | `/api/lab/reportes` solicitado por la vista, pero no implementado en el backend actual | Admin/gerente; informa indisponibilidad, sin mediciones ni exportación. Contrato/endpoint pendientes |
| IA (heurística) | Reincidencia existente, no modelo nuevo | Falta datos y error distintos; sin fixtures productivos |

Indicadores interactivos conservan destinos reales/autorizados de consulta. Ningún KPI mueve equipos. No sumar universos solapados como un total.

## 8. Fricción y accesibilidad

Comparación por controles/código de copia inicial, sin inventar tiempos humanos:

| Tarea | Antes | Después |
|---|---|---|
| Modelo/marca en alta | 2 entradas manuales opcionales | 2 campos readonly, 0 redigitaciones |
| Contexto reporte Mobile | Serie y PPU escritos + selectores terminal/operador | Seleccionar activo sustituye esos 4 datos; búsqueda parcial por cualquiera |
| Bridge | Tipo, serie y OS digitados | Identidad seleccionada y OS propuestas; 0 redigitaciones tipo/serie; elección OS si ambiguo |
| Recepción Lab | Código y confirmación genérica sin contrato propio | Validar → confirmar llegada; dos acciones explícitas conservan custodia |
| Salida Lab | 2 entradas con contratos divergentes | Página/servicio compartidos |
| Error recuperable | Mensaje temporal/estado ambiguo | Feedback visible, campos conservados y revalidación en conflicto |

Se comprobaron 320, 390, 768, 1024 y 1440 px a escala 1/100%, claro/oscuro. Se corrigieron mínimos de grids/fieldset/inputs y cabecera sin reducir letra ni ocultar overflow del documento. Foco visible, etiquetas, botones con texto, feedback accesible y semántica no dependiente solo del color. Interacción prueba teclado, Atrás, borrador y confirmaciones. No se hizo estudio humano, auditoría WCAG completa ni medición previa de desplazamiento en browser; no se atribuyen esos resultados.

## 9. Pruebas de esta revisión

| Comando / ámbito | Resultado | Log nuevo |
|---|---|---|
| Backend `npm test` | **92/92**, 95 entradas sin token con middleware real | `backend-final.log` |
| Frontend `npm test` | **189/189**, incluye componentes Mobile simulados | `frontend-final.log` |
| Web `npm run build` | TypeScript `tsc -b` + Vite aprobados | `frontend-build.log` |
| Mobile `expo export --platform android` | Bundle Android con Expo SDK 57 aprobado | `mobile-build.log` |
| `initial_installation_empty_e2e.mjs --consolidation` | PostgreSQL efímero aprobado, original intacta, instancia eliminada | `consolidation-final.log` |
| `all-pages.browser.mjs` | **350 renders**, 35 páginas × 2 temas × 5 anchos, sin overflow/error render/overlay operacional | `visual-all/report.json` |
| `operational-pages.browser.mjs` | **400 renders**, 4 recorridos QA de interacción; 0 conexiones backend | `browser-operational.log` |
| `initial-dispatch.browser.mjs` | **10 renders**, Nueva instalación con API simulada | `browser-initial-dispatch.log` |
| `habitual-readonly.mjs connections` | Conexiones efectivas verificadas | `habitual-connections.log` |
| `consolidation_readonly.mjs` | Datos/esquema/secuencias conservados; 4 accesos y 2 conflictos documentados | `final-readonly.json` |

Logs completos: `.local/pmp-verification/consolidation-2026-10-08/`. Sin tokens/contraseñas. Excepciones esperadas pueden aparecer como diagnóstico de pruebas negativas. Advertencia Vite por tamaño de chunk de gráficos, sin impedir build. No se reejecutaron runners históricos con contratos reemplazados ni se acreditan como pruebas actuales.

E2E: alta/recepción inicial sin OS → IN sin caso → instalación → falla → retiro PoD No sin foto → Bodega → Lab con recepción propia → asignación/trabajo → salida/Bodega → QA rechazado no PoD → reingreso/ciclo técnico nuevo → QA Operativo → Bodega → instalación vinculada. Incluye identidad 72/74/75/consola, PoD/repuestos, insuficiencia, entregas concurrentes, borradores/legacy, rutas retiradas, evidencia incorrecta/antigua/otro contexto, rollback, doble clic y recuperación de confirmación.

Distinciones: React/native mocks y browser fixture comprueban interfaz; HTTP/PostgreSQL efímero comprueba contratos/persistencia con actores simulados. Comprobación habitual: token personalizado temporal de cuentas existentes y middleware Firebase/PostgreSQL real, solo GET. No equivale a login con contraseña, emulador Firebase ni hardware físico.

## 10. Pendientes y comprobación manual

1. Conciliar vínculos reales de Logística/QA con autorización específica; no cambiados aquí.
2. Definir entradas/ajustes legítimos de repuestos; bypass cerrado, stock no falseado.
3. Especificar procedimiento técnico de Instalación Ambiente; sin firmware/comandos/versiones inventados.
4. Probar cámara, pistola USB/Bluetooth, teclado, permisos, foco/retorno y escalado en dispositivo físico. Bundle/mocks no sustituyen hardware.
5. Reportes de Laboratorio: la vista existente solicita `/api/lab/reportes`, pero no hay endpoint montado que lo implemente. Se conserva la presentación honesta de indisponibilidad y el bloqueo de exportación; faltan contrato de cálculo e implementación. No se inventaron eficiencia, período ni agregaciones de negocio. Los payloads válidos/vacíos de sus tests son mocks, no mediciones de producción.

Rafa puede comprobar el alta abriendo Gestión de activos: seleccionar VALIDADOR, escribir una serie propia 72/74/75 y verificar modelo/marca readonly. Cambiar a CONSOLA debe mostrar N9715 / Waysion, sin prefijos de validador. Prefijo desconocido bloquea. Registrar es decisión del usuario: esta revisión no lo hizo. Alta no crea stock, OS ni bus.

Después de reconciliar accesos, continuar recepción inicial y Nueva instalación. Cada recepción/salida debe pedir evidencia nueva; navegar no mueve y SLA Lab comienza al recibir. El recorrido manual no fue ejecutado en la base habitual.

## 11. Cobertura, rutas y archivos

Las matrices siguientes se generan desde archivos actuales. El render usa transporte con API indisponible simulada; las páginas sin consulta muestran su estado inicial. Interacción se indica solo donde se ejecutó. Las seis pantallas Mobile se revisaron en código/bundle; render nativo y hardware quedan pendientes.

### Páginas web (35)

Todas: revisión de fuente, componentes PMP compartidos y matriz render 320/390/768/1024/1440 en claro/oscuro. La prueba general usa error de API; no acredita por sí sola interacciones.

| Archivo | Intervención | Verificación adicional |
|---|---|---|
| `AdminDespachoPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `AdminUsersPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `AIPredictionsPage.tsx` | Revisada; estilos compartidos | Render y revisión de estados/permisos; sin interacción específica adicional |
| `BodegaDashboardPage.tsx` | Revisada; estilos compartidos | Render y revisión de estados/permisos; sin interacción específica adicional |
| `BodegaModulosPage.tsx` | Modificada | Inventario, evidencia propia, consulta sin despacho; error |
| `BodegaPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `BodegaRepuestosPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `BridgeFlowPage.tsx` | Modificada | Selección maestro/OS, sin escritura por seleccionar |
| `DashboardPage.tsx` | Revisada; estilos compartidos | Render y revisión de estados/permisos; sin interacción específica adicional |
| `DespachoEscaneoPage.tsx` | Modificada | Interacción/4xx/contexto y 10 renders cargados |
| `EquipmentScanPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `EquiposOperativosPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `ForbiddenPage.tsx` | Revisada; estilos compartidos | Render y revisión de estados/permisos; sin interacción específica adicional |
| `GestionActivosPage.tsx` | Modificada | Identidad automática, cambio tipo, recepción explícita |
| `IngresoOSPage.tsx` | Modificada | Contratos de búsqueda/creación operativa, render |
| `IngresoRequerimientosPage.tsx` | Revisada; estilos compartidos | Selección bidireccional, duplicados, contexto, tests existentes |
| `LabAsignacionPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `LabConsolasPage.tsx` | Revisada; estilos compartidos | Render y revisión de estados/permisos; sin interacción específica adicional |
| `LabCustodyPage.tsx` | Modificada | Formulario real: validación sin mover y 409 inline |
| `LabDashboardPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `LabDespachoQaPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `LabReportesPage.tsx` | Revisada; estilos compartidos | Error/incompleto no fabrica ni exporta; payload vacío válido probado con mock. Endpoint real pendiente |
| `LabValidadoresPage.tsx` | Revisada; estilos compartidos | Render y revisión de estados/permisos; sin interacción específica adicional |
| `LabWorkPage.tsx` | Revisada; estilos compartidos | Browser: abrir/volver no escribe, borrador, QA/PoD, guardado |
| `LoginPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `MyServiceOrdersPage.tsx` | Modificada | Carga autorizada y enlace al flujo Mobile de retiro |
| `NotFoundPage.tsx` | Revisada; estilos compartidos | Render y revisión de estados/permisos; sin interacción específica adicional |
| `OrdenesServicioPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `QaPage.tsx` | Modificada | Browser: 4 etapas, roles y búsqueda/retorno |
| `QaWorkPage.tsx` | Revisada; estilos compartidos | Browser: teclado, draft, Atrás, retry, evidencia nueva |
| `RetirosTerrenoPage.tsx` | Revisada; estilos compartidos | Buscar/asignar sin retirar, tablas responsive |
| `RoleDashboardPage.tsx` | Modificada | Mi carga: abrir sin mutar, asignación/recepción necesarias |
| `SettingsPage.tsx` | Revisada; estilos compartidos | Render y revisión de estados/permisos; sin interacción específica adicional |
| `TrazabilidadPage.tsx` | Modificada | Render y revisión de estados/permisos; sin interacción específica adicional |
| `WarehouseOperationPage.tsx` | Revisada; estilos compartidos | Browser: recepción/salidas deshabilitadas sin evidencia, cancelar |

### Mobile (6 pantallas)

| Pantalla | Cambio / revisión | Verificación / límite |
|---|---|---|
| `AssetHistoryScreen.js` | Identidad canónica visible, botones/feedback PMP | Bundle Android; mocks de formularios/retiro/historia/selección según suite. Render nativo y hardware pendientes |
| `HomeScreen.js` | Acciones reales por rol, tema/safe area, soporte ficticio retirado | Bundle Android; mocks de formularios/retiro/historia/selección según suite. Render nativo y hardware pendientes |
| `LoginScreen.js` | Teclado/scroll/etiquetas, sesión/errores | Bundle Android; mocks de formularios/retiro/historia/selección según suite. Render nativo y hardware pendientes |
| `MyOrdersScreen.js` | Identidad y contexto, tareas asignadas | Bundle Android; mocks de formularios/retiro/historia/selección según suite. Render nativo y hardware pendientes |
| `NewOrderScreen.js` | Búsqueda operativa y relaciones readonly; sin defaults ni foto simulada | Bundle Android; mocks de formularios/retiro/historia/selección según suite. Render nativo y hardware pendientes |
| `TerrainWithdrawalScreen.js` | Tema y componentes, conserva SCAN/MANUAL/PoD | Bundle Android; mocks de formularios/retiro/historia/selección según suite. Render nativo y hardware pendientes |

### Rutas web y permisos efectivos

Inventario de `App.tsx` y `app/rbac.ts`. La API aplica además sus controles de objeto/custodia; la navegación no los reemplaza.

| Ruta | Página / destino | Permiso y roles |
|---|---|---|
| `/login` | LoginPage | Pública; sin acción operacional |
| `/403` | ForbiddenPage | Pública; sin acción operacional |
| `/` | Dashboard / Mi jornada / Bodega según rol | `DASHBOARD_VIEW` · admin, gerente, logistica, qa, tecnico_laboratorio, tecnico_terreno |
| `/mi-jornada` | RoleDashboardPage | `PERSONAL_DASHBOARD_VIEW` · qa, tecnico_laboratorio, tecnico_terreno |
| `/admin/users` | AdminUsersPage | `USERS_VIEW` · admin |
| `/admin/despacho` | AdminDespachoPage | `DISPATCH_OPERATIONS_VIEW` · admin |
| `/operacion/os` | OrdenesServicioPage | `OS_VIEW` · admin, gerente |
| `/operacion/mis-os` | MyServiceOrdersPage | `MY_OS_VIEW` · tecnico_terreno |
| `/operacion/ingreso` | IngresoOSPage | `OS_CREATE` · tecnico_terreno |
| `/operacion/requerimientos` | IngresoRequerimientosPage | `REQUEST_CREATE` · admin, logistica |
| `/operacion/retiros` | RetirosTerrenoPage | `WITHDRAWAL_ASSIGN` · admin, logistica |
| `/operacion/activos` | GestionActivosPage | `ASSET_MANAGE` · admin, logistica |
| `/operacion/escaneo` | EquipmentScanPage | `EQUIPMENT_SCAN_VIEW` · admin, gerente, logistica, qa |
| `/bridge` | BridgeFlowPage | `BRIDGE_FLOW_VIEW` · admin, gerente, logistica, qa, tecnico_laboratorio, tecnico_terreno |
| `/mi-carga/:osId` | LabWorkPage | `LAB_WRITE` · tecnico_laboratorio |
| `/bodega/recepciones/:osId` | WarehouseOperationPage | `BODEGA_WRITE` · admin, logistica |
| `/bodega/envios-laboratorio/:osId` | WarehouseOperationPage | `BODEGA_WRITE` · admin, logistica |
| `/bodega/envios-qa/:osId` | WarehouseOperationPage | `BODEGA_WRITE` · admin, logistica |
| `/lab/custodia/:osId/:step` | LabCustodyPage | `LAB_DISPATCH` · admin |
| `/lab/dashboard` | LabDashboardPage | `LAB_VIEW` · admin, gerente, tecnico_laboratorio |
| `/lab/asignacion` | LabAsignacionPage | `LAB_ASSIGN` · admin |
| `/lab/validadores` | LabValidadoresPage | `LAB_EQUIPMENT_VIEW` · admin, tecnico_laboratorio |
| `/lab/consolas` | LabConsolasPage | `LAB_EQUIPMENT_VIEW` · admin, tecnico_laboratorio |
| `/lab/reportes` | LabReportesPage | `REPORTS_VIEW` · admin, gerente |
| `/lab/despacho-qa` | LabDespachoQaPage | `LAB_DISPATCH` · admin |
| `/qa` | QaPage | `QA_SUMMARY_VIEW` · admin, gerente, qa |
| `/qa/:osId/:step` | QaWorkPage | `QA_SUMMARY_VIEW` · admin, gerente, qa |
| `/bodega` | BodegaPage | `BODEGA_OPERATIONS_VIEW` · admin, logistica |
| `/bodega/dashboard` | BodegaDashboardPage | `BODEGA_VIEW` · admin, gerente, logistica |
| `/bodega/modulos` | BodegaModulosPage | `BODEGA_OPERATIONS_VIEW` · admin, logistica |
| `/bodega/despacho` | DespachoEscaneoPage | `BODEGA_WRITE` · admin, logistica |
| `/bodega/repuestos` | BodegaRepuestosPage | `BODEGA_OPERATIONS_VIEW` · admin, logistica |
| `/equipos-operativos` | EquiposOperativosPage | `EQUIPOS_VIEW` · admin, gerente, logistica |
| `/trazabilidad` | TrazabilidadPage | `TRACE_VIEW` · admin, gerente, logistica, qa, tecnico_laboratorio, tecnico_terreno |
| `/ia/predicciones` | AIPredictionsPage | `AI_VIEW` · admin, gerente |
| `/settings` | SettingsPage | `SETTINGS_VIEW` · admin, gerente, logistica, qa, tecnico_laboratorio, tecnico_terreno |
| `/404` | NotFoundPage | Pública; sin acción operacional |
| `*` | Redirección a /404 | Pública; sin acción operacional |

### Rutas Mobile

| Ruta | Pantalla | Disponibilidad |
|---|---|---|
| `Login` | LoginScreen | Sin sesión |
| `Home` | HomeScreen | Sesión válida; acciones según rol |
| `NewOrder` | NewOrderScreen | Técnico de terreno |
| `MyOrders` | MyOrdersScreen | Técnico de terreno; OS propias |
| `TerrainWithdrawal` | TerrainWithdrawalScreen | Técnico de terreno; asignación validada en API |
| `AssetHistory` | AssetHistoryScreen | Sesión válida; consulta autorizada |

### Inventario HTTP montado

Inventario estático de declaraciones y guard de entrada. Los servicios/custodia se detallan arriba; autorización por objeto está dentro del servicio correspondiente. Middleware común: Firebase → ensureUser → permisos/read-only. Los alias se listan por separado.

| Método | Ruta | Router / guard de declaración |
|---|---|---|
| GET | `/api/auth/me` | `auth.routes.js` · `guard común / servicio` |
| POST | `/api/auth/reset-password-link` | `auth.routes.js` · `guard común / servicio` |
| POST | `/api/auth/my/reset-password-link` | `auth.routes.js` · `guard común / servicio` |
| POST | `/api/auth/password` | `auth.routes.js` · `guard común / servicio` |
| GET | `/api/ai/predictive-report` | `ai.routes.js` · `requireAnyRole(ROLES.ADMIN, ROLES.GERENTE)` |
| GET | `/api/os/activos-operativos` | `os.routes.js` · `requireAnyRole(ROLES.TECNICO_TERRENO)` |
| GET | `/api/os/pendientes-retiro` | `os.routes.js` · `requireAnyRole(ROLES.ADMIN,ROLES.LOGISTICA)` |
| POST | `/api/os/asignar-retiro` | `os.routes.js` · `requireAnyRole(ROLES.ADMIN,ROLES.LOGISTICA)` |
| POST | `/api/os/validar-identidad-retiro` | `os.routes.js` · `requireAnyRole(ROLES.TECNICO_TERRENO)` |
| POST | `/api/os/discrepancia-retiro` | `os.routes.js` · `requireAnyRole(ROLES.TECNICO_TERRENO)` |
| POST | `/api/os/confirmar-retiro` | `os.routes.js` · `requireAnyRole(ROLES.TECNICO_TERRENO)` |
| GET | `/api/os/` | `os.routes.js` · `requireAnyRole(ROLES.ADMIN, ROLES.GERENTE)` |
| POST | `/api/os/crear` | `os.routes.js` · `requireAnyRole(...osWriteRoles)` |
| POST | `/api/os/completar-instalacion` | `os.routes.js` · `requireAnyRole(...osWriteRoles)` |
| GET | `/api/os/mis-ordenes` | `os.routes.js` · `requireAnyRole(...osReadRoles)` |
| GET | `/api/os/:id` | `os.routes.js` · `requireAnyRole(...osReadRoles)` |
| GET | `/api/requerimientos/` | `requirements.routes.js` · `requireAnyRole(...Object.values(ROLES)` |
| GET | `/api/requerimientos/:id` | `requirements.routes.js` · `requireAnyRole(...Object.values(ROLES)` |
| POST | `/api/requerimientos/` | `requirements.routes.js` · `requireAnyRole(ROLES.ADMIN,ROLES.LOGISTICA)` |
| POST | `/api/requerimientos/:id/pod` | `requirements.routes.js` · `requireAnyRole(ROLES.ADMIN,ROLES.LOGISTICA)` |
| GET | `/api/activos/` | `assets.routes.js` · `guard común / servicio` |
| POST | `/api/activos/` | `assets.routes.js` · `guard común / servicio` |
| POST | `/api/activos/recepcion/validar` | `assets.routes.js` · `guard común / servicio` |
| POST | `/api/activos/recepcion` | `assets.routes.js` · `guard común / servicio` |
| GET | `/api/users/` | `users.routes.js` · `requireRole(ROLES.ADMIN)` |
| GET | `/api/users/:id` | `users.routes.js` · `guard común / servicio` |
| PATCH | `/api/users/:id` | `users.routes.js` · `requireRole(ROLES.ADMIN)` |
| POST | `/api/users/:id/password` | `users.routes.js` · `requireRole(ROLES.ADMIN)` |
| POST | `/api/admin/users/` | `admin.users.routes.js` · `requireRole(ROLES.ADMIN)` |
| PUT | `/api/admin/users/:id` | `admin.users.routes.js` · `requireRole(ROLES.ADMIN)` |
| PATCH | `/api/admin/users/:id/activar` | `admin.users.routes.js` · `requireRole(ROLES.ADMIN)` |
| PATCH | `/api/admin/users/:id/desactivar` | `admin.users.routes.js` · `requireRole(ROLES.ADMIN)` |
| POST | `/api/admin/users/:id/reset-password-link` | `admin.users.routes.js` · `requireRole(ROLES.ADMIN)` |
| POST | `/api/admin/users/:id/set-password` | `admin.users.routes.js` · `requireRole(ROLES.ADMIN)` |
| GET | `/api/dashboard/summary` | `dashboard.routes.js` · `requireAnyRole(ROLES.ADMIN, ROLES.GERENTE)` |
| GET | `/api/dashboard/equipos-operativos` | `dashboard.routes.js` · `requireAnyRole(ROLES.ADMIN, ROLES.GERENTE, ROLES.LOGISTICA)` |
| GET | `/api/dashboard/global-search` | `dashboard.routes.js` · `requireAnyRole(...Object.values(ROLES)` |
| GET | `/api/lab/custody/:code` | `lab.routes.js` · `requireAnyRole(ROLES.ADMIN)` |
| GET | `/api/lab/technicians` | `lab.routes.js` · `requireAnyRole(...labReadRoles)` |
| PUT | `/api/lab/assign` | `lab.routes.js` · `requireAnyRole(ROLES.ADMIN)` |
| GET | `/api/lab/queue/:type` | `lab.routes.js` · `requireAnyRole(...labReadRoles)` |
| PUT | `/api/lab/move` | `lab.routes.js` · `requireAnyRole(...labWriteRoles)` |
| GET | `/api/lab/work/:codigoOs` | `lab.routes.js` · `requireAnyRole(...labWriteRoles)` |
| PUT | `/api/lab/work/:codigoOs` | `lab.routes.js` · `requireAnyRole(...labWriteRoles)` |
| POST | `/api/lab/finish` | `lab.routes.js` · `requireAnyRole(...labWriteRoles)` |
| POST | `/api/lab/request-part` | `lab.routes.js` · `requireAnyRole(...labWriteRoles)` |
| GET | `/api/lab/parts` | `lab.routes.js` · `requireAnyRole(ROLES.ADMIN, ROLES.GERENTE, ROLES.LOGISTICA)` |
| GET | `/api/lab/completed` | `lab.routes.js` · `requireAnyRole(...labReadRoles)` |
| POST | `/api/lab/dispatch-qa` | `lab.routes.js` · `requireAnyRole(ROLES.ADMIN)` |
| GET | `/api/qa/dashboard` | `qa.routes.js` · `requireAnyRole(...qaReadRoles)` |
| GET | `/api/qa/queue` | `qa.routes.js` · `requireAnyRole(...qaReadRoles)` |
| GET | `/api/qa/incoming` | `qa.routes.js` · `requireAnyRole(...qaReadRoles)` |
| PUT | `/api/qa/assign` | `qa.routes.js` · `requireAnyRole(...qaWriteRoles)` |
| POST | `/api/qa/start` | `qa.routes.js` · `requireAnyRole(...qaWriteRoles)` |
| POST | `/api/qa/process` | `qa.routes.js` · `requireAnyRole(...qaWriteRoles)` |
| GET | `/api/qa/:code/work` | `qa.routes.js` · `requireAnyRole(...qaReadRoles)` |
| POST | `/api/qa/:code/:purpose/validar` | `qa.routes.js` · `requireAnyRole(...qaWriteRoles)` |
| POST | `/api/qa/:code/actions/:action` | `qa.routes.js` · `requireAnyRole(...qaWriteRoles)` |
| GET | `/api/bodega/despacho/destinos` | `bodega.routes.js` · `requireAnyRole(...bodegaReadRoles)` |
| POST | `/api/bodega/despacho/validar` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| POST | `/api/bodega/despacho/confirmar` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| POST | `/api/bodega/recepcion-terreno/validar` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| GET | `/api/bodega/queue` | `bodega.routes.js` · `requireAnyRole(...bodegaReadRoles)` |
| GET | `/api/bodega/qa-users` | `bodega.routes.js` · `requireAnyRole(ROLES.ADMIN)` |
| PUT | `/api/bodega/receive` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| POST | `/api/bodega/dispatch-lab/validar` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| PUT | `/api/bodega/dispatch-lab` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| PUT | `/api/bodega/dispatch-qa` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| POST | `/api/bodega/dispatch-qa/validar` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| GET | `/api/bodega/stock` | `bodega.routes.js` · `requireAnyRole(...bodegaReadRoles)` |
| GET | `/api/bodega/repuestos` | `bodega.routes.js` · `requireAnyRole(...bodegaReadRoles)` |
| PUT | `/api/bodega/repuestos/:id/stock` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| PUT | `/api/bodega/solicitudes/:id/entregar` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| GET | `/api/bodega/tecnicos` | `bodega.routes.js` · `requireAnyRole(...bodegaReadRoles)` |
| PUT | `/api/bodega/asignar` | `bodega.routes.js` · `requireAnyRole(...bodegaWriteRoles)` |
| GET | `/api/bodega/dashboard` | `bodega.routes.js` · `requireAnyRole(...bodegaReadRoles)` |
| GET | `/api/admin/stats` | `admin.routes.js` · `requireAnyRole(...adminReadRoles)` |
| GET | `/api/admin/dispatch-queue` | `admin.routes.js` · `requireAnyRole(...adminReadRoles)` |
| POST | `/api/admin/dispatch` | `admin.routes.js` · `requireAnyRole(ROLES.ADMIN)` |
| GET | `/api/master/terminales` | `master.routes.js` · `requireAnyRole(...VALID_ROLES)` |
| GET | `/api/master/psts` | `master.routes.js` · `requireAnyRole(...VALID_ROLES)` |
| GET | `/api/dashboard/badges` | `badges.routes.js` · `requireAnyRole(...VALID_ROLES)` |
| GET | `/api/bridge/buscar` | `bridge.routes.js` · `guard común / servicio` |
| GET | `/api/bridge/activos/:tipo/:serie/historial` | `bridge.routes.js` · `guard común / servicio` |
| GET | `/api/bridge/` | `bridge.routes.js` · `guard común / servicio` |
| POST | `/api/bridge/` | `bridge.routes.js` · `requireAnyRole(ROLES.ADMIN,ROLES.LOGISTICA)` |
| GET | `/api/equipment-scan/resolve` | `equipmentScan.routes.js` · `requireAnyRole(...SCAN_READ_ROLES)` |
| POST | `/api/equipment-scan/confirm` | `equipmentScan.routes.js` · `requireAnyRole(...SCAN_WRITE_ROLES)` |
| POST | `/api/lab/custody/:code/RECEPCION/validar` | `lab.routes.js` · `requireAnyRole(ROLES.ADMIN)` |
| POST | `/api/lab/custody/:code/RECEPCION/confirmar` | `lab.routes.js` · `requireAnyRole(ROLES.ADMIN)` |
| POST | `/api/lab/custody/:code/SALIDA/validar` | `lab.routes.js` · `requireAnyRole(ROLES.ADMIN)` |
| POST | `/api/lab/custody/:code/SALIDA/confirmar` | `lab.routes.js` · `requireAnyRole(ROLES.ADMIN)` |
| GET | `/api/requerimientos/operativos` | `requirements.routes.js` · admin/logística |
| GET | `/api/requerimientos/buses` | `requirements.routes.js` · admin/logística |
| GET | `/api/requerimientos/intervenciones-activas` | `requirements.routes.js` · admin/logística |

Entradas inventariadas: **95**, incluidas las siete registradas mediante bucles de rutas. Coinciden con la prueba sobre routers Express montados.

### Archivos modificados respecto de la línea base

Lista cotejada con los hashes iniciales disponibles y el registro de ediciones documentales de esta intervención, no con todo `git diff` (el árbol ya contenía trabajo anterior). Son 91 archivos distintos de su hash inicial, además del bloque de consolidación añadido a `README.md`, que no estaba en ese inventario de hashes. Nuevos archivos se distinguen; dist, logs y bundles son artefactos de verificación.

#### shared

- `shared/assetIdentity.d.ts` — nuevo.
- `shared/assetIdentity.js` — nuevo.
- `shared/package.json` — nuevo.
- `shared/sessionToken.d.ts` — nuevo.
- `shared/sessionToken.js` — nuevo.

#### 03_Backend

- `03_Backend/pmp-api/package.json`.
- `03_Backend/pmp-api/src/middleware/ensureUser.js`.
- `03_Backend/pmp-api/src/routes/admin.routes.js`.
- `03_Backend/pmp-api/src/routes/admin.users.routes.js`.
- `03_Backend/pmp-api/src/routes/bodega.routes.js`.
- `03_Backend/pmp-api/src/routes/equipmentScan.routes.js`.
- `03_Backend/pmp-api/src/routes/lab.routes.js`.
- `03_Backend/pmp-api/src/routes/os.routes.js`.
- `03_Backend/pmp-api/src/services/assetHistory.js`.
- `03_Backend/pmp-api/src/services/assetIdentity.js` — nuevo.
- `03_Backend/pmp-api/src/services/assetManagement.js`.
- `03_Backend/pmp-api/src/services/equipmentScan.js`.
- `03_Backend/pmp-api/src/services/initialAssetStock.js`.
- `03_Backend/pmp-api/src/services/labArrival.js`.
- `03_Backend/pmp-api/src/services/labCustody.js` — nuevo.
- `03_Backend/pmp-api/src/services/labWork.js`.
- `03_Backend/pmp-api/src/services/requirements.js`.
- `03_Backend/pmp-api/src/services/warehouseDispatch.js`.
- `03_Backend/pmp-api/src/services/warehouseLabDispatch.js`.
- `03_Backend/pmp-api/src/services/warehouseParts.js`.
- `03_Backend/pmp-api/test/app.phase1.smoke.test.js`.
- `03_Backend/pmp-api/test/consolidation.test.js` — nuevo.
- `03_Backend/pmp-api/test/equipment.scan.test.js`.
- `03_Backend/pmp-api/test/requirements.test.js`.
- `03_Backend/pmp-api/verification/consolidation_readonly.mjs` — nuevo.
- `03_Backend/pmp-api/verification/consolidation_scenarios.mjs` — nuevo.
- `03_Backend/pmp-api/verification/initial_installation_empty_e2e.mjs`.
- `03_Backend/pmp-api/verification/lab_work_scenarios.mjs`.
- `03_Backend/pmp-api/verification/qa_custody_scenarios.mjs`.

#### 04_Frontend

- `04_Frontend/package.json`.
- `04_Frontend/src/App.tsx`.
- `04_Frontend/src/api/activos.ts`.
- `04_Frontend/src/api/bodega.ts`.
- `04_Frontend/src/api/bridge.ts`.
- `04_Frontend/src/api/equipmentScan.ts`.
- `04_Frontend/src/api/errors.ts`.
- `04_Frontend/src/api/http.ts`.
- `04_Frontend/src/api/lab.ts`.
- `04_Frontend/src/api/os.ts`.
- `04_Frontend/src/app/SessionContext.tsx`.
- `04_Frontend/src/app/session.ts`.
- `04_Frontend/src/components/AIRiskPanel.tsx`.
- `04_Frontend/src/components/LabEquipmentView.tsx`.
- `04_Frontend/src/components/LabTechnicianWorklist.tsx`.
- `04_Frontend/src/components/ProtectedRoute.tsx`.
- `04_Frontend/src/components/RepairWorkForm.tsx`.
- `04_Frontend/src/components/ScanOperationalActions.tsx`.
- `04_Frontend/src/components/Sidebar.tsx`.
- `04_Frontend/src/components/TerrainWithdrawalAssignments.tsx`.
- `04_Frontend/src/components/WarehouseReceptionForm.tsx`.
- `04_Frontend/src/hooks/useScannerInput.ts` — nuevo.
- `04_Frontend/src/pages/AdminDespachoPage.tsx`.
- `04_Frontend/src/pages/AdminUsersPage.tsx`.
- `04_Frontend/src/pages/BodegaModulosPage.tsx`.
- `04_Frontend/src/pages/BodegaPage.tsx`.
- `04_Frontend/src/pages/BodegaRepuestosPage.tsx`.
- `04_Frontend/src/pages/BridgeFlowPage.tsx`.
- `04_Frontend/src/pages/DespachoEscaneoPage.tsx`.
- `04_Frontend/src/pages/EquipmentScanPage.tsx`.
- `04_Frontend/src/pages/EquiposOperativosPage.tsx`.
- `04_Frontend/src/pages/GestionActivosPage.tsx`.
- `04_Frontend/src/pages/IngresoOSPage.tsx`.
- `04_Frontend/src/pages/LabAsignacionPage.tsx`.
- `04_Frontend/src/pages/LabCustodyPage.tsx` — nuevo.
- `04_Frontend/src/pages/LabDashboardPage.tsx`.
- `04_Frontend/src/pages/LabDespachoQaPage.tsx`.
- `04_Frontend/src/pages/LoginPage.tsx`.
- `04_Frontend/src/pages/MyServiceOrdersPage.tsx`.
- `04_Frontend/src/pages/OrdenesServicioPage.tsx`.
- `04_Frontend/src/pages/QaPage.tsx`.
- `04_Frontend/src/pages/RoleDashboardPage.tsx`.
- `04_Frontend/src/pages/TrazabilidadPage.tsx`.
- `04_Frontend/src/styles/base.css`.
- `04_Frontend/src/styles/components.css`.
- `04_Frontend/src/styles/layout.css`.
- `04_Frontend/src/styles/pages.css`.
- `04_Frontend/src/utils/traceabilityPresentation.ts`.
- `04_Frontend/test/all-pages.browser.mjs` — nuevo.
- `04_Frontend/test/bridge.frontend.test.mjs`.
- `04_Frontend/test/consolidation.frontend.test.mjs` — nuevo.
- `04_Frontend/test/equipment-scan.frontend.test.mjs`.
- `04_Frontend/test/requirements.frontend.test.mjs`.
- `04_Frontend/test/routes.frontend.test.mjs`.
- `04_Frontend/test/session.frontend.test.mjs`.
- `04_Frontend/test/warehouse-dispatch.frontend.test.mjs`.

#### 07_Mobile

- `07_Mobile/App.js`.
- `07_Mobile/metro.config.js` — nuevo.
- `07_Mobile/src/components/PmpUi.js` — nuevo.
- `07_Mobile/src/components/TerrainWithdrawalForm.js`.
- `07_Mobile/src/constants/styles.js`.
- `07_Mobile/src/context/AuthContext.js`.
- `07_Mobile/src/screens/AssetHistoryScreen.js`.
- `07_Mobile/src/screens/HomeScreen.js`.
- `07_Mobile/src/screens/LoginScreen.js`.
- `07_Mobile/src/screens/MyOrdersScreen.js`.
- `07_Mobile/src/screens/NewOrderScreen.js`.
- `07_Mobile/src/screens/TerrainWithdrawalScreen.js`.
- `07_Mobile/src/services/api.js`.

#### 01_Requerimientos

- `01_Requerimientos/Auth_Users_Requerimientos.md`.
- `01_Requerimientos/Bodega_Logistica_Requerimientos.md`.
- `01_Requerimientos/Laboratorio_Requerimientos.md`.

#### 02_Arquitectura

- `02_Arquitectura/README.md`.

#### 08_Pruebas

- `08_Pruebas/Consolidacion_Seguridad_Identidad_UX_2026-10-08.md` — nuevo.

#### README.md

- `README.md`.

## 12. Evidencia conservada de esta ejecución

Resumen verificable: [verificacion.json](evidencias_consolidacion_2026-10-08/verificacion.json). Incluye resultados, límites de autenticación/hardware y hashes de los artefactos copiados. Los tres `package-lock.json` y `07_Mobile/app.json` coinciden con sus hashes iniciales. La comparación de base no usa limpieza ni restauración. Comprobación final adicional: `/api/health` responde `ok` y web 5173 devuelve HTTP 200; escuchan los puertos habituales 4000, 5173, 5432 y 8081, y ninguno de los cuatro puertos demo.

Logs nuevos preservados en [evidencias_consolidacion_2026-10-08](evidencias_consolidacion_2026-10-08/): backend, frontend, TypeScript/Vite, bundle Android y recorrido PostgreSQL efímero. El [reporte de 350 renders](evidencias_consolidacion_2026-10-08/render-35-paginas.json) y las [cuatro interacciones QA](evidencias_consolidacion_2026-10-08/interacciones-qa.json) distinguen render de interacción.

Capturas representativas revisadas visualmente, a zoom 100%. Son formularios/componentes reales con transporte y datos simulados, sin escribir en la base habitual; no acreditan acceso de usuarios reales ni uso de hardware. Las capturas con error verifican la representación de indisponibilidad. No se afirma revisión humana individual de cada render generado.

| Vista | Captura | Contexto |
|---|---|---|
| Gestión de activos | [Claro, 320 px](evidencias_consolidacion_2026-10-08/gestion-activos-claro-320.png) | Alta y campos derivados, estado inicial sin búsqueda |
| Ingreso de requerimientos | [Oscuro, 1440 px](evidencias_consolidacion_2026-10-08/requerimientos-oscuro-1440.png) | Formulario y jerarquía PMP |
| QA salida | [Oscuro, 1440 px](evidencias_consolidacion_2026-10-08/qa-salida-oscuro-1440.png) | Evidencia de salida en fixture aislada |
| Trabajo Laboratorio | [Claro, 320 px](evidencias_consolidacion_2026-10-08/trabajo-laboratorio-claro-320.png) | Formulario técnico adaptado |
| Trazabilidad | [Oscuro, 1440 px](evidencias_consolidacion_2026-10-08/trazabilidad-oscuro-1440.png) | Estructura y buscador inicial sin consulta |
| Nueva instalación | [Claro, 390 px](evidencias_consolidacion_2026-10-08/nueva-instalacion-claro-390.png) | Preparación de despacho sin caso, fixture aislada |

Estos artefactos nuevos se agregan a la lista de archivos modificados anterior; no sustituyen evidencia histórica ni documentos Capstone.
