# QA — despacho, recepción y asignación separados

Fecha de esta entrega: 2026-10-07. Este informe no sustituye ni reescribe resultados históricos.

## Causa y corrección

El handler Bodega `PUT /dispatch-qa` exigía un `qa_usuario_id`, guardaba la asignación
junto con el despacho y ubicaba inmediatamente el equipo en QA. La estación, a su
vez, exigía que quien recibía ya tuviera la OS asignada. El estado 6 se trataba como
carga QA sin comprobar custodia. Se separaron despacho, recepción, coordinación e
inicio/control usando las tablas, eventos y estados existentes.

La recepción desde Laboratorio tenía otra divergencia: la bandeja llamaba `receive`
directamente, mientras la página operacional solo admitía estado 2. Ahora los
retornos en estado 11 usan esa misma página y los mismos endpoints de evidencia y
confirmación. Una lectura previa del origen nunca sustituye esa evidencia.

## Caso real e integridad

Consulta mediante `BEGIN READ ONLY` / `ROLLBACK`: MV-87126356, VALIDADOR 7490004,
se encontraba en estado 3, Bodega Central Mersan, sin usuario QA y con su técnico
Laboratorio conservado. La consulta compartida `warehouseQaReadySql` confirma que
es pendiente de envío a QA. No se ejecutó ninguna escritura, reasignación, despacho,
recepción ni reapertura sobre esa OS. Los movimientos manuales previos del usuario
se conservaron.

## Responsabilidades

| Acción | Actor autorizado | Condición |
|---|---|---|
| Validar y despachar desde Bodega | admin / logistica | Reparado y recibido en Bodega; nueva evidencia específica; confirmación explícita |
| Recepcionar físicamente en QA | qa | Permiso de estación vigente; escáner; no exige ser certificador asignado |
| Asignar / reasignar QA | admin | Recepción física del ciclo actual |
| Iniciar, aprobar o rechazar | qa asignado | Recepción + asignación vigentes; resultado después de iniciar |
| Consultar coordinación | admin / gerente | Gerente permanece de solo lectura |

No se incorpora contingencia manual para QA: esa autorización no existía en la
estación. Bodega reutiliza `MANUAL_AUTORIZADO` para admin/logistica, con serie exacta,
tipo, presencia, motivo y usuario/fecha auditados. Nunca se registra como SCANNER.
El patrón keyboard-wedge valida intervalos + Enter; no es una atestación criptográfica
del hardware. La digitación normal QA consulta; no confirma una recepción.

## Rutas y endpoints

- `/bodega/recepciones/:osId`: recepción desde Terreno, Laboratorio o QA.
- `/bodega/envios-qa/:osId`: preparación y confirmación de salida a QA.
- `/operacion/escaneo`: recepción QA según permiso actual; atajos Bodega a las mismas páginas operacionales.
- `/qa`: entradas pendientes separadas, coordinación Admin y carga propia del técnico.
- `POST /api/bodega/recepcion-terreno/validar`: se conserva la URL por compatibilidad; admite también retornos en estado 11.
- `PUT /api/bodega/receive`: confirmación transaccional; evidencia nueva vinculada a usuario, activo y movimiento de origen.
- `POST /api/bodega/dispatch-qa/validar`: valida salida sin despachar.
- `PUT /api/bodega/dispatch-qa`: confirma salida. Rechaza campos de asignación manipulados; no exige certificador.
- `POST /api/equipment-scan/confirm`: QA recepciona con evidencia nueva; conserva deduplicación por OS/ciclo.
- `GET /api/qa/incoming`: tránsito hacia QA, no carga asignable.
- `GET /api/qa/queue`: recibidos; técnico limitado a sus asignados.
- `GET /api/qa/users`: catálogo para Admin. `/api/bodega/qa-users` queda como compatibilidad de lectura exclusiva Admin, sin asignación logística.
- `PUT /api/qa/assign`: asignación/reasignación Admin.
- `POST /api/qa/start`: inicio explícito del control asignado.
- `POST /api/qa/process`: decisión del certificador, con rechazo motivado.
- Badges, resumen ejecutivo e historial usan los mismos predicados de custodia.

## Transiciones y trazabilidad

