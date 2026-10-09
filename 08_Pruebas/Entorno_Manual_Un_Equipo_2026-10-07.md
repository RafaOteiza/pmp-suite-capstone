# Sistema habitual vacío para prueba manual — procedimiento vigente

## Corrección de alcance ejecutada — 7 de octubre de 2026, 22:29 (Santiago)

**El entorno vigente es `http://localhost:5173`, conectado a la API habitual `localhost:4000` y a `localhost:5432 / pmp_suite`.** Se vaciaron los datos operacionales de esa base con autorización explícita, incluido MV-87126356 y el activo 7490004. No se registró ningún activo ni se ejecutó el recorrido manual.

La demo separada queda **fuera del procedimiento vigente**. Se detuvieron sus procesos de API 4100, web 5175, Expo 8082 y PostgreSQL 55435, previa identificación de propietarios y conexiones. Sus archivos, credenciales, respaldos y la copia de recuperación se conservan fuera de la operación activa. No utilizar los comandos de arranque de demo del anexo histórico.

### Conexiones efectivamente comprobadas

| Componente habitual | Conexión comprobada |
|---|---|
| PostgreSQL | `localhost:5432 / pmp_suite`, dirección efectiva `::1`, PostgreSQL 18.1 |
| API | `http://localhost:4000`; sus sockets PostgreSQL se correlacionaron por puerto cliente/PID con `pg_stat_activity` en `pmp_suite` |
| Web | `http://localhost:5173`; módulo servido por Vite apunta a `http://localhost:4000` |
| Mobile | Metro 8081; bundle Android servido apunta a `http://192.168.1.84:4000/api` |
| IA | La API habitual ejecuta `analyzer.py` con su conexión habitual; la consulta real devuelve `[]` |

Se encontró y corrigió una IP antigua en `07_Mobile/.env`: `192.168.1.83` → `192.168.1.84`, dirección Wi-Fi actual de esta computadora. Se reinició únicamente Expo habitual en el mismo puerto 8081 y se recompiló su bundle. Se comprobó que la API por LAN y por localhost devuelve los mismos datos. No se cambió el SDK ni se redirigió ningún cliente a la demo.

Las cifras de **26 equipos en operación y 25 en Laboratorio** provenían realmente de `/api/dashboard/summary` en la API habitual, antes de la limpieza. No eran valores de la demo. La misma consulta ahora devuelve cero, sin filtros adicionales ni constantes ficticias.

### Respaldo actual y recuperabilidad

- Respaldo completo nuevo, snapshot consistente de solo lectura: **7 de octubre, 22:24:26 Santiago / 8 de octubre, 01:24:26 UTC**.
- Archivo: `Respaldos/PMP_Suite/2026-10-07-limpieza-habitual/pmp_suite-before-habitual-cleanup-2026-10-08T01-24-26-415Z.dump`.
- SHA-256: `90163b02cd394ff0344922e4722c2c9ad8af3975f2498692df4f64402a92e8fa`.
- Restauración real satisfactoria con `pg_restore --exit-on-error --single-transaction` en `pmp_recovery_check_1791422682591`, dentro de la instancia auxiliar local 55435. Esta copia es exclusivamente de recuperación y está fuera de servicio.
- Coincidencia de las **26 tablas completas, 19 secuencias y estructura**: columnas, restricciones, triggers, funciones, índices y vistas. La comparación utiliza UTC, orden textual estable y normalización de casts equivalentes de PostgreSQL.
- La limpieza se ensayó allí dentro de una transacción con **rollback**. Se comprobó nuevamente que la copia conservaba todos los datos del respaldo.
- Inmediatamente antes de limpiar la base habitual se bloquearon sus tablas, se comparó otra vez el snapshot completo con el respaldo y se confirmó que no existían cambios concurrentes.
- El dump conserva eventos, metadata y evidencias fotográficas almacenadas en JSON/base64. No se borraron archivos de evidencias, fotografías externas, documentos ni archivos compartidos. Los directorios `08_Pruebas/evidencias`, `10_Evidencias`, la documentación Capstone y los artefactos privados permanecen conservados.
- No se ejecutó `DROP DATABASE`, `DROP SCHEMA`, reinstalación, modificación de migraciones ni desactivación de restricciones.

### Datos eliminados y conservados

| Datos operacionales | Antes | Después |
|---|---:|---:|
| Validadores | 51 | 0 |
| Consolas | 50 | 0 |
| OS de todos los tipos | 102 | 0 |
| Casos / requerimientos | 2 | 0 |
| Bridges / referencias externas | 1 / 2 | 0 / 0 |
| Reparaciones | 26 | 0 |
| Escaneos / eventos / historial del activo | 4 / 37 / 22 | 0 / 0 / 0 |
| Instalaciones, QA, guías, detalles y solicitudes de repuestos | 0 | 0 |

Las **17 tablas operacionales** quedaron vacías (297 filas eliminadas). Asignaciones, PoD, retiros, custodia y borradores persistidos estaban contenidos en esas OS/eventos; no quedan trabajos asociados. Se utilizó una única transacción con `TRUNCATE` sobre una lista explícita, `RESTRICT` y `CONTINUE IDENTITY`; no se utilizó `CASCADE`. El stock de repuestos se actualizó directamente a cero, sin movimientos artificiales.

| Configuración preservada | Cantidad |
|---|---:|
| Usuarios y sus roles/identidades | 6 |
| Estados / ubicaciones / relaciones estado-ubicación | 13 / 3 / 14 |
| Buses | 347 |
| Terminales / operadores PST / relaciones terminal-PST | 11 / 15 / 165 |
| Referencias del catálogo de repuestos | 24, con stock 0 y umbrales originales |

Se compararon los hashes de todos los maestros antes/después; son idénticos. En repuestos se comparó el catálogo excluyendo únicamente `stock`. Se conservaron secuencias, tipos, catálogos técnicos, métodos Manual/Test MK, permisos, FSM y SLA. No se cambiaron cuentas, contraseñas ni claims de Firebase. No se sembró un contexto de ejemplo ni se redujo la flota a BJ2149.

