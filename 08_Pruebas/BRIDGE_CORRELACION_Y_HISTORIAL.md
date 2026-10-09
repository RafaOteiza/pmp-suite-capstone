# Bridge: correlación externa e historial del activo

Fecha de validación: 15 de septiembre de 2026.

Este documento complementa la [línea base normativa Capstone v2.0](../Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_VIGENCIA_v2.0.md) para Bridge. Las pruebas documentadas aquí corresponden a la entrega histórica de correlación, anterior a la evolución de casos y despacho; no se ejecutaron nuevamente en esta actualización documental. Para el contrato operacional consultar la [adenda de casos e ingreso de requerimientos](../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md) y el [informe vigente de recepción inicial y resultados registrados](RECEPCION_INICIAL_SIN_OS.md).

Gestión de activos registra el maestro; Requerimientos opera solo sobre activos existentes. La recepción inicial exige escaneo y conformidad en BODEGA sin OS ni bus ficticio. El historial por tipo + serie admite sus eventos sin OS, además de órdenes y referencias posteriores. Stock inicial conforme y stock reparado aprobado por QA comparten el despacho physical-first: solo confirmar la salida crea una IN con correlativo PMP independiente y SALIDA_BODEGA_TERRENO. Bridge conserva únicamente la correlación con la OS existente. El esquema vigente incorpora las migraciones 003–006; se mantiene Expo SDK 57 y Docker fuera del alcance.

## Ampliación: correlaciones de un caso operacional

Caso, OS PMP, activo físico y referencia externa son conceptos diferentes. Ingreso de requerimientos crea el caso y la OS; el despacho confirmado crea la IN. Esas operaciones pueden registrar la correlación en su transacción, pero no se ejecutan desde Bridge.

El índice único existente incluye `tipo_equipo + serie + codigo_os + sistema_externo + referencia_externa`. Por ello ya admite `AR-12345678 ↔ MV-12345678` para el activo retirado y `AR-12345678 ↔ IN-000184` para el instalado. No se cambia el índice ni se elimina la protección contra el vínculo exactamente duplicado.

El historial individual conserva tipo + serie como identidad. La consulta adicional de caso reconstruye las distintas intervenciones mediante relaciones explícitas y permite navegar a cada activo sin mezclar sus historias. Al buscar una referencia/caso, la UI puede ofrecer el caso completo; al buscar una serie, prioriza el historial del activo. Los endpoints de correlación conservan su contrato de búsqueda de activos.

PMP funciona sin Aranda. En el Capstone se usa ingreso asistido; la integración automática futura en SONDA queda fuera de ese alcance. La coincidencia numérica de AR y OS solo facilita lectura humana y nunca sustituye las relaciones registradas. Los códigos históricos se conservan y los componentes nuevos mantienen ceros iniciales como texto.

## Resultado y alcance

Bridge permite vincular **tipo de equipo + serie + OS PMP existente + sistema externo + referencia externa**, por ejemplo una OS Aranda. Las asignaciones, creación de órdenes, reparaciones, QA e inventario pertenecen al circuito normal de OS PMP.

Se conserva la arquitectura Node/Express/PostgreSQL, React/TypeScript/Vite y Expo/React Native. No se incorporaron Docker, dependencias nuevas ni integración de escritura con Aranda. La referencia externa se registra como correlación; no implica sincronización con el sistema externo.

La revisión cubrió las dependencias de Bridge en backend, rutas operativas de OS/laboratorio/QA/bodega/administración, escaneo, búsqueda global, navegación, jornada por rol, historial web, pantallas móviles, migraciones, pruebas y documentación de requisitos y arquitectura. Los cambios anteriores que ya existían en el repositorio se conservaron.

## Cambios

### Backend y datos

