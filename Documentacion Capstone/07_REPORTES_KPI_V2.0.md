# Reportes, Dashboards e Indicadores — PMP Suite V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026

## 1. Principios

Los reportes V2.0 deben distinguir claramente:

- **parque de activos**;
- **órdenes de servicio**;
- **custodia física**;
- **estado técnico**;
- **disponibilidad para instalación**;
- **tránsito**;
- **error de consulta**;
- **sin datos**.

Un KPI no debe sumar dos veces el mismo activo ni interpretar un error de API como cero.

## 2. Dashboard Ejecutivo

**Roles:** Admin, Gerente.

### KPI

- Total parque.
- Validadores.
- Consolas.
- Equipos disponibles.
- Equipos en operación.
- Equipos en Bodega.
- Equipos en Laboratorio.
- Equipos en QA.
- Equipos en tránsito.
- OS activas.
- Casos/requerimientos activos.
- Equipos con reincidencia/prioridad analítica.

### Reglas

1. El parque se cuenta por activo único `tipo + serie`.
2. Una OS no aumenta el total del parque.
3. Un activo en tránsito no debe aparecer simultáneamente en origen y destino.
4. Stock inicial y stock reparado se proyectan bajo la misma semántica de disponibilidad, aunque su evidencia de origen sea distinta.

## 3. Dashboard de Bodega

**Rol operacional:** Logística.  
**Consulta:** Admin/Gerente.

### Indicadores

- total parque visible;
- stock físico en Bodega;
- disponibles para instalación;
- no disponibles;
- recepciones pendientes;
- despachos a Laboratorio;
- despachos a QA;
- equipos en ruta Terreno;
- solicitudes de repuesto pendientes;
- repuestos bajo stock crítico.

### Definiciones

**Stock físico:** activo cuya custodia vigente es Bodega.

**Disponible para instalación:** activo físicamente en Bodega con evidencia de elegibilidad y sin intervención incompatible.

**En ruta:** existe SALIDA_BODEGA_TERRENO confirmada y la instalación aún no termina.

**Asignado a técnico:** técnico definido, pero sin despacho físico confirmado.

## 4. Inventario de Equipos

Filtros esperados:

- tipo;
- serie;
- modelo;
- marca;
- ubicación/custodia;
- disponibilidad;
- bus;
- OS;
- origen de stock.

Campos de presentación:

- tipo;
- serie;
- modelo;
- marca;
- estado actual derivado;
- ubicación;
- última OS;
- bus cuando corresponda;
- elegibilidad;
- origen stock inicial/reparado.

## 5. Dashboard Laboratorio

**Rol operacional:** Jefe Laboratorio.

### KPI

- En camino.
- Recibidos.
- Recibidos sin asignar.
- En diagnóstico.
- En reparación.
- Espera de repuesto.
- Listos para salida.
- Incidencias.
- Reingresos.
- SLA próximos a vencer.
- SLA vencidos.
- Carga por técnico.

### SLA

El cronómetro se inicia con la recepción física confirmada del ciclo vigente. La salida de Bodega no inicia SLA.

### Carga por técnico

Debe considerar únicamente OS realmente recibidas y asignadas. Un equipo En camino no forma parte de la carga técnica.

## 6. Reporte de Validadores / Consolas

Campos mínimos:

- serie;
- modelo/marca;
- OS;
- falla reportada;
- diagnóstico;
- técnico;
- estado;
- fecha recepción;
- tiempo/SLA;
- resultado técnico;
- PoD;
- repuesto pendiente;
- QA más reciente cuando corresponda.

## 7. Reporte de Repuestos

### KPI

- stock actual;
- stock crítico;
- solicitudes pendientes;
- solicitudes despachadas;
- consumo por período;
- categoría Validador/Consola/Genérico.

### Regla

El consumo válido proviene de una entrega confirmada por Bodega. No se debe inferir consumo desde texto libre de reparación.

## 8. Dashboard QA

**Rol operacional:** QA.

### Etapas

- Recepción.
- Ambiente.
- Pruebas.
- Dictamen.
- Salida.

### KPI

- entradas pendientes;
- recibidos;
- en Ambiente;
- en pruebas;
- operativos;
- rechazados;
- pendientes de salida.

Un dictamen no implica que el equipo haya salido físicamente de QA.

## 9. Trazabilidad

Búsquedas:

- serie;
- OS;
- caso;
- referencia externa.

La línea de tiempo puede incluir:

- alta de activo;
- recepción inicial;
- requerimiento;
- retiro;
- entradas/salidas;
- escaneos;
- diagnóstico;
- reparación;
- solicitud/entrega de repuesto;
- QA;
- instalación;
- referencias externas.

## 10. Historial técnico para Terreno

Proyección restringida por diseño:

- falla reportada;
- diagnóstico;
- trabajo realizado;
- resultado;
- observaciones técnicas.

Se excluyen:

- stock/costos;
- autorizadores;
- auditoría administrativa;
- IDs internos sin valor técnico;
- información sensible de otros roles.

## 11. Inteligencia Operacional

Salida del analizador:

- total de OS analizadas;
- fallas previas;
- coincidencia EMV;
- coincidencia lector/QR;
- `riesgo_score`;
- top de equipos priorizados.

El score es heurístico y no representa probabilidad calibrada.

## 12. Reportes de Auditoría

La auditoría técnica se reconstruye desde:

- `flujo_eventos`;
- `os_historial_activo`;
- `escaneos_equipos`;
- logs de autorización;
- registro de reparación;
- QA.

No se debe exponer token, contraseña ni datos secretos en reportes.

## 13. Estados de interfaz

Cada reporte debe soportar:

- cargando;
- con datos;
- vacío real;
- error;
- acceso denegado.

## 14. Reportes pendientes / limitaciones

No declarar como implementado un reporte si la ruta o consulta no existe. La documentación de cierre debe distinguir:

- implementado;
- validado;
- pendiente de validación;
- proyectado.