**Las 24 alertas de repuestos son correctas:** todas las referencias tienen stock cero frente a umbrales conservados. No representan movimientos antiguos ni se ocultan.

### Verificación real posterior

- API habitual: **27 consultas GET aprobadas**, más comprobación de acceso de los seis roles existentes, con autenticación Firebase real y sin bypass. Cero filas en bandejas, activos, búsquedas, OS, retiros, stock de equipos, carga de Laboratorio y etapas QA; IA `[]`.
- Dashboard habitual: todos los KPI operacionales en **0**; `tiempoPromedio: null`, mostrado como **Sin mediciones**. Badges `lab`, `lab_dispatch`, `bodega`, `qa`: **0**.
- Navegador real sobre web 5173 y API 4000, sin mocks: **17 vistas y 166 solicitudes aprobadas**. Dashboard, OS, activos, operación, retiros, inventario, Bodega, Laboratorio, QA y Trazabilidad vacíos; también bandejas de técnico de Laboratorio, técnico de Terreno, QA y Logística. Búsquedas globales de `7490004`, `MV-87126356` y `AR-87126356` sin resultados; consulta del maestro por serie sin coincidencias. Capturas de dashboard claro/oscuro en 390 y 1440 px. El verificador bloquea cualquier solicitud operacional que no sea GET/OPTIONS.
- Las verificaciones de lectura comparan tablas y secuencias antes/después para confirmar que no crearon operaciones. Los únicos ensayos de escritura ocurrieron en la copia aislada y se revirtieron; la limpieza autorizada fue la única intervención de mantenimiento sobre la base habitual.
- No se repitieron builds ni suites funcionales de las entregas previas: no se cambió lógica de negocio. Sus resultados fechados se conservan en el anexo como históricos. Se recompiló y comprobó el bundle Android habitual para verificar su dirección efectiva.

Respaldo y evidencia privada permanentes en `Respaldos/PMP_Suite/2026-10-07-limpieza-habitual/`: `habitual-inspection.json`, `habitual-connections.json`, `habitual-cleanup-backup.json`, `habitual-restore-check.json`, `habitual-cleanup-completed.json`, `habitual-api-empty.json`, `habitual-demo-retired.json`, `habitual-web/report.json` y capturas `habitual-web/dashboard-*.png`. No publicar esta carpeta: también contiene configuración privada.

### Cachés y continuidad del trabajo manual

No existen colas persistentes/offline de operaciones en Mobile ni caché persistente de listados operacionales en web. Las pantallas consultan la API. Los borradores QA en `sessionStorage` se recuperan únicamente después de consultar satisfactoriamente la OS/ciclo vigente; al eliminarse esas OS, no pueden recuperarse ni reproducir una acción válida. Los correlativos no se reiniciaron, evitando reutilizar identificadores antiguos.

Cerrar cualquier pantalla de trabajo abierta antes de la limpieza y recargar **5173**; en Expo, recargar completamente el proyecto de **8081**. No continuar desde el proyecto de demo 8082. No se borraron sesiones Firebase ni almacenamiento de otras aplicaciones. Si una pestaña conserva un borrador local antiguo, pueden descartarse exclusivamente claves `pmp:qa-draft:` y `pmp:qa-scroll:` de esa pestaña; no es necesario borrar todo el almacenamiento.

La herramienta `habitual-cleanup.mjs` no forma parte del arranque y rechaza repetir la operación cuando existe `habitual-cleanup-completed.json` en la carpeta permanente de respaldos. No se añadió ningún reset automático. Los avances manuales siguientes se conservan.

### Recuperación futura — instrucciones, no ejecutadas sobre la base habitual

1. Conservar `Respaldos/PMP_Suite/2026-10-07-limpieza-habitual/`, su dump y los archivos de evidencia externos del proyecto. La carpeta est? excluida de Git. El archivo mantiene el SHA-256 indicado arriba; su integridad y recuperabilidad se verificaron despu?s de copiarlo y antes de eliminar el origen.
2. Para repetir la comprobaci?n desde la ra?z del repositorio: `node 03_Backend/pmp-api/tools/verify-habitual-backup.mjs`. Usa los binarios PostgreSQL instalados, una instancia ef?mera con contrase?a aleatoria y puerto din?mico, restaura el dump y compara todas las tablas, secuencias y estructura. Detiene y elimina ?nicamente su directorio temporal al terminar. No recrea la demo, no abre 55435 ni modifica `pmp_suite`.
3. Patr?n de recuperaci?n del archivo: `pg_restore --exit-on-error --single-transaction --dbname <base_de_recuperaci?n_vac?a> <dump>`, con `PGHOST`, `PGPORT`, `PGUSER` y contrase?a por mecanismo privado. Requiere PostgreSQL 18 y rol propietario `postgres`. No ejecutar una restauraci?n completa sobre el esquema habitual existente ni usar `--clean` indiscriminadamente. El problema hist?rico de templates de la instancia habitual no interviene en la verificaci?n ef?mera.
4. Recuperar el punto anterior **en pmp_suite** es una operaci?n de mantenimiento distinta: detener escrituras, respaldar primero cualquier avance manual nuevo y planificar una carga transaccional de datos sobre el esquema existente, con todos los grupos relacionados y secuencias del respaldo. No mezclar ciegamente el dump antiguo con nuevas OS. No cambiar de base ni sobrescribir avances sin esa decisi?n expl?cita. Verificar integridad, triggers habilitados y conexiones al terminar.
5. El respaldo es un archivo permanente y verificable, no un entorno alternativo de trabajo. La instancia de demo y su copia de recuperaci?n ya no existen.

### Validaciones del complemento de eliminaci?n definitiva

