# Entrega: requerimientos, casos y despacho por escaneo

Fecha de cierre: 16 de septiembre de 2026.

> **Registro de la entrega anterior.** La numeración IN por caso y la exigencia de un activo preexistente fueron corregidas posteriormente. Consultar el [modelo vigente y sus pruebas](CORRECCION_MODELO_OS_ACTIVOS.md). Se conserva este informe como evidencia histórica de esa entrega.

## 1. Resumen funcional

Se implementó **Ingreso de requerimientos** para Admin/Logística y **Despacho por escaneo** desde el inventario. El caso agrupa sus intervenciones y cada OS conserva su activo. La selección de stock puede comenzar directamente por contexto y lectura física, sin elegir previamente una serie en una tabla. La confirmación crea la IN, asigna técnico, registra salida y correlaciona la referencia externa en una sola transacción.

## 2. Arquitectura y decisiones

Se mantienen Express/PostgreSQL, React/Vite y Expo. Se agrega una tabla de casos y relaciones a las OS existentes; se reutilizan catálogos, eventos, escaneos e historial Bridge. No se crea un inventario paralelo: la OS cerrada y aprobada por QA en Bodega representa la evidencia de stock, siempre que no haya una intervención posterior/incompatible ni consumo por otra IN. Los placeholders IN históricos siguen siendo reconocidos.

La selección del activo y la numeración de instalaciones se serializan mediante bloqueos transaccionales. Los errores revierten toda la operación, incluido el contador de instalaciones. La prueba E2E fuerza un fallo en la correlación final, después de insertar IN y evento, y comprueba que ninguno queda persistido.

## 3. Códigos definitivos

| Origen/proceso | Ejemplo |
| --- | --- |
| Aranda | `AR-00123456` |
| Mantención validador / consola | `MV-00123456` / `MC-00123456` |
| PoD validador / consola | `PDV-00123456` / `PDC-00123456` |
| Instalaciones del caso externo | `IN-00123456-01`, `IN-00123456-02` |
| Caso interno | `INT-000001` |
| Mantención/PoD internos | Correlativos existentes `MV-000001`, `MC-000001`, etc. |
| Instalación interna | `IN-INT000001-01` |

El componente Aranda es texto: no pierde ceros. La relación real es `caso_id` y las relaciones OS/Bridge; nunca se deduce solo del código. El componente `INT` evita colisiones entre instalaciones internas y externas. Si una nueva OS externa colisiona con un código histórico, devuelve conflicto sin sobrescribirlo.

## 4. Ingreso Aranda

`12345678` o `AR-12345678` → caso `AR-12345678` → `MV-12345678`/MC/PDV/PDC según tipo y clasificación → correlación Bridge. Se validan activo existente, tipo/serie, terminal/operador y ausencia de intervención activa incompatible. Un duplicado produce conflicto. Origen INTERNO funciona sin Aranda. El reporte técnico existente también registra caso para las nuevas OS sin cambiar sus permisos de creación.

## 5. Reparación y PoD

La OS del activo fallado continúa por recepción, laboratorio, reparación y QA. Recibir el activo aprobado en Bodega cierra la reparación, conserva aprobación y ubicación, y **no crea una IN**.

PoD conocido desde origen crea PDV/PDC directamente. La derivación posterior se permite en mantenciones en curso, antes de finalizar taller: crea PDV/PDC relacionada, conserva el código MV/MC y cierra su proceso previo con eventos explícitos de derivación. Se transfiere contexto/asignación; el nuevo proceso exige sus escaneos habituales. No quedan dos procesos activos duplicados para el mismo activo. No se deriva automáticamente una reparación terminada.

## 6. Despacho físico desde Bodega

Caso + OS origen + bus + terminal/operador + técnico → lectura de cualquier equipo elegible → validación → **Confirmar asignación y despacho**. La captura MANUAL consulta y no genera evidencia habilitante; SCANNER registra origen y contexto en el escaneo. La confirmación vuelve a verificar elegibilidad, último escaneo, usuario y caso.

Se bloquean tipo incorrecto, QA pendiente/rechazado, asignación, ruta, instalación, fuera de Bodega, intervención incompatible y serie desconocida. El error es inline y conserva el contexto. Abrir, seleccionar o escanear no crea IN. El inventario mantiene etiquetas de validación física y la acción independiente del listado. El despacho antiguo permanece limitado a IN históricas disponibles ya existentes, para compatibilidad.

