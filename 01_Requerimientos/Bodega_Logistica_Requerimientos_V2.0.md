# Bodega y Logística

**Versión:** V2.0

**Estado:** vigente — 09-10-2026

## Propósito

Logística controla la custodia en Bodega, recepción y despacho físico, inventario de equipos, repuestos y stock, requerimientos, retiros y preparación de instalaciones.

## Requisitos funcionales

- **RF-BOD-01:** Logística debe ver parque, Bodega, disponibilidad, tránsito y pendientes sin duplicar activos.
- **RF-BOD-02:** Inventario debe diferenciar parque global, stock físico, disponibles y no disponibles.
- **RF-BOD-03:** La recepción desde Terreno, Laboratorio o QA requiere evidencia física nueva del destino.
- **RF-BOD-04:** Un equipo en tránsito no se considera ubicado en Bodega.
- **RF-BOD-05:** El despacho hacia Laboratorio/QA/Terreno requiere validación y confirmación separadas.
- **RF-BOD-06:** La recepción inicial de un activo nuevo habilita stock sin crear OS de mantenimiento.
- **RF-BOD-07:** Disponible para instalación requiere custodia Bodega + elegibilidad vigente.
- **RF-BOD-08:** La IN se crea solo al confirmar despacho físico a Terreno.
- **RF-BOD-09:** PPU, terminal y operador deben permanecer coherentes; relaciones conocidas se autocompletan y las ambiguas requieren selección explícita.
- **RF-BOD-10:** Repuestos bajo umbral deben generar alertas visuales.
- **RF-BOD-11:** Entregar repuesto descuenta stock una sola vez, transaccionalmente.
- **RF-BOD-12:** Ajustes directos de stock permanecen bloqueados hasta existir una política legítima de ajuste.
- **RF-BOD-13:** Admin/Gerente pueden consultar Bodega según política; solo Logística ejecuta movimientos/stock.
- **RF-BOD-14:** Errores de API no deben presentarse como inventario vacío.

## Physical First

```text
contexto operacional
→ validar identidad/evidencia física
→ confirmar movimiento
→ registrar evento y nueva custodia
```

La lectura de recepción no sirve como evidencia de una salida posterior.

## Instalación

```text
Bodega disponible
→ contexto de instalación
→ seleccionar técnico/destino
→ leer activo físico
→ validar
→ confirmar despacho
→ crear IN
→ En ruta
```

Seleccionar técnico o validar lectura no crea la IN.

## Repuestos

Las solicitudes nacen desde trabajo técnico. La entrega física se realiza por Logística. Guardar/finalizar una reparación no debe volver a consumir stock.

## Pendientes conocidos

- Política formal para ajustes manuales legítimos de inventario.
- Entradas de repuestos con documento de respaldo: deben definirse como movimiento auditable; no como sobrescritura de cantidad.
