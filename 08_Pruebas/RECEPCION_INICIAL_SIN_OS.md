# Recepción inicial de activos nuevos sin OS

Cierre documental: 22 de septiembre de 2026. Suites y builds ejecutados el 17 de septiembre; E2E de requerimientos/recepción repetido el 22 tras ajustar el mensaje de rechazo para activos sin recepción. Resultados y artefactos revisados al cerrar. Sustituye exclusivamente el antiguo circuito de recepción inicial del [informe anterior](MODELO_DEFINITIVO_ACTIVOS.md).

## 1. Comportamiento final

**Dar de alta crea el maestro y su auditoría. Recibir físicamente y confirmar la conformidad inicial habilita el stock. La primera OS se crea al confirmar un despacho real.**

```text
Gestión de activos
  → ALTA_ACTIVO (maestro, sin OS ni stock)
  → lectura física en BODEGA: ESCANEO_BODEGA
  → confirmación de identidad, integridad y conformidad inicial
  → RECEPCION_INICIAL + HABILITADO_INSTALACION (sin OS)
  → Listos para instalación
  → lectura física contextual de despacho
  → confirmación: IN independiente + SALIDA_BODEGA_TERRENO
  → En ruta → instalación → En operación
  → falla posterior: MV/MC normal
```

- **Recepcionar activo nuevo** no crea MV, MC, PDV, PDC ni IN. No solicita bus, terminal, operador ni técnico. Usa la ubicación BODEGA existente.
- La consulta manual no constituye evidencia física. La recepción exige una lectura válida del activo seleccionado, en Bodega, del mismo usuario y del contexto de recepción. Una lectura anterior sustituida por otra ya no sirve.
- El escaneo por sí solo no habilita stock. Se exige confirmación explícita de conformidad inicial; no se inventa una aprobación de reparación ni se envía al activo nuevo a laboratorio/QA.
- Inventario y dashboard incluyen los nuevos activos recibidos. Se presentan como **Recepción inicial conforme**, con OS y bus vacíos. Los equipos reparados conservan su QA y circuito existentes.
- El despacho exige su propia lectura contextual. Elegir técnico, consultar o escanear no crea IN ni incrementa En ruta. Confirmar genera la IN independiente, consume el origen de stock y registra la salida en una transacción.
- El historial por tipo + serie reúne eventos iniciales sin OS, escaneos y órdenes posteriores. Conserva todos los identificadores originales.
- Recepciones repetidas/concurrentes, activos con OS previas, identidad incorrecta y evidencia fuera de contexto se rechazan. Un fallo al habilitar stock revierte también la recepción.

La nueva ruta no crea ni utiliza un bus ficticio `STOCK`. Los registros históricos que ya referencian ese identificador se preservan: no se eliminan ni reescriben para adaptar la historia. Las pruebas comparan íntegramente el catálogo de buses antes y después y verifican bus nulo en el stock nuevo.

## 2. API y persistencia

| Operación | Contrato |
|---|---|
| `POST /api/activos` | Maestro + evento ALTA_ACTIVO. Sin caso, OS, Bridge ni stock. |
| `POST /api/activos/recepcion/validar` | Identidad seleccionada, código leído y origen de captura. MANUAL consulta; SCANNER registra evidencia física válida en BODEGA con las reglas de estación existentes. |
| `POST /api/activos/recepcion` | Tipo, serie, `escaneo_id`, `validacion_inicial_conforme: true` y observación opcional. Registra recepción y habilitación sin OS. |
| Stock y dashboards | Incluyen disponibilidad inicial derivada de eventos y evidencia física. No agregan un estado persistido a la FSM. |
| Despacho existente | Admite stock inicial además del reparado. La primera IN referencia el evento de disponibilidad mediante `stock_origen_evento`. |

Se reutilizan `flujo_eventos`, `escaneos_equipos`, ubicaciones, maestros y órdenes. No hay tablas paralelas de inventario ni un circuito de mantenimiento ficticio.