```text
Laboratorio finalizado (10)
  → salida a Bodega (11), evento SALIDA_LABORATORIO_BODEGA
  → nueva validación + confirmación de recepción Bodega (3)
  → nueva validación de salida QA, sin cambiar OS
  → confirmar envío QA (6, ubicación NULL), SALIDA_BODEGA_QA
  → recepción QA (6, ubicación QA), RECEPCION_QA_CONFIRMADA
  → Admin asigna (6), QA_TECNICO_ASIGNADO
  → técnico inicia (6), QA_CONTROL_INICIADO
  → resultado (11, tránsito hacia Bodega), QA_APPROVED / QA_REJECTED
```

Estado 6 se presenta como **En tránsito hacia QA**, **Recibido en QA / pendiente de
asignación**, **Asignado / pendiente de control** o **En control QA**, según custodia
real. Se inspeccionaron `validar_ubicacion_estado` y `config_estado_ubicacion`:
permiten ubicación pendiente y asociación QA para 6. No se renumeró el catálogo,
no se modificó la FSM ni se agregaron migraciones.

La devolución QA rechazada conserva el indicador de rechazo al recibir en Bodega,
para dirigirse a Laboratorio. Al confirmar el nuevo ciclo de Laboratorio se limpia
el resultado corriente; su evento histórico permanece. El cierre técnico no
consume repuestos ni aprueba QA. El técnico Laboratorio no es sobrescrito por QA.
No se crea IN u otra OS durante este circuito.

## Ciclos, reloj y legacy

`qaCustody.js` centraliza los predicados. El último `SALIDA_BODEGA_QA` identifica el
ciclo; el escaneo QA guarda esa identidad. Ingreso QA = primera recepción física
confirmada dentro de ese último ciclo. Repetir lectura no reinicia el ingreso.
Asignación e inicio se comprueban contra el mismo ciclo; el resultado solo se admite
con la recepción y el certificador vigentes. Las transacciones bloquean la OS antes
de comprobar/escribir; los reintentos no duplican despacho, recepción o asignación.

No existe un umbral SLA QA configurado en este módulo. Se muestra la recepción con
fecha/hora, y el inicio de control tiene su propio evento. No se utiliza salida de
Bodega ni fecha OS como recepción QA. El reloj y umbrales SLA de Laboratorio se
mantienen sin cambios.

Legacy: no se recrean asignaciones ni se editan eventos. Para OS sin salida QA
moderna, solo se considera recepción una evidencia QA válida posterior a la última
estación anterior. El estado 6 o la asignación, por sí solos, no son prueba física.
La asignación legacy registrada se conserva cuando hay custodia válida. Los futuros
ciclos exigen el nuevo despacho y su propia recepción. Para Bodega reparada legacy
se admite el escaneo Bodega posterior a la reparación; una salida moderna desde
Laboratorio exige confirmación explícita de recepción.

## Contadores

- **Bodega**: unión de Recepcionar (2/11, destino Bodega), Para laboratorio (3,
  sin reparación o rechazo QA) y Para control QA (3, reparado, recibido físicamente,
  sin aprobación/rechazo pendiente de envío). Cada OS contribuye una vez.
- **Entradas QA**: estado 6 sin recepción válida; no suma al KPI recibido.
- **Pendientes de asignación QA**: recibidos sin asignación vigente.
- **Asignados / control QA**: recibidos con asignación vigente.
- **Badge QA Admin y KPI En QA**: total recibido activo, asignado o pendiente.
- **Carga y respuesta badge técnico QA**: recibidos y asignados a ese usuario.
- Tránsito QA suma a tránsito logístico, no a En QA ni a carga certificable.

## Validación

Resultados efectivamente ejecutados en esta entrega:

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Backend `npm test` | 74/74 aprobadas | `tmp/qa-custody-backend.log` |
| Frontend `npm test` | 162/162 aprobadas | `tmp/qa-custody-frontend.log` |
| TypeScript `tsc --noEmit --incremental false` | Aprobado | `tmp/qa-custody-typescript.log` |
| Build Vite | Aprobado | `tmp/qa-custody-build.log` |
| `requirements_flow_e2e.mjs` | Aprobado; incluye dos ciclos QA y legacy | `tmp/qa-custody-e2e.log` |
| Chrome, vistas operacionales | 252 renders aprobados | `tmp/qa-custody-qa/report.json` |
| Chrome, revalidación final de QA | 24 renders aprobados tras ajustar separación de secciones | `tmp/qa-custody-qa-final/report.json` |