- Restauraci?n del respaldo copiado: 26 tablas, 19 secuencias y estructura coincidentes; instancia ef?mera eliminada.
- Backend: **82 pruebas aprobadas**, incluidas las guardas de directorios temporales y protecci?n de credenciales. El primer intento restringido recibi? `spawn EPERM`; la ejecuci?n con permisos para el runner termin? sin fallos.
- E2E de entorno vac?o: **25 consultas y seis perfiles aprobados** sobre PostgreSQL ef?mero, con comprobaci?n de que la base habitual no cambi?.
- E2E de Nueva instalaci?n desde cero: **aprobado**, incluida IN sin caso/MV/AR previos, confirmaci?n f?sica, rollback, reintentos y primera falla posterior. Todos los activos/OS de ensayo existieron ?nicamente en la instancia ef?mera ya eliminada.
- Las mejoras funcionales de producto se conservaron. No se ejecut? el recorrido en el sistema habitual ni se cre? all? ning?n activo u OS.

### Inicio manual para Rafa

1. Abrir **http://localhost:5173** y recargar. Iniciar sesión con la cuenta habitual.
2. Confirmar dashboard y bandejas vacíos. Las 24 alertas de stock de repuestos son esperadas.
3. Registrar personalmente el primer activo en **Gestión de activos** y continuar con su recepción inicial física.
4. Usar **Nueva instalación** cuando corresponda; la IN se crea únicamente al confirmar despacho. No hace falta crear MV, caso ni AR previos.
5. Continuar las operaciones desde las pantallas habituales y Expo **8081** (`exp://192.168.1.84:8081`). Si cambia la IP de esta computadora, actualizar solamente la URL LAN de Mobile al mismo puerto 4000.

**Hasta esta entrega no se ejecutó ninguno de los pasos operacionales 3–5. La base habitual queda vacía para que Rafa los realice.**

---

<details>
<summary>HISTÓRICO — preparación anterior de demo y primera instalación. Fuera del procedimiento vigente; no ejecutar sus comandos de arranque.</summary>

Lo que sigue conserva la evidencia fechada de las entregas anteriores. Las afirmaciones de “base original intacta”, las direcciones 5175/4100/8082, la flota reducida y sus resultados corresponden a ese momento; no describen el estado actual. Las mejoras funcionales de primera instalación siguen vigentes, pero se utilizan desde el sistema habitual indicado arriba.

# Entorno manual persistente de un equipo — 7 de octubre de 2026

## Estado de entrega y límite del recorrido

La demo está creada, vacía y disponible para que Rafael registre manualmente el primer activo. No se dio de alta 7490004 ni se ejecutó el recorrido en esta base.

**Bloqueo resuelto el 7 de octubre de 2026:** el despacho ofrece Nueva instalación sin caso ni OS de origen, y conserva Instalación vinculada a un requerimiento para necesidades existentes. La nueva IN se crea solamente al confirmar la salida física. No se crean casos artificiales, MV ficticias ni referencias AR. La demo permanece vacía; el recorrido desde cero se probó en otra base efímera. Los detalles y resultados de esta corrección están en la sección final.

El hallazgo de la preparación anterior era real: el formulario y `warehouseDispatch.context()` exigían siempre `caso_id` + `os_origen`. El E2E anterior utilizaba un caso sembrado y no demostraba la primera instalación desde una base vacía. Esa evidencia previa no se reinterpreta como prueba del nuevo recorrido.

## Conexiones sin secretos

| Servicio | Habitual, conservado | Demo de un equipo |
|---|---|---|
| PostgreSQL | `localhost:5432 / pmp_suite` | `127.0.0.1:55435 / pmp_capstone_un_equipo` |
| API | `http://localhost:4000` | `http://localhost:4100` |
| Web | `http://localhost:5173` | `http://localhost:5175` |
| Expo / Metro | puerto 8081 | puerto 8082 |
| API para teléfono | configuración habitual intacta | `http://192.168.1.84:4100/api` |

La instancia habitual presenta archivos de catálogo ausentes en template0/template1 (`base/4/2838` y `base/1/2618`). La base original permite lectura y respaldo, pero crear otra base en esa instancia falló. No se reparó ni reinició esa instancia: se reutilizaron los binarios PostgreSQL 18 instalados para levantar una instancia local separada y persistente en 55435. No se instaló Docker ni otro motor.

Datos persistentes y configuración privada: `.local/pmp-single-equipment/`, excluida de Git. No borrar esta carpeta al cerrar la aplicación. Contiene credenciales locales, respaldo, manifiesto, logs y `postgres/data`. No compartirla ni publicarla como evidencia sin revisar su contenido. El arranque conserva la base; detener web/API/Expo no la elimina.

## Respaldo y restauración

- Respaldo completo de la base, formato custom de `pg_dump`, con snapshot consistente de solo lectura: **2026-10-07 23:14:31 UTC** (20:14:31 de Santiago).
- Archivo: `.local/pmp-single-equipment/pmp_suite-full-2026-10-07T23-14-31-271Z.dump`.
- SHA-256: `338697ae726c30ddbec420030de87dfd4606a42522dfe856e9982ad951364b9f`.
- PostgreSQL 18.1. Commit `5e1baef9e9798240024dd978d840c5875897d5ea`; árbol de trabajo con cambios previos, 241 entradas al tomar el respaldo. El commit solo no representa todo el código local utilizado.
- Restaurado realmente en una base de comprobación separada, antes de crear la demo. Comparación satisfactoria de las 26 tablas completas, 19 secuencias y estructura: columnas, restricciones, funciones, índices, triggers y vistas. La comparación normaliza UTC, ordenación textual y la representación equivalente de casts de arrays en restricciones.
- Se eliminaron únicamente las copias de comprobación identificadas con sus propios marcadores. La base manual persiste.
- Se clonó el esquema actual y su configuración necesaria; no se ejecutaron semillas históricas. El esquema incorpora los cambios vigentes de migraciones 003–006. No se editaron migraciones ni se deshabilitaron restricciones.
- Comparación final de todas las tablas y secuencias de la base original contra el respaldo: idénticas, incluido MV-87126356 y sus evidencias. No se borraron archivos compartidos ni fotografías.

