# Migración de procesos a páginas PMP Suite

## Inventario previo (2026-10-06)

| Componente / uso | Ruta / función actual | Reemplazo previsto |
|---|---|---|
| RepairModal: Mi carga, LabEquipmentView y EquipmentScanPage | /mi-jornada, /lab/validadores, /lab/consolas, /operacion/escaneo; trabajo técnico | /mi-carga/:osId, formulario técnico y repuestos inline |
| WarehouseReceptionDialog | /bodega; recibir desde terreno / enviar a laboratorio | /bodega/recepciones/:osId y /bodega/envios-laboratorio/:osId |
| BodegaModulosPage: asignación | /bodega/modulos; técnico y despacho | sección operacional inline con validación vigente |
| AdminUsersPage: edición | /admin/users; editar usuario | panel de edición inline |
| GestionActivosPage: detalle/recepción inicial | /operacion/activos | detalle y recepción inline |
| OperationalAssetExplorer | /operacion/requerimientos; búsqueda paginada | explorador inline |
| CustomModal / useAlert | AdminDespachoPage, BodegaRepuestosPage, LabDashboardPage, LabDespachoQaPage, QaPage | FeedbackBanner y confirmación inline |
| TerrainWithdrawalDialog | Mobile Mis Órdenes; identidad, PoD, retiro | TerrainWithdrawalScreen, navegación completa |
| MyOrdersScreen Alert | Mobile; confirmar instalación, resultado/error | confirmación y mensajes inline |
| NewOrderScreen SelectionModal / Alert | Mobile; seleccionar terminal/operador, mensajes | selección y mensajes inline |
| HomeScreen / LoginScreen Alert | Mobile; mensajes informativos/errores | mensajes inline |
| Trazabilidad / AssetTimeline | Detalle de eventos | ya utiliza expansión inline; conservar |

No reemplazar permisos nativos, cámara del sistema ni selector nativo de archivos. La navegación lateral y los autocompletados no son procesos operacionales flotantes. No modificar documentos Capstone v2.0 ni evidencias históricas. No utilizar la base real para escrituras.

## Resultado implementado (2026-10-07)

- Retirados `RepairModal`, `WarehouseReceptionDialog`, `CustomModal` y `TerrainWithdrawalDialog` del código operativo. Los formularios reutilizan los mismos endpoints y reglas; no hay componentes de compatibilidad que continúen abriendo ventanas.
- Trabajo técnico: `/mi-carga/:osId`, desde Mi carga, validadores/consolas o estación de escaneo. Breadcrumb, contexto readonly, recepción canónica/SLA y estado. Consulta nuevamente la cola autorizada y comprueba pertenencia + recepción antes de habilitar acciones. Regreso a la bandeja de origen mediante un destino local permitido. Solicitar repuesto es secundario y se abre inline junto a repuestos; conserva el borrador técnico.
- Recepción: `/bodega/recepciones/:osId`. Envío: `/bodega/envios-laboratorio/:osId`. Se usa el dominio Bodega existente para no crear rutas duplicadas en `/logistica`. Se consulta la bandeja vigente al acceder directamente o recargar. Validar conserva el contrato de evidencia; solo confirmar ejecuta el movimiento. Resultado inline y regreso a Bodega/siguiente equipo.
- Mobile: `TerrainWithdrawalScreen` registrada solo para técnico de terreno. Consulta `/os/mis-ordenes` al entrar, verifica la tarea vigente y contiene `TerrainWithdrawalForm` en pantalla completa con ScrollView. La bandeja se actualiza al recuperar foco. Instalación, mensajes de login/soporte y selectores de terminal/operador usan contenido inline.
- Usuarios, explorador de activos, recepción inicial y asignación del inventario usan paneles normales del documento. QA, control de salida, repuestos y mensajes de laboratorio usan `InlineFeedback` con `FeedbackBanner`. No hay bloqueo de scroll, cierre por Escape ni backdrop operacional.
- Trazabilidad ya utilizaba detalle expandible; se conserva. El menú lateral responsive y los autocompletados de navegación no ejecutan procesos y no fueron rediseñados. Permisos del SO, cámara nativa y selector de archivos permanecen externos a PMP.

