# QA Dashboard — flujo autónomo

Fecha de ejecución: 2026-10-07. Evidencia de esta implementación; no reemplaza resultados históricos de entregas anteriores.

## 1. Auditoría y causa

El módulo anterior separaba salida Bodega y recepción, pero Admin asignaba al certificador; QA debía iniciar control y aprobar/rechazar mediante un endpoint que también movía la OS a tránsito. No existían Instalación Ambiente independiente, borradores de evaluación QA ni una salida QA con evidencia propia. La cola de entrada además interpretaba todo registro sin recepción como tránsito.

Se reutilizaron la ubicación QA, estado global 6, campos de responsabilidad, servicios de identidad/scanner y eventos append-only. Las etapas internas y snapshots se guardan en `flujo_eventos` con `version: 3`, ciclo y revisión. No se creó otra arquitectura, tabla, rol, estado global, migración ni dependencia.

No se halló un procedimiento técnico específico de Instalación Ambiente en el código/catálogos/documentación revisados. El registro del hito es genérico y su procedimiento detallado sigue pendiente de especificación. No se simula firmware, SONDA, banco ni instalación en bus.

## 2. Situación real consultada, sin intervenir

Consulta `BEGIN READ ONLY` / `ROLLBACK`: **2026-10-07 17:52:35 UTC**.

- MV-87126356, VALIDADOR 7490004: estado persistido 6 (`EN_QA`), ubicación nula; último envío Bodega→QA: evento 30.
- Sin recepción QA confirmada y sin responsable QA. Proyección funcional: **En tránsito hacia QA / Recepción**.
- Técnico de Laboratorio: Jose Villarroel, conservado.
- Conteo de la proyección real en ese instante: **Recepción 1; Por verificar 25**. No se transformaron los 26 registros en tránsito ni se fabricaron recepciones.

Los movimientos anteriores del usuario se respetaron. El código y las fixtures cambiaron; **la OS real no fue recibida, tomada, asignada, evaluada ni despachada**. La evidencia de consulta está en [qa-autonomous-source-readonly.json](../tmp/qa-autonomous-source-readonly.json).

## 3. Operación y rutas

- `/qa` y `/mi-jornada` para QA: Mi operación QA.
- `/qa/:osId/recepcion`: contexto readonly, captura QA y confirmación de recepción.
- `/qa/:osId/ambiente`: Tomar trabajo, Iniciar, Guardar avance, Confirmar Instalación Ambiente completada.
- `/qa/:osId/pruebas`: ejecuciones Manual/Test MK, borradores y dictamen explícito.
- `/qa/:osId/despacho`: evidencia nueva y salida física a Bodega.
- `/qa/:osId/detalle?ciclo=...`: consulta inmutable de un ciclo anterior, incluso durante un reingreso de la misma OS.

Pestaña, búsqueda y página se conservan al volver. Búsqueda en servidor por OS, serie, AR y PPU, aplicada antes de paginar, 20 filas por página. Historial devuelve ciclos despachados, no los mezcla con carga activa. Por verificar no permite operar sin evidencia suficiente.

QA recibe, toma trabajo, registra ambiente y pruebas, emite dictamen y despacha. Ambiente/pruebas/dictamen solo los modifica quien tomó el trabajo. Otro QA puede recibir o despachar con su evidencia propia; cada actor se audita por separado. Admin y gerente consultan donde ya están autorizados; Admin no asigna ni certifica por su rol. Logística solo opera sus movimientos de Bodega. Técnico Lab conserva sus funciones.

## 4. Estados, retornos y fechas

```text
Bodega → salida confirmada → 6 / ubicación nula / Recepción
QA → recepción confirmada → 6 / ubicación QA / Instalación Ambiente
QA → ambiente completado → 6 / ubicación QA / Pruebas
QA → dictamen confirmado → 6 / ubicación QA / Despacho
QA → salida confirmada → 11 / ubicación nula / En tránsito hacia Bodega
Bodega → recepción física → 13 si Operativo; 3 si Rechazado
```

**Operativo:** la prueba, el dictamen y la salida no habilitan stock. Solo después de recepción Bodega y elegibilidad vigente aparece disponible. No se crea IN, ni se instala en la PPU histórica, ni se consume stock de repuestos al certificar.