La migración [006_recepcion_inicial_sin_os.sql](../05_BaseDatos/migraciones/requerimientos/006_recepcion_inicial_sin_os.sql) incorpora identidad tipo/serie a eventos y permite escaneos sin OS solo para el contexto inicial BODEGA/SCANNER. Verifica existencia del maestro, unicidad de habilitación, consumo único del evento por una instalación e inmutabilidad de su origen físico.

**Aplicada en la base local**, tras ensayo con rollback. La aplicación repetida resultó idempotente y la comparación conservó las filas históricas, incluidas **100 OS**. Evidencias: [ensayo](evidencias/recepcion-inicial/reception-migration-dry-run.json) y [aplicación](evidencias/recepcion-inicial/reception-migration.json).

En otros entornos, aplicar las migraciones precedentes y 006 en orden. Desde `03_Backend/pmp-api`:

```powershell
node verification/apply_initial_reception.mjs
node verification/apply_initial_reception.mjs --apply
```

El primer comando ensaya y revierte; el segundo aplica. Reiniciar la API y recargar clientes para usar el código actualizado. La migración no reconstruye eventos de alta que nunca se registraron ni convierte recepciones históricas con OS en eventos nuevos.

## 3. Archivos de esta corrección

El workspace contiene entregas previas. Esta lista delimita el ajuste actual.

| Área | Archivos |
|---|---|
| Servicios backend (`03_Backend/pmp-api/src/services/`) | `assetManagement.js`, `equipmentScan.js`, `initialAssetStock.js` (nuevo), `warehouseDispatch.js`, `logisticsPresentation.js`, `assetHistory.js`, `bridgeFlow.js` |
| Rutas backend (`src/routes/`) | `assets.routes.js`, `bodega.routes.js`, `dashboard.routes.js` |
| Persistencia | `05_BaseDatos/migraciones/requerimientos/006_recepcion_inicial_sin_os.sql` (nuevo) |
| API web (`04_Frontend/src/api/`) | `activos.ts`, `bodega.ts`, `requerimientos.ts` |
| Páginas web (`src/pages/`) | `GestionActivosPage.tsx`, `BodegaModulosPage.tsx`, `DespachoEscaneoPage.tsx` |
| Frontend tests | `04_Frontend/test/requirements.frontend.test.mjs` |
| E2E (`03_Backend/pmp-api/verification/`) | `asset_management_scenarios.mjs`, `requirements_flow_e2e.mjs`, `equipment_scan_flow_e2e.mjs`, `logistics_nomenclature_e2e.mjs` |
| Verificadores de migración | `apply_initial_reception.mjs` (nuevo), `apply_requirements.mjs` |
| Documentación | Este informe, evidencias, `MODELO_DEFINITIVO_ACTIVOS.md`, `02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md`, `README.md` |
| Artefacto web | `04_Frontend/tsconfig.tsbuildinfo`, regenerado por build |

`bridgeFlow.js` solo amplía el helper compartido de eventos para admitir identidad de activo sin OS. Bridge mantiene exclusivamente correlación y no recibe acciones operacionales. No se cambiaron FSM, permisos, Docker ni Expo SDK 57. No fueron necesarios cambios de código móvil: su historial ya admite eventos sin `codigo_os`.

