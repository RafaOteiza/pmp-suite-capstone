# Modelo definitivo: maestro de activos e ingreso de requerimientos

Fecha de cierre: 17 de septiembre de 2026. Sustituye el alta desde Requerimientos descrita en el informe anterior.

> **Actualización posterior:** la recepción inicial descrita aquí mediante una OS interna y laboratorio/QA quedó retirada. El contrato vigente, sus pruebas y el guion de recepción sin OS están en [Recepción inicial de activos nuevos](RECEPCION_INICIAL_SIN_OS.md). Las secciones de alta, requerimientos sobre activos existentes y carga inicial conservan su vigencia; los resultados y pasos del antiguo circuito de recepción se preservan solo como evidencia histórica.

## 1. Comportamiento final

**Ingreso de requerimientos no crea ni modifica activos.** Trabaja con una identidad existente, seleccionada explícitamente, y valida su relación operacional vigente con el bus. Mantiene la creación transaccional de caso, OS y correlación Aranda cuando corresponde.

- Tipo y PPU consultan automáticamente los equipos en operación asociados al bus.
- El buscador filtra por serie y presenta hasta 30 coincidencias, con serie, modelo, marca, bus y estado actual. Admite selección con teclado o mediante clic.
- Las sugerencias no seleccionan silenciosamente el activo. Cambiar tipo, bus o búsqueda invalida la selección anterior; las respuestas de consultas obsoletas se descartan.
- Una serie desconocida muestra **Activo no registrado en PMP Suite** y **El activo debe registrarse previamente en Gestión de activos antes de generar un requerimiento.** No existe acción de alta en esta pantalla.
- Sin selección válida no se envía creación. La API también rechaza identidades inexistentes, falta de vínculo operacional, bus diferente y el antiguo parámetro `registrar_activo`.
- El endpoint de reporte de fallas de terreno tampoco crea ni sobrescribe validadores/consolas. Conserva su permiso existente; los mensajes web/móvil explican la regla.

**Gestión de activos**, para Admin y Logística, registra tipo, serie, modelo y marca conocidos, origen, fecha de ingreso y observación. Conserva el autor del alta. Modelo/marca desconocidos permanecen NULL; no se inventan atributos técnicos.

| Situación | Significado |
|---|---|
| Registrado | Existe en el maestro por tipo + serie. No implica ubicación, instalación ni disponibilidad. |
| Disponible para instalación | Cumple las reglas existentes de QA, Bodega y ausencia de intervención/asignación incompatible. |
| En operación | Tiene la relación con bus que utiliza la vista operacional vigente y no está en stock ni en un circuito activo incompatible. |
| En ruta | Existe la salida física validada del despacho; seleccionar un técnico no alcanza. |

La sugerencia por bus y la revalidación backend reutilizan `operatingAssetsSql`, la misma definición de la vista de equipos operativos y su KPI. No se infieren vínculos a partir del código de una OS.

### Equipo nuevo y circuito físico

Dar de alta crea exclusivamente la fila del maestro. Una acción separada, **Iniciar recepción pendiente**, prepara una OS interna MV/MC en el estado existente 2, con bus técnico `STOCK`, terminal y operador. No asigna ubicación, técnico, aprobación QA ni evidencia de recepción.

La acción solo admite activos sin intervenciones previas y protege la concurrencia. Si existe un circuito, se debe continuar su OS; no se abre otro paralelo.

```text
Gestión de activos: alta del maestro
  → iniciar recepción pendiente (OS interna)
  → escaneo físico Bodega
  → recepción existente
  → laboratorio / validación
  → QA
  → escaneo y recepción final en Bodega
  → Listos para instalación
```

Se reutiliza el circuito conservador completo disponible en el proyecto; no se añadió una excepción para saltar laboratorio o QA por tratarse de un equipo nuevo. La IN se crea únicamente al confirmar posteriormente el despacho físico.

## 2. Backend, frontend y móvil

### Backend

- `GET /api/activos?tipo_equipo=VALIDADOR&bus_ppu=WXSS18`: sugerencias operativas por bus.
- `GET /api/activos?tipo_equipo=CONSOLA&q=9715`: búsqueda parcial en el maestro.
- `POST /api/activos`: alta exclusiva del maestro, sin OS, caso, Bridge ni stock.
- `POST /api/activos/recepcion`: prepara una OS interna pendiente para iniciar el circuito físico existente.
- Las rutas anteriores requieren Admin/Logística. Los demás roles conservan sus permisos.
- `POST /api/requerimientos`: revalida activo existente y bus bajo bloqueo transaccional; retiradas todas las inserciones en los maestros.
- `POST /api/os/crear`: retirado el upsert de maestros del reporte de terreno, evitando altas y sobrescrituras de datos técnicos desde ese camino.

