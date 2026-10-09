# PMP Suite

## Consolidación de seguridad, identidad y UX — 08-10-2026

Regla modelo/marca compartida y autoritativa en backend, custodia física por movimiento/ciclo, sesión con token vigente del SDK y componentes PMP homologados. [Alcance, pruebas y pendientes de esta intervención](08_Pruebas/Consolidacion_Seguridad_Identidad_UX_2026-10-08.md). La base habitual se conserva; las escrituras de pruebas usan PostgreSQL efímero. No se recrea la demo ni se agregan migraciones o Docker.


PMP Suite es un sistema de gestión operacional para controlar el retiro,
recepción, diagnóstico, reparación, certificación y reinstalación de
validadores y consolas utilizados en una flota de transporte. El proyecto se
desarrolla como trabajo Capstone de Ingeniería Informática en Duoc UC.

La solución se encuentra en etapa de validación y cierre documental. El núcleo
funcional está implementado; el trabajo pendiente se concentra en ejecutar el
flujo completo con evidencia, validar la aplicación móvil, completar pruebas
complementarias y mantener los documentos alineados con el sistema real.

## Equipo

- Matías Garrido: documentación y levantamiento de requerimientos.
- Rafael Oteiza: gestión, arquitectura, base de datos y backend.
- Luis Arenas: frontend web y aplicación móvil.

La participación individual se respaldará con las evidencias y contribuciones
que organice el equipo durante el Capstone.

## Línea base documental vigente

Los cinco artefactos Capstone con sufijo `_v2.0.docx` y su
[índice de vigencia v2.0](Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_VIGENCIA_v2.0.md)
constituyen la fuente normativa. Fueron actualizados manualmente y se preservan;
los documentos técnicos complementan esa línea base. Las versiones anteriores
son históricas. Docker no forma parte del alcance.

## Problema abordado

El proceso de mantenimiento involucra distintas áreas y movimientos físicos.
Sin un registro central, la organización puede perder visibilidad sobre qué
equipo fue retirado, dónde se encuentra, quién debe intervenirlo y si está listo
para volver a terreno.

PMP Suite centraliza las órdenes de servicio, la ubicación operacional de cada
activo, las asignaciones, los diagnósticos, las reparaciones, la certificación
QA, los repuestos y el historial de eventos. La identificación física mediante
serie, código de barras, QR o AMID permite comprobar que el equipo presentado en
cada estación corresponde al activo asociado a la orden.

## Alcance implementado

- Gestión de activos separada de Ingreso de requerimientos, con identidad tipo + serie.
- Requerimientos sobre activos existentes y vinculados operacionalmente al bus.
- Recepción inicial en BODEGA por escaneo y conformidad explícita, sin crear OS.
- Gestión de órdenes de servicio para validadores y consolas.
- Bridge como capa de correlación entre serie, OS PMP y referencias externas (por ejemplo OS Aranda).
- Recepción y despacho entre terreno, bodega, laboratorio y QA.
- Identificación física por serie o AMID y registro de escaneos.
- Asignación de técnicos de laboratorio y terreno; QA toma su propio trabajo después de recibir físicamente.
- Diagnóstico, reparación, solicitud de repuestos y registro técnico.
- Aprobación o rechazo de calidad.
- Reincorporación del equipo disponible a terreno.
- Trazabilidad por orden, serie, bus, responsable y estado.
- Dashboards y navegación adaptados a cada rol.
- Reporte de riesgo operacional mediante un analizador Python.
- Aplicación móvil para las tareas de terreno.

## Flujo operacional principal

Bridge no asigna técnicos, crea órdenes ni mueve stock. Las siguientes acciones
pertenecen exclusivamente al flujo normal de OS PMP. El historial se consulta
por activo (tipo + serie), con múltiples OS y referencias externas. Consulta el
[informe y guión de prueba de correlación](08_Pruebas/BRIDGE_CORRELACION_Y_HISTORIAL.md)
y la [adenda vigente de casos, requerimientos y despacho](02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md).

1. **Ingreso de requerimientos** registra el caso interno o externo y crea la
   OS MV/MC/PDV/PDC del activo existente que presentó la necesidad. No da de alta
   activos. Si existe una referencia Aranda, se
   conserva como texto y se registra su correlación Bridge.
2. La misma OS y serie siguen el retiro, recepción, laboratorio,
   diagnóstico/reparación, QA y retorno físico a Bodega.
3. El activo aprobado y elegible aparece en **Listos para instalación**.
   Recibir desde QA no crea por sí solo una orden de instalación.

   En **Mi trabajo QA**, iniciar combina toma e inicio; registrar dictamen puede guardar la evaluación nueva en la misma transacción. Los borradores y avisos de salida son inline.
   En QA, emitir Operativo/Rechazado mantiene la custodia QA. La salida a Bodega requiere otra validación física y confirmación; Admin no asigna OS QA. Véase [flujo QA autónomo](01_Requerimientos/QA_Requerimientos.md).