Evidencia privada: `backup.json`, `restore-verification.json`, `restore-cleanup.json`, `source-preserved.json`, `final-verification.json`, dentro de la carpeta local.

## Configuración conservada y conteos iniciales

| Elemento | Cantidad / condición |
|---|---|
| Usuarios | 6 existentes, activos, con roles y datos de identidad copiados |
| Estados | 13 |
| Ubicaciones | 3: Bodega Central Mersan, Laboratorio Garantías, Certificación Sonda |
| Relaciones estado/ubicación | 14 |
| Bus | 1: BJ2149 |
| Terminal | 1: El Conquistador, ID 1 |
| Operador/PST | 1: VOYSANTIAGO, código U15 |
| Relación terminal/PST | 1 |
| Catálogo de repuestos | 24 referencias, todas con stock 0; umbrales conservados |
| Validadores / consolas | 0 / 0 |
| OS / casos | 0 / 0 |
| Instalaciones / reparaciones / QA | 0 / 0 / 0 |
| Escaneos / eventos / historial activo | 0 / 0 / 0 |
| Solicitudes e ítems de repuestos | 0 / 0 |
| Guías y detalles | 0 / 0 |
| Bridge y referencias externas | 0 |
| PoD / asignaciones / borradores técnicos | 0; sin OS ni eventos que los contengan |
| Disponibles / en tránsito / por verificar | 0 / 0 / 0 |

Las 17 tablas operacionales están vacías: `bridge_mantenimiento`, `bridge_referencias`, `bridges`, `casos_operacionales`, `consolas`, `escaneos_equipos`, `flujo_eventos`, `guia_detalle`, `guias`, `instalaciones_equipos`, `ordenes_servicio`, `os_historial_activo`, `qa_inspecciones`, `registro_reparaciones`, `solicitud_items`, `solicitudes_repuestos`, `validadores`.

Los tipos, catálogos técnicos, métodos Manual/Test MK, permisos y umbrales SLA definidos en código permanecen intactos. Modelo y marca son atributos del maestro, no justifican sembrar un activo. Se introducirán CVB45 y Mikroelektronika al registrar el equipo.

La relación BJ2149 / El Conquistador / U15 se resolvió de los datos reales; no se importó la flota ni su instalación. El maestro `buses` contiene PPU, mientras terminal y operador se relacionan en el contexto operacional: no se inventaron nuevas columnas/relaciones. Usar estos valores al indicar el destino de instalación.

**Las 24 alertas de repuestos son legítimas:** stock cero frente a los umbrales conservados. No son movimientos antiguos ni se ocultaron para aparentar una demo limpia. La primera prueba no consume repuestos.

## Identidades y acceso

| Usuario existente | Rol |
|---|---|
| Rafael Oteiza | admin |
| Sergio Delgadillo | logistica |
| Rodrigo Escobar | tecnico_terreno |
| Jose Villarroel | tecnico_laboratorio |
| Cristian Alvarez | qa |
| Jorge Castillo | gerente |

Las seis cuentas se encontraron activas en Firebase por su correo real. Sergio y Cristian tienen un UID almacenado en PostgreSQL distinto del UID actual de Firebase; se preservó el dato original. `ensureUser` resuelve la autorización por correo del token verificado y rol en PostgreSQL, por lo que esa diferencia no impide la correspondencia de roles vigente. No se cambiaron cuentas, contraseñas, UID ni claims.

El login interactivo con contraseña debe hacerlo cada usuario; no se utilizaron credenciales de usuario ni tokens de suplantación. El E2E simula únicamente el contexto Firebase dentro de su proceso aislado y verifica la autorización PostgreSQL real. La API demo mantiene autenticación Firebase normal y devuelve 401 sin token. Admin recibe 403 al intentar operar QA.

## Arranque y cambio de entorno

Desde PowerShell, en `C:\Users\raote\Documents\Duoc\Tesis`:

```powershell
node 03_Backend/pmp-api/tools/run-single-equipment.mjs start
node 03_Backend/pmp-api/tools/run-single-equipment.mjs status
node 03_Backend/pmp-api/tools/run-single-equipment.mjs mobile-start --host 192.168.1.84
```

Web: abrir **http://localhost:5175**. La pestaña se titula `PMP Suite · DEMO UN EQUIPO`. Verificar la conexión real de la API en **http://localhost:4100/__local/environment**: debe indicar `pmp_capstone_un_equipo`, puerto `55435` y `DEMO UN EQUIPO`. El endpoint consulta la conexión PostgreSQL efectiva, no una etiqueta estática.

Los servicios quedaron iniciados al entregar. `start` reutiliza API/web propios activos; `mobile-start` rechaza un puerto 8082 ya ocupado. Si ya está funcionando, abrir directamente Expo en `exp://192.168.1.84:8082`. Usar la misma red y una recarga completa del proyecto; no continuar en el proyecto habitual de 8081. Si cambia la IP LAN, detener la demo y volver a iniciarla usando la IP actual en `--host`.

Para detener exclusivamente los procesos de esta demo:

```powershell
node 03_Backend/pmp-api/tools/run-single-equipment.mjs stop
```

El comando comprueba PID, ruta del lanzador y marcador antes de detener sus procesos. PostgreSQL y sus datos permanecen disponibles. Tras reiniciar Windows, `start` vuelve a levantar la instancia PostgreSQL demo si hace falta.

Para volver al entorno anterior: abrir `http://localhost:5173` y el proyecto móvil habitual de 8081. Los `.env` habituales no se cambiaron y sus servicios no se detuvieron. Si no están corriendo, iniciar como siempre: `npm run dev` en `03_Backend/pmp-api` y `04_Frontend`, y `npm start` en `07_Mobile`. Verificar el endpoint antes de operar; cambiar de entorno no copia datos.

### Cachés, borradores y servicios auxiliares

