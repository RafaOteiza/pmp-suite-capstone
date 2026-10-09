# Trabajo técnico de laboratorio — auditoría y cierre

## Corrección vigente — responsabilidades Laboratorio/Bodega (2026-10-07)

Esta sección **sustituye** la decisión anterior de mostrar stock al técnico y consumir repuestos al cierre técnico, así como el uso de métodos de prueba libres. Las evidencias fechadas de la entrega anterior se conservan más abajo como históricas; no se reinterpretan como ejecución de estas reglas nuevas.

### Responsabilidades y permisos

- Técnico de laboratorio: trabajo propio, diagnóstico, intervención, pruebas, evidencia PoD, avances, cierre y solicitud descriptiva por necesidad PoD. No consulta inventario ni decide ID/cantidad/stock.
- Admin y logística: resuelven la solicitud contra inventario y confirman la entrega física. Gerente mantiene consulta de solo lectura conforme a permisos vigentes.
- `/api/lab/parts` ya no permite técnico; tampoco puede usar directamente los endpoints de inventario o entrega de Bodega.
- `/api/lab/finish` no actualiza repuestos; rechaza intentos de declarar consumos nuevos. Cambiar un repuesto puede describirse como intervención sin administrar inventario.

### Solicitud PoD y entrega

1. La vista muestra Solicitud a Bodega cuando hay PoD documentado o diagnóstico PoD, y requiere indicar expresamente que se necesita un repuesto.
2. Contexto readonly de OS, tipo+serie, modelo, AR, técnico y diagnóstico. El técnico informa únicamente necesidad y motivo.
3. Backend verifica propiedad de OS, rol, recepción/etapa, PoD con categoría/observación/fotografía válida y ausencia de otra solicitud pendiente. No infiere PoD del prefijo MV/MC/PDV/PDC.
4. Se reutiliza PoD del retiro físico confirmado, del ciclo de Laboratorio o de una solicitud PoD auditada. No se exige volver a escribir datos conocidos. La evidencia de la solicitud queda asociada a su avance y ciclo.
5. Solicitar guarda avance y pasa a 9; no mueve inventario. La solicitud pendiente bloquea el cierre incluso si un estado inconsistente indicara 5.
6. Bodega elige pieza y cantidad, verifica categoría y stock, y confirma la entrega. **Este es el único momento nuevo de salida de inventario**.
7. Transacción con bloqueos de OS → solicitud → repuesto. Descuenta stock, registra evento de entrega con ID/nombre/cantidad, stock anterior/final, OS, solicitud, responsable y fecha; marca solicitud entregada y vuelve a 5 solo si no quedan bloqueantes.
8. Repetir entrega equivalente no descuenta ni registra otro movimiento; una entrega incompatible devuelve conflicto. Repetir una entrega tras cerrar no reabre la OS.
9. Cerrar posteriormente no consume otra vez. Termina en 10, pendiente de logística; no confirma salida ni recepción física en QA/Bodega.

### Pruebas y cierre

- Catálogo fijo exacto: **Manual** y **Test MK**. Selector inicialmente vacío, resultado inicialmente Pendiente. No existe Otro ni método libre ni integración automática Test MK.
- Puede registrarse una o más ejecuciones; no se exigen ambos métodos.
- Backend rechaza nuevos nombres arbitrarios. Pendiente/Rechazada se guardan, pero bloquean cierre.
- NFF conserva observación y pruebas aprobadas sin reparación/pieza artificial.
- PoD mantiene categoría, observación y foto válida; no renombra MV/MC ni crea una nueva OS.
- Avance incompleto puede guardarse. Cierre valida diagnóstico, intervención cuando corresponde, pruebas y resultado, sin exigir inventario.

### Datos legacy: preservación explícita

