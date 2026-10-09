# 03 — Plan de Pruebas y Evidencias PMP Suite v3.0

## Objetivo

Verificar reglas de negocio, RBAC, integridad, custodia, UX e integración sin comprometer la base habitual.

## Estrategia

1. unitarias/contratos;
2. integración HTTP;
3. RBAC;
4. PostgreSQL efímero;
5. E2E por flujo;
6. build/export;
7. visual responsive;
8. prueba manual Web/Mobile.

## Matriz principal

| Área | Casos |
|---|---|
| Auth/RBAC | cuenta activa, rol, 401/403, scope propio |
| Activos | alta, identidad, modelo/marca, recepción inicial |
| Terreno | falla, retiro, instalación, historial |
| Bodega | recepción, despacho, inventario, repuestos |
| Laboratorio | recepción, SLA, asignación, trabajo, salida |
| QA | recepción, Ambiente, pruebas, dictamen, salida |
| Bridge | correlación/búsqueda, sin operaciones |
| IA | lectura, deduplicación, error controlado |
| UX | claro/oscuro, responsive, focus/overflow |

## Estado documentado 09-10-2026

- Backend: 118/118.
- Web: 176/177.
- Mobile: 210/210 con mocks.
- Build Web: aprobado.
- RBAC HTTP: 99 solicitudes aprobadas.
- E2E operacional y Lab: aprobados.
- Visual RBAC: 150 renderizados.

## Fallos/pendientes

- un fixture Web;
- cámara/lector real y Safe Area;
- rendimiento;
- seguridad dedicada;
- Docker;
- recorrido final hasta reinstalación.

## Evidencia

`08_Pruebas/` contiene el detalle por fecha. `Documentacion Capstone/Evidencias/` funciona como índice académico.