La [carga inicial del parque](MODELO_DEFINITIVO_ACTIVOS.md#5-carga-inicial-del-parque) continúa documentada: cargar parque instalado y stock con evidencia y relaciones verificadas, sin inventar MV/MC históricas. El importador masivo sigue fuera de esta implementación.

## 4. Pruebas y builds

| Verificación | Resultado | Evidencia |
|---|---|---|
| Backend `npm test` | **56/56 aprobadas** | [Log](evidencias/recepcion-inicial/reception-backend-tests.log) |
| Frontend `npm test` | **62/62 aprobadas** | [Log](evidencias/recepcion-inicial/reception-frontend-tests.log) |
| Web `npm run build` | **Correcto** | [Log](evidencias/recepcion-inicial/reception-web-build.log) |
| Expo Android + iOS | **Exportación completada**, SDK 57.0.22 | [Log](evidencias/recepcion-inicial/reception-mobile-export.log), [bundles y SHA-256](evidencias/recepcion-inicial/mobile-artifacts.json) |
| Requerimientos, activos y recepción | **Aprobado** | [E2E](evidencias/recepcion-inicial/reception-new-e2e.json) |
| Escaneo y circuito de reparación | **Aprobado** | [E2E](evidencias/recepcion-inicial/reception-scan-e2e.json) |
| Nomenclatura y logística | **Aprobado** | [E2E](evidencias/recepcion-inicial/reception-logistics-e2e.json) |
| Bridge, correlación e historial | **Aprobado** | [E2E](evidencias/recepcion-inicial/reception-bridge-e2e.json) |

Los E2E finalizaron con limpieza de sus entornos; las suites de recepción, escaneo y logística verificaron además que la base original quedó sin cambios. El rechazo esperado de una serie inexistente desde `/api/os/crear` produce un mensaje en stderr durante la prueba negativa; la suite terminó con `ok: true`.

### Cobertura A–J solicitada

| Criterio | Comprobación |
|---|---|
| A. Alta sin OS | Conteos antes/después: solo maestro y ALTA_ACTIVO. |
| B. Alta sin stock | Serie ausente de Listos para instalación tras alta y también tras solo escanear. |
| C. Escaneo obligatorio | Sin evidencia: 409; MANUAL no genera escaneo; otra identidad se rechaza; permisos de estación intactos. |
| D. Recepción sin MV/MC | Conteo de todas las OS idéntico antes y después de recibir. |
| E. Sin bus ficticio | Catálogo de buses sin modificaciones; recepción sin parámetros de bus y stock con PPU nula. No se eliminan referencias históricas previas. |
| F. Disponible tras validación | Confirmación explícita requerida; stock conforme sin QA de reparación y distribución de dashboard correcta. |
| G. Primera IN independiente | Primera y única OS inicial `IN-000016` en la fixture, relacionada con su evento de stock. Correlativo real variable. |
| H. Primera falla normal | Después de instalar se creó `MV-87126354` mediante Requerimientos. La regresión de prefijos mantiene MC/PDV/PDC. |
| I. Historial mixto | ALTA_ACTIVO, ESCANEO_BODEGA, RECEPCION_INICIAL, HABILITADO_INSTALACION sin OS, más IN y MV posteriores. |
| J. Desconocidos rechazados | Requerimientos y reporte de terreno rechazan activos inexistentes sin insertar maestro, caso, OS o Bridge. |

También se verificaron rollback, recepción concurrente (una 201 y una 409), restricciones SQL, origen de stock inmutable, consumo único, separación entre tipos con la misma serie y aumento de En ruta solo después de confirmar despacho. Las nuevas pruebas web cubren consulta manual, bloqueo sin conformidad, invalidación al cambiar lectura y error inline sin perder la lectura. Se mantiene la regresión 4xx del modal de despacho.

Comandos E2E, desde backend:

```powershell
node verification/requirements_flow_e2e.mjs
node verification/equipment_scan_flow_e2e.mjs
node verification/logistics_nomenclature_e2e.mjs
node verification/bridge_correlation_e2e.mjs
```

Exportación desde `07_Mobile`:

```powershell
$env:EXPO_OFFLINE='1'
$env:CI='1'
node node_modules/expo/bin/cli export --platform android --platform ios --output-dir ../tmp/reception-mobile
```

La exportación verifica compilación de bundles; no constituye APK/IPA firmado ni ejecución en teléfono. Mobile no define una suite `npm test` propia.

## 5. Guion manual paso a paso

Usar un entorno de pruebas, un usuario Logística, técnico de terreno, lector físico, bus/terminal válidos, caso de instalación o reemplazo existente y una serie nueva real. Registrar códigos efectivamente generados; los números del informe son de fixtures.

1. Reiniciar API y recargar web/móvil con las migraciones aplicadas. Anotar cantidades de OS, stock, En ruta y códigos históricos de referencia.
2. Abrir **Gestión de activos**. Registrar tipo, serie nueva, modelo/marca si se conocen, origen, fecha y observación.
3. Verificar estado **Registrado**, evento ALTA_ACTIVO con autor/fecha y ausencia de OS, bus, stock, asignación y QA. Los KPI de stock/En ruta deben permanecer iguales.
4. Abrir **Recepcionar activo nuevo** para esa serie. Confirmar que no pide PPU ni técnico y que **Confirmar recepción inicial** está deshabilitado.
5. En **Consulta manual**, escribir la serie y validar. Debe continuar **Pendiente de escaneo físico**, sin habilitar confirmación ni generar disponibilidad.
6. Elegir **Lector físico en Bodega** y leer otro equipo. Verificar error visible e identidad seleccionada conservada. Corregir leyendo físicamente el activo nuevo.
7. Verificar **Escaneado en Bodega**. Sin marcar conformidad inicial, la confirmación sigue deshabilitada y el equipo aún no figura en Listos para instalación.
8. Verificar físicamente identidad, integridad y conformidad inicial; marcar la casilla y confirmar una vez. Debe informar recepción y habilitación sin OS.
9. Abrir historial por serie: comprobar ALTA_ACTIVO, ESCANEO_BODEGA, RECEPCION_INICIAL y HABILITADO_INSTALACION con fechas/autor. No deben aparecer MV/MC/PDV/PDC/IN iniciales ficticias.
10. Abrir **Inventario de equipos → Listos para instalación**. Debe aparecer el activo en Bodega, **Recepción inicial · Sin OS**, sin PPU y con validación inicial conforme. Revisar el incremento de disponibilidad en dashboard; En ruta sigue igual.
11. Volver a buscar el activo en Gestión. Debe figurar disponible y no ofrecer otra recepción inicial. Si se conservó un formulario antiguo, su reenvío debe dar conflicto sin duplicar eventos.
12. Abrir **Despacho por escaneo**, elegir caso/contexto, tipo, bus/terminal y técnico. Comprobar que seleccionar estos datos no genera una OS ni cambia En ruta.
13. Leer físicamente el activo recién recibido en ese contexto. Revisar **Recepción inicial conforme** y la identidad. La lectura sola tampoco genera IN ni salida. Cambiar la lectura debe invalidar la confirmación previa.
14. Confirmar despacho. Verificar nueva **IN con correlativo independiente**, evento SALIDA_BODEGA_TERRENO, técnico/bus correctos, salida del pool disponible e incremento de En ruta. No deben crearse MV/MC para justificar el stock.
15. Como técnico, abrir esa IN en Mobile y completar su instalación mediante el flujo vigente. Verificar En operación en el bus y salida de En ruta.
16. Registrar una falla posterior desde **Ingreso de requerimientos**, seleccionando el activo ya instalado mediante sugerencia por bus o búsqueda. Debe crear MV para validador o MC para consola, con su caso/referencia cuando corresponda.
17. Buscar la serie y los códigos de las OS creadas. Verificar que el historial conserva los eventos iniciales y ambas intervenciones, sus fechas y referencias externas sin reemplazar identificadores. Revisar también el historial móvil.
18. Intentar un requerimiento para una serie inexistente. Debe mostrar **Activo no registrado en PMP Suite**, sin crear maestro, OS ni correlación.
19. Repetir el recorrido con el otro tipo de equipo. Comprobar que una serie textual compartida entre tipos no fusiona sus historias y que se mantienen las reglas de lectura ambigua.
20. Comparar OS históricas y revisar que Bridge solo permite correlacionar. El equipo nuevo no debió recorrer diagnóstico/reparación/QA antes de su primera instalación.

**Pendiente de ejecución humana:** recorrido visual con lector real y teléfono. Las pruebas automatizadas, migración y builds indicados arriba sí se ejecutaron; no se presentan como sustituto de esa validación física.