- El origen web 5175 separa localStorage, sessionStorage y sesión Firebase del origen habitual 5173. Se usa caché Vite propia. No se limpió almacenamiento del navegador habitual.
- El móvil usa API explícita de 4100 y Metro separado 8082 con caché renovada, sin cargar el `.env` habitual. La revisión de `src`/`App.js` no encontró cola persistente/offline ni mecanismo de reproducción de acciones: usa solicitudes directas. Recargar completamente al cambiar de proyecto elimina el contexto en memoria.
- IA se ejecuta desde la API y hereda `DATABASE_URL` de la demo. Su `load_dotenv` no sobrescribe esa variable. Con datos vacíos, el endpoint retorna `[]`; no se copiaron resultados analíticos.
- Los lanzadores no siembran activos ni acciones al arrancar. No se copiaron referencias a fotos ni evidencias antiguas.

### Preparación reproducible y protección de avances

```powershell
# Consulta por defecto; no prepara ni reinicia datos.
node 03_Backend/pmp-api/tools/prepare-single-equipment.mjs

# Solo para un destino inexistente; NO volverá a crear la demo existente.
node 03_Backend/pmp-api/tools/prepare-single-equipment.mjs --prepare --confirm-target pmp_capstone_un_equipo --mobile-host 192.168.1.84
```

La preparación repetida se probó: termina con código 2 y conserva la base existente. No se implementó un reset ni un botón de borrado. Si hay avances manuales, reiniciar aplicaciones los conserva. Un esquema con tablas nuevas/desconocidas exige revisar dependencias antes de copiar configuración.

## Guion manual A–S — no ejecutado

Comprobar primero el diagnóstico de entorno. Utilizar exclusivamente el activo que Rafael dará de alta; ninguna acción de esta tabla fue realizada automáticamente en la demo. Los códigos de OS los genera el sistema: anotar los realmente obtenidos.

| Paso | Usuario / pantalla | Acción y comprobación |
|---|---|---|
| A | Rafael o Sergio · Gestión de activos | Registrar VALIDADOR 7490004, CVB45, Mikroelektronika, origen/fecha/observación reales del ensayo. Debe existir solo maestro, sin OS y sin stock disponible. |
| B | Rafael o Sergio · Recepcionar activo nuevo | Nueva evidencia física; escáner o ingreso manual autorizado explícito con sus requisitos. Confirmar recepción inicial conforme. Debe quedar disponible sin MV/MC/IN ni reparación ficticia. |
| C | Sergio · Inventario → Despacho por escaneo | Seleccionar **Nueva instalación**, tipo Validador, bus BJ2149 y técnico Rodrigo. Terminal El Conquistador y operador VOYSANTIAGO U15 se completan automáticamente. Leer el equipo con escáner o usar Ingreso manual autorizado con serie exacta, motivo y presencia física. Pulsar **Confirmar asignación y despacho**: se genera la IN independiente, sin caso previo. En Mobile, Rodrigo abre Mis Órdenes, selecciona esa IN y confirma la instalación física operativa en BJ2149. |
| D | Rafael o Sergio · Ingreso de requerimientos | Solo tras instalación: seleccionar el activo operativo y registrar una falla de prueba, sin PoD. Puede usarse origen interno para no inventar un caso Aranda. Si existe referencia real de prueba autorizada, usarla sin fijar artificialmente la OS. |
| E | Rafael o Sergio · Retiros de terreno | Asignar a Rodrigo. El activo sigue instalado; asignar no confirma retiro. |
| F | Rodrigo · Móvil / Mis órdenes | Abrir la OS generada; validar identidad, declarar PoD No y confirmar presencia/retiro. Sin PoD, fotografía opcional. Recién entonces tránsito hacia Bodega. |
| G | Sergio · Bodega y logística | Recepcionar con evidencia nueva, luego enviar a Laboratorio con evidencia de salida. Debe quedar en tránsito, no como carga asignable. |
| H | Rafael · Recepción laboratorio | Confirmar llegada física en su estación. Debe ubicarse en Laboratorio Garantías y comenzar el SLA desde esta recepción. |
| I | Rafael · Gestión de carga | Asignar a Jose la OS recibida. Debe aparecer en Mi carga. |
| J | Jose · Mi carga / Abrir trabajo | Iniciar y registrar diagnóstico, intervención y prueba correspondientes al ensayo. No seleccionar repuestos ni PoD. |
| K | Jose · Trabajo técnico | Guardar/finalizar con las evidencias y prueba requerida, sin consumo de piezas. Cierre técnico no equivale a salida física. |
| L | Rafael y Sergio · Despacho laboratorio / Bodega | Confirmar salida desde Laboratorio, luego recepción separada en Bodega. No reutilizar una validación como evidencia de ambas custodias. |
| M | Sergio · Bodega → QA | Validar y confirmar salida a QA. Logística no asigna certificador. |
| N | Cristian · QA → Recepción | Validar llegada y usar Recibir y comenzar. Debe quedar recibido y bajo responsabilidad del QA autenticado. |
| O | Cristian · Instalación Ambiente / Pruebas | Registrar hitos y evaluación conforme al procedimiento acordado. El procedimiento técnico detallado de Instalación Ambiente sigue pendiente de definición. Para ensayo de interfaz, identificar expresamente simulación funcional; no afirmar un Test MK físico no ejecutado. |
| P | Cristian · Evaluación | Registrar la prueba válida del ensayo y emitir Operativo cuando corresponda. Mantener separados dictamen y movimiento físico. |
| Q | Cristian y Sergio · QA Despacho / Bodega | Evidencia nueva y confirmación de salida desde QA, seguida de recepción en Bodega. |
| R | Sergio · Inventario → Listos para instalación | Comprobar el mismo tipo+serie disponible como stock reparado, sin duplicar maestro. |
| S | Sergio y Rodrigo · Despacho / Móvil | Con el caso/intervención ya existente, nueva validación de despacho, nueva IN independiente e instalación del mismo equipo. No usar un segundo equipo inexistente. |

El paso C ya no requiere un caso previo. Los pasos D–S continúan el flujo vigente sobre el mismo activo; el recorrido manual no se ejecutó en la demo. La simulación funcional no certifica ejecución física ni calidad técnica real.