## Archivos de esta intervención

### Backend

- `03_Backend/pmp-api/src/routes/lab.routes.js`: solo consultas de lectura de carga y terminados; resuelve marca, terminal y operador desde maestro/OS/caso. No cambia transacciones.

### Web

- `04_Frontend/src/App.tsx`: rutas protegidas nuevas.
- `04_Frontend/src/api/lab.ts`: tipado del contexto de lectura.
- `04_Frontend/src/app/navigation.ts`: selección de Mi carga en navegación.
- `04_Frontend/src/components/TopBar.tsx`: títulos del contexto operacional.
- `04_Frontend/src/components/RepairModal.tsx` → `RepairWorkForm.tsx`: formulario técnico normal.
- `04_Frontend/src/components/WarehouseReceptionDialog.tsx` → `WarehouseReceptionForm.tsx`: evidencia y confirmación dentro de página.
- `04_Frontend/src/components/CustomModal.tsx` → `InlineFeedback.tsx`: mensajes/confirmaciones inline.
- `04_Frontend/src/components/LabTechnicianWorklist.tsx`: navega al trabajo.
- `04_Frontend/src/components/LabEquipmentView.tsx`: reutiliza la misma ruta técnica.
- `04_Frontend/src/hooks/useAlert.ts`: estado de feedback inline.
- `04_Frontend/src/pages/LabWorkPage.tsx`: nueva página técnica autorizada.
- `04_Frontend/src/pages/WarehouseOperationPage.tsx`: páginas físicas de Bodega.
- `04_Frontend/src/pages/BodegaPage.tsx`: navegación a recepción/envío.
- `04_Frontend/src/pages/EquipmentScanPage.tsx`: navegación al trabajo técnico.
- `04_Frontend/src/pages/AdminUsersPage.tsx`: edición/notificaciones inline.
- `04_Frontend/src/pages/GestionActivosPage.tsx`: detalle/recepción inicial inline.
- `04_Frontend/src/pages/IngresoRequerimientosPage.tsx`: explorador paginado inline.
- `04_Frontend/src/pages/BodegaModulosPage.tsx`: asignación existente inline.
- `04_Frontend/src/pages/AdminDespachoPage.tsx`: confirmación inline.
- `04_Frontend/src/pages/BodegaRepuestosPage.tsx`: confirmación y resultado inline.
- `04_Frontend/src/pages/LabDashboardPage.tsx`: información inline.
- `04_Frontend/src/pages/LabDespachoQaPage.tsx`: confirmación inline.
- `04_Frontend/src/pages/QaPage.tsx`: confirmación/resultado inline.
- `04_Frontend/src/styles/components.css`: retira primitivas flotantes sin uso.
- `04_Frontend/src/styles/pages.css`: anatomía normal de formularios, contexto compacto y responsive.

### Mobile

- `07_Mobile/App.js`: screen protegida por el rol vigente.
- `07_Mobile/src/components/TerrainWithdrawalDialog.js` → `TerrainWithdrawalForm.js`: conserva identidad, discrepancias, PoD y evidencias sin React Native Modal.
- `07_Mobile/src/screens/TerrainWithdrawalScreen.js`: carga propia, resultado y volver.
- `07_Mobile/src/screens/MyOrdersScreen.js`: navegación, refresco al volver y confirmación de instalación inline.
- `07_Mobile/src/screens/NewOrderScreen.js`: selección y mensajes inline; resultado explícito.
- `07_Mobile/src/screens/LoginScreen.js`: errores inline.
- `07_Mobile/src/screens/HomeScreen.js`: información inline.

### Pruebas y documentación

- `04_Frontend/test/requirements.frontend.test.mjs`: adapta pruebas existentes y añade páginas, permisos, navegación sin mutaciones, screen móvil y auditoría estática.
- `04_Frontend/test/warehouse-dispatch.frontend.test.mjs`: errores visibles en panel inline y conservación de selección.
- `04_Frontend/test/equipment-scan.frontend.test.mjs`: referencia al formulario técnico reutilizado.
- `04_Frontend/test/repair-modal.browser.mjs` → `operational-pages.browser.mjs`: navegación real en Chrome con APIs simuladas, recarga, Escape, acciones explícitas y capturas.
- Este inventario/informe. No se modificaron artefactos Capstone v2.0 ni evidencias históricas.