El runner E2E confirma `sourceDatabaseUnchanged: true` y
`temporaryClusterRemoved: true`. Sus escenarios prueban permisos, lectura/validación
sin despacho, scanner/manual Bodega, recepción sin asignación previa, asignación
Admin, carga propia, inicio/control, rechazo/reingreso, no reutilización de evidencia,
concurrencia, contadores y ausencia de nuevas OS/IN.

Las pruebas Chrome utilizan APIs simuladas (cero conexiones backend), temas claro y
oscuro y anchos 320, 375, 390, 768, 1024 y 1440 px. Verifican navegación sin modales,
sin bloqueo del body, sin overflow horizontal y sin recorte de badges QA. Se
inspeccionaron capturas desktop/mobile de QA, envío QA y recepción desde Laboratorio.
Se reutilizaron `PageHeader`, `StatusBadge`, `FeedbackBanner`, `EmptyState`, botones,
inputs, Lucide, `grid` y los estilos responsive `warehouse-flow`/`logistics-list`.
No se agregaron colores, CSS aislado ni un sistema visual paralelo.

Los E2E prueban los endpoints y transacciones sobre PostgreSQL efímero. El render de
fixtures es evidencia visual, no prueba de un recorrido físico ni de una pistola real.
La verificación con el dispositivo físico queda cubierta por el guion manual siguiente.
No se modificaron Mobile, Bridge, migraciones ni documentos Capstone v2.0.

## Guion manual corto

Usar una OS de prueba distinta de MV-87126356.

1. Finalizar Laboratorio y confirmar salida a Bodega. Desde Recepcionar abrir la
   página; comprobar contexto readonly, origen Laboratorio y destino Bodega.
2. Validar escáner o manual autorizado (serie/tipo/presencia/motivo). Comprobar que
   validar o volver no recibe. Confirmar recepción: pasa a Para control QA.
3. Preparar envío QA: no hay selector de técnico. Una evidencia de recepción no
   habilita salida. Validar nuevamente; confirmar envío. Misma OS, en tránsito QA.
4. Comprobar que no aparece en carga recibida ni puede asignarse/controlarse.
5. Con rol QA, efectuar nueva lectura de escáner en su estación. Comprobar fecha
   real de recepción. La digitación ordinaria solo consulta y no recibe.
6. Admin asigna al certificador. Otro QA no ve esa OS en su carga ni la procesa.
7. Certificador inicia control y confirma resultado; cancelar la confirmación
   inline no registra decisión. Un rechazo exige motivo.
8. Para un segundo ciclo repetir recepción Bodega, Laboratorio y envío/recepción QA:
   comprobar que las evidencias y resultados anteriores no habilitan controles.

## Archivos modificados en esta entrega

