# Laboratorio

**Versión:** V2.0

**Estado:** vigente — 09-10-2026

## Propósito

El módulo controla custodia, asignación y ejecución técnica de validadores y consolas en Laboratorio. Las responsabilidades de jefatura y técnico están separadas.

## Roles

- **`jefe_laboratorio`:** recepción física, asignación/reasignación, supervisión, SLA y despacho.
- **`tecnico_laboratorio`:** diagnóstico, intervención, pruebas y solicitud de repuestos de su carga.
- **`admin` / `gerente`:** supervisión de solo consulta del dominio; no custodia.
  
## Requisitos funcionales

- **RF-LAB-01:** Recepción debe mostrar bandeja con En camino, Recibidos, Incidencias e Historial.
- **RF-LAB-02:** Envío a Laboratorio no equivale a recepción.
- **RF-LAB-03:** La recepción requiere evidencia nueva y confirmación explícita.
- **RF-LAB-04:** El SLA comienza en la recepción física vigente.
- **RF-LAB-05:** Solo equipos recibidos pueden quedar pendientes de asignación.
- **RF-LAB-06:** Jefatura asigna/reasigna a técnicos activos.
- **RF-LAB-07:** Técnico solo abre y modifica su carga.
- **RF-LAB-08:** Iniciar trabajo cambia de diagnóstico a reparación según flujo vigente.
- **RF-LAB-09:** Deben registrarse diagnóstico, falla real, intervención, pruebas y resultado técnico.
- **RF-LAB-10:** Puede solicitarse repuesto cuando el trabajo lo requiera.
- **RF-LAB-11:** Finalizar trabajo deja el equipo Listo para QA/salida, sin cambiar custodia.
- **RF-LAB-12:** Despacho a Bodega requiere evidencia nueva de salida.
- **RF-LAB-13:** Un rechazo QA debe volver con antecedentes visibles para el nuevo ciclo.
- **RF-LAB-14:** Reingresos y ciclos anteriores deben conservarse en historial sin reutilizar evidencia antigua.

## SLA

El SLA de Laboratorio utiliza la recepción física confirmada del ciclo vigente. Los equipos «en camino» quedan fuera de carga y SLA.

## Trabajo técnico

```text
Recibido
→ asignado
→ diagnóstico
→ reparación
→ pruebas
→ resultado técnico
→ listo para salida
→ validación física
→ salida hacia Bodega
```

## UX

Resumen de Laboratorio debe distinguir:

- tickets en Laboratorio;
- recibidos sin asignar;
- diagnóstico;
- reparación;
- espera de repuesto;
- listos para salida;
- reingresos;
- prioridad SLA y carga por técnico.

Un error de consulta debe mostrarse como error.