**Rechazado:** Bodega recibe → Para laboratorio → salida Bodega/Lab → nueva recepción física Lab → asignación/revisión. Se preservan OS/AR, pruebas fallidas, motivos, autores, fechas y evidencia de custodia. El nuevo ciclo no hereda recepción/cierre Lab ni ambiente/pruebas/dictamen QA anteriores.

La recepción QA canónica es la primera confirmación física de su ciclo vigente. Se registran por separado inicio/fin de ambiente, cada ejecución, dictamen y salida. Reintentos/relecturas no reinician el ingreso. No hay SLA QA configurado: se muestran horas transcurridas, sin inventar plazo contractual. El SLA de Laboratorio no fue modificado.

## 5. Definición de contadores

| Indicador | Inclusión |
|---|---|
| Recepción | Salida Bodega→QA confirmada, estado global 6, sin recepción del ciclo |
| Instalación Ambiente | Recibido físicamente en QA, hito pendiente/en curso |
| Pruebas | Recibido, ambiente completado, sin dictamen definitivo |
| Despacho | Dictamen definitivo del ciclo y custodia física QA; salida aún no confirmada |
| Badge lateral QA | Suma de las cuatro etapas anteriores, para toda la operación autorizada |
| KPI global En QA | Equipos activos físicamente recibidos en QA; excluye tránsito y Por verificar |
| Por verificar | QA legacy sin evidencia física suficiente; nunca se infiere tránsito por ausencia |
| Historial | Ciclos con salida QA confirmada, separados de carga activa |

Tarjetas, bandejas y badge comparten `qaStageSql`. Las tarjetas muestran totales operacionales; la búsqueda/paginación solo filtra filas y su total de resultados.

## 6. Persistencia y validaciones

Los comandos bloquean la OS y comprueban ciclo, etapa, rol, responsable y revisión. `request_id` + huella del payload permite reintentos equivalentes; contenido distinto, versión/ciclo obsoleto o competencia devuelve conflicto sin cambios parciales. El dictamen es único e inmutable por ciclo. Las ejecuciones concluidas no se sobrescriben: un reintento conserva el fracaso anterior y registra nueva ejecución.

La recepción y salida necesitan evidencias diferentes por activo/OS/ciclo/propósito/usuario. Se auditan coincidencias y discrepancias. MANUAL_AUTORIZADO exige tipo + serie exactos, presencia y motivo; nunca se guarda como SCANNER. La lectura genérica QA no recibe automáticamente. Endpoints antiguos de asignación/inicio/proceso no permiten eludir etapas ni permisos.

Los borradores se recuperan del backend. Guardar avance o una prueba pendiente no certifica ni mueve custodia. Operativo exige pruebas aplicables completas y aprobadas; Rechazado exige evaluación documentada y motivo técnico, sin exigir aprobar pruebas fallidas.

## 7. Pruebas ejecutadas

| Nivel | Ejecución | Resultado |
|---|---|---|
| Backend, unitarias/contratos | `npm test` en `03_Backend/pmp-api` | 78/78 aprobadas |
| Frontend, componentes/contratos y regresiones Mobile existentes | `npm test` en `04_Frontend` | 169/169 aprobadas |
| TypeScript | `tsc --noEmit --incremental false` | Aprobado |
| Build web | `vite build` | Aprobado |
| Integración/E2E HTTP + PostgreSQL | `verification/requirements_flow_e2e.mjs` | Aprobado, código de salida Node 0 |
| Navegador con fixtures | `operational-pages.browser.mjs`, modo QA | 168 renderizados aprobados; 0 conexiones backend |

### Escenarios comprobados con PostgreSQL efímero