## Comprobaciones de la preparación inicial — evidencia histórica de esta entrega

| Comprobación | Resultado |
|---|---|
| Respaldo restaurable | Restauración real y comparación completa aprobadas |
| Origen conservado | Tablas y secuencias iguales al respaldo; MV-87126356 intacta |
| Demo vacía | Las 17 tablas operacionales permanecen en cero |
| Endpoints vacíos, en copia efímera | 25 lecturas, 6 perfiles; QA Por verificar 0, búsquedas sin series previas, badges operacionales 0, IA vacía |
| Repuestos | 24 referencias con stock 0; alertas legítimas conservadas |
| RBAC | Roles resueltos; Admin no opera QA (403); API real sin token (401) |
| Firebase | Lectura de seis cuentas activas por correo; sin login interactivo ni cambios de identidad |
| Backend | 82/82 pruebas aprobadas |
| Frontend | 178/178 pruebas aprobadas |
| E2E operacional existente | `requirements_flow_e2e.mjs` aprobado en clúster efímero; fuente sin cambios; fixtures no importadas a demo |
| TypeScript | `tsc --noEmit --incremental false` aprobado |
| Build | Vite producción aprobado |
| Web real | Login renderizado en Chrome aislado a 390 y 1440 px, sin overflow horizontal; revisión de captura desktop |
| Conexiones efectivas | API a 55435/demo; web servida apunta a 4100; Metro 8082 activo y bundle Android compilado con API 4100 verificada; IA consulta copia efímera vacía |
| Preparación repetida | Dry-run aprobado; modo preparación rechaza destino existente sin reiniciarlo |

Las pruebas automatizadas de flujo usan PostgreSQL efímero. La copia para comprobar endpoints vacíos se destruye al terminar; **la base manual no se destruye ni recibe fixtures**. Evidencias privadas: `empty-e2e.json`, `full-e2e.log`, `backend-tests.log`, `frontend-tests.log`, `preparation-guards.json`, `firebase-readonly-check.json`, `browser-login-check.json`, `mobile-bundle-check.json`, `login-390.png`, `login-1440.png`.

Para repetir (antes de introducir datos manuales): `node verification/single_equipment_empty_e2e.mjs` desde backend. Se niega a continuar si la demo ya contiene registros operacionales. `npm test` en backend/frontend incluye las nuevas pruebas. No usar el recorrido automatizado como sesión manual.

### Corrección mínima de métricas ficticias

El dashboard retornaba `18.5` como SLA promedio constante. Ahora retorna `null` y la web muestra **Sin mediciones**: no se inventó un cálculo ni se modificaron reglas SLA. Reportes Laboratorio usaba fixtures de 47 reparaciones y 92% cuando fallaba una ruta `/api/lab/reportes` que no está implementada. Ahora muestra **Reportes no disponibles** y permite reintentar, sin gráficos/exportaciones ficticias. No se ocultaron registros existentes ni se cambiaron filtros operacionales.

### Limitaciones comprobadas

- La preparación inicial detectó el bloqueo por caso/OS origen. Fue resuelto posteriormente con la corrección documentada a continuación; los resultados iniciales anteriores se conservan como históricos.
- Reportes de laboratorio no dispone de endpoint implementado; se comunica indisponibilidad.
- Login con contraseña, conexión desde teléfono físico, escáner real y ejecución técnica no realizados. Metro está activo y configurado; no equivale a validar conectividad Wi-Fi/firewall del teléfono.
- UID antiguos de Sergio/Cristian conservados, con cuentas reales activas resueltas por correo según el middleware vigente.
- Plantillas del PostgreSQL habitual requieren revisión independiente; esta tarea no las reparó.

## Archivos de este ajuste

- `.gitignore`: excluye datos y secretos del entorno local.
- `03_Backend/pmp-api/tools/single-equipment-common.mjs`: conexiones, marcadores, guardas, inventario/fingerprints y PostgreSQL local persistente.
- `03_Backend/pmp-api/tools/prepare-single-equipment.mjs`: dry-run, respaldo/restauración verificada y copia exclusiva de configuración a destino nuevo.
- `03_Backend/pmp-api/tools/run-single-equipment.mjs`: arranque/estado/parada de servicios separados y diagnóstico de conexión real.
- `03_Backend/pmp-api/verification/single_equipment_empty_e2e.mjs`: validación HTTP vacía en copia efímera y preservación de ambos entornos.
- `03_Backend/pmp-api/test/single-equipment-tools.test.js`: guardas contra destino original, esquema desconocido y exposición de credenciales.
- `03_Backend/pmp-api/src/routes/dashboard.routes.js`: elimina promedio constante sin medición.
- `03_Backend/pmp-api/package.json`: incorpora pruebas de guardas.
- `04_Frontend/src/api/dashboard.ts`: promedio nullable.
- `04_Frontend/src/pages/DashboardPage.tsx`: presenta ausencia de mediciones sin inventar cero horas.
- `04_Frontend/src/pages/LabReportesPage.tsx`: retira fallback de métricas ficticias; reutiliza PageHeader/FeedbackBanner/botones existentes.
- `04_Frontend/test/empty-reports.frontend.test.mjs`: render de respuesta vacía, inválida y error, sin cifras/exportaciones ficticias.
- `04_Frontend/package.json`: incorpora las pruebas nuevas de reportes.
- Este documento: entrega, instrucciones y guion no ejecutado; no reemplaza evidencias históricas.

No se editaron documentos Capstone v2.0, evidencias históricas, migraciones, FSM, reglas de custodia, Mobile, Expo ni cuentas Firebase. Los cambios previos del árbol de trabajo se conservaron.


## Corrección: primera instalación legítima desde cero — 7 de octubre de 2026

### Decisión de modelo y contratos

No se requirió migración: `ordenes_servicio.caso_id` y `os_origen` ya son opcionales; el trigger de relaciones permite caso nulo. Se conserva el correlativo `pmp.seq_in` y la generación normal del código. La ausencia de una avería anterior no exige crear un caso.