### Web

- Nueva opción **Gestión de activos** y ruta `/operacion/activos`, protegidas con la capacidad `ASSET_MANAGE`, exclusiva de Admin/Logística.
- Requerimientos reemplaza la serie libre por buscador con sugerencias, selección explícita y validación del contexto.
- La gestión separa formulario de alta, búsqueda y preparación de recepción. La interfaz explica que registrar no equivale a stock o instalación.
- Los errores permanecen visibles y conservan los datos del formulario.

### Mobile

El reporte de fallas explica que solo admite un activo registrado y asociado al bus, y muestra el mensaje funcional devuelto por la API. Dejó de enviar modelo/marca vacíos como datos de alta. No se agregó gestión del maestro al rol de terreno. Expo permanece en SDK **57**, versión instalada **57.0.22**.

## 3. Base de datos y migración

Se mantiene 004: IN independientes con `pmp.seq_in` y `modelo NULL` legítimo. **No se renumeró ninguna OS** ni se restauraron las IN basadas en caso.

La migración [005_gestion_activos.sql](../05_BaseDatos/migraciones/requerimientos/005_gestion_activos.sql) agrega en `validadores` y `consolas`:

- `origen_registro`;
- `fecha_ingreso`;
- `observacion_registro`;
- `registrado_por`, relacionado con el usuario existente.

Son columnas nullable sin backfill. No se agregaron estados ni tablas paralelas de stock. No se modificaron filas históricas; las altas antiguas mantienen la información que realmente tenían.

**Aplicada en la base local**, después de un ensayo con rollback. El verificador aplicó dos veces la migración y comparó firmas de las tablas existentes, excluyendo únicamente los cuatro campos añadidos a los maestros. Conservó **100 OS históricas** y el contenido previo de las demás tablas.

Evidencias: [ensayo](evidencias/modelo-definitivo/assets-migration-dry-run.json), [aplicación](evidencias/modelo-definitivo/assets-migration.json).

Desde `03_Backend/pmp-api`:

```powershell
node verification/apply_asset_management.mjs
node verification/apply_asset_management.mjs --apply
```

En otros entornos, aplicar 003, 004 y 005 en orden. `apply_requirements.mjs` incluye esa secuencia. La aplicación local ya está realizada; reiniciar API y recargar clientes para usar el código actualizado.

## 4. Archivos de esta entrega

El workspace contiene cambios anteriores. Esta lista corresponde solo a la corrección definitiva.

| Área | Archivos |
|---|---|
| Servicios backend | `03_Backend/pmp-api/src/services/assetManagement.js` (nuevo), `requirements.js` |
| Rutas backend | `03_Backend/pmp-api/src/routes/assets.routes.js` (nuevo), `requirements.routes.js`, `os.routes.js`, `src/app.js` |
| Base de datos | `05_BaseDatos/migraciones/requerimientos/005_gestion_activos.sql` (nuevo) |
| API web | `04_Frontend/src/api/activos.ts` (nuevo), `requerimientos.ts` |
| Páginas web | `04_Frontend/src/pages/GestionActivosPage.tsx` (nuevo), `IngresoRequerimientosPage.tsx`, `IngresoOSPage.tsx` |
| Navegación y acceso | `04_Frontend/src/App.tsx`, `src/app/rbac.ts`, `src/app/navigation.ts` |
| Mobile | `07_Mobile/src/screens/NewOrderScreen.js` |
| Pruebas backend | `03_Backend/pmp-api/test/requirements.test.js` |
| Pruebas web | `04_Frontend/test/requirements.frontend.test.mjs`, `routes.frontend.test.mjs`, `rbac.frontend.test.mjs` |
| E2E | `03_Backend/pmp-api/verification/asset_management_scenarios.mjs` (nuevo), `requirements_scenarios.mjs`, `requirements_flow_e2e.mjs`, `equipment_scan_flow_e2e.mjs`, `logistics_nomenclature_e2e.mjs` |
| Verificadores de migración | `03_Backend/pmp-api/verification/apply_asset_management.mjs` (nuevo), `apply_requirements.mjs` |
| Documentación | `02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md`, `08_Pruebas/CORRECCION_MODELO_OS_ACTIVOS.md`, `README.md`, este informe y sus evidencias |
| Build | `04_Frontend/tsconfig.tsbuildinfo`, regenerado |

Las fixtures E2E ahora preparan explícitamente el parque instalado antes de reportar fallas. Ninguna fixture se inserta en la base de uso real.

## 5. Carga inicial del parque

**En una puesta en producción, PMP Suite recibe inicialmente el maestro de activos instalados y de stock. A partir de esa fotografía inicial, los requerimientos operacionales siempre referencian activos existentes.** No se espera la primera falla para registrar la identidad.