- No se ejecutó migración ni corrección masiva de datos. Consumos y bitácoras anteriores conservan su significado original.
- Avances viejos se proyectan a la vista nueva: las piezas históricas no se exponen como gestor de inventario; los nombres libres de pruebas aparecen en una sección readonly con su resultado original.
- Se conservan los eventos originales intactos. Al guardar otra versión, el servicio arrastra su información legacy en metadata, sin inventar movimientos.
- Las pruebas legacy no se convierten automáticamente a Manual/Test MK ni a Aprobada. Para cerrar un trabajo vigente se registra una ejecución nueva del catálogo fijo.
- Una solicitud ya entregada bajo la política anterior sigue entregada: reintentar no genera descuento retroactivo.
- Una solicitud legacy todavía pendiente puede atenderse ahora: Bodega elige explícitamente pieza/cantidad y confirma un movimiento nuevo con fecha actual. No se inventa PoD retrospectivo para esa solicitud histórica.
- Cierres históricos repetidos con el mismo contenido se reconocen sin ejecutar consumo ni alterar su estado.

### UX y componentes reutilizados

Resumen compacto y readonly, OS en PageHeader, eliminación del breadcrumb manual duplicado, falla solo en el contexto del caso, secciones sin estirar su altura, mensajes vacíos inline, Guardar avance secundario y Finalizar trabajo principal. Corrección compartida de “1 día restante” sin alterar umbral ni cálculo SLA.

Reutiliza PageHeader, StatusBadge, FeedbackBanner, botones, inputs, selects, tablas, InlineFeedback y paneles del sistema. EmptyState permanece en listados de Bodega, no como tarjeta gigante dentro del trabajo. Iconos Lucide y tokens existentes; sin modales.

### Archivos modificados en esta corrección

| Archivo | Cambio |
|---|---|
| `03_Backend/pmp-api/src/services/labWork.js` | Retira consumo/inventario técnico; métodos fijos, solicitudes PoD descriptivas, contexto y protección legacy. |
| `03_Backend/pmp-api/src/services/warehouseParts.js` | Entrega transaccional exclusiva de Bodega con descuento y auditoría idempotentes. |
| `03_Backend/pmp-api/src/routes/lab.routes.js` | Restringe acceso técnico al catálogo de existencias. |
| `03_Backend/pmp-api/src/routes/bodega.routes.js` | Conecta entrega transaccional y contexto de solicitudes. |
| `03_Backend/pmp-api/test/lab.work.test.js` | Validaciones de métodos, resultados, PoD y cierre sin consumos. |
| `03_Backend/pmp-api/verification/lab_work_scenarios.mjs` | Permisos, entrega/concurrencia, cierre sin stock y legacy en PostgreSQL efímero. |
| `03_Backend/pmp-api/verification/requirements_scenarios.mjs` | Usa Manual en el cierre nuevo del escenario integral. |
| `04_Frontend/src/components/RepairWorkForm.tsx` | Elimina inventario, solicitud contextual PoD, métodos fijos, estados y lectura legacy. |
| `04_Frontend/src/pages/LabWorkPage.tsx` | Resumen compacto, contexto y navegación única. |
| `04_Frontend/src/utils/labTechnicalWork.ts` | Contrato técnico y validación de cierre sin inventario. |
| `04_Frontend/src/utils/sla.ts` | Singular/plural del texto de días restantes. |
| `04_Frontend/src/pages/BodegaRepuestosPage.tsx` | Identifica pieza y cantidad antes de confirmar entrega física. |
| `04_Frontend/src/api/bodega.ts` | Payload de entrega y contexto de solicitud. |
| `04_Frontend/src/components/AssetTimeline.tsx` | Lectura de repuestos históricos sin afirmar consumos en cierres nuevos. |
| `04_Frontend/src/styles/pages.css` | Resumen responsive, altura según contenido y retiro de estilos de inventario técnico. |
| `04_Frontend/test/requirements.frontend.test.mjs` | UX, restricciones, métodos, legacy, SLA y atención en Bodega. |
| `04_Frontend/test/operational-pages.browser.mjs` | Renderizados de nueva UX y entrega, mocks que prohíben catálogo técnico. |
| `08_Pruebas/Laboratorio_Trabajo_Tecnico_Integral.md` | Política vigente, transición y evidencia anterior preservada. |

