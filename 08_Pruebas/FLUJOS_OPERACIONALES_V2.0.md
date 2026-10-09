# Flujos Operacionales — V2.0

## Identidad

- Validador 72 → CVB35 / Mikroelektronika.
- Validador 74/75 → CVB45 / Mikroelektronika.
- Consola → N9715 / Waysion.
- Identidad transversal: tipo + serie.

## Physical First

Consultar, seleccionar o validar identidad no cambia custodia. Cada movimiento exige evidencia del propósito/ciclo actual y confirmación explícita.

## Flujo integral

```text
Activo en operación
→ falla
→ retiro Terreno
→ recepción Bodega
→ despacho a Laboratorio
→ recepción Lab
→ asignación
→ diagnóstico/reparación/pruebas
→ salida Lab
→ recepción Bodega
→ despacho QA
→ recepción QA
→ Ambiente
→ Pruebas
→ Dictamen
→ salida QA
→ recepción Bodega
→ disponible
→ despacho Terreno
→ creación IN
→ instalación
→ En operación
```

## Laboratorio

Jefe Laboratorio confirma recepción/salida y asigna. Técnico Lab trabaja solo su carga. El SLA inicia en recepción física confirmada. Finalizar trabajo no mueve el activo.

## Repuestos

Técnico Lab describe la necesidad; Logística resuelve repuesto/cantidad y confirma entrega. El stock se descuenta una sola vez al entregar.

## QA

QA toma su trabajo. Dictamen Operativo/Rechazado no confirma despacho. La salida QA y recepción Bodega son eventos distintos.

## Instalación

La IN se crea únicamente al confirmar despacho físico desde Bodega a Terreno.

## Bridge

Solo correlaciona activo + OS PMP existente + referencia externa. No asigna, no crea mantenimiento y no mueve stock.
