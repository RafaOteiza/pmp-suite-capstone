# Flujo Bridge → Mantenimiento

> Documento histórico del comportamiento anterior. El flujo operativo descrito
> aquí quedó retirado; sus endpoints devuelven HTTP 410. La especificación y las
> pruebas vigentes están en [Bridge: correlación e historial](BRIDGE_CORRELACION_Y_HISTORIAL.md).

## Objetivo

Implementar el flujo operacional interno de PMP Suite desde la preparación logística de un reemplazo hasta su instalación en terreno, la generación automática del mantenimiento del equipo retirado, su reparación, certificación QA y retorno físico a bodega.

La **OS Bridge** o **Intervención Bridge** es un requerimiento operacional interno que coordina la preparación del reemplazo, el trabajo en terreno y la generación del mantenimiento del equipo retirado.

## Flujo

```text
Logística crea y asigna Bridge
→ Técnico terreno inicia y completa el cambio físico
→ PMP genera exactamente una OS de mantenimiento para el equipo retirado
→ Logística recibe desde terreno
→ Admin asigna laboratorio
→ Logística despacha físicamente a laboratorio
→ Admin recibe físicamente en laboratorio
→ Técnico de laboratorio diagnostica, repara y prueba
→ Admin despacha físicamente a bodega
→ Logística recibe y despacha a QA con usuario asignado
→ QA aprueba o rechaza
→ Si rechaza: retrabajo de laboratorio conservando historial
→ Si aprueba: queda pendiente de recepción logística
→ Logística recibe desde QA
→ Equipo disponible
```

## Roles y alcance

- **logistica:** crea Bridge, asigna o reasigna terreno antes del inicio, recibe desde terreno, despacha a laboratorio, entrega repuestos y recibe desde QA.
- **tecnico_terreno:** consulta exclusivamente sus Bridges asignadas, inicia y completa la intervención.
- **admin:** consulta todas las Bridges y mantenimientos, asigna laboratorio y controla la recepción y el despacho físico del laboratorio. No ejecuta la reparación técnica.
- **tecnico_laboratorio:** consulta y trabaja exclusivamente mantenimientos asignados.
- **qa:** consulta y certifica exclusivamente mantenimientos QA asignados.

## Estados Bridge

- `PENDIENTE_ASIGNACION`
- `ASIGNADA`
- `EN_TERRENO`
- `COMPLETADA`
- `CANCELADA`

El frontend no envía un estado. Las acciones semánticas del backend determinan cada transición.

## Estados de mantenimiento reutilizados

| Concepto del flujo | Estado existente |
|---|---|
| Pendiente recepción logística | `EN_TRANSITO` (2) |
| Pendiente asignación laboratorio | `EN_BODEGA` (3) |
| Diagnóstico | `EN_DIAGNOSTICO` (4) |
| Reparación/retrabajo | `EN_REPARACION` (5) |
| Pendiente asignación/ejecución QA | `EN_QA` (6) |
| Espera repuesto | `ESPERA_REPUESTO` (9) |
| Aprobado QA pendiente recepción | `EN_TRAYECTO_BODEGA` (11) |
| Disponible | `DISPONIBLE` (7) |
| Reemplazo instalado | `INSTALADO` (12) |

La asignación y la ubicación física permiten distinguir las subetapas que comparten un estado existente.

## Bridge

Logística registra el técnico asignado, equipo de reemplazo disponible, bus y terminal esperados cuando se conocen, motivo y observación. El origen queda fijado como `PMP`; `sistema_externo` y `referencia_externa` permanecen `NULL`.

La reasignación solo se permite antes de `EN_TERRENO`. Al cerrarse, un trigger impide modificar o eliminar los datos históricos de la Bridge.

## Intervención de terreno

El técnico debe confirmar:

- equipo retirado;
- equipo instalado;
- bus;
- terminal y PST;
- fecha/hora real;
- observación;
- evidencia URL opcional.

El equipo instalado debe coincidir con el preparado y continuar disponible. Terminal y PST deben ser una combinación válida. No se inventan valores predeterminados.

## Generación de mantenimiento

La finalización exitosa se ejecuta en una única transacción:

1. bloquea y valida Bridge;
2. valida técnico asignado y estado;
3. valida equipos y ubicación operacional;
4. registra la instalación física;
5. marca el reemplazo como instalado;
6. genera la OS del equipo retirado;
7. crea la relación Bridge–mantenimiento;
8. cierra Bridge;
9. registra eventos.

`pmp.bridge_mantenimiento.bridge_codigo` es clave primaria y `codigo_os` es único. Una Bridge no puede generar dos mantenimientos.

## Bodega

La ubicación física solo se actualiza mediante acciones logísticas:

- `recibir-terreno` confirma serie, ubicación, condición y guía opcional;
- `despachar-lab` requiere asignación previa de Admin;
- `recibir-qa` requiere aprobación QA persistida y deja el equipo disponible.

Cada acción registra un evento. La entrega de repuesto no permite que laboratorio modifique stock directamente.

## Laboratorio

Admin asigna la OS y controla la recepción y el despacho físico del laboratorio. El técnico solo ve `tecnico_laboratorio_id = usuario autenticado` y puede:

- iniciar reparación;
- registrar diagnóstico;
- registrar reparación;
- registrar prueba y resultado;
- solicitar repuesto;
- completar la etapa.

Cada reparación/retrabajo genera un nuevo registro histórico en `pmp.registro_reparaciones`.

## QA

Admin asigna un usuario QA. QA solo ve su carga y registra una fila inmutable en `pmp.qa_inspecciones` con usuario, fecha, resultado, comentario y certificación.

- Rechazo: comentario obligatorio, conserva el técnico de laboratorio y vuelve a retrabajo.
- Aprobación: queda pendiente de recepción logística; QA no actualiza una ubicación física de bodega.

## Trazabilidad

`pmp.flujo_eventos` permite reconstruir cronológicamente Bridge y mantenimiento. Sus registros, las instalaciones y las inspecciones QA son append-only mediante triggers.

La relación `pmp.bridge_mantenimiento` permite navegar en ambos sentidos sin depender de códigos copiados en texto.

## Campos reservados para integración futura

La tabla Bridge incluye:

- `origen`;
- `sistema_externo`;
- `referencia_externa`.

En esta versión todas las Bridges usan `origen = PMP`. No existe una API, webhook, credencial, SDK ni respuesta simulada de una plataforma externa.

## Migraciones

Ubicación: `05_BaseDatos/migraciones/bridge/`.

- `001_bridge_mantenimiento_schema.sql`: estructura común.
- `001_bridge_mantenimiento_dry_run.sql`: aplica dentro de una transacción y termina con `ROLLBACK`.
- `001_bridge_mantenimiento_apply.sql`: aplica con validaciones y `COMMIT`.
- `001_bridge_mantenimiento_rollback.sql`: reversión independiente.

La migración agrega estructura sin eliminar ni transformar datos existentes.

## Pruebas

Backend (`npm test`):

- acciones semánticas;
- autorización por rol;
- scopes assigned;
- validación de estados y datos reales;
- idempotencia;
- relación persistente;
- inmutabilidad;
- QA histórico;
- recepciones logísticas.

Frontend (`npm test` y `npm run build`):

- ruta protegida;
- navegación específica por rol;
- formularios propios de cada etapa;
- ausencia de `estado_id` en escrituras del nuevo cliente;
- comentario obligatorio de rechazo;
- compilación TypeScript y producción Vite.
