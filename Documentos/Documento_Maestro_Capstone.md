# Documento maestro Capstone PMP Suite

## Estado del documento

Este archivo resume la línea base técnica de PMP Suite para preparar el informe
y la defensa. Los resultados incluidos corresponden a verificaciones
reproducibles; las actividades pendientes se identifican expresamente.

Actualización documental: 23 de septiembre de 2026. La fuente normativa son los
cinco artefactos Capstone v2.0 y su [índice de vigencia](../Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_VIGENCIA_v2.0.md),
actualizados manualmente. Se preservan esos archivos y las versiones históricas.
Esta revisión no ejecuta pruebas ni transforma resultados anteriores en evidencia nueva.

## Equipo

- Rafael Oteiza: gestión, arquitectura, base de datos y backend.
- Matías Garrido: documentación y levantamiento de requerimientos.
- Luis Arenas: frontend web y aplicación móvil.

La evidencia individual y el historial del repositorio serán organizados por el
equipo antes de la entrega.

## Problema y solución

El mantenimiento de validadores y consolas requiere coordinar terreno, bodega,
laboratorio y QA. Cuando cada área registra información por separado, resulta
difícil comprobar qué equipo fue retirado, dónde está, quién debe intervenirlo y
cuándo puede volver a servicio.

PMP Suite centraliza órdenes, activos, ubicaciones, responsables, reparaciones,
repuestos, decisiones QA y eventos. El escaneo por serie o AMID agrega una
comprobación física antes de los movimientos críticos.

## Objetivo general

Desarrollar y validar un sistema que controle el ciclo de mantenimiento de los
equipos y mantenga una trazabilidad consultable desde el retiro hasta la
reinstalación.

## Objetivos específicos

1. Gestionar órdenes de validadores y consolas con datos maestros válidos.
2. Controlar las transiciones entre terreno, bodega, laboratorio y QA.
3. Aplicar permisos efectivos en backend y frontend según el rol PostgreSQL.
4. Verificar físicamente el activo mediante serie, código de barras, QR o AMID.
5. Registrar diagnósticos, reparaciones, repuestos y certificaciones.
6. Entregar indicadores y trazabilidad a administración y gerencia.
7. Evaluar información histórica mediante un analizador Python de riesgo.

## Arquitectura

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| Aplicación web | React, TypeScript y Vite | Interfaz operacional y ejecutiva |
| Aplicación móvil | Expo y React Native | Trabajo y órdenes de terreno |
| API | Node.js y Express | Seguridad, validación y reglas de negocio |
| Base de datos | PostgreSQL | Persistencia, relaciones y transacciones |
| Autenticación | Firebase | Identidad de los usuarios |
| Analizador | Python y scikit-learn | Reporte de riesgo operacional |

PostgreSQL define el rol efectivo. Firebase Admin verifica la identidad, pero
los atributos del token no reemplazan el rol ni el estado activo registrado en
`pmp.usuarios`.

## Roles

| Rol | Alcance |
|---|---|
| `admin` | Administración global, usuarios, asignaciones y control del laboratorio |
| `gerente` | Consulta global de solo lectura |
| `logistica` | Bodega, stock, repuestos y movimientos físicos |
| `qa` | Certificación de órdenes asignadas |
| `tecnico_laboratorio` | Diagnóstico y reparación de carga asignada |
| `tecnico_terreno` | Retiro, sustitución e instalación |

## Flujo principal

Gestión de activos registra el maestro por tipo + serie, origen, fecha,
observación, autor y datos técnicos conocidos. El alta registra ALTA_ACTIVO y
no crea OS ni stock. Ingreso de requerimientos selecciona únicamente activos
existentes vinculados operacionalmente al bus, y crea caso y OS MV/MC/PDV/PDC
según el proceso. Bridge solo correlaciona referencias externas con OS existentes.

La reparación mantiene su OS y su activo durante retiro, Bodega, laboratorio,
QA y retorno físico a Bodega. La recepción conforme desde QA puede habilitar
stock reparado; no genera una IN anticipada.

Un activo nuevo se recibe por una acción separada: escaneo físico en BODEGA y
confirmación de identidad, integridad y conformidad inicial. Registra
ESCANEO_BODEGA, RECEPCION_INICIAL y HABILITADO_INSTALACION sin ninguna OS ni bus
ficticio, y sin recorrer diagnóstico, reparación o QA de reparación.

