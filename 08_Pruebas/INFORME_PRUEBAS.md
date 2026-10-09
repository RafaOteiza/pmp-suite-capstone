# PMP Suite — Estado de pruebas

**Actualización:** 09-10-2026

Este documento es el índice de resultados vigentes. Los informes fechados de esta carpeta conservan el detalle de cada intervención.

## Resultado más reciente documentado

| Verificación | Resultado |
|---|---:|
| Backend `npm test` | **118/118 aprobadas** |
| Web `npm test` | **176/177 aprobadas** |
| Mobile con mocks | **210/210 aprobadas** |
| TypeScript + build Web | **Aprobados** |
| RBAC HTTP aislado | **99 solicitudes aprobadas** |
| E2E Laboratorio | **Aprobado** |
| E2E operacional integral aislado | **Aprobado** |
| Visual/responsive RBAC | **150 renderizados 320–1440 px** |

Fuente: [Separación RBAC — 09-10-2026](Separacion_Roles_RBAC_2026-10-09.md).

## Fallo conocido

La suite Web conserva un fallo de fixture previo: un mock relacionado con `AssetHistoryScreen` no exporta `useAuth`. No se declara corregido.

## Validación manual

Se ha ejecutado un recorrido controlado de un equipo real de prueba funcional a través de:

- instalación;
- reporte de falla;
- retiro Terreno;
- recepción Bodega;
- envío/recepción Laboratorio;
- asignación;
- diagnóstico/reparación/prueba;
- finalización;
- salida hacia Bodega.

Las etapas posteriores continúan validándose. Cuando se utiliza contingencia manual, el resultado valida lógica de flujo pero no certifica el hardware de escaneo/cámara.

## RBAC

Roles cubiertos:

`admin`, `gerente`, `jefe_laboratorio`, `logistica`, `qa`, `tecnico_laboratorio`, `tecnico_terreno`.

La separación vigente evita que Admin ejecute automáticamente operaciones físicas y que Gerencia realice escrituras.

## Estrategia

- unitarias/contratos con Node Test Runner;
- HTTP/RBAC;
- PostgreSQL efímero;
- E2E por flujo;
- visual/responsive;
- manual Web/Mobile;
- rendimiento solo en entorno aislado.

## Pendientes

- resolver el fixture Web;
- validar cámara/escáner/Safe Area en dispositivo físico;
- completar recorrido manual hasta QA y nueva instalación;
- repetir rendimiento en entorno descartable;
- mantener trazabilidad requisito → prueba → evidencia.