### Verificación de esta corrección


| Verificación actual | Resultado | Evidencia |
|---|---|---|
| Backend npm test | **74/74 aprobadas** | tmp/lab-bodega-backend.log |
| Frontend npm test | **154/154 aprobadas** | tmp/lab-bodega-frontend.log |
| E2E integral PostgreSQL efímero | **Aprobado** | tmp/lab-bodega-e2e.log |
| TypeScript | **Aprobado**, sin errores | tmp/lab-bodega-typescript.log |
| Vite build | **Aprobado** | tmp/lab-bodega-build.log |
| Chrome, claro/oscuro a 320/375/390/768/1024/1440 px | **180 renderizados aprobados**, sin overflow del documento, modales ni bloqueo de scroll | tmp/lab-bodega-browser.log, tmp/lab-bodega-qa/report.json |

La cobertura verifica métodos exactos y resultados pendientes/rechazados, avance persistente, NFF, PoD en MV, solicitud con evidencia desde Laboratorio y desde Terreno, inventario inaccesible al técnico, stock intacto hasta entregar, entrega concurrente de una solicitud y competencia entre solicitudes diferentes, stock insuficiente, cierre posterior sin segundo descuento, prohibición de reabrir por reintento y conservación de avances/cierres/entregas legacy. Las regresiones previas de recepción/asignación/SLA/QA siguen incluidas en el runner integral.

Se inspeccionaron visualmente el trabajo normal en escritorio claro, solicitud PoD en móvil oscuro y entrega de Bodega en ambos tamaños/temas. Se reutilizan componentes existentes y CSS de PMP. Los renderizados utilizan fixtures y API simulada; no dispositivos físicos ni Test MK real.

**MV-87126356 y la base original no fueron modificadas.** El runner confirmó **sourceDatabaseUnchanged = true** y **temporaryClusterRemoved = true**. No quedan fallos automatizados pendientes en las suites ejecutadas. El despliegue y una prueba con usuarios/dispositivos reales no forman parte de estas verificaciones.

### Comprobación manual en ambiente de pruebas

1. Abrir una OS de prueba recibida/asignada: comprobar resumen único y ausencia de stock, catálogo y consumo. Abrir/cerrar no escribe.
2. Registrar diagnóstico y Cambio de Repuesto como acción, Manual o Test MK con resultado pendiente; guardar y volver. Debe recuperar datos y mantener cierre bloqueado.
3. Aprobar una prueba y completar resultado. Cerrar un trabajo normal sin piezas de inventario: estado 10, sin descuento.
4. En una MV de prueba, documentar PoD con categoría/nota/foto, marcar necesidad, describir componente/motivo y solicitar. Estado 9, avance conservado, stock intacto.
5. Entrar como logística: Atender solicitud, seleccionar pieza y cantidad, comprobar stock y confirmar entrega física. Debe registrar una salida y volver a 5 cuando no quedan pendientes.
6. Reintentar la misma entrega y cerrar posteriormente: no debe descontar otra vez ni reabrir el trabajo.
7. Consultar un avance antiguo: sus pruebas anteriores deben permanecer readonly sin renombrar ni aprobarse automáticamente. Registrar nueva ejecución Manual/Test MK para el cierre vigente.
8. Revisar claro/oscuro y tamaños móvil/escritorio. No ejecutar este guión sobre MV-87126356.


---

## Archivo histórico — entrega anterior sustituida en los puntos indicados

Todo el contenido siguiente corresponde a la entrega anterior. Sus resultados son históricos y las decisiones sobre inventario técnico, consumo al cierre y métodos libres ya no son vigentes.


## Auditoría previa (2026-10-07)