4. Para una necesidad de instalación, logística define caso, bus, tipo y
   técnico; toma un activo físico del stock y lo escanea, sin preseleccionar
   una fila específica.
5. Solo la confirmación del despacho crea una nueva `IN-xxxxxx` para el activo leído,
   con correlativo PMP independiente del caso y de Aranda,
   registra `SALIDA_BODEGA_TERRENO` y deja el equipo En ruta. Elegir técnico
   o escanear por sí solos no crean la IN ni el despacho.
6. Terreno recibe la IN en **Mis Órdenes** e instala la serie asignada. Al
   completar la instalación el activo queda **En operación**. La OS de
   reparación del otro activo conserva su identidad e historial.

Para un activo nuevo, **Gestión de activos** registra únicamente el maestro y
`ALTA_ACTIVO`. La recepción inicial exige escaneo en la ubicación BODEGA y
conformidad de identidad e integridad: registra `ESCANEO_BODEGA`,
`RECEPCION_INICIAL` y `HABILITADO_INSTALACION`, sin OS, bus ficticio ni circuito
de reparación/QA. Ese stock inicial comparte **Listos para instalación** con
el stock reparado elegible y aprobado por QA. El historial por tipo + serie
incluye tanto los eventos sin OS como las intervenciones posteriores.

**Disponible para instalación** significa elegible en Bodega; **Asignado a
técnico** no prueba salida; **En ruta** requiere despacho físico confirmado;
**Equipos en operación** muestra activos instalados y operativos, no stock.

El esquema vigente requiere las migraciones aditivas 003–006, después de sus
prerrequisitos. La 004 establece el correlativo IN independiente, la 005 registra
la procedencia del maestro y la 006 habilita recepción y eventos iniciales sin OS.
Los identificadores y evidencias históricas se conservan.

Las acciones que implican un movimiento físico requieren un escaneo válido en
la estación correspondiente. La estación de escaneo muestra el contexto de la
orden y permite continuar la siguiente acción sin cambiar de pantalla.

PMP Suite opera de forma autónoma. En el Capstone, el ingreso Aranda es asistido;
una integración automática mediante API, Web Service, webhook o ETL se mantiene
como proyección productiva/comercial. Caso, OS, activo y referencia externa son
conceptos distintos relacionados explícitamente en datos.

## Identificación de equipos

Los validadores poseen una serie de siete dígitos y pueden incluir un AMID de
doce dígitos con checksum UPC-A. PMP Suite resuelve ambos identificadores hacia
el mismo activo. Por ejemplo:

| Serie | AMID |
|---|---|
| `7405020` | `280000050209` |
| `7400010` | `280000000105` |

En las consolas, el código QR y el código de barras representan directamente la
serie. El lector puede ser una pistola USB configurada para enviar Enter, un
lector 2D o un ingreso manual controlado.

## Roles y permisos

PostgreSQL es la fuente efectiva del rol y del estado activo del usuario.
Firebase autentica la identidad; sus atributos adicionales no reemplazan la
autorización registrada en `pmp.usuarios`.

| Rol | Responsabilidad principal |
|---|---|
| `admin` | Administración global, usuarios, asignaciones y control físico de recepción y despacho en laboratorio |
| `gerente` | Consulta ejecutiva global sin escritura operacional |
| `logistica` | Bodega, inventario, repuestos, recepciones y despachos |
| `qa` | Operación autónoma: recepción, Instalación Ambiente, pruebas/dictamen y despacho a Bodega |
| `tecnico_laboratorio` | Diagnóstico y reparación de su carga asignada |
| `tecnico_terreno` | Intervenciones, retiros, instalaciones y órdenes propias |

Las rutas autenticadas aplican la cadena:

```text
firebaseAuth -> ensureUser -> enforceReadOnlyRole -> autorización por rol -> handler
```

El rol `gerente` puede ejecutar lecturas globales. Las escrituras operacionales
devuelven HTTP 403 con el código `READ_ONLY_ROLE`, salvo las acciones personales
de contraseña expresamente permitidas.

## Arquitectura

```text
Aplicación web React ─┐
                     ├─> API REST Node.js y Express ─> PostgreSQL
Aplicación Expo ──────┘                 │
                                       ├─> Firebase Admin
                                       └─> Analizador Python
```

- Frontend web: React 18, TypeScript, Vite y React Router.
- Backend: Node.js, Express y controlador PostgreSQL `pg`.
- Datos: PostgreSQL con esquema `pmp`.
- Autenticación: Firebase Authentication y Firebase Admin SDK.
- IA: Python, pandas, scikit-learn, joblib y psycopg2.
- Mobile: Expo SDK 57 y React Native.

El backend ejecuta el analizador con el intérprete aislado de
`06_ModelosIA/.venv`. El endpoint de IA es de consulta y está autorizado para
`admin` y `gerente`.

## Estructura del proyecto