- **Nueva instalación:** `contexto_instalacion: NUEVA`, sin caso/OS origen/AR; tipo, destino y técnico válidos. El motivo registrado es Instalación nueva, no una falla inventada. En el esquema existente se conserva en el campo descriptivo `falla`; Mobile oculta ese bloque cuando se trata de una IN.
- **Vinculada:** `contexto_instalacion: REQUERIMIENTO`, exige caso y OS de origen pertenecientes al mismo caso y tipo. Omitir el nuevo discriminante conserva el contrato vinculado anterior. No se relajan sus relaciones.
- **Procedencia del stock:** la API la obtiene con las consultas existentes de elegibilidad. Stock inicial usa `stock_origen_evento` (habilitación basada en recepción conforme), con `stock_origen_os = null`. Stock reparado mantiene su respaldo `stock_origen_os` y condiciones QA/Bodega. El cliente no decide la procedencia con `nuevo` u otros indicadores.
- **Caso de respuesta:** `caso` es nullable en el resultado de despacho. Cuando no existe, la web enlaza directamente al historial por tipo+serie.
- **Contexto de destino:** nueva consulta de lectura `GET /api/bodega/despacho/destinos?q=...`, hasta 20 buses, priorizando coincidencia exacta. Resuelve terminal/operador desde contexto real del bus. Si el bus no tiene historia y existe una única relación terminal/PST configurada, ofrece esa relación inequívoca; si no, permite completar el contexto faltante y valida su relación. No importa información de la base original para suplir datos de la demo.

### Evidencia, atomicidad y reintentos

`POST /api/bodega/despacho/validar` conserva los orígenes existentes. El scanner requiere ráfaga keyboard-wedge con Enter y `lectura_scanner`; digitación normal/pegado no habilitan salida. Se reutilizan `scannerProof` y `validateReceiptScanner`, no otra estación. La contingencia nueva exige serie exacta, permiso admin/logística, presencia física y motivo. Siempre queda como `MANUAL_AUTORIZADO`.

La validación nueva vincula tipo, activo, destino, terminal, operador y técnico. Cambiar ese contexto exige nueva evidencia. La recepción inicial no sirve como validación de despacho. Modelo y marca se resuelven desde el maestro también en captura manual.

Solo `POST /api/bodega/despacho/confirmar` revalida y crea la IN, asigna técnico y registra `SALIDA_BODEGA_TERRENO`, en la misma transacción. Conserva los bloqueos por activo y agrega un bloqueo por ID/método de evidencia. Un reintento equivalente del mismo usuario devuelve la IN ya creada (HTTP 201, `reutilizado: true`); una solicitud distinta con esa evidencia devuelve conflicto. La web conserva evidencia ante pérdida de respuesta para reintentar; un rechazo 4xx definitivo exige nueva validación.

Nueva instalación comprueba que no haya otro activo del mismo tipo operativo en el bus, tanto al preparar/confirmar despacho como al instalar. No retira ni sustituye silenciosamente otro equipo. La comprobación final se identifica por el evento de despacho con contexto NUEVA, sin imponer retrospectivamente este contrato a IN históricas o modificar el flujo vinculado previo.

### Instalación activa y trazabilidad

El modelo vigente representa la instalación operacional mediante la IN finalizada, su contexto de bus y `INSTALACION_COMPLETADA`, consultados por `operatingAssetsSql`. No se utiliza `instalaciones_equipos` para fabricar un registro: esa tabla pertenece al modelo Bridge histórico y exige Bridge/equipo retirado.

Despachar deja estado 1, En ruta, sin activo operativo asociado por ese mero movimiento. La confirmación del técnico asignado conserva el endpoint y la FSM existentes: operativo → estado 13 y evento de instalación; falla de instalación → retorno existente. En el escenario de prueba, solo tras confirmar hubo una relación operacional de tipo+serie con BJ2149, y En ruta volvió a cero. Requerimientos encontró ese activo y creó su primera MV real sin cambiar la IN.

La consulta Mis Órdenes mantiene joins opcionales con caso, devuelve ahora modelo, marca y operador, y no exige MV/AR. Mobile muestra contexto conocido, omite origen/referencia inexistentes y el bloque de falla no aplicable. Abrir/cancelar no confirma instalación.

### Ruta manual exacta

1. Abrir `http://localhost:5175`; comprobar `http://localhost:4100/__local/environment` → `pmp_capstone_un_equipo`, puerto 55435.
2. Rafael/Sergio: Gestión de activos → registrar 7490004 como Validador, CVB45, Mikroelektronika. No se ha registrado automáticamente.
3. Recepcionar activo nuevo → evidencia física nueva y recepción inicial conforme.
4. Inventario de equipos → **Despacho por escaneo**, ruta **`/bodega/despacho`**.
5. Contexto **Nueva instalación** → Validador → BJ2149 → Rodrigo. Comprobar El Conquistador / VOYSANTIAGO completados.
6. Escáner con Enter o **Ingreso manual autorizado** → serie 7490004, motivo y presencia física. Validar: aún no existe IN ni salida.
7. **Confirmar asignación y despacho**. Anotar la IN realmente generada; no fijar un número. Debe salir de disponibles y quedar En ruta.
8. Rodrigo: abrir el proyecto Expo de **8082** (`exp://192.168.1.84:8082`), recargar por completo → Mis Órdenes → esa IN → comprobar serie/bus → **Confirmar instalado OK** únicamente cuando corresponda a la confirmación física del ensayo.
9. Verificar En operación y luego continuar el guion D–S. No usar una segunda unidad inexistente ni crear una falla automáticamente.

### Verificación de la corrección