- Página principal `/mi-carga/:osId`; RepairModal retirado. RepairWorkForm reutiliza /move, /finish y /request-part.
- Mi carga distingue 4 diagnóstico, 5 reparación / 9 espera, 10 terminado pendiente de logística. Validadores/Consolas son consultas filtradas con búsqueda y el mismo acceso al trabajo; conservarlas como consultas secundarias, sin crear otro proceso.
- /finish registra texto en registro_reparaciones y cambia a 10. No consume stock y no admite detalle estructurado ni borrador.
- registro_reparaciones ya tiene prueba_realizada y resultado_prueba. flujo_eventos permite metadata JSON, usuario y fecha; se reutilizará para avances explícitos/versiones y detalle técnico por ciclo. Sin tablas paralelas ni migración.
- repuestos: id, nombre, categoria, stock, stock_critico. No existe código de fabricante ni matriz de modelos compatibles: se mostrará ID interno y categoría real, sin inventar SKU/compatibilidad.
- solicitudes_repuestos guarda solicitud, autor, comentario y estado. La entrega devuelve a 5; no descuenta stock. Se mantendrá el consumo únicamente al cierre técnico, nunca al solicitar/entregar/guardar.
- No se encontró persistencia parcial. Guardar avance deberá conservar el FSM/stock/ubicación.
- Catálogos actuales de fallas por tipo y acciones se conservan. Pruebas de Estrés se traslada a pruebas; las demás pruebas se describen como técnicas genéricas sin catálogo hardware inventado.
- La evidencia fotográfica existente valida hasta tres imágenes con sharp y audita origen. Laboratorio distinguirá archivo adjunto de cámara, manteniendo la regla de terreno.
- Salida de laboratorio actual: 10 → despacho a Bodega (11) → recepción Bodega (3) → despacho QA (6) → escaneo QA para procesar. El cierre técnico no crea recepción ni movimiento. El estado 6 es el estado existente de asignación/despacho hacia QA; el procesamiento exige nueva evidencia física QA. No se rediseña esa FSM.
- Se reutilizan PageHeader, StatusBadge, FeedbackBanner, EmptyState, tablas, botones y tokens. Sin modales.

## Decisiones de implementación

Avance explícito persistido en eventos, con revisión optimista para prevenir sobrescritura entre pestañas. Ciclo identificado por la última salida Bodega→Laboratorio; reingresos no recuperan avances de ciclos anteriores. Cierre transaccional con bloqueo de OS y repuestos ordenados por ID, validación de stock y evento definitivo único por ciclo. Reintento equivalente devuelve el cierre existente sin consumir nuevamente. Resultados no cerrables (espera/revisión/no reparable) se guardan como avance; no se inventa una disposición ni estado nuevo. NFF cierra sin reparación artificial con pruebas aprobadas y observación. PoD requiere categoría, nota y foto validada, conservando el código MV/MC.


## Flujo entregado