- `POST /api/bridge`: inserta únicamente un vínculo en `pmp.bridge_referencias`. Comprueba equipo, tipo y pertenencia de la OS a la serie dentro de una transacción.
- Escritura autorizada para `admin` y `logistica`. Gerente, técnicos y QA consultan historial y correlaciones; sus permisos operativos siguen en las rutas normales.
- Rechazo de campos operacionales (técnicos, ubicación, stock, estados), datos incompletos e identidades inconsistentes. Los códigos se conservan como texto, incluidos ceros iniciales.
- Múltiples referencias por OS y múltiples OS por activo. Índice único del vínculo con sistema/referencia sin distinción de mayúsculas, protección ante concurrencia y rechazo de duplicados heredados.
- Las antiguas acciones de Bridge y mantenimiento devuelven `410 BRIDGE_CORRELATION_ONLY`; no ejecutan operaciones. Los filtros que excluían OS antiguas de Bridge del circuito normal fueron retirados.
- `GET /api/bridge/buscar?q=...` y `GET /api/dashboard/global-search?q=...`: resuelven serie, OS PMP o referencia externa a activos. Devuelven todas las coincidencias, distinguiendo validador y consola si comparten serie.
- `GET /api/bridge/activos/:tipo/:serie/historial`: reúne todas las OS, referencias, fechas, reparaciones, QA, escaneos, instalaciones y eventos registrados del activo, sin el límite anterior de diez órdenes ni excluir ubicaciones nulas.
- La vista `pmp.v_referencias_activo` conserva referencias anteriores de `ticket_aranda` y Bridges históricos. No sustituye `codigo_os` por identificadores externos.
- La migración aditiva `002_bridge_correlacion.sql` añade correlaciones y auditoría de cambios futuros de OS. La identidad del activo en una OS queda inmutable. Los históricos y vínculos son de solo adición.
- Los cambios futuros muestran valores anteriores/nuevos de estado, ubicación, responsables, bus, falla y aprobación QA. Los nombres se resuelven con los catálogos actuales.

### Web y móvil

- Formulario Bridge de correlación, sin controles de técnico, reemplazo, reserva, creación de OS ni movimiento de equipos.
- Referencias vinculadas enlazan al historial por tipo y serie.
- La búsqueda de activos permite escoger entre varias coincidencias. La evolución de casos agrega la navegación al caso completo cuando el término identifica su referencia; no sustituye los historiales individuales.
- Historial con todas las intervenciones/OS PMP, referencias externas y eventos; cambia correctamente al navegar entre búsquedas en la misma pantalla.
- Jornadas de terreno, laboratorio y QA consultan sus bandejas normales de OS. Escaneo deja de redirigir operaciones hacia Bridge.
- Móvil incorpora «Historial del activo» en inicio y un acceso desde cada tarjeta de Mis Órdenes, con consulta por serie/OS PMP/OS Aranda y los mismos eventos y referencias.

## Migración aplicada

Se ejecutó `node verification/apply_bridge_correlation.mjs` en la base indicada por el `.env` del backend. El script compara las firmas de los datos antes y después dentro de una transacción, antes de confirmar.

Resultado: **datos operacionales sin cambios**: 100 OS, 50 validadores, 50 consolas, 1 Bridge anterior, 0 relaciones antiguas de mantenimiento y 24 registros de repuestos. Se conservaron técnicos, estados, ubicaciones e identificadores.

En otra instalación, primero deben estar disponibles el esquema base y las migraciones existentes `bridge/001` y `escaneo/001`; después ejecutar el script de aplicación de correlación desde `03_Backend/pmp-api`. Reiniciar el backend para cargar las rutas nuevas y recargar la web o el bundle móvil.

## Pruebas y build

| Validación | Comando y ubicación | Resultado |
|---|---|---|
| Backend | `npm test`, en `03_Backend/pmp-api` | 49/49 aprobadas |
| Sintaxis backend | `node --check` sobre los archivos JavaScript de `src` | 29 archivos aprobados |
| Frontend | `npm test`, en `04_Frontend` | 43/43 aprobadas |
| Web | `npm run build`, en `04_Frontend` | TypeScript y Vite aprobados |
| Móvil | `npx expo export --platform android --platform ios --output-dir ../tmp/mobile-correlation-build`, en `07_Mobile` | Bundles Hermes Android e iOS generados |
| Correlación HTTP + PostgreSQL | `node verification/bridge_correlation_e2e.mjs`, en backend | Aprobada, clúster efímero eliminado |
| Circuito normal OS y escaneos | `node verification/equipment_scan_flow_e2e.mjs`, en backend | Aprobada, base original intacta |
| Migración local | `node verification/apply_bridge_correlation.mjs`, en backend | Aplicada; firmas operacionales idénticas |