## Reglas preservadas

Physical-first; FSM/estados; asignación por rol y pertenencia; evidencia distinta por custodia; scanner y manual autorizado; máximo tres fotos; PoD No sin foto obligatoria y PoD Sí con evidencia; IN independiente; Bridge correlacional; identidad tipo+serie; rechazo de duplicados; historial; badges; fecha canónica de recepción y umbrales SLA. Entrar, recargar, cancelar o volver no ejecutan movimientos. Las validaciones físicas explícitas conservan la auditoría ya existente; no equivalen a confirmar una transacción.

## Verificación ejecutada

- Backend: **68/68**.
- Suite Web/componentes: **144/144**, de las cuales **11** corresponden a componentes/flujo Mobile y **133** a Web y comprobaciones compartidas. No son 11 ejecuciones en un dispositivo físico.
- E2E vigente `verification/requirements_flow_e2e.mjs`: aprobado, PostgreSQL efímero. Incluye búsqueda bidireccional, duplicados, recepción inicial, retiro/PoD, recepción y despacho, IN, laboratorio/ciclos/SLA/asignación y QA.
- `tsc --noEmit --incremental false`: aprobado.
- Vite build: aprobado.
- Expo SDK 57: exportaciones Android e iOS aprobadas.
- Chrome con APIs simuladas: **132** capturas/comprobaciones en 320, 375, 390, 768, 1024 y 1440 px, claro/oscuro, **0** overflow horizontal del documento y **0** diálogos activos. Incluye diagnóstico, reparación, repuestos, recepción/envío por scanner/manual, explorador, activos, usuarios y confirmación inline. Revisión visual de capturas representativas desktop/móvil.
- React Native: probado a nivel de componentes y exportación Android/iOS; no se ejecutó un dispositivo/emulador nativo ni se probó hardware de cámara/escáner en esta intervención.
- Búsqueda estática reproducible incorporada a la suite: `role="dialog"`, `aria-modal`, `showModal`, `createPortal`, `window.alert/confirm`, `Alert.alert`, React Native Modal: **0 usos activos propios**.
- E2E: `sourceDatabaseUnchanged: true`, `temporaryClusterRemoved: true`. **MV-87126356 y la base real no fueron modificadas**.

El ejecutor histórico `bridge_e2e_isolated.mjs` se ejecutó inicialmente y falló porque intenta crear Bridge operacional (rechazo correcto `CORRELATION_ONLY`). Se preservó sin cambios y se utilizó después el ejecutor vigente. La primera ejecución vigente detectó un join faltante en la lectura de terminados; fue corregido y la repetición aprobó. No se presentan esos intentos como aprobados.

Evidencias locales: `tmp/no-modals-{frontend,backend,e2e-current,build,expo,browser}.log`, `tmp/no-modals-static.json`, `tmp/operational-pages-qa/report.json` y capturas; bundles en `tmp/no-modals-expo/`.

## Prueba manual corta, sin mutar OS reales

1. Como técnico de laboratorio, abrir Mi carga → Abrir trabajo. Comprobar URL, contexto readonly y fecha real; volver y recargar sin pulsar Iniciar trabajo.
2. Abrir una OS no asignada mediante URL: debe bloquear. Una OS sin recepción no habilita trabajo.
3. Como logística, abrir Recepcionar / Preparar envío: comprobar página completa, contexto y CTA bloqueado sin evidencia. Volver sin confirmar.
4. Explorar activos, abrir detalle y editar usuario: comprobar paneles inline sin overlay y que cancelar conserva los datos persistidos.
5. En Mobile, abrir Mis Órdenes → retiro: pantalla completa con contexto precargado. Volver sin confirmar; comprobar recarga de bandeja.
6. En un entorno aislado, ejecutar validación/confirmación física y transiciones explícitas, PoD Sí/No y error/reintento conservando campos.
7. Revisar claro/oscuro y los seis tamaños indicados. Escape no debe cerrar formularios ni descartar su contenido.