1. Abrir `/mi-carga/:osId` consulta la carga propia y el avance; no escribe. Permiso de técnico y recepción física vigentes se verifican en backend.
2. Iniciar trabajo cambia 4 (diagnóstico) → 5 (reparación) y registra autor/fecha.
3. Diagnóstico independiente de falla reportada; catálogo de fallas por tipo. Intervenciones independientes de pruebas.
4. Guardar avance persiste en `flujo_eventos` (`LAB_AVANCE_GUARDADO`), con usuario, fecha, tipo+serie y revisión. Se recupera por OS/ciclo después de salir, recargar o volver a autenticarse con el mismo usuario. No depende de localStorage. La prueba automatizada simula nuevas lecturas/montajes; no ejecuta un login Firebase real.
5. Solicitar repuesto guarda primero el avance, solicita ID/cantidad/motivo y cambia a 9. Bodega recibe nombre, cantidad/motivo y solicitante. La entrega vuelve a 5; repetirla no reabre una OS cerrada. No consume stock.
6. Cerrar requiere diagnóstico, resultado explícito, pruebas completas/aprobadas y requisitos específicos de reparación, NFF o PoD. Cambio de repuesto requiere repuesto o justificación. Pendiente de repuesto, revisión adicional y no reparable pueden guardarse, pero no se envían automáticamente a QA.
7. Cierre transaccional: bloquea OS y repuestos, comprueba categoría/stock, descuenta cantidades, escribe bitácora y evidencia estructurada, cambia a 10. Reintentos equivalentes no duplican consumo ni bitácora. Un fallo de stock revierte toda la operación.
8. La OS queda en **Listos para QA** en Mi carga. Mantiene ubicación de Laboratorio; el cierre no es salida ni recepción QA. Se conserva el recorrido logístico existente y su exigencia de escaneo QA.
9. Historial con títulos funcionales y detalle expandible de diagnóstico, acciones, repuestos, pruebas y resultado. Eventos secundarios del mismo cierre y versiones de avances se agrupan visualmente conservando los registros persistidos.

### NFF y PoD

- NFF: observación técnica y pruebas aprobadas, sin acción ni repuesto artificial.
- PoD: diagnóstico/resultado coherentes, categoría, observación y al menos una fotografía validada. Reutiliza normalización de evidencia con límite de tres fotos de 1 MB; el adjunto web conserva origen **ARCHIVO**, nunca se declara cámara sin respaldo. Terreno conserva su origen CAMARA por defecto.
- La OS MV/MC original no se renombra. No se crea automáticamente PDV/PDC.
- Los códigos internos de resultado se presentan con etiquetas funcionales; no son nuevos estados FSM.

### Contrato técnico

- `GET /api/lab/work/:codigoOs`: avance/revisión del ciclo y cierre si existe.
- `PUT /api/lab/work/:codigoOs`: `{revision, trabajo}`; conflicto 409 ante revisión desactualizada.
- `POST /api/lab/finish`: `{codigo_os, revision, trabajo}`; exige trabajo estructurado.
- `POST /api/lab/request-part`: `{codigo_os, repuesto_id, cantidad, motivo}`.
- `PUT /api/lab/move`: conserva inicio semántico a reparación.
- Cargas fotográficas de hasta 5 MB se procesan después de autenticación/permisos; las demás rutas conservan su límite existente.
- Sin tablas, migraciones, permisos o estados nuevos. Se reutilizan `registro_reparaciones`, `solicitudes_repuestos`, `repuestos` y `flujo_eventos`.
- El ciclo se identifica con la última salida Bodega→Laboratorio, únicamente como clave de correlación de trabajo. **No modifica la fuente de ingreso/SLA**, que continúa siendo la recepción física en Laboratorio.
- Los registros históricos sin salida usan clave de trabajo `legacy`; este identificador no evita las validaciones de recepción física.

## Archivos de esta entrega

No incluye modificaciones previas que ya estaban presentes en el árbol de trabajo.