La API utiliza JavaScript directamente y no define un script de compilación; su validación incluye pruebas HTTP y comprobación de sintaxis. Los paquetes Expo son exportaciones de JavaScript/Hermes: **no son APK/IPA firmados ni sustituyen pruebas en un dispositivo físico**.

Las antiguas pruebas que exigían asignaciones y creación de mantenimiento desde Bridge fueron reemplazadas por pruebas del contrato nuevo. Los comandos históricos de `FLUJO_BRIDGE_MANTENIMIENTO.md` describen el flujo retirado; para correlación usar el E2E indicado arriba.

### Cobertura de integración

- Una serie con 13 OS; referencias diferentes en la misma OS y la misma referencia en varias intervenciones.
- Validador y consola con la misma serie, correctamente separados por tipo.
- Activo sin OS y OS sin ubicación.
- Búsquedas por OS, referencia nueva y Aranda heredada, incluida la ruta global.
- Comparación íntegra de OS, técnicos, ubicaciones, validadores, consolas, repuestos, instalaciones y eventos OS antes/después de crear referencias: sin cambios operacionales.
- Duplicado secuencial, duplicado heredado y dos solicitudes simultáneas: conflicto controlado, un solo vínculo.
- Rechazos de serie desconocida, OS inexistente, OS de otra serie y tipo incorrecto.
- Campos de operación rechazados con 422; roles sin escritura con 403; operaciones retiradas con 410.
- Asignación por HTTP en `/api/lab/assign` después de vincular referencias: sigue funcionando en el flujo normal.
- Cambio normal de responsable visible en el historial con nombre y valores anterior/nuevo.
- Protección contra cambio de identidad de una OS histórica.
- Circuito normal: recepción, laboratorio, reparación, QA, retorno a bodega y asignación de instalación; seis escaneos válidos en tres estaciones. Conserva bloqueos por falta de escaneo y de asignación QA.

Evidencia reproducible: carpeta [`evidencias/bridge-correlacion`](evidencias/bridge-correlacion).

## Guión manual paso a paso

### 1. Preparar datos y sesiones

1. Iniciar el backend con `npm run dev` desde `03_Backend/pmp-api` y la web con `npm run dev` desde `04_Frontend`, en terminales distintas. Si ya estaban abiertos, reiniciar el backend y recargar la web.
2. Iniciar sesión como logística. Elegir un **validador real** y anotar su serie como **S**, una OS existente como **P1**, técnico, estado, ubicación y disponibilidad en bodega. Elegir también una consola real para repetir la prueba.
3. Para verificar varias intervenciones, disponer de otra OS histórica **P2** de S. Si no existe, completar la OS actual y registrar otra intervención mediante el circuito normal de OS en una base de pruebas. Bridge nunca prepara estas órdenes.
4. Anotar el total de OS y stock de equipos/repuestos antes de vincular. Usar referencias de prueba únicas, por ejemplo `AR-PRUEBA-20260915-01` y `AR-PRUEBA-20260915-02`.

### 2. Vincular sin operar

5. Abrir **Bridge · Referencias externas**. Comprobar que el formulario contiene tipo, serie, OS PMP, sistema, referencia externa y comentario. No debe contener técnico, equipo disponible, reemplazo ni acciones de instalación/recepción.
6. Introducir tipo `VALIDADOR`, S, P1, sistema `ARANDA` y la primera referencia. Pulsar **Vincular referencia**. Esperar el mensaje de éxito y la fila en la tabla.
7. Volver a las vistas de OS y stock. Comparar con lo anotado: mismo número de OS, mismo técnico, estado, ubicación y disponibilidad; repuestos sin cambios.
8. Volver a Bridge y vincular la segunda referencia a S + P1. Luego vincular la primera referencia a S + P2. Deben existir tres vínculos, manteniendo P1 y P2 como OS distintas.
9. Repetir la vinculación con una consola y su propia OS. Debe funcionar sin tratar la serie como validador ni convertirla a número.

### 3. Historial y búsqueda

