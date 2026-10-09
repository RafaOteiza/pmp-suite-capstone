# Experiencia operacional por rol

> **FLUJO RETIRADO / HISTÓRICO.** Esta matriz conserva evidencia de la navegación anterior a Bridge de correlación. Las referencias a crear/asignar/ejecutar Bridge y a «equipos disponibles» instalados no describen el producto vigente. Consultar [Bridge de correlación](BRIDGE_CORRELACION_Y_HISTORIAL.md) y la [adenda de casos y despacho](../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md). Las reglas de autorización efectivas siguen en el backend actual.

La navegación se construye desde una única definición basada en capacidades. Las rutas directas mantienen `ProtectedRoute` y el backend continúa como barrera final. Los dashboards técnicos consumen únicamente información real asociada al usuario autenticado.

| Rol | Sidebar | Dashboard | Módulos | Scope | Acciones | Vistas ocultas |
|---|---|---|---|---|---|---|
| `gerente` | Dashboard ejecutivo, OS, equipos, trazabilidad, resúmenes Lab/QA/Bodega, reportes e IA | Indicadores globales, SLA, flota, laboratorio, logística y calidad | Consultas y resúmenes ejecutivos | Global, solo lectura | Actualizar y navegar a consultas; contraseña propia desde cuenta | Usuarios, ingreso OS, Bridge operacional, asignaciones, despacho operacional, recepciones, inventario editable, repuestos operacionales y configuración operacional |
| `admin` | Operación global, usuarios, despacho, Bridge, asignación Lab, resúmenes QA/Bodega, reportes e IA | Visión operacional global | Todos los dominios de supervisión y administración | Global | Supervisar, administrar usuarios y asignar/reasignar terreno, Lab y QA | Ejecución como técnico de terreno, diagnóstico/reparación y aprobación/rechazo QA |
| `tecnico_terreno` | Mi jornada, Mis OS, Reportar falla y Mis trabajos Bridge | Trabajos activos, en terreno, OS propias y completados | Terreno y contexto propio | `OWN + ASSIGNED` | Crear OS propias; iniciar y completar Bridge asignadas | Usuarios, Lab, QA, Bodega, stock, reportes ejecutivos, IA y administración |
| `tecnico_laboratorio` | Mi carga, mantenimiento Bridge, resumen Lab, Validadores y Consolas | Diagnósticos, reparaciones, repuestos y carga asignada | Laboratorio y contexto Bridge necesario | `ASSIGNED` en backend | Diagnosticar, reparar, probar, solicitar repuesto y completar únicamente carga propia | Usuarios, asignaciones administrativas, QA operacional, Bodega completa, stock, IA y administración |
| `qa` | Dashboard QA y Mi QA | Certificaciones pendientes, aprobadas y rechazadas asignadas | QA con contexto previo de Bridge/mantenimiento | `ASSIGNED QA` en backend | Inspeccionar, aprobar, rechazar, comentar y certificar carga propia | Usuarios, Lab editable, Bodega/stock, diagnósticos, reparaciones, Bridge logístico y administración |
| `logistica` | Dashboard logística, equipos disponibles, trazabilidad, Bridge, recepciones/despachos, inventario y repuestos | Situación real de bodega, fases y alertas de stock | Bridge, Bodega, equipos, inventario y repuestos | Dominio logístico global | Crear/asignar Bridge, preparar/recibir/despachar equipos, movimientos y stock | Usuarios, Lab técnico, QA operacional, diagnóstico, reparación, certificación e IA administrativa |

## Controles de validación

- El Sidebar omite categorías vacías y no carga badges globales para roles técnicos.
- La búsqueda global solo aparece para los roles con trazabilidad y su endpoint queda limitado a `admin`, `gerente` y `logistica`.
- El resumen corporativo queda limitado a `admin` y `gerente`; terreno, laboratorio y QA usan `/mi-jornada`.
- `tecnico_terreno` consulta sus OS mediante `/api/os/mis-ordenes`.
- Los alcances Bridge de terreno, laboratorio y QA se conservan en backend y no se reemplazan por filtros de interfaz.
- No se incorporaron KPI simulados, dependencias ni nuevos números de negocio.

## Gaps conocidos

- No existe una página independiente de historial QA; el historial asignado se resume con los datos disponibles del flujo Bridge.
- No existe una página independiente para solicitudes de repuesto propias de laboratorio; se gestionan dentro de cada mantenimiento Bridge asignado.
- No existen páginas separadas de guías y movimientos: esas funciones permanecen integradas en los módulos actuales de Bodega/Bridge.
- El endpoint de mis OS entrega las últimas 20 órdenes y no expone paginación; se conserva el contrato existente.