| Archivo | Cambio |
|---|---|
| `03_Backend/pmp-api/src/services/labWork.js` | Servicio transaccional único de avance, inicio, cierre, solicitud y consumo por ciclo. |
| `03_Backend/pmp-api/src/routes/lab.routes.js` | Conecta endpoints al servicio; lectura de avances y catálogo con piezas sin stock para solicitudes. |
| `03_Backend/pmp-api/src/app.js` | Deriva el parseo de fotos a rutas autenticadas de Laboratorio. |
| `03_Backend/pmp-api/src/routes/bodega.routes.js` | Datos de solicitud y entrega idempotente sin reabrir cierres ni consumir stock. |
| `03_Backend/pmp-api/src/services/terrainWithdrawalEvidence.js` | Orígenes permitidos configurables, preservando la restricción por defecto de terreno. |
| `03_Backend/pmp-api/src/services/withdrawalTimeline.js` | Títulos legibles de eventos técnicos. |
| `03_Backend/pmp-api/package.json` | Incluye nueva suite unitaria de trabajo técnico. |
| `03_Backend/pmp-api/test/lab.work.test.js` | Diagnóstico, NFF, PoD, fotos y validaciones de cierre. |
| `03_Backend/pmp-api/test/rbac.phase1.test.js` | Verifica identidad autorizada en el servicio reutilizado. |
| `03_Backend/pmp-api/test/equipment.scan.test.js` | Ajusta comprobación de la validación física en rutas. |
| `03_Backend/pmp-api/verification/lab_work_scenarios.mjs` | E2E aislado de persistencia, permisos, stock, concurrencia, NFF, PoD y solicitudes. |
| `03_Backend/pmp-api/verification/requirements_scenarios.mjs` | Integra escenarios técnicos y actualiza payload de cierre al contrato estructurado. |
| `04_Frontend/src/components/RepairWorkForm.tsx` | Secciones B–G, avance persistente, partes/cantidades, pruebas, PoD y solicitud inline. |
| `04_Frontend/src/pages/LabWorkPage.tsx` | Resumen A, contexto conocido y feedback de espera/cierre. |
| `04_Frontend/src/utils/labTechnicalWork.ts` | Tipos, etiquetas y requisitos visibles de cierre. |
| `04_Frontend/src/data/fallas.ts` | Retira Pruebas de Estrés de las acciones de reparación. |
| `04_Frontend/src/components/LabEquipmentView.tsx` | Explicita propósito de consulta secundaria por tipo. |
| `04_Frontend/src/api/bodega.ts` | Tipos de datos conocidos de solicitudes. |
| `04_Frontend/src/pages/BodegaRepuestosPage.tsx` | Muestra repuesto, cantidad/motivo y técnico antes de entregar. |
| `04_Frontend/src/components/AssetTimeline.tsx` | Detalle técnico legible y evidencia con texto genérico. |
| `04_Frontend/src/utils/traceabilityPresentation.ts` | Etiquetas y agrupación visual por ciclo sin borrar auditoría. |
| `04_Frontend/src/styles/pages.css` | Distribución responsive con tokens y componentes PMP existentes. |
| `04_Frontend/test/requirements.frontend.test.mjs` | Persistencia, errores, NFF, PoD, espera, solicitudes e historial agrupado. |
| `04_Frontend/test/operational-pages.browser.mjs` | Renderizados e interacción de trabajo, guardado/retorno, repuestos y PoD con mocks. |
| `08_Pruebas/Laboratorio_Trabajo_Tecnico_Integral.md` | Auditoría, decisiones, alcance y evidencias actuales. |

## Guión manual breve (ambiente de pruebas)

1. Usar una OS de prueba físicamente recibida en Laboratorio y asignada al técnico autenticado. Abrir desde Mi carga; verificar contexto y ausencia de escrituras por abrir.
2. Iniciar trabajo. Seleccionar diagnóstico/falla, intervenciones, repuesto/cantidad y una prueba. Guardar avance. Comprobar mismo stock y estado 5.
3. Volver a la bandeja, recargar y abrir nuevamente. Verificar recuperación. Repetir cerrando/iniciando sesión con el mismo usuario.
4. Solicitar una pieza indicando cantidad/motivo. Verificar estado 9, avance conservado y cierre bloqueado. Confirmar entrega desde Bodega de pruebas; volver al trabajo en estado 5.
5. Completar pruebas aprobadas y resultado Reparado. Cerrar; comprobar estado 10, Listos para QA, consumo único y detalle de historial. El equipo no debe aparecer como recibido físicamente en QA por este cierre.
6. Con otra OS de prueba, registrar NFF + observación + prueba aprobada sin acciones/repuestos; debe permitir cerrar.
7. Con otra OS de prueba, registrar PoD; sin foto debe bloquear. Adjuntar foto válida, categoría y nota; cerrar conservando MV/MC.
8. Revisar claro/oscuro y ancho móvil/desktop. No usar MV-87126356 para acciones de esta prueba.


