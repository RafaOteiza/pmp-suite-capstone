# Corrección del modelo: OS independientes y alta de activos

Fecha: 16 de septiembre de 2026. Registro histórico de esta entrega.

> **Superado por la regla definitiva del 17 de septiembre:** Requerimientos ya no crea activos. Gestión de activos es un módulo separado y los requerimientos identifican un activo existente vinculado al bus. Ver [modelo definitivo, pruebas y guión manual](MODELO_DEFINITIVO_ACTIVOS.md). La numeración IN independiente y los datos históricos se conservan.

## 1. Resultado y diagnóstico

La implementación anterior generaba las instalaciones con el componente del caso y su contador. Además, exigía que el activo existiera en el maestro antes del ingreso. Los maestros de validadores y consolas exigían `modelo NOT NULL`, aunque ese dato puede ser desconocido en un requerimiento externo.

Se corrigieron ambos puntos conservando casos, relaciones explícitas, historial por tipo + serie, selección mediante escaneo, transacciones, roles, FSM y circuitos de laboratorio/QA.

- **Nueva IN:** correlativo global PMP `IN-000001`, `IN-000002`, etc. El siguiente número real depende de la secuencia existente. No se usa el número del caso.
- **Origen directo Aranda:** se mantienen MV/MC/PDV/PDC con su componente textual, incluidos los ceros iniciales.
- **Relaciones:** `caso_id`, `os_origen` y `stock_origen_os` continúan vinculando las intervenciones; los códigos no se analizan para inferir parentesco.
- **Historial del activo:** reúne todas sus OS por tipo + serie, aunque pertenezcan a casos distintos.
- **Historial del caso:** reúne exclusivamente las intervenciones relacionadas con esa necesidad.
- **Maestro frente a stock:** conocer un activo no lo hace elegible para instalación. Las reglas de QA, ubicación y escaneo continúan gobernando la disponibilidad física.

### Alta desde el requerimiento

1. El usuario completa el formulario y pulsa **Consultar activo**. La consulta no modifica datos.
2. Si existe, ve **Activo registrado**, tipo, serie, modelo y marca conocidos; confirma la creación del requerimiento usando ese activo.
3. Si falta, ve **Activo no registrado en PMP Suite**, la identidad que está confirmando y las acciones **Registrar activo y continuar** / **Cancelar alta**.
4. La confirmación explícita envía `registrar_activo: true`. La API exige un booleano real, el rol autorizado y el resto de las validaciones vigentes.
5. El alta mínima, caso, OS, correlación y evento se guardan en una transacción. Un fallo revierte todo. El evento de ingreso registra si se dio de alta el activo.

Modelo y marca desconocidos quedan `NULL`; el alta no aplica las marcas predeterminadas de las tablas. Bus, terminal, operador, fecha, falla y observación reportados se conservan en el caso/OS. La OS comienza en el estado existente 2, sin ubicación Bodega, sin aprobación QA y fuera de Listos para instalación.

Cambiar tipo o serie invalida la consulta anterior. Cancelar conserva el formulario sin crear registros. Los conflictos se muestran inline y conservan los datos. Un mismo texto de serie en ambos maestros sigue representando dos identidades distintas; el escaneo mantiene su tratamiento existente de códigos ambiguos.

## 2. Migración y conservación histórica

Nueva migración: [004_os_independientes_alta_activos.sql](../05_BaseDatos/migraciones/requerimientos/004_os_independientes_alta_activos.sql).

- Permite `modelo NULL` en ambos maestros, sin modificar filas existentes.
- Sustituye el generador para que todas las nuevas IN usen `pmp.seq_in`.
- Sincroniza la secuencia únicamente hacia adelante si existen códigos históricos mayores. El reinicio condicional usa `ALTER SEQUENCE`, transaccional para permitir ensayo con rollback.
- `nextval` es seguro ante concurrencia. Los números consumidos por transacciones fallidas no se reutilizan: se admiten saltos.
- No modifica códigos, series, tipos, relaciones ni datos históricos. Conserva las columnas antiguas `instalacion_numero` y `siguiente_instalacion`; las nuevas IN ya no las usan para generar identidad.
- Las IN existentes con el formato anterior permanecen intactas.

**Aplicada en la base local**, después del ensayo. El verificador compara firmas de todas las filas de todas las tablas existentes, sin excluir las relaciones nuevas, y aplica la migración dos veces para verificar idempotencia. Se conservaron **100 OS históricas** y el contenido de las demás tablas.

Evidencias: [ensayo](evidencias/correccion-modelo/model-migration-dry-run.json), [aplicación](evidencias/correccion-modelo/model-migration.json).

Desde `03_Backend/pmp-api`:

```powershell
node verification/apply_model_correction.mjs
node verification/apply_model_correction.mjs --apply
```

El primer comando revierte el ensayo; el segundo aplica. En otros entornos debe existir la migración 003 antes de aplicar 004. `apply_requirements.mjs` se actualizó para aplicar 003 y después 004 en orden, evitando restaurar accidentalmente la numeración previa al usar ese instalador.