| Archivo | Cambio |
|---|---|
| `03_Backend/pmp-api/src/services/qaCustody.js` | Predicados compartidos de ciclo, recepción, asignación e inicio QA. |
| `03_Backend/pmp-api/src/services/warehouseLabDispatch.js` | Reutiliza validación y confirmación de salida para LAB/QA; rechaza asignación en despacho QA. |
| `03_Backend/pmp-api/src/services/warehouseQueue.js` | Pendientes Bodega y elegibilidad QA vinculados a recepción física. |
| `03_Backend/pmp-api/src/services/warehouseReceipt.js` | Homologa validación y evidencia de recepción desde Terreno, Laboratorio y QA. |
| `03_Backend/pmp-api/src/services/warehouseEvidence.js` | Admite contexto explícito de recepción de retorno para captura manual autorizada. |
| `03_Backend/pmp-api/src/services/equipmentScan.js` | Recibe QA sin dependencia circular; evidencia por ciclo y deduplicación; Bodega no actualiza ubicación al prevalidar retorno. |
| `03_Backend/pmp-api/src/services/logisticsPresentation.js` | Representaciones funcionales QA derivadas de custodia. |
| `03_Backend/pmp-api/src/services/assetHistory.js` | Estado, ubicación y responsables QA legibles en historial. |
| `03_Backend/pmp-api/src/services/withdrawalTimeline.js` | Nombres funcionales de eventos QA y retorno de Laboratorio. |
| `03_Backend/pmp-api/src/routes/bodega.routes.js` | Envío QA sin certificador y confirmación compartida de recepción; contexto técnico readonly. |
| `03_Backend/pmp-api/src/routes/qa.routes.js` | Entradas, carga recibida, catálogo Admin, asignación, inicio y resultado con guardias de ciclo. |
| `03_Backend/pmp-api/src/routes/equipmentScan.routes.js` | Exige patrón de escáner para la recepción física QA. |
| `03_Backend/pmp-api/src/routes/lab.routes.js` | Audita salida a Bodega y corrige singular del mensaje de despacho. |
| `03_Backend/pmp-api/src/routes/badges.routes.js` | Cuenta QA recibido y respeta carga propia del certificador. |
| `03_Backend/pmp-api/src/routes/dashboard.routes.js` | Separa tránsito QA del KPI En QA. |
| `03_Backend/pmp-api/test/equipment.scan.test.js` | Actualiza contrato físico de despacho separado y recepción QA. |
| `03_Backend/pmp-api/test/rbac.phase1.test.js` | Verifica alcance QA y recepción previa en backend. |
| `03_Backend/pmp-api/verification/qa_custody_scenarios.mjs` | Nuevo E2E aislado: roles, concurrencia, dos ciclos, legacy y recepción de retorno. |
| `03_Backend/pmp-api/verification/requirements_flow_e2e.mjs` | Segundo certificador de prueba y evidencia scanner QA del harness aislado. |
| `03_Backend/pmp-api/verification/requirements_scenarios.mjs` | Integra el circuito QA separado en el recorrido de regresión. |
| `04_Frontend/src/App.tsx` | Ruta de preparación de envío QA con permiso Bodega existente. |
| `04_Frontend/src/api/bodega.ts` | Evidencia de despacho QA y contexto de recepción. |
| `04_Frontend/src/api/qa.ts` | Contratos de entradas, recepción, asignación e inicio. |
| `04_Frontend/src/api/equipmentScan.ts` | Transmite patrón de captura scanner cuando corresponde. |
| `04_Frontend/src/components/WarehouseReceptionForm.tsx` | Formulario compartido para recepción de retornos y preparación QA, sin selector de certificador. |
| `04_Frontend/src/components/ScanOperationalActions.tsx` | Atajos a las mismas páginas operacionales; elimina asignación/certificación desde despacho. |
| `04_Frontend/src/components/LabTechnicianWorklist.tsx` | Trabajo terminado se presenta como Ver resultado. |
| `04_Frontend/src/components/AssetTimeline.tsx` | Distingue visualmente salida y recepción QA. |
| `04_Frontend/src/pages/WarehouseOperationPage.tsx` | Admite recepción desde Laboratorio/QA y preparación de salida QA. |
| `04_Frontend/src/pages/BodegaPage.tsx` | Bandejas navegan a preparación; sin asignación QA ni recepción directa sin validación. |
| `04_Frontend/src/pages/QaPage.tsx` | Separa entradas, coordinación Admin y carga del certificador; confirmación inline. |
| `04_Frontend/src/pages/EquipmentScanPage.tsx` | Digitación QA solo consulta; captura de escáner confirma; etiquetas funcionales y sesión sin duplicados. |
| `04_Frontend/src/utils/traceabilityPresentation.ts` | Títulos legibles de eventos de custodia y control QA. |
| `04_Frontend/test/equipment-scan.frontend.test.mjs` | Contratos frontend sin asignación QA desde Logística. |
| `04_Frontend/test/requirements.frontend.test.mjs` | Cobertura de coordinación, control, errores inline, permisos y recepción de retorno. |
| `04_Frontend/test/operational-pages.browser.mjs` | Vistas QA/retorno y preparación en seis anchos y ambos temas con APIs simuladas. |
| `01_Requerimientos/QA_Requerimientos.md` | Actualiza responsabilidades, recepción, ciclos, contadores y compatibilidad legacy. |
| `08_Pruebas/QA_Custodia_Asignacion.md` | Informe de implementación, contratos, validación y guion manual de esta entrega. |