- **E2E desde cero aprobado:** copia efímera `pmp_initial_install_...`, configuración mínima, usuarios ficticios exclusivos de prueba y un bus; cero activos/casos/OS al empezar. Alta y recepción sin OS, validación sin IN, confirmación con una IN independiente, Mobile sin caso/AR, instalación activa y primera MV posterior. Se verificaron historial, stock y contadores mediante endpoints normales.
- Primer recorrido: un solo activo, una IN y posteriormente una MV legítima; cero casos antes de la MV. La IN observada en el ensayo fue `IN-000002` porque el rollback forzado consumió el primer valor normal de secuencia. No se reiniciaron secuencias para obtener un código fijo.
- Negativos: activo no recibido, lectura desconocida/tipo incorrecto, scanner sin evidencia de ráfaga, contexto vinculado incompleto, contexto nuevo incompatible, técnico/destino inválidos, cambio de técnico tras validar y tras confirmar, recepción reutilizada como despacho, captura previa invalidada, bus ya ocupado.
- Atomicidad: fallo inyectado después de insertar IN revierte la transacción y conserva disponibilidad; dos confirmaciones concurrentes equivalentes devuelven la misma IN, sin doble salida. Pruebas adicionales después del recorrido principal validan contingencia manual para consola sin caso y bloqueo de bus ocupado, sin contaminar la demo.
- **Regresión operacional completa aprobada:** `requirements_flow_e2e.mjs`, con stock reparado sin QA rechazado, despacho vinculado, correlación real, reparación, laboratorio, QA y preservación de códigos históricos. Se actualizaron las expectativas de reintento 409 al nuevo resultado idempotente solicitado y se comprueba identidad de IN, no solo respuesta HTTP.
- **Backend 82/82; frontend 182/182**, incluidas pruebas renderizadas de Mis Órdenes Mobile sin caso ni AR, abrir/cancelar sin escritura y confirmación explícita.
- **TypeScript y build web aprobados. Bundle Android completo compilado** desde Expo 8082 con API demo 4100 verificada.
- **10 renderizados Chrome** con APIs simuladas: claro/oscuro a 320, 390, 768, 1024 y 1440 px, sin overflow horizontal ni modales. Se revisaron capturas de escritorio claro y móvil oscuro. Se reutilizan PageHeader, StatusBadge, FeedbackBanner, botones/inputs, operation-section/form-grid/scan-details y tokens existentes; no se agregó CSS.
- Reiniciada exclusivamente la **API demo 4100**, verificando PID y marcador del lanzador. Web 5175 y Expo 8082 actualizaron archivos; los servicios habituales 4000/5173/8081 no fueron reiniciados por este ajuste.
- Comparación final **2026-10-08 00:19:23 UTC / 7 de octubre 21:19:23 Santiago**: todas las tablas y secuencias de origen y demo idénticas a la huella previa a esta corrección. Demo: **0 activos, 0 OS, 0 casos, 0 instalaciones**, y las 17 tablas operacionales vacías. Se conservan seis usuarios y el contexto BJ2149 / El Conquistador / VOYSANTIAGO.

Evidencias privadas: `.local/pmp-single-equipment/initial-install-{before,final,e2e}.json`, `initial-install-{backend,frontend,typescript,build,regression}.log` e `initial-dispatch-visual/report.json` y capturas. Los errores de rollback forzado en logs pertenecen exclusivamente a PostgreSQL efímero y son comprobaciones esperadas.

Comandos de repetición: `node verification/initial_installation_empty_e2e.mjs` y `node verification/requirements_flow_e2e.mjs` desde backend; `npm test` en backend/frontend; `node test/initial-dispatch.browser.mjs` desde frontend. El primer runner exige la demo sin operaciones, crea otra base y elimina solo esa copia al terminar. No ejecutar el guion manual mediante estos runners.

### Archivos de la corrección

| Archivo | Cambio |
|---|---|
| `03_Backend/pmp-api/src/services/warehouseDispatch.js` | Contextos nuevo/vinculado, destinos, evidencia de salida, procedencia y reintentos atómicos. |
| `03_Backend/pmp-api/src/services/logisticsPresentation.js` | Reconoce En ruta con evidencia manual y relaciones de caso/origen nulas legítimas. |
| `03_Backend/pmp-api/src/routes/bodega.routes.js` | Consulta de destinos protegida con los roles existentes. |
| `03_Backend/pmp-api/src/routes/os.routes.js` | Contexto completo en Mis Órdenes y comprobación final de ocupación para instalación nueva. |
| `03_Backend/pmp-api/verification/initial_installation_empty_e2e.mjs` | Recorrido genuino desde cero y negativos en copia efímera. |
| `03_Backend/pmp-api/verification/requirements_scenarios.mjs` | Evidencia keyboard-wedge en fixtures y expectativas de reintento/concurrencia. |
| `03_Backend/pmp-api/verification/terrain_warehouse_scenarios.mjs` | Reintento manual espera la operación existente sin duplicación. |
| `04_Frontend/src/api/requerimientos.ts` | Contexto de instalación, consulta de destinos, evidencia scanner y caso nullable. |
| `04_Frontend/src/pages/DespachoEscaneoPage.tsx` | Dos contextos en la página existente, autollenado, captura explícita y recuperación del reintento. |
| `04_Frontend/test/requirements.frontend.test.mjs` | Regresión frontend/Mobile y nuevos escenarios de instalación sin caso. |
| `04_Frontend/test/initial-dispatch.browser.mjs` | Renderizado visual aislado con componentes y CSS reales. |
| `07_Mobile/src/screens/MyOrdersScreen.js` | Modelo/operador visibles y campos de avería no aplicables ocultos en IN. |
| Este documento | Guion desbloqueado, decisión de modelo, contratos y evidencia nueva separada de la preparación histórica. |

**Confirmaciones separadas:** base original y MV-87126356 intactas; demo sin operaciones de tests y sin registrar 7490004; escrituras de verificación exclusivamente en PostgreSQL efímero eliminado al terminar.

</details>

**Límites:** bundle y renderizados no equivalen a login ni prueba física de teléfono/escáner. Keyboard-wedge valida un patrón de entrada, no certifica hardware. No se cambió Firebase ni se inició sesión en nombre de usuarios. El procedimiento técnico de Instalación Ambiente sigue pendiente de definición. No se modificaron migraciones, infraestructura, FSM, PoD, QA, repuestos ni Bridge.
