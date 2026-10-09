# Experiencia operacional por rol

**Estado:** vigente — 09-10-2026

| Rol | Inicio / navegación | Acciones principales | No debe hacer |
|---|---|---|---|
| `admin` | Supervisión global, OS, parque, trazabilidad, reportes, usuarios, IA | gestionar usuarios/roles y supervisar | movimientos físicos, reparación, QA, stock |
| `gerente` | Dashboard ejecutivo y consultas | leer indicadores, reportes y trazabilidad | cualquier escritura operacional/administrativa |
| `jefe_laboratorio` | Resumen Lab, Recepción, Asignar carga, Validadores, Consolas, Despacho | recepción, asignación, supervisión, salida Lab | usuarios, Bodega, QA, trabajo técnico |
| `logistica` | Dashboard logística, Bodega, inventario, repuestos, retiros | recepcionar/despachar, stock, requerimientos | trabajo Lab/QA |
| `qa` | Mi trabajo QA + herramientas | recepción, Ambiente, pruebas, dictamen, despacho | gestión de otros dominios |
| `tecnico_laboratorio` | Mi carga, validadores/consolas | diagnóstico, reparación, pruebas, repuestos propios | asignar, custodiar, administrar |
| `tecnico_terreno` | Mi jornada/Mis órdenes | instalar, retirar, reportar falla, historial técnico | ver datos administrativos/internos |

## Controles

- Sidebar derivado de capacidades.
- Rutas directas protegidas.
- Backend como barrera final.
- Técnicos limitados por asignación.
- Admin sin wildcard.
- Gerente read-only.
- Jefatura limitada al dominio Laboratorio.

## Nota UX

La presentación puede agrupar accesos de supervisión aunque el usuario no tenga capacidad de ejecución. La existencia de una vista de consulta no implica permiso de escritura.
