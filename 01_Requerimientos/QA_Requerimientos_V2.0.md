# Control de Calidad — QA

**Versión:** V2.0

**Estado:** vigente — 09-10-2026

## Propósito

QA verifica equipos que llegan físicamente desde Bodega después del trabajo de Laboratorio. El flujo es autónomo: QA toma su trabajo y ejecuta sus etapas; Admin no asigna ni confirma movimientos QA.

## Requisitos funcionales

- **RF-QA-01:** Un equipo debe estar en tránsito hacia QA antes de poder recepcionarse.
- **RF-QA-02:** Recepción QA exige evidencia propia del destino.
- **RF-QA-03:** QA toma/inicia su trabajo desde su bandeja; la asignación administrativa legacy está retirada.
- **RF-QA-04:** El flujo contempla Recepción → Instalación Ambiente → Pruebas → Dictamen → Despacho.
- **RF-QA-05:** Ambiente y pruebas deben registrar el contexto disponible.
- **RF-QA-06:** Dictamen Operativo/Rechazado conserva custodia QA.
- **RF-QA-07:** Rechazo requiere motivo/observación suficiente para Laboratorio.
- **RF-QA-08:** Despacho a Bodega requiere validación física separada.
- **RF-QA-09:** Solo la recepción posterior de Bodega cambia custodia a Bodega.
- **RF-QA-10:** Un ciclo nuevo no hereda dictamen/evidencia de un ciclo anterior.
- **RF-QA-11:** Admin/Gerente pueden consultar; solo QA ejecuta acciones QA.

## Rutas legacy

Las rutas de asignación administrativa/proceso genérico retiradas deben responder de forma explícita y no servir como bypass del flujo actual.

## Resultado

Un equipo Operativo queda elegible para stock reparado después de salir de QA y ser recibido físicamente en Bodega. Un Rechazado retorna al circuito de corrección con antecedentes.