## Verificación ejecutada — 2026-10-07

| Verificación | Resultado | Evidencia local |
|---|---|---|
| Backend `npm test` | **73/73 aprobadas**, sin omitidas | `tmp/lab-integral-backend.log` |
| Frontend `npm test` | **150/150 aprobadas**, sin omitidas; incluye pruebas Mobile existentes sin modificar Mobile | `tmp/lab-integral-frontend.log` |
| E2E `node verification/requirements_flow_e2e.mjs` | **Aprobado**, incluido flujo previo y escenarios técnicos nuevos | `tmp/lab-integral-e2e.log` |
| TypeScript `tsc --noEmit --incremental false` | **Aprobado**, sin errores | `tmp/lab-integral-typescript.log` |
| Vite build | **Aprobado** | `tmp/lab-integral-build.log` |
| Chrome con APIs simuladas | **168 renderizados aprobados**, cero conexiones al backend | `tmp/lab-integral-browser.log`, `tmp/operational-pages-qa/report.json` |

### Cobertura comprobada

- Apertura/lectura sin escrituras, inicio explícito, propiedad de OS y permisos por rol.
- Guardado/restauración en nuevas lecturas y montajes, control de revisión, mismos campos/estado/stock de OS después de guardar, guardar idéntico sin crear otro evento.
- Diagnóstico confirmado/diferente, NFF sin acción ni repuesto, PoD con foto válida y código MV intacto.
- Rechazo de pruebas pendientes/rechazadas, resultado pendiente, cantidad inválida, cambio de repuesto sin pieza/justificación y foto inválida.
- Stock sin consumo al seleccionar/guardar/solicitar/entregar; descuento al cierre; cierres simultáneos/reintentos sin duplicación; rechazo de stock insuficiente y rollback de un consumo parcial cuando falla una segunda pieza.
- Solicitud, espera y entrega; cierre bloqueado en espera; entrega repetida después de cierre no vuelve a reparación.
- Cierre en 10/ubicación Laboratorio, presencia en Listos para QA, historial legible y nuevo ciclo sin arrastrar avance/cierre anterior.
- Pruebas de custodia existentes siguen pasando, incluida recepción física de Laboratorio antes de asignar/iniciar y escaneo QA antes de procesar.
- Claro/oscuro a 320, 375, 390, 768, 1024 y 1440 px. Sin overflow horizontal, modales ni bloqueo de documento en las capturas.
- Revisión visual de escritorio claro y móvil oscuro: resumen conocido, diagnóstico, intervención, tabla de repuestos adaptada, pruebas, PoD y acciones de cierre.

### Componentes reutilizados

`PageHeader`, `StatusBadge`, `FeedbackBanner`, `EmptyState`, `StatCard` de la bandeja existente; paneles, tablas, botones `btn`, inputs `input`, etiquetas `field-label`, iconos Lucide y tokens de tipografía, espaciado, bordes y color. No se agrega biblioteca ni sistema visual alternativo.

### Integridad y alcance de la evidencia

`sourceDatabaseUnchanged = true` y `temporaryClusterRemoved = true`, comprobados por el runner E2E con firma de tablas de la base fuente antes/después y clúster efímero separado. **MV-87126356 y la base real no fueron modificadas.** Las acciones y cierres probados pertenecen exclusivamente a fixtures aisladas.

Los renderizados usan Chrome y API simulada; no representan uso sobre la OS real ni una validación en dispositivos físicos. No se ejecutó login/logout Firebase real: se verificaron persistencia backend y recuperación al remontar/volver a la página. Los resultados fechados de informes anteriores permanecen históricos.

No se editaron Capstone v2.0, Mobile, Expo, Docker, Bridge operacional/correlación, migraciones, reglas de recepción ni umbrales SLA.
