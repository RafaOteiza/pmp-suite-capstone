# Órdenes de Servicio, casos e intervenciones

**Estado:** vigente — 09-10-2026

## Conceptos

| Concepto | Función |
|---|---|
| Caso/requerimiento | Agrupa una necesidad operacional |
| OS PMP | Intervención concreta de un activo |
| Activo | Identidad física tipo + serie |
| Referencia externa | Identificador Aranda u otro, correlacionado mediante Bridge |

No deben fusionarse.

## Nomenclatura

- Validador mantenimiento: `MV-...`
- Consola mantenimiento: `MC-...`
- PoD validador: `PDV-...`
- PoD consola: `PDC-...`
- Instalación: `IN-xxxxxx`

La IN usa secuencia PMP independiente del caso/referencia externa.

## Requisitos

- **RF-OS-01:** Toda OS debe referenciar un activo existente.
- **RF-OS-02:** La identidad tipo + serie de una OS no debe alterarse para representar otro activo.
- **RF-OS-03:** Un caso puede relacionar varias OS/activos sin mezclar sus historiales.
- **RF-OS-04:** PoD conocido desde el origen utiliza PDV/PDC.
- **RF-OS-05:** Reportar falla no crea ni corrige el maestro del activo.
- **RF-OS-06:** Una OS de reparación no se reutiliza para instalar un reemplazo.
- **RF-OS-07:** La IN nace con despacho físico confirmado desde Bodega.
- **RF-OS-08:** Estados y custodia deben ser coherentes; un tránsito no equivale a recepción.
- **RF-OS-09:** Técnicos solo pueden operar OS asignadas a ellos.
- **RF-OS-10:** Cierres técnicos, dictámenes y movimientos físicos son acciones distintas.

## Historial

El historial de activo agrupa intervenciones del mismo tipo + serie. La vista para Terreno se restringe a información técnica útil; supervisión autorizada puede consultar mayor contexto según rol.