## 7. Instalación IN

La IN nueva pertenece a la serie elegida físicamente y aparece en Mis Órdenes del técnico. Solo una IN asignada con evidencia de salida vigente puede completarse. El bus debe coincidir con el destino confirmado. Éxito conserva estado final 13 y registra `INSTALACION_COMPLETADA`; fallo conserva retorno 11 y registra `INSTALACION_FALLIDA`. La reparación del activo retirado no se modifica. Al finalizar, la IN deja de contar En ruta.

## 8. Bridge e historial

Bridge continúa exclusivamente como `referencia externa ↔ OS PMP`. Se reutilizó su inserción de correlación dentro de la transacción operacional, sin agregarle operaciones. Su índice único ya admite varias OS por referencia y no se relajó. Acciones retiradas siguen respondiendo 410.

La consulta por tipo + serie mantiene historiales individuales. La consulta del caso reúne sus OS, activos, técnicos, buses, referencias y eventos. La búsqueda por serie exacta prioriza el activo; OS y referencia permiten navegar al caso explícito.

## 9. Backend

- Rutas de ingreso/listado/detalle/derivación PoD bajo `/api/requerimientos`.
- Rutas `/api/bodega/despacho/validar` y `/confirmar`, con bloqueos y transacción.
- Recepción QA sin creación anticipada de IN y disponibilidad derivada del stock aprobado.
- Escaneo de stock cerrado admitido exclusivamente si cumple elegibilidad; estaciones y permisos existentes preservados.
- Mis Órdenes y detalle exponen caso, origen, terminal, técnico y clasificación IN.
- KPI de activos deduplicados por tipo + serie; órdenes activas contabilizadas por separado.

## 10. Frontend

Nuevo ingreso, nuevo formulario de despacho, acción principal desde inventario, errores visibles, consulta de casos, navegación entre caso y activo, información ampliada de Mis OS y permiso de ingreso exclusivo de Admin/Logística. Se conserva el reporte de fallas de terreno.

## 11. Mobile

Mis Órdenes muestra contexto y solo ofrece instalar/devolver una IN En ruta. Historial permite consultar casos y navegar a cada activo. El perfil se obtiene de `/auth/me` para usar el rol autorizado por la API; las acciones de terreno se muestran al técnico correspondiente. Expo permanece en SDK 57, versión instalada 57.0.22.

## 12. Migración realizada

Se preparó y aplicó `05_BaseDatos/migraciones/requerimientos/003_casos_operacionales.sql` sobre la base local configurada, después de probarla en un clúster efímero y ejecutar un ensayo con rollback.

- Tabla `pmp.casos_operacionales` y secuencia interna.
- Columnas OS `caso_id`, `os_origen`, `stock_origen_os`, `instalacion_numero`, con claves/índices.
- Generación de códigos nuevos según caso y contador de instalación.
- Protección de identidad del caso y relaciones de OS; protección previa de tipo/serie conservada.
- Aplicación repetida verificada. No se ejecutaron actualizaciones sobre OS históricas.
- Comparación transaccional antes/después de las tablas existentes: datos conservados, incluidas **100 OS históricas**. Las columnas añadidas se excluyen de la firma de contenido anterior.

Evidencias: [aplicación](evidencias/requerimientos-casos/requirements-migration.json) y [ensayo](evidencias/requerimientos-casos/requirements-migration-dry-run.json). Script reproducible: `node verification/apply_requirements.mjs` para ensayo y `--apply` para aplicación.

## 13. Archivos de esta entrega

El workspace ya contenía cambios anteriores. Este listado corresponde a la evolución de casos/despacho; no atribuye todos los cambios pendientes de Git a esta entrega.

**Backend y base de datos:**

