# Órdenes de Servicio, Casos e Intervenciones — PMP Suite V2.0

**Versión:** V2.0  
**Estado:** vigente

## 1. Modelo conceptual

PMP Suite separa cuatro identidades:

| Concepto | Identidad | Ejemplo |
|---|---|---|
| Activo | tipo + serie | VALIDADOR 7490004 |
| Caso | codigo_caso | INT-000001 |
| OS | codigo_os | MV-000210 |
| Referencia externa | sistema + referencia | AR-12345678 |

Una relación entre ellas no significa que sean la misma cosa.

## 2. Nomenclatura

| Proceso | Tipo | Prefijo |
|---|---|---|
| mantenimiento | Validador | MV |
| mantenimiento | Consola | MC |
| PoD | Validador | PDV |
| PoD | Consola | PDC |
| instalación | ambos | IN |

La generación es responsabilidad del backend/BD.

## 3. Caso ARANDA

- origen = ARANDA;
- referencia normalizada `AR-<dígitos>`;
- caso conserva referencia;
- mantenimiento/PoD se correlaciona;
- Aranda no sustituye el código PMP.

## 4. Caso INTERNO

El sistema usa secuencia propia y genera `INT-xxxxxx`.

No requiere referencia Aranda.

## 5. Creación de mantenimiento

Precondiciones:

- activo registrado;
- activo en operación;
- bus/contexto coherentes;
- sin OS activa incompatible.

La OS mantiene el activo que originó el caso.

## 6. Instalación IN

La IN es independiente.

No se crea al:

- recibir desde QA;
- elegir técnico;
- elegir bus;
- escanear/validar;
- abrir formulario.

Se crea al:

> confirmar el despacho físico Bodega→Terreno.

## 7. Reemplazo

Caso típico:

1. activo A instalado falla;
2. se crea MV/MC/PDV/PDC para A;
3. A se retira y entra a reparación;
4. Bodega selecciona activo B elegible;
5. se crea IN para B al despacho;
6. historia de A y B permanece separada;
7. ambos pueden relacionarse al mismo caso cuando corresponde.

No cambiar serie de la OS de A para “convertirla” en B.

## 8. Origen de stock

### Inicial

IN referencia `stock_origen_evento`.

### Reparado

IN referencia `stock_origen_os`.

El origen es inmutable.

## 9. Relaciones de OS

- `caso_id`;
- `os_origen`;
- `stock_origen_os`;
- `stock_origen_evento`.

Se validan contra tipo/serie y no deben cambiar después de crear la OS.

## 10. Estado vs custodia

`estado_id` es parte del modelo, pero V2.0 deriva estados de presentación con eventos/evidencias.

Ejemplos:

- pendiente retiro;
- asignado;
- en ruta;
- tránsito Lab;
- disponible instalación;
- etapas QA.

Por eso no debe inferirse custodia únicamente desde un número de estado.

## 11. Historial

`os_historial_activo` registra snapshots de OS.

La trazabilidad por activo agrega:

- OS;
- cambios;
- eventos;
- escaneos;
- reparaciones;
- QA;
- referencias.

## 12. Requisitos

- **RF-OS-001:** código generado automáticamente.
- **RF-OS-002:** nomenclatura según tipo/proceso.
- **RF-OS-003:** identidad tipo+serie inmutable.
- **RF-OS-004:** una OS corresponde a un activo.
- **RF-OS-005:** caso agrupa sin fusionar activos.
- **RF-OS-006:** referencia externa no reemplaza OS.
- **RF-OS-007:** impedir OS activa duplicada incompatible.
- **RF-OS-008:** PoD desde origen usa PDV/PDC.
- **RF-OS-009:** mantenimiento normal usa MV/MC.
- **RF-OS-010:** IN secuencia independiente.
- **RF-OS-011:** IN solo al despacho.
- **RF-OS-012:** IN conserva stock origen.
- **RF-OS-013:** origen stock no se reutiliza.
- **RF-OS-014:** relaciones caso/origen inmutables.
- **RF-OS-015:** reparación no se reutiliza como instalación.
- **RF-OS-016:** historial por serie.
- **RF-OS-017:** transiciones incompatibles se rechazan.
- **RF-OS-018:** cierre técnico ≠ movimiento.
- **RF-OS-019:** dictamen QA ≠ movimiento.
- **RF-OS-020:** tránsito ≠ recepción.

## 13. Casos negativos

- cliente envía `codigo_os` manual → rechazo;
- identidad cambia después → trigger/rechazo;
- stock origen de otra serie → rechazo;
- caso con tipo distinto → rechazo;
- doble IN sobre mismo origen → rechazo;
- requerimiento para activo no operativo → rechazo;
- requerimiento duplicado Aranda → conflicto.

## 14. Fuentes

- `05_BaseDatos/migraciones/requerimientos/`
- `03_Backend/pmp-api/src/services/requirements.js`
- `warehouseDispatch.js`
- `assetHistory.js`