El alta manual está implementada. La importación masiva CSV/Excel queda como extensión documentada del Capstone, sin añadir un importador parcial que cree instalaciones o stock sin respaldo.

Contrato propuesto para la carga:

1. Identidad obligatoria: tipo + serie textual, sin perder ceros. Modelo/marca opcionales; origen, fecha de corte y observación de procedencia.
2. Diferenciar maestro, parque instalado y stock físico. No convertir una etiqueta de una planilla en aprobación QA o despacho.
3. Para el parque instalado, validar bus, terminal, operador y evidencia de la relación. El código actual consulta relaciones operacionales registradas en OS; cargar solo maestros no crea un vínculo con bus.
4. Cuando existan OS históricas reales, importarlas con sus identificadores y relaciones verificadas. Si la fuente solo aporta una fotografía del parque sin OS, diseñar un registro auditado de esa fotografía y su adaptación al modelo de consulta; **no inventar OS históricas ni despachos físicos**. Ese importador/adaptador no está implementado en esta entrega.
5. Para stock nuevo, ejecutar el circuito físico de recepción y validación. Cualquier homologación de evidencias históricas de QA requeriría una política de migración explícita y validada.
6. Hacer vista previa, detección de duplicados por tipo + serie, resolución de conflictos, comprobación de catálogos, aplicación transaccional y reporte de filas aceptadas/rechazadas. Registrar autor y fuente del lote.

Una misma serie textual en ambos maestros conserva dos identidades por tipo; las reglas de escaneo ambiguo existentes no se relajan. Ningún proceso de carga debe sobrescribir silenciosamente el historial.

## 6. Pruebas y builds

| Verificación | Resultado | Evidencia |
|---|---|---|
| Backend `npm test` | **56/56 aprobadas** | [Log](evidencias/modelo-definitivo/assets-backend-tests.log) |
| Frontend `npm test` | **60/60 aprobadas** | [Log](evidencias/modelo-definitivo/assets-frontend-tests.log) |
| Web `npm run build` | **Correcto** | [Log](evidencias/modelo-definitivo/assets-web-build.log) |
| Expo Android + iOS SDK 57 | **Correcto, salida 0** | [Log](evidencias/modelo-definitivo/assets-mobile-export.log), [bundles y firmas](evidencias/modelo-definitivo/mobile-artifacts.json) |
| E2E casos y maestro | **Aprobado** | [Resultado](evidencias/modelo-definitivo/assets-new-e2e.json) |
| E2E escaneo anterior | **Aprobado** | [Resultado](evidencias/modelo-definitivo/assets-scan-e2e.json) |
| E2E logística anterior | **Aprobado** | [Resultado](evidencias/modelo-definitivo/assets-logistics-e2e.json) |
| E2E Bridge anterior | **Aprobado** | [Resultado](evidencias/modelo-definitivo/assets-bridge-e2e.json) |

Cobertura de aceptación:

- **A–B:** sugerencias por bus para validador y consola, sin selección automática.
- **C:** búsqueda parcial por serie, selección explícita y envío de la identidad elegida.
- **D–E:** desconocidos, identidad ausente y antiguo intento de alta rechazados, sin cambios en maestro/caso/OS/Bridge; comprobados también desde el reporte de terreno.
- **F:** alta de maestro con atributos desconocidos NULL; no crea OS ni stock. Duplicados no sobrescriben datos.
- **G:** recepción inicial única bajo concurrencia; sin escaneo se rechaza. Recorrido completo Bodega → laboratorio → QA → Bodega antes de aparecer disponible.
- **H:** stock y activos operativos diferenciados; un activo registrado o en Bodega no se acepta como instalado en un bus.
- **I:** IN independientes, dos intervenciones por caso, concurrencia de despacho y números de transacciones revertidas no reutilizados.
- **J:** migración idempotente y firmas de datos históricos conservadas. E2E con clústeres aislados, eliminados al terminar.

Se conserva la regresión frontend del error 4xx de despacho visible dentro del modal. También se comprueba que cambiar bus/tipo invalida selección y que los errores de creación conservan el formulario.

Los E2E se ejecutan desde backend con `node verification/requirements_flow_e2e.mjs`, `equipment_scan_flow_e2e.mjs`, `logistics_nomenclature_e2e.mjs` y `bridge_correlation_e2e.mjs` (cada archivo bajo `verification/`).

Exportación desde `07_Mobile`: `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir ../tmp/assets-mobile`, con `EXPO_OFFLINE=1` y `CI=1`. Se verificó que ambos bundles incluyen los mensajes móviles definitivos. Esta exportación no constituye un APK/IPA firmado.