Stock inicial conforme y stock reparado aprobado por QA comparten **Listos para
instalación**. En el despacho physical-first, logística define contexto, toma
un equipo y lo escanea. Solo confirmar la salida crea `IN-xxxxxx` con correlativo
PMP independiente, relaciona caso y origen de stock, asigna técnico y registra
SALIDA_BODEGA_TERRENO. Seleccionar técnico o escanear no equivale a despachar.

**Disponible para instalación** es stock elegible en Bodega; **Asignado** no
demuestra salida; **En ruta** requiere despacho confirmado; **Equipos en
operación** reúne activos instalados y operativos, sin ofrecerlos como stock.
El historial por tipo + serie muestra eventos iniciales sin OS y todas las
intervenciones posteriores, conservando sus identificadores.

Cada estación física valida la etiqueta del activo antes de recepcionar o
despachar. Los validadores aceptan serie o AMID; las consolas utilizan su serie.

## Seguridad

Las rutas protegidas aplican autenticación Firebase, usuario PostgreSQL activo,
restricción del gerente y autorización específica por rol. El gerente recibe
HTTP 403 ante escrituras operacionales. Las consultas SQL utilizan parámetros y
las transiciones sensibles se ejecutan dentro de transacciones.

## Estado de validación

La línea base v2.0 remite a los resultados ya registrados en el
[informe de recepción inicial](../08_Pruebas/RECEPCION_INICIAL_SIN_OS.md): 56/56
backend, 62/62 frontend, build web, exportaciones Android/iOS con Expo SDK 57 y
cuatro suites E2E aprobadas. Suites/builds se ejecutaron el 17 de septiembre y
el E2E de recepción se repitió el 22; no se ejecutaron de nuevo en esta revisión.
La validación humana con lector real y teléfono sigue pendiente.

### Registro histórico del 12 de septiembre de 2026

Los siguientes resultados se conservan exclusivamente como evidencia de esa fecha:

| Verificación | Resultado |
|---|---|
| Backend | 52 de 52 pruebas aprobadas |
| Frontend | 42 de 42 pruebas aprobadas |
| Build web | Aprobado |
| Firebase Admin | Identidad de Rafael y Jorge consistente |
| Entorno IA | `psycopg2` 2.9.11 importado correctamente |

En esa verificación, la base demostrativa contenía 50 validadores, 50 consolas y 100 órdenes,
distribuidas en partes iguales entre terreno, bodega, laboratorio y QA.

## Innovación

### Problema que resuelve

Reduce la pérdida de trazabilidad entre áreas y permite verificar que el activo
físico corresponde a la orden procesada.

### Diferencia de la solución

Combina control del flujo, autorización por rol, identificación física,
historial transaccional y una consulta analítica en un mismo sistema.

### Valor aportado

Entrega información sobre ubicación, responsabilidad y estado del equipo, y
reduce decisiones basadas únicamente en registros manuales o supuestos.

## Pendientes de cierre

1. Ejecutar el recorrido completo sobre el dataset reiniciado.
2. Capturar evidencia por rol y transición.
3. Validar la aplicación móvil en un dispositivo físico.
4. Ejecutar rendimiento y errores sobre una base aislada.
5. Documentar evaluación, métricas y limitaciones del modelo de IA.
6. Actualizar diagramas y artefactos con los resultados finales.
7. Preparar presentación, guion y ensayo de defensa.

## Persistencia y alcance de despliegue

Las migraciones 003–006 incorporan casos, IN independientes, procedencia del
maestro y recepción inicial sin OS. Se aplican después de sus prerrequisitos,
con verificadores y preservación de datos históricos. El stock inicial se
respalda en eventos; el reparado, en su intervención aprobada y recibida.

La puesta en producción debe cargar previamente parque instalado y stock con
relaciones verificadas, sin inventar MV/MC para representar activos existentes.
El importador masivo sigue documentado como extensión futura. El Capstone usa
ingreso externo asistido; la integración automática con Aranda es futura.
Se mantiene Expo SDK 57 y Docker no forma parte del alcance.

## Criterio de cierre

PMP Suite estará listo para defensa cuando el recorrido completo pueda
reproducirse, las evidencias correspondan a la versión presentada y los
documentos describan únicamente funciones comprobadas.
