# Nomenclatura y representación logística

Contrato actualizado documentalmente el 23 de septiembre de 2026 conforme a la [línea base Capstone v2.0](../Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_VIGENCIA_v2.0.md). Los resultados de la entrega original se conservan más abajo como históricos; no se ejecutaron pruebas nuevamente en esta revisión.

## Comportamiento final

| Concepto | Representación |
|---|---|
| Equipos en operación | Misma denominación en menú, título, breadcrumb y dashboard. Activos con bus registrado y sin OS activa, según el criterio de la vista existente; no ofrece asignación ni se utiliza como stock. |
| Disponible para instalación | Inventario de equipos → Listos para instalación. Stock inicial recibido/conforme sin OS, o stock reparado aprobado por QA y recibido en Bodega, sin intervención/asignación incompatible. No depende exclusivamente del estado 7. |
| Asignado a técnico | Existe técnico asociado a una OS en fase de salida, sin evidencia de despacho físico. Se distingue del contador En ruta, incluso si la OS conserva el ID de estado 1. |
| En ruta | Despacho físico confirmado con SALIDA_BODEGA_TERRENO y evidencia contextual del origen de stock, pendiente de instalación o retorno. Para stock inicial, la lectura se vincula al activo sin una OS previa. |
| Diagnóstico, reparación y QA | Conservan los IDs, transiciones y controles operacionales. QA se representa en los gráficos como una etapa independiente y no se cuenta como equipo en operación. |

Los códigos `ASIGNADO_TECNICO`, `DISPONIBLE_INSTALACION` y similares son nombres derivados para consulta: no se agregan estados al catálogo ni se migran órdenes existentes.

## Asignación y despacho

El flujo vigente es **Despacho por escaneo**: definir caso/contexto, tomar un activo elegible e identificarlo físicamente. La validación revisa stock inicial conforme o reparado aprobado, ubicación BODEGA, identidad y ausencia de incompatibilidades. La consulta manual no sustituye evidencia física.

Solo confirmar despacho crea `IN-xxxxxx` con correlativo PMP independiente, relaciona caso y origen de stock, asigna técnico y registra SALIDA_BODEGA_TERRENO atómicamente. Seleccionar técnico, consultar o escanear no crea IN ni aumenta En ruta. Recibir desde QA tampoco crea una IN anticipada. El comando heredado `PUT /api/bodega/asignar` y su modal permanecen para los registros históricos compatibles; no definen la creación de nuevas instalaciones.

Gestión de activos solo registra el maestro y ALTA_ACTIVO. Requerimientos requiere un activo existente relacionado con el bus. La recepción inicial exige escaneo BODEGA y conformidad explícita; registra RECEPCION_INICIAL y HABILITADO_INSTALACION sin OS, bus ficticio ni reparación/QA inventada. Su historial por tipo + serie incorpora los eventos iniciales y las OS posteriores. Bridge continúa exclusivamente correlacional.

Las asignaciones históricas sin evento de despacho permanecen **sin salida física confirmada**: no se inventan eventos retrospectivos. El esquema actual requiere migraciones 003–006 y sus prerrequisitos; la entrega original de nomenclatura no requirió una migración propia. Se conserva Expo SDK 57 y Docker queda fuera del alcance.

## Dashboard

- Logística muestra por separado «Asignados a técnico» y «Equipos en ruta».
- «En ruta» se calcula con evidencia de salida, no por `estado_id = 1` ni por la presencia de un técnico.
- Los indicadores de equipos cuentan activos distintos por tipo y serie.
- El total y la distribución que cuentan órdenes se rotulan «Órdenes activas», evitando confundir OS con equipos del inventario.
- El dashboard ejecutivo y la vista de operación comparten el criterio de activos en operación. Se eliminó el cálculo por resta de cantidades de OS al total de activos, que podía contabilizar equipos en QA como operativos.
- El inventario disponible y el indicador de disponibilidad usan el mismo criterio de consulta.
- La API de órdenes devuelve la representación derivada para mantener nombres coherentes en web y móvil, sin cambiar `estado_id` ni las acciones autorizadas.

## Registro histórico de la entrega original

Las listas de archivos, conteos, escenarios y resultados siguientes describen la entrega de nomenclatura anterior a casos/recepción inicial. Se preservan tal como fueron registrados y no acreditan una nueva ejecución ni el contrato completo v2.0. Los resultados más recientes están en [Recepción inicial sin OS](RECEPCION_INICIAL_SIN_OS.md).

### Archivos modificados en la entrega original

### Backend