## 3. Archivos de esta corrección

El workspace conserva modificaciones de entregas anteriores. Este listado identifica únicamente los archivos ajustados en esta corrección.

| Área | Archivos | Cambio |
|---|---|---|
| Base de datos | `05_BaseDatos/migraciones/requerimientos/004_os_independientes_alta_activos.sql` | Secuencia IN independiente y modelo desconocido |
| Backend | `03_Backend/pmp-api/src/services/requirements.js` | Consulta tipada del maestro y alta mínima transaccional |
| Backend | `03_Backend/pmp-api/src/routes/requirements.routes.js` | GET `/api/requerimientos/activo` bajo roles de ingreso |
| Backend | `03_Backend/pmp-api/src/services/bridgeFlow.js` | Mensaje de maestro, sin confundirlo con inventario |
| Frontend | `04_Frontend/src/pages/IngresoRequerimientosPage.tsx` | Consulta, advertencia, confirmación, cancelación y errores visibles |
| Contratos web | `04_Frontend/src/api/requerimientos.ts`, `equipmentScan.ts`, `dashboard.ts` | Consulta/consentimiento y tipo de modelo nullable |
| Pruebas | `03_Backend/pmp-api/test/requirements.test.js` | Consentimiento booleano explícito |
| Pruebas | `04_Frontend/test/requirements.frontend.test.mjs` | Conocido, desconocido, cancelar, invalidar identidad, conflicto y nuevo formato IN |
| Verificación | `03_Backend/pmp-api/verification/requirements_scenarios.mjs` | Escenarios A–H, rollback, numeración y vida del activo entre casos |
| Verificación | `03_Backend/pmp-api/verification/requirements_flow_e2e.mjs`, `equipment_scan_flow_e2e.mjs`, `logistics_nomenclature_e2e.mjs` | Aplicación de 004 en clústeres aislados |
| Migración | `03_Backend/pmp-api/verification/apply_model_correction.mjs`, `apply_requirements.mjs` | Ensayo/aplicación e integridad histórica |
| Documentación | `02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md`, `08_Pruebas/BRIDGE_CORRELACION_Y_HISTORIAL.md`, `08_Pruebas/REQUERIMIENTOS_CASOS_DESPACHO.md`, `README.md` | Contrato vigente y rotulado del informe anterior |
| Entrega | Este informe y `08_Pruebas/evidencias/correccion-modelo/` | Resultados y guión manual |
| Build | `04_Frontend/tsconfig.tsbuildinfo` | Regenerado por compilación |

No fue necesario modificar código móvil: ya consume el código de OS y sus relaciones explícitas sin exigir la numeración por caso. No se modificaron Docker ni Expo SDK 57. Bridge conserva exclusivamente correlaciones; no se alteraron sus endpoints operacionales retirados.

## 4. Pruebas y builds ejecutados

| Verificación | Resultado | Evidencia |
|---|---|---|
| Backend `npm test` | **54/54 aprobadas** | [Log](evidencias/correccion-modelo/model-backend-tests.log) |
| Frontend `npm test` | **58/58 aprobadas** | [Log](evidencias/correccion-modelo/model-frontend-tests.log) |
| Web `npm run build` | **Correcto** | [Log](evidencias/correccion-modelo/model-web-build.log) |
| Expo Android/iOS SDK 57.0.22 | **Correcto, salida 0** | [Log](evidencias/correccion-modelo/model-mobile-export.log), [bundles y firmas](evidencias/correccion-modelo/mobile-artifacts.json) |
| E2E casos y corrección | **Aprobado** | [Resultado](evidencias/correccion-modelo/model-new-e2e.json) |
| E2E Bridge anterior | **Aprobado** | [Resultado](evidencias/correccion-modelo/model-bridge-e2e.json) |
| E2E escaneo anterior | **Aprobado** | [Resultado](evidencias/correccion-modelo/model-scan-e2e.json) |
| E2E logística anterior | **Aprobado** | [Resultado](evidencias/correccion-modelo/model-logistics-e2e.json) |

La suite de componentes conserva la cobertura del error 4xx de despacho visible dentro del modal. Los E2E usan clústeres efímeros y fixtures propias, eliminados al terminar; las verificaciones de conservación de la base origen pasaron.

Cobertura solicitada:

- **A:** activo conocido reutilizado, MV directa de Aranda y ceros iniciales.
- **B:** desconocido consultado sin mutaciones; alta confirmada, MV y ausencia de stock/QA/Bodega.
- **C:** cancelar en UI no envía creación; consulta y petición sin consentimiento no crean filas.
- **D:** fallo forzado al insertar OS y fallo tardío en Bridge revierten maestro, caso, OS y correlación.
- **E–F:** IN con correlativo propio; dos IN distintas para un caso, sin renumeración; doble despacho concurrente produce una sola operación; el número de una IN revertida no se reutiliza.
- **G:** la misma serie acumula IN y posterior MV de otro caso en su historial; no se mezcla con el activo retirado ni con el mismo texto de serie de otro tipo.
- **H:** consulta AR/caso reconstruye sus OS y referencias; excluye la MV del caso posterior.
- **I:** aplicación idempotente sin cambios en filas históricas, verificada mediante firmas.

