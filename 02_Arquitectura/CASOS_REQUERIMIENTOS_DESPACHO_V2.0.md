# Casos, requerimientos y despacho Physical First

**Versión:** V2.0

**Estado:** vigente — 09-10-2026

## Conceptos

| Concepto | Identidad | Uso |
|---|---|---|
| Caso | código interno / referencia | agrupa necesidad |
| OS PMP | `codigo_os` | intervención de un activo |
| Activo | tipo + serie | historial físico |
| Referencia externa | sistema + texto | correlación Bridge |

## Requerimiento

Ingreso de requerimientos trabaja sobre un activo registrado. No crea ni corrige maestros. Para un activo instalado, PPU/terminal/operador deben provenir de relaciones vigentes; el backend revalida antes de escribir.

## Prefijos

- MV: mantenimiento validador.
- MC: mantenimiento consola.
- PDV: PoD validador.
- PDC: PoD consola.
- IN: instalación.

## Bridge

Bridge registra correlaciones hacia OS/activos existentes. Las operaciones legacy que asignaban, creaban mantenimiento o movían equipos no forman parte del contrato vigente.

## Stock e instalación

Un activo puede estar disponible por:

1. recepción inicial conforme; o
2. reparación aprobada por QA y recepción posterior en Bodega.

La instalación sigue:

```text
contexto (caso/bus/técnico)
→ lectura del activo físico
→ validación de elegibilidad
→ confirmación de salida
→ creación atómica de IN
→ En ruta
```

La recepción desde QA no crea la IN.

## Coherencia relacional

PPU, terminal y operador son datos relacionados. El sistema debe autocompletar cuando la relación es inequívoca; si existen varias opciones legítimas, debe pedir selección explícita. No se debe permitir una combinación incompatible por digitación libre.

## Historial

La búsqueda por serie/OS/referencia conduce al historial del activo correspondiente. Un caso puede enlazar intervenciones de activos distintos, pero no fusiona sus vidas.

## Evidencia

La verificación vigente se consolida en:

- `08_Pruebas/FLUJOS_OPERACIONALES_V2.0.md`
- `08_Pruebas/INFORME_PRUEBAS_V2.0.md`