## 7. Guión manual actualizado

Usar un entorno de prueba con usuarios Admin, Logística y los roles de terreno/laboratorio/QA existentes. Preparar un bus con relaciones de operación conocidas para validador y consola, una serie nueva y equipos elegibles en Bodega. Sustituir los ejemplos por datos válidos; no alterar producción para fabricar estados.

1. Reiniciar API y recargar clientes. Confirmar las migraciones correspondientes. Anotar stock, En ruta y códigos de OS históricas para comparar al final.
2. Como Logística abrir **Ingreso de requerimientos**, elegir tipo VALIDADOR y bus `WXSS18`. Verificar que se propone el validador asociado con serie, modelo, marca, bus y estado. Confirmar que aún no está seleccionado ni se creó nada.
3. Cambiar a CONSOLA. Verificar que se propone la consola asociada y que se eliminó cualquier selección previa del otro tipo.
4. Volver al tipo requerido y buscar parte de su serie. Seleccionarla explícitamente con clic o flechas/Enter. Completar origen, referencia, fecha, intervención, terminal, operador, falla y observación.
5. Usar `AR-00123456` libre y confirmar. Verificar el caso, MV/MC/PDV/PDC correspondiente, ceros iniciales y correlación, sin cambios en datos técnicos del maestro.
6. Buscar una serie inexistente en otro formulario. Verificar **Activo no registrado en PMP Suite**, explicación de registro previo y ausencia de **Registrar activo y continuar**. Confirmación debe estar bloqueada.
7. Intentar cambiar bus o tipo después de seleccionar. Verificar que exige una nueva selección. Buscar un activo de otro bus: debe mostrar la incompatibilidad y bloquear el requerimiento.
8. Abrir **Gestión de activos** como Logística/Admin. Registrar tipo, serie nueva, origen, fecha y observación; dejar modelo/marca vacíos si se desconocen.
9. Verificar **Registrado**, datos desconocidos sin inventar y ausencia de bus instalado. Comprobar que no se creó caso/OS/Bridge, no aumentó stock ni En ruta y no hay aprobación QA.
10. Buscar ese activo desde Requerimientos. Puede consultarse el maestro, pero no reportar una falla de bus hasta que exista su relación operacional válida.
11. Desde Gestión seleccionar el activo nuevo e **Iniciar recepción pendiente**, indicando terminal/operador. Verificar una OS interna MV/MC pendiente, sin disponibilidad ni salida física. Un segundo intento debe continuar la OS existente, no duplicarla.
12. Intentar recibir desde Bodega sin escaneo. Verificar rechazo visible. Escanear físicamente en Bodega y completar la recepción vigente.
13. Recorrer asignación/entrada de laboratorio, validación, salida, recepción en Bodega, despacho QA y aprobación, usando los roles y escaneos existentes. Durante este tramo el activo aún no está disponible para instalación.
14. Escanear y recibir finalmente en Bodega tras QA. Verificar que entonces aparece en **Inventario de equipos → Listos para instalación**.
15. Abrir **Despacho por escaneo** para un caso existente. Seleccionar contexto/técnico y leer un equipo elegible. Verificar que ni seleccionar técnico ni escanear crea una IN o incrementa En ruta.
16. Confirmar despacho. Verificar nueva `IN-` con correlativo PMP independiente, caso y OS origen explícitos, salida física y En ruta. Repetir con otro equipo para el mismo caso: otra IN independiente sin renombrar la primera.
17. En Mobile del técnico asignado, completar la instalación de la IN. Verificar operación del activo, salida de En ruta y preservación del historial de reparación del activo retirado.
18. Buscar la serie instalada: historial de toda su vida. Buscar AR/caso: solo intervenciones de esa necesidad. Verificar que una mantención posterior de esa serie en otro caso no fusiona ambas vistas.
19. Como terreno, intentar reportar una serie desconocida desde web/móvil. Debe mostrarse la explicación funcional y no crearse maestro. Confirmar que otros roles no acceden a Gestión de activos ni amplían sus permisos.
20. Comparar códigos históricos y revisar KPI: maestro registrado, stock, En ruta y En operación permanecen separados. Revisar conflictos visibles sin pérdida de datos.

## 8. Alcance y pendientes

Bridge sigue exclusivamente como correlación; no se tocaron sus acciones operacionales retiradas. Se conservan el escaneo físico, FSM, QA y numeración independiente de IN. No se agregó Docker ni se cambió Expo SDK.

El recorrido con lector real y teléfono queda pendiente de ejecución manual. Las pruebas automatizadas, transacciones, builds y exportación están ejecutadas. La carga masiva inicial queda diseñada y documentada; no se presenta como importador implementado.
