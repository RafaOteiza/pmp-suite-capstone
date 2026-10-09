# EV-CIERRE-001 — Estado técnico de cierre PMP Suite

**Fecha:** 09-10-2026  
**Estado:** vigente

## Objetivo

Consolidar en una evidencia académica breve los resultados técnicos más recientes y las brechas que continúan abiertas.

## Resultados

| Área | Resultado |
|---|---|
| Backend | 118/118 |
| Web | 176/177 |
| Mobile | 210/210 con mocks |
| Build Web | aprobado |
| RBAC HTTP | 99 solicitudes aprobadas |
| E2E Laboratorio | aprobado |
| E2E operacional | aprobado |
| Visual | 150 renderizados 320–1440 px |

Fuente detallada: `08_Pruebas/Separacion_Roles_RBAC_2026-10-09.md`.

## RBAC vigente

Siete roles oficiales:

- admin;
- gerente;
- jefe_laboratorio;
- logistica;
- qa;
- tecnico_laboratorio;
- tecnico_terreno.

Se verificó manualmente la administración de usuarios y la actualización de Rafael Oteiza a `jefe_laboratorio`. Las credenciales/UID no se documentan.

## Brechas

- fixture Web pendiente;
- validación nativa de cámara/lector;
- pruebas dedicadas de rendimiento y seguridad;
- evidencia manual final QA → Bodega → reinstalación.

## Conclusión

El núcleo funcional está en estado avanzado y demostrable. El cierre académico debe concentrarse en las brechas anteriores y en evidencia reproducible, no en ampliar el alcance.