- `03_Backend/pmp-api/src/services/logisticsPresentation.js` — nuevo; criterios compartidos de presentación, disponibilidad, asignación, salida y operación.
- `03_Backend/pmp-api/src/routes/bodega.routes.js` — evento del despacho existente, consulta de disponibles y KPI separados.
- `03_Backend/pmp-api/src/routes/dashboard.routes.js` — clasificación y contadores coherentes con las vistas.
- `03_Backend/pmp-api/src/routes/os.routes.js` — nombres derivados en las consultas de órdenes para web/móvil.
- `03_Backend/pmp-api/verification/logistics_nomenclature_e2e.mjs` — nueva integración sobre PostgreSQL aislado.

### Frontend

- `04_Frontend/src/app/navigation.ts` — «Equipos en operación» también para logística.
- `04_Frontend/src/components/TopBar.tsx` — breadcrumbs de operación e inventario.
- `04_Frontend/src/components/ScanOperationalActions.tsx` — textos de asignación y despacho; reglas y llamadas de escaneo intactas.
- `04_Frontend/src/pages/BodegaModulosPage.tsx` — inventario, disponibilidad y confirmación explícita del despacho.
- `04_Frontend/src/pages/BodegaDashboardPage.tsx` — separación de asignados/en ruta y etiquetas de órdenes activas.
- `04_Frontend/src/pages/DashboardPage.tsx` — nombres de operación y disponibilidad.
- `04_Frontend/src/pages/EquiposOperativosPage.tsx` — estado «En operación», clave por tipo/serie y ninguna presentación como asignable.
- `04_Frontend/src/utils/formatters.ts` — etiquetas de estados derivados.
- `04_Frontend/src/api/bodega.ts` y `src/api/dashboard.ts` — tipos de los indicadores separados.
- `04_Frontend/test/role-experience.frontend.test.mjs` — comprobación de nombres y rutas conservadas.

### Móvil

- `07_Mobile/src/screens/MyOrdersScreen.js` — presenta los nombres derivados de la API de forma legible. Las acciones móviles permanecen iguales.

### Evidencia

- Este informe y `08_Pruebas/evidencias/nomenclatura-logistica/`.
- Los cambios anteriores del repositorio no forman parte de esta lista; no se revirtieron.

## Pruebas ejecutadas en la entrega original — histórico

| Validación | Resultado |
|---|---|
| Backend, `npm test` | 49/49 aprobadas |
| Frontend, `npm test` | 43/43 aprobadas |
| Web, `npm run build` | TypeScript y Vite aprobados |
| Móvil, exportación Expo Android e iOS | Bundles Hermes generados correctamente |
| `node verification/logistics_nomenclature_e2e.mjs` | Flujo HTTP y PostgreSQL aislado aprobado; base original intacta |

La integración recorre terreno, recepción, laboratorio, reparación, QA, retorno a bodega, despacho e instalación. Conserva las verificaciones previas de escaneo y valida adicionalmente:

1. Equipo aprobado recibido en bodega: visible en Listos para instalación.
2. Solo asignación de técnico, todavía en bodega: En ruta = 0; Asignados = 1; no aparece como libre para asignar.
3. OS con estado 1 y técnico, sin evento de salida: En ruta = 0 y nombre `ASIGNADO_TECNICO` en la API compartida por web/móvil.
4. Solo escaneo de bodega: En ruta = 0.
5. Despacho físico confirmado con el comando existente: En ruta = 1; Asignados sin salida = 0; un evento de salida registrado.
6. Instalación confirmada: En ruta = 0; En operación = 1; stock disponible = 0.
7. Vista de operación y KPI ejecutivo coinciden.
8. Lectura de elegibilidad: acepta aprobación QA o instalación proveniente del circuito QA; excluye rechazo, ubicación distinta de bodega, etapa QA y equipo ya asignado.

No se ejecutó una prueba visual en teléfono físico. La exportación Expo no equivale a APK/IPA firmado.

## Comprobación manual breve

Guion vigente para una futura ejecución; no representa pruebas realizadas en esta actualización.

1. Con logística, abrir «Equipos en operación» y verificar el mismo título/breadcrumb y la ausencia de acciones de asignación.
2. Abrir «Inventario de equipos → Listos para instalación» y comprobar que allí se ofrece la salida de equipos elegibles de bodega.
3. Abrir Despacho por escaneo y definir contexto/técnico sin confirmar: En ruta permanece igual.
4. Tomar y escanear un equipo de stock inicial conforme o reparado aprobado: el contador sigue igual y todavía no hay IN nueva.
5. Confirmar la salida física: verificar IN independiente, SALIDA_BODEGA_TERRENO, incremento en En ruta y retiro del pool disponible.
6. Confirmar la instalación en el circuito normal: verificar la disminución de En ruta y su presentación en Equipos en operación.
7. Consultar una asignación anterior sin evidencia de salida: debe aparecer como asignada/sin salida confirmada y no incrementar En ruta.