- Salida de Bodega no recibe QA ni aprueba pruebas; recepción independiente scanner/manual.
- QA puede recibir sin asignación Admin; otros roles y vías antiguas no operan.
- Digitación sin prueba de scanner, identidad errónea y falta de presencia se bloquean.
- Recepciones concurrentes/reintentos no duplican eventos.
- Dos usuarios compitiendo por Tomar trabajo: uno obtiene responsabilidad, el otro conflicto.
- Otro usuario no modifica ambiente. Guardar recupera datos; revisión antigua devuelve conflicto.
- No se salta ambiente; no se emite Operativo con pruebas ausentes, pendientes o fallidas.
- Rechazado exige motivo, conserva evaluación y permanece físicamente en QA.
- Evidencia de recepción no habilita salida; destino distinto de Bodega se rechaza.
- Reintentos de dictamen/salida no duplican eventos. Dictamen distinto no sobrescribe.
- Retorno rechazado con recepción Bodega idempotente; no retorna directo a QA.
- Reingreso Lab exige nueva recepción antes de asignar; antecedentes QA readonly y cierre anterior no se reutiliza.
- Nuevo ciclo QA inicia ambiente/pruebas/dictamen vacíos; los ciclos previos siguen consultables.
- Prueba fallida no se sobrescribe; un intento nuevo aprobado conserva ambos resultados.
- Operativo no entra en stock mientras permanece en QA ni en tránsito; recepción Bodega y posterior IN siguen el circuito vigente.
- Contadores/bandejas/badge coherentes y sin doble conteo.
- Búsqueda sobre el conjunto previo a paginar: fixture de 22 filas, páginas de 20 + 2; se encuentra una serie que no estaba en la primera página.
- Legacy sin recepción permanece Por verificar; un scan QA histórico válido conserva su valor físico sin fabricar otro evento.
- Regresiones de requerimientos, Bridge correlacional, alta/recepción inicial, retiros/PoD, físico primero, laboratorio, repuestos, IN, historial y permisos dentro del E2E existente.

### Validación visual y límites

Se renderizaron dashboard, recepción, ambiente, pruebas, despacho, detalle y contingencia manual, para QA y consulta Admin: **320, 375, 390, 768, 1024 y 1440 px**, claro/oscuro. Se comprobaron ausencia de overflow horizontal de documento, bloqueo del body y modales operacionales. Se inspeccionaron capturas desktop/móvil y se ajustó el espaciado con clases compartidas.

Reutilizados: `PageHeader`, `StatCard`, `StatusBadge`, `FeedbackBanner`, `EmptyState`, tablas `withdrawal-table`, tabs y clases de recepción/acciones, botones, inputs, Lucide y tokens existentes. No se agregó CSS aislado.

Estas son pruebas de software y fixtures. No certifican un escáner físico, Test MK real ni un procedimiento técnico de ambiente. Keyboard-wedge se verifica por patrón temporal; no es autenticación del dispositivo. La comprobación de hardware y la realización técnica de QA quedan para ejecución manual autorizada.

Logs: [backend](../tmp/qa-autonomous-backend.log), [frontend](../tmp/qa-autonomous-frontend.log), [TypeScript](../tmp/qa-autonomous-typescript.log), [build](../tmp/qa-autonomous-build.log), [E2E](../tmp/qa-autonomous-e2e.log), [reporte visual](../tmp/qa-autonomous-visual-final/report.json). Los errores esperados de escenarios negativos E2E se capturan aparte; no son fallos de la suite.

## 8. Integridad de la base original

El ejecutor crea otro clúster PostgreSQL con schema-only y fixtures. Compara **conteo y hash de todas las tablas del esquema `pmp`** de la fuente antes/después. Resultado final:

```json
{"sourceDatabaseUnchanged": true, "temporaryClusterRemoved": true}
```

La consulta del caso real fue readonly. No se escribieron datos de MV-87126356 ni se alteraron sus eventos. Los DOCX Capstone v2.0, README_VIGENCIA, evidencias históricas, Mobile, Bridge, Docker y migraciones no se modificaron por esta tarea.

## 9. Guion manual corto

Usar una OS/activo de prueba, **no MV-87126356**, con salida Bodega→QA confirmada.

1. Ingresar como QA; abrir Mi operación QA. Buscar por OS, serie, AR y PPU; comprobar Recepción y la conservación de filtros al volver.
2. Abrir Recepción. Verificar contexto autocompletado y que abrir/cancelar no mueve el equipo. Probar código distinto: recepción bloqueada.
3. Leer con escáner o seleccionar Ingreso manual autorizado, indicar serie exacta, motivo y presencia. Validar; todavía no debe recibir. Confirmar recepción explícita.
4. En Instalación Ambiente, pulsar Tomar trabajo. Con otro QA comprobar que no puede sobrescribir. Iniciar, guardar observación, recargar y comprobar persistencia.
5. Confirmar Instalación Ambiente completada. En Pruebas comprobar método vacío, resultado Pendiente y dictamen sin seleccionar. Guardar una prueba pendiente y volver a entrar.
6. Completar una evaluación fallida. Emitir Rechazado con motivo técnico y confirmación. Comprobar que permanece en QA, en Despacho.
7. Validar una **nueva** evidencia de salida y confirmar hacia Bodega. Comprobar tránsito, salida de carga activa, historial y ausencia de stock disponible.
8. Como Logística, recepcionar físicamente en Bodega. Verificar Para laboratorio; despachar, recepcionar en Lab y asignar. Revisar antecedentes QA y trabajo nuevo sin cierre heredado.
9. Tras el ciclo técnico y nuevo envío QA, repetir recepción/ambiente y registrar prueba aprobada. Emitir Operativo; verificar que aún no es stock. Despachar y recepcionar físicamente en Bodega: entonces debe aparecer disponible, sin nueva IN hasta el despacho operacional posterior.
10. Consultar Historial de ambos ciclos. Como Admin/gerente verificar solo lectura QA. Repetir navegación en móvil y temas claro/oscuro.