- `03_Backend/pmp-api/src/app.js`
- `03_Backend/pmp-api/src/routes/requirements.routes.js`
- `03_Backend/pmp-api/src/routes/bodega.routes.js`
- `03_Backend/pmp-api/src/routes/os.routes.js`
- `03_Backend/pmp-api/src/routes/dashboard.routes.js`
- `03_Backend/pmp-api/src/services/requirements.js`
- `03_Backend/pmp-api/src/services/warehouseDispatch.js`
- `03_Backend/pmp-api/src/services/assetHistory.js`
- `03_Backend/pmp-api/src/services/equipmentScan.js`
- `03_Backend/pmp-api/src/services/logisticsPresentation.js`
- `03_Backend/pmp-api/package.json`
- `03_Backend/pmp-api/test/requirements.test.js`
- `03_Backend/pmp-api/verification/apply_requirements.mjs`
- `03_Backend/pmp-api/verification/requirements_flow_e2e.mjs`
- `03_Backend/pmp-api/verification/requirements_scenarios.mjs`
- `03_Backend/pmp-api/verification/equipment_scan_flow_e2e.mjs`
- `03_Backend/pmp-api/verification/logistics_nomenclature_e2e.mjs`
- `05_BaseDatos/migraciones/requerimientos/003_casos_operacionales.sql`

**Web:**

- `04_Frontend/src/App.tsx`, `src/app/rbac.ts`, `src/app/navigation.ts`
- `04_Frontend/src/api/requerimientos.ts`, `src/api/os.ts`, `src/api/bridge.ts`
- `04_Frontend/src/pages/IngresoRequerimientosPage.tsx`
- `04_Frontend/src/pages/DespachoEscaneoPage.tsx`
- `04_Frontend/src/pages/BodegaModulosPage.tsx`
- `04_Frontend/src/pages/TrazabilidadPage.tsx`
- `04_Frontend/src/pages/MyServiceOrdersPage.tsx`
- `04_Frontend/src/components/TopBar.tsx`
- `04_Frontend/src/components/ScanOperationalActions.tsx`
- `04_Frontend/test/requirements.frontend.test.mjs`
- `04_Frontend/test/warehouse-dispatch.frontend.test.mjs` (fixture explícita de IN histórica disponible)
- `04_Frontend/package.json`; `tsconfig.tsbuildinfo` regenerado por build.

**Mobile:**

- `07_Mobile/src/context/AuthContext.js`
- `07_Mobile/src/screens/HomeScreen.js`
- `07_Mobile/src/screens/MyOrdersScreen.js`
- `07_Mobile/src/screens/AssetHistoryScreen.js`

**Documentación:**

- `02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md`, `02_Arquitectura/README.md`, `README.md`
- `08_Pruebas/BRIDGE_CORRELACION_Y_HISTORIAL.md`, `08_Pruebas/EXPERIENCIA_POR_ROL.md`, `08_Pruebas/INFORME_PRUEBAS.md`
- `Documentos/PMP_Suite_Manual_Global_v5.md`
- `Documentacion Capstone/Artefactos Metodologia Cascada/README_VIGENCIA.md`
- En `Diagramas_PlantUML/`: índice 00 y documentos 05, 06, 07, 08 rotulados históricos.
- Este informe y `08_Pruebas/evidencias/requerimientos-casos/`.

## 14. Pruebas y builds

| Verificación | Resultado | Evidencia |
| --- | --- | --- |
| Backend `npm test` | **53/53** | [Log](evidencias/requerimientos-casos/requirements-backend-tests.log) |
| Frontend `npm test` | **54/54** | [Log](evidencias/requerimientos-casos/requirements-frontend-tests.log) |
| Web `npm run build` | **Correcto** | [Log](evidencias/requerimientos-casos/requirements-web-build.log) |
| Expo export Android + iOS | **Correcto, código 0** | [Log](evidencias/requerimientos-casos/requirements-mobile-export.log), [bundles y firmas](evidencias/requerimientos-casos/mobile-artifacts.json) |
| Bridge correlación | **Correcto** | [E2E](evidencias/requerimientos-casos/requirements-bridge-e2e.json) |
| Flujo escaneo | **Correcto** | [E2E](evidencias/requerimientos-casos/requirements-scan-e2e.json) |
| Nomenclatura logística | **Correcto** | [E2E](evidencias/requerimientos-casos/requirements-logistics-e2e.json) |
| Casos, ingreso y despacho | **Correcto** | [E2E](evidencias/requerimientos-casos/requirements-new-e2e.json) |

Los E2E de escaneo/logística conservan sus validaciones de recepción, laboratorio, QA y evidencia física. Se adaptó el tramo que esperaba una IN anticipada al contrato nuevo. El E2E nuevo cubre MV/MC/PDV/PDC, ceros iniciales, internos, duplicados, PoD derivado, reparación completa, stock sin IN fantasma, rechazos de elegibilidad, múltiples IN, concurrencia, rollback al fallar la correlación, compatibilidad IN histórica, instalación, KPI, consultas móviles y separación de historiales.