10. Pulsar la serie de una fila Bridge. Verificar que la cabecera muestra tipo y S; deben aparecer **todas** las OS del activo, incluso las que no tienen referencia externa.
11. En cada intervención revisar el código OS PMP original, fecha, falla, estado, ubicación y todas sus referencias. Revisar también las secciones de referencias y eventos, con fechas y detalles legibles.
12. Buscar S en la barra global, seleccionar el activo y anotar la URL de historial. Repetir buscando P1 y la primera OS Aranda: deben llevar al mismo tipo + serie, con el historial completo, no solo a la OS que coincidió.
13. Desde Trazabilidad buscar otra OS/serie sin salir de la pantalla. Debe cambiar el activo y no conservar resultados anteriores. Probar un valor inexistente: debe mostrar ausencia de coincidencias.
14. Cuando un término coincida con varios activos, escoger uno y comprobar que no se mezclan sus OS. Si hay series iguales en ambos maestros, seleccionar explícitamente validador o consola.
15. Consultar un activo sin OS y uno cuya OS no tenga ubicación. Deben ser consultables; el primero muestra cero OS y el segundo «Sin ubicación».

### 4. Validaciones negativas

16. Repetir exactamente S + P1 + ARANDA + la primera referencia. Debe informar que ya existe y no aumentar el total de vínculos. Repetir variando mayúsculas de sistema/referencia.
17. Intentar vincular P1 a una serie distinta, cambiar tipo a `CONSOLA` manteniendo P1, usar una OS inexistente y dejar campos obligatorios vacíos. Ningún intento debe crear vínculos ni modificar OS/stock.
18. Abrir sesión de gerente, técnico de terreno, laboratorio o QA. Deben poder consultar el historial y referencias, sin el formulario de creación. La API debe rechazar un POST de correlación de esos roles con 403.
19. Como comprobación técnica opcional, enviar con una sesión autorizada un POST Bridge que además incluya `tecnico_terreno_id` o `estado_id`: esperar 422. Llamar la antigua ruta `PATCH /api/bridge/BR-ANTERIOR/asignar-terreno` o `POST /api/bridge/BR-ANTERIOR/completar`: esperar 410 y comprobar datos intactos.

### 5. Comprobar el circuito normal

20. Como administrador, asignar una OS de laboratorio elegible con referencias desde **Asignar carga**, dentro del módulo de laboratorio. El técnico debe recibirla en su bandeja normal. Bridge no interviene en esta asignación.
21. Consultar nuevamente el historial de S. Verificar que aparece el cambio de responsable con fecha y valores anterior/nuevo. Los vínculos externos y códigos OS deben seguir iguales.
22. Continuar una OS de prueba por recepción, escaneo de estación, diagnóstico/reparación, despacho, QA y bodega según los roles habituales. Confirmar que las acciones se realizan desde esos módulos y que el historial agrega sus registros. Comprobar que omitir un escaneo sigue bloqueando el movimiento.

### 6. Móvil

23. En `07_Mobile`, configurar `EXPO_PUBLIC_API_URL` hacia el backend accesible desde el teléfono e iniciar `npm start`. Abrir la aplicación y autenticar al técnico.
24. Desde Inicio abrir **Historial del activo**. Buscar S, P1 y la OS Aranda. Cada búsqueda debe resolver al mismo activo y mostrar todas sus intervenciones, referencias y eventos.
25. Abrir **Mis Órdenes** y pulsar **Ver historial del activo** en una tarjeta. Debe abrir el historial sin ejecutar instalar/devolver ni disparar el diálogo de esa acción.
26. Repetir con una consola y con un término inexistente. Probar un error de conexión: debe informar el error sin presentar datos viejos como un resultado válido.

### Criterio de aceptación

La única diferencia causada por Bridge debe ser la incorporación del vínculo externo. Cualquier cambio de técnico, creación de OS o movimiento de stock debe originarse en una acción explícita del circuito normal. Serie/tipo, OS PMP y referencia externa permanecen como identidades distintas y consultables.

## Límites de la evidencia

- Se ejecutaron suites automatizadas, integración HTTP con PostgreSQL real aislado y builds. El recorrido visual completo del guión y la prueba en teléfono físico quedan para ejecución manual; no se presentan como realizados.
- La auditoría nueva registra cambios desde que se aplica la migración. Los eventos anteriores se muestran cuando existen en las tablas históricas; no se inventan transiciones pasadas que nunca fueron registradas.
- Se conservan Bridges operacionales antiguos como históricos, pero sus acciones se retiraron. No se convierten automáticamente en órdenes ni se reasignan equipos.
- Las búsquedas e historiales no truncan resultados. Para volúmenes muy superiores al conjunto actual puede requerirse paginación explícita en una evolución posterior.