```text
01_Requerimientos/       Requisitos funcionales y no funcionales
02_Arquitectura/         Arquitectura, datos y diagramas
03_Backend/pmp-api/      API REST y pruebas del backend
04_Frontend/             Aplicación web
05_BaseDatos/            Scripts, migraciones y dataset demostrativo
06_ModelosIA/            Analizador y documentación de IA
07_Mobile/               Aplicación móvil Expo
08_Pruebas/              Informes de pruebas y experiencia por rol
09_BrandKit/             Identidad visual PMP Suite
Documentacion Capstone/  Entregables académicos y evidencias
```

## Configuración local

### Backend

Crear `03_Backend/pmp-api/.env` a partir de `.env.example` y configurar:

```dotenv
PORT=4000
DATABASE_URL=postgresql://usuario:contrasena@localhost:5432/pmp_suite
FIREBASE_SERVICE_ACCOUNT_PATH=C:\ruta\segura\firebase-admin.json
```

La credencial Firebase debe permanecer fuera del repositorio.

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\03_Backend\pmp-api
npm install
npm run dev
```

Comprobación de salud: `GET http://localhost:4000/api/health`.

### Frontend web

Crear `04_Frontend/.env` a partir de `.env.example` y completar la URL del
backend y la configuración pública del cliente Firebase.

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\04_Frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### Aplicación móvil

El dispositivo físico debe utilizar la dirección IP local del equipo que
ejecuta el backend. Copia `07_Mobile/.env.example` como `07_Mobile/.env` y
configura `EXPO_PUBLIC_API_URL`; el archivo local está excluido del repositorio.

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\07_Mobile
npm install
npm start
```

Ejemplo para un dispositivo conectado a la misma red:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api
```

### Módulo de IA

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\06_ModelosIA
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -c "import psycopg2; print(psycopg2.__version__)"
```

## Pruebas verificadas

Resultados reproducidos el 12 de septiembre de 2026:

Esta tabla conserva la línea base histórica; no corresponde a resultados de la
evolución de casos y despacho. Las verificaciones exigidas para esa evolución
se detallan en la [adenda](02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md#11-verificaciones-y-evidencia-a-registrar).
Los resultados actuales y sus evidencias están en el
[informe de recepción inicial sin OS](08_Pruebas/RECEPCION_INICIAL_SIN_OS.md).
El alta mantiene el maestro separado; la recepción física y su conformidad
habilitan stock sin mantenimiento ni bus ficticio. La primera IN se crea al
confirmar el despacho.

| Componente | Comando | Resultado |
|---|---|---:|
| Backend | `npm test` | 52 de 52 aprobadas |
| Frontend | `npm test` | 42 de 42 aprobadas |
| Frontend | `npm run build` | Aprobado |
| Firebase Admin | `node verification/firebase_admin_health.mjs` | Consistente |
| Python | Importación de `psycopg2` en `.venv` | Aprobada, versión 2.9.11 |

Las pruebas masivas y los recorridos que modifiquen muchos datos deben
ejecutarse sobre una base aislada. Sus resultados solo se consideran evidencia
final cuando incluyen fecha, versión, configuración y archivos de salida.

## Dataset demostrativo

La base preparada contiene 50 validadores, 50 consolas y 100 órdenes de
servicio. La distribución inicial es de 25 equipos en terreno, 25 en bodega, 25
en laboratorio y 25 en QA. El procedimiento y el respaldo se documentan en
`05_BaseDatos/reinicio_demo_100_equipos_README.md`.

## Documentación Capstone

La carpeta `Documentacion Capstone/Artefactos Metodologia Cascada` contiene:

- documento de inicio del proyecto;
- SRS simplificado;
- documento de diseño;
- plan de pruebas y evidencias;
- manual técnico y de ejecución;
- fuentes de los diagramas técnicos.

La estrategia de cierre es validar primero, guardar las evidencias obtenidas y
actualizar los documentos con resultados reproducibles. No se deben presentar
funciones planificadas como si estuvieran implementadas.

El [índice de vigencia v2.0 de los artefactos Cascada](Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_VIGENCIA_v2.0.md)
identifica la fuente normativa actual. Los DOCX anteriores y los diagramas
rotulados como históricos conservan el Bridge operacional retirado; no deben
reutilizarse como representación del modelo vigente.

## Estado de cierre

Pendientes principales:

1. Ejecutar el flujo operacional completo sobre el dataset reiniciado.
2. Capturar evidencias por rol, estación y transición.
3. Validar la aplicación móvil en un dispositivo físico.
4. Ejecutar rendimiento y escenarios de error sobre una base aislada.
5. Completar la evaluación académica del modelo de IA.
6. Revisar diagramas y documentos contra la versión demostrada.
7. Preparar la presentación y el guion de defensa.

El proyecto no requiere nuevos módulos grandes para su defensa. El cierre se
concentra en validación, evidencia, documentación y consistencia.