Todos los clústeres efímeros se eliminaron y las verificaciones de origen pasaron. La suite nueva compara firmas de contenido de todas las tablas de la base original antes/después. Ninguna prueba E2E usa esa base para insertar fixtures.

## 15. Límites y operación pendiente

- Falta ejecutar el recorrido visual con un lector físico y un teléfono. Las pruebas de componentes y API no certifican el hardware; el origen SCANNER es declarado por el flujo y auditado.
- La exportación móvil produce bundles Android/iOS; no es un APK/IPA firmado ni una prueba en dispositivo.
- Se preservó la autorización física por estación: Logística confirma Bodega; Admin conserva su estación de laboratorio. No se ampliaron roles por conveniencia de demo.
- Los históricos sin caso permanecen sin caso; no se reconstruyen relaciones por coincidencia numérica. Las IN históricas pendientes conservan su camino compatible.
- No hay reglas nuevas de compatibilidad por modelo: el proyecto no tenía un catálogo operativo de compatibilidad bus/modelo que reutilizar. Sí se exige el tipo de equipo del caso.
- Para usar el código actualizado, reiniciar la API local y recargar web/mobile. La migración local ya está aplicada. Otros entornos deben aplicar la migración antes de iniciar este backend.

## 16. Guión manual E2E

El [guión completo de 28 pasos](../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md#12-guión-manual-e2e-detallado) detalla preparación, ingresos, ceros, duplicados, reparación, rechazo por elegibilidad, escaneo, confirmación, dos IN, Mobile, búsqueda y Bridge. Debe ejecutarse con datos de prueba.

Recorrido principal resumido:

1. Ingresar como Logística el requerimiento AR-12345678 del validador 7404593 y bus BJ2514. Verificar MV-12345678 y su correlación.
2. Ejecutar recepción → Lab → reparación → QA → Bodega sobre esa misma serie. Confirmar ausencia de nueva IN por recepción.
3. Abrir inventario y **Despacho por escaneo**, sin elegir fila. Seleccionar caso, OS origen, bus, terminal, operador y técnico Rodrigo.
4. Seleccionar captura con lector y escanear 7400010 elegible. Verificar tipo, serie, modelo, QA y Bodega. Confirmar que todavía no existe IN ni salida.
5. Confirmar despacho. Verificar IN-12345678-01, correlación AR, evento de salida, retiro del stock y En ruta.
6. En Mobile de Rodrigo, revisar contexto y completar la instalación de la serie asignada. Verificar En operación y reducción de En ruta; MV-12345678 conserva su serie y reparación.
7. Repetir la necesidad con otro equipo elegible: IN-12345678-02, sin renombrar la primera.
8. Buscar cada serie por separado y luego AR-12345678. Verificar historiales individuales y reconstrucción del caso con ambas instalaciones.
9. Probar lectura incorrecta, falta de QA, asignación, fuera de Bodega, captura manual y doble confirmación. Revisar bloqueo, errores visibles y conservación del formulario.

## 17. Capstone y documentación

Se publicó la adenda técnica con diagnóstico y diagramas del flujo vigente. Se marcaron los documentos/diagramas contradictorios como históricos y se agregó un índice de vigencia para los DOCX, conservando los binarios y sus evidencias.

PMP Suite constituye una solución autónoma. Dentro del Capstone, los requerimientos externos ingresan de forma asistida; el sistema crea sus OS y conserva referencias mediante correlación. API/Web Service/Webhook/ETL con Aranda queda documentado como **proyección de integración productiva/comercial**, fuera del alcance Capstone. Una integración futura sustituye el ingreso asistido sin cambiar el modelo operacional central.

## 18–20. Confirmaciones

- **No se agregó Docker**, Dockerfile, docker-compose ni diagramas Docker.
- **No se alteraron códigos, identidades ni datos de OS históricas durante la migración.** Se verificaron las 100 OS existentes y las demás tablas mediante firmas antes/después.
- **Bridge continúa sin lógica operacional**: no crea OS por sí mismo, no asigna técnicos, no despacha, no instala ni modifica stock/estados.