## 10. Archivos modificados en esta tarea

El repositorio ya contenía otros cambios; la siguiente lista corresponde exclusivamente a esta entrega.

| Archivo | Cambio |
|---|---|
| [03_Backend/pmp-api/src/services/qaWork.js](../03_Backend/pmp-api/src/services/qaWork.js) | Servicio QA autónomo, etapas, contexto, borradores, ciclos, responsabilidad, evidencia e idempotencia. |
| [03_Backend/pmp-api/src/services/qaCustody.js](../03_Backend/pmp-api/src/services/qaCustody.js) | Proyección canónica de recepción, etapa activa, historia y legacy por verificar. |
| [03_Backend/pmp-api/src/routes/qa.routes.js](../03_Backend/pmp-api/src/routes/qa.routes.js) | API por etapa exclusiva QA; consultas globales autorizadas; cierre de escrituras antiguas. |
| [03_Backend/pmp-api/src/routes/equipmentScan.routes.js](../03_Backend/pmp-api/src/routes/equipmentScan.routes.js) | Impide recepción QA implícita desde el escaneo genérico. |
| [03_Backend/pmp-api/src/routes/badges.routes.js](../03_Backend/pmp-api/src/routes/badges.routes.js) | Badge QA = suma de las cuatro etapas activas, sin legacy por verificar. |
| [03_Backend/pmp-api/src/routes/dashboard.routes.js](../03_Backend/pmp-api/src/routes/dashboard.routes.js) | Distingue custodia QA, tránsito probado y registros por verificar en indicadores globales. |
| [03_Backend/pmp-api/src/routes/bodega.routes.js](../03_Backend/pmp-api/src/routes/bodega.routes.js) | Retorno QA con salida vigente, disposición y reintentos equivalentes de recepción. |
| [03_Backend/pmp-api/src/services/warehouseReceipt.js](../03_Backend/pmp-api/src/services/warehouseReceipt.js) | La salida QA propia delimita la nueva evidencia de recepción en Bodega. |
| [03_Backend/pmp-api/src/services/warehouseLabDispatch.js](../03_Backend/pmp-api/src/services/warehouseLabDispatch.js) | Mensaje del despacho consistente con responsabilidad autónoma QA. |
| [03_Backend/pmp-api/src/services/labWork.js](../03_Backend/pmp-api/src/services/labWork.js) | Entrega antecedentes readonly del rechazo QA y evidencia de custodia. |
| [03_Backend/pmp-api/src/services/assetHistory.js](../03_Backend/pmp-api/src/services/assetHistory.js) | Presentación de custodia QA/por verificar y ubicación del retorno a Bodega. |
| [03_Backend/pmp-api/src/services/withdrawalTimeline.js](../03_Backend/pmp-api/src/services/withdrawalTimeline.js) | Títulos amigables para los eventos de las cuatro etapas QA. |
| [04_Frontend/src/api/qa.ts](../04_Frontend/src/api/qa.ts) | Contratos tipados de dashboard, trabajo, pruebas, validación y comandos QA. |
| [04_Frontend/src/pages/QaPage.tsx](../04_Frontend/src/pages/QaPage.tsx) | Dashboard con cuatro indicadores/pestañas, tabla responsive, búsqueda y paginación en servidor. |
| [04_Frontend/src/pages/QaWorkPage.tsx](../04_Frontend/src/pages/QaWorkPage.tsx) | Páginas operacionales de recepción, ambiente, pruebas, despacho y ciclos históricos. |
| [04_Frontend/src/pages/RoleDashboardPage.tsx](../04_Frontend/src/pages/RoleDashboardPage.tsx) | El inicio del rol QA presenta la operación autónoma, sin dependencia de asignación Admin. |
| [04_Frontend/src/App.tsx](../04_Frontend/src/App.tsx) | Rutas QA de detalle y operación bajo el permiso de consulta existente. |
| [04_Frontend/src/app/navigation.ts](../04_Frontend/src/app/navigation.ts) | Entrada Operación QA consistente con la nueva responsabilidad. |
| [04_Frontend/src/pages/EquipmentScanPage.tsx](../04_Frontend/src/pages/EquipmentScanPage.tsx) | La estación identifica y conduce a confirmación explícita de recepción QA. |
| [04_Frontend/src/components/ScanOperationalActions.tsx](../04_Frontend/src/components/ScanOperationalActions.tsx) | Acciones y textos de integración sin coordinación de certificador por Admin. |
| [04_Frontend/src/components/RepairWorkForm.tsx](../04_Frontend/src/components/RepairWorkForm.tsx) | Consulta compacta del rechazo QA previo y su evidencia, sin reutilizarlo como trabajo nuevo. |
| [04_Frontend/src/components/AssetTimeline.tsx](../04_Frontend/src/components/AssetTimeline.tsx) | Renderiza snapshots QA separados del trabajo Lab, actores, pruebas y salida hacia Bodega. |
| [04_Frontend/src/utils/traceabilityPresentation.ts](../04_Frontend/src/utils/traceabilityPresentation.ts) | Tipos de metadata y etiquetas amigables de eventos QA. |
| [03_Backend/pmp-api/test/qa.work.test.js](../03_Backend/pmp-api/test/qa.work.test.js) | Casos unitarios de métodos, evaluación, rechazo, aprobación y reintentos de pruebas. |
| [03_Backend/pmp-api/test/rbac.phase1.test.js](../03_Backend/pmp-api/test/rbac.phase1.test.js) | Contrato de permisos QA autónomo, sin asignación administrativa. |
| [03_Backend/pmp-api/test/equipment.scan.test.js](../03_Backend/pmp-api/test/equipment.scan.test.js) | Contrato de recepción QA propia y servicio operacional. |
| [03_Backend/pmp-api/package.json](../03_Backend/pmp-api/package.json) | Incluye la suite unitaria QA en npm test; sin dependencias nuevas. |
| [03_Backend/pmp-api/verification/qa_custody_scenarios.mjs](../03_Backend/pmp-api/verification/qa_custody_scenarios.mjs) | E2E PostgreSQL de ambos retornos, permisos, concurrencia, evidencia, paginación y ciclos. |
| [04_Frontend/test/requirements.frontend.test.mjs](../04_Frontend/test/requirements.frontend.test.mjs) | Cobertura de las cuatro etapas, búsqueda, borradores, confirmación explícita e historial QA. |
| [04_Frontend/test/routes.frontend.test.mjs](../04_Frontend/test/routes.frontend.test.mjs) | Verifica separación de lectura/escritura en la nueva página operacional QA. |
| [04_Frontend/test/bridge.frontend.test.mjs](../04_Frontend/test/bridge.frontend.test.mjs) | Actualiza referencia del dashboard QA en la regresión que mantiene Bridge correlacional. |
| [04_Frontend/test/operational-pages.browser.mjs](../04_Frontend/test/operational-pages.browser.mjs) | Fixtures visuales QA para seis anchos, ambos temas y roles QA/Admin. |
| [01_Requerimientos/QA_Requerimientos.md](../01_Requerimientos/QA_Requerimientos.md) | Norma vigente de operación QA autónoma, reglas, responsabilidades y límites. |
| [02_Arquitectura/Arquitectura_06_Flujos_Datos.md](../02_Arquitectura/Arquitectura_06_Flujos_Datos.md) | Integración QA/Bodega/Laboratorio, custodia, ciclos y persistencia reutilizada. |
| [README.md](../README.md) | Roles y resumen QA consistentes con la operación autónoma. |
| [08_Pruebas/QA_Dashboard_Flujo_Autonomo.md](../08_Pruebas/QA_Dashboard_Flujo_Autonomo.md) | Informe de implementación, evidencias, resultados, límites y guion manual. |