Comandos E2E desde backend: `node verification/requirements_flow_e2e.mjs`, `node verification/bridge_correlation_e2e.mjs`, `node verification/equipment_scan_flow_e2e.mjs`, `node verification/logistics_nomenclature_e2e.mjs`.

Exportación desde `07_Mobile`: `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir ../tmp/model-mobile`, con `EXPO_OFFLINE=1` y `CI=1`. Produce bundles; no es una compilación APK/IPA firmada.

## 5. Guión manual actualizado

Ejecutar con datos de prueba y roles existentes. Preparar un activo conocido sin intervención activa, una serie que no exista, terminal/operador autorizados, un bus y dos equipos aprobados en Bodega. Anotar los códigos reales generados; los ejemplos IN no fijan el siguiente número.

1. Reiniciar la API con el código actualizado y recargar la web. En otros entornos aplicar primero 004. Anotar totales de stock/En ruta y los códigos de algunas OS históricas.
2. Ingresar como Logística. Abrir **Ingreso de requerimientos** y completar ARANDA, `AR-00123456`, tipo/serie conocidos, bus, terminal, operador, fecha, falla y observación.
3. Pulsar **Consultar activo**. Verificar **Activo registrado** y sus datos conocidos. Todavía no debe existir un caso nuevo ni otra OS.
4. Confirmar. Verificar `MV-00123456` para validador, la referencia textual con ceros y la correlación. Repetir con consola/PoD si corresponde: MC/PDV/PDC.
5. Iniciar otro requerimiento con una serie inexistente y referencia diferente. Escribir la serie no debe crear nada. Pulsar **Consultar activo** y verificar **Activo no registrado en PMP Suite**.
6. Pulsar **Cancelar alta**. Verificar que no aparece activo/caso/OS/Bridge y que el formulario conserva lo escrito.
7. Consultar de nuevo y pulsar **Registrar activo y continuar**. Verificar alta mínima, caso, OS y referencia; modelo/marca deben mostrarse sin informar, nunca como un dato técnico inventado.
8. Buscar la serie y abrir su historial. Verificar el bus, terminal, operador, fecha, falla y observación reportados. Comprobar que no aparece en **Listos para instalación**, no tiene QA aprobada y no aumentó **En ruta**.
9. Cambiar tipo o serie después de una consulta. Verificar que se exige consultar la identidad nueva antes de confirmar. Si existe la misma serie en ambos maestros, comprobar que los historiales distinguen el tipo.
10. Repetir una referencia existente. Verificar conflicto visible sin borrar formulario y sin duplicar el requerimiento.
11. Ejecutar el circuito normal de retiro/recepción/reparación/QA para el activo cuando corresponda. Su identidad y su OS original permanecen iguales.
12. Abrir **Listos para instalación → Despacho por escaneo**, elegir caso/contexto y técnico. Elegir técnico o bus no crea IN ni salida.
13. Escanear un equipo elegible. Antes de confirmar tampoco debe existir una IN nueva. La consulta manual continúa sin habilitar despacho.
14. Confirmar el despacho. Anotar la nueva `IN-` seguida del correlativo PMP, por ejemplo `IN-000184`. Debe vincularse al caso, OS origen y serie seleccionada mediante datos; registrar una salida y pasar a **En ruta**.
15. Despachar otro equipo elegible para el mismo caso. Debe obtener otra IN independiente, por ejemplo `IN-000185` o el siguiente correlativo disponible. La primera conserva su identidad. Repetir para un caso interno: mismo formato independiente y ninguna referencia Aranda inventada.
16. En Mobile del técnico asignado, completar la IN despachada. Verificar instalación, reducción de En ruta y conservación de la OS de reparación del activo retirado.
17. Buscar cada serie: ver solo sus OS, de cualquier caso. Buscar AR: ver las intervenciones de esa necesidad y enlaces a cada activo. Una posterior mantención del equipo instalado debe aparecer en su vida completa, sin incorporarse al caso anterior.
18. Comparar las OS históricas anotadas, el stock y los eventos. Confirmar que el maestro no se confunde con disponibilidad, que los fallos quedan visibles y que no se alteraron los identificadores antiguos.

La inyección de fallos de OS/Bridge y la concurrencia se ejecutan automáticamente en el E2E aislado. No instalar triggers de fallo en una base de uso real para realizar la prueba manual.

## 6. Límites de la verificación

No se ejecutó el recorrido visual con lector físico y teléfono en esta corrección. Las pruebas de componentes, API, transacciones y exportación están ejecutadas; el guión manual queda disponible para esa validación. El código actualizado requiere reiniciar la API y recargar los clientes en ejecución.
