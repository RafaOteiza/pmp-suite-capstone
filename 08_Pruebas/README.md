# Pruebas y evidencias PMP Suite

**Índice vigente:** 09-10-2026

Esta carpeta conserva evidencia fechada. Un informe fechado describe lo ejecutado en ese momento; no se reescribe para simular que corresponde al estado posterior.

> **Regla de lectura:** para permisos y roles, cualquier afirmación anterior al 09-10-2026 queda subordinada a [Separación RBAC](Separacion_Roles_RBAC_2026-10-09.md). Para resumen de resultados actuales usar [INFORME_PRUEBAS](INFORME_PRUEBAS.md).

## Evidencia vigente/prioritaria

| Documento | Uso |
|---|---|
| [Separacion_Roles_RBAC_2026-10-09.md](Separacion_Roles_RBAC_2026-10-09.md) | RBAC actual |
| [Consolidacion_Seguridad_Identidad_UX_2026-10-08.md](Consolidacion_Seguridad_Identidad_UX_2026-10-08.md) | seguridad, identidad y UX |
| [Laboratorio_Custodia_Physical_First.md](Laboratorio_Custodia_Physical_First.md) | custodia Lab |
| [Laboratorio_Trabajo_Tecnico_Integral.md](Laboratorio_Trabajo_Tecnico_Integral.md) | trabajo técnico |
| [QA_Dashboard_Flujo_Autonomo.md](QA_Dashboard_Flujo_Autonomo.md) | QA autónomo |
| [QA_Simplificacion_UX_2026-10-07.md](QA_Simplificacion_UX_2026-10-07.md) | UX QA |
| [Recepcion_Bodega_Physical_First.md](Recepcion_Bodega_Physical_First.md) | recepción Bodega |
| [RECEPCION_INICIAL_SIN_OS.md](RECEPCION_INICIAL_SIN_OS.md) | stock inicial |
| [EXPERIENCIA_POR_ROL.md](EXPERIENCIA_POR_ROL.md) | experiencia actual por rol |
| [INFORME_PRUEBAS.md](INFORME_PRUEBAS.md) | resumen actual |

## Evidencia evolutiva / histórica

Estos documentos se conservan para explicar cómo evolucionó el diseño:

- `FASE_1_5_VERIFICACION_RBAC.md`
- `BRIDGE_CORRELACION_Y_HISTORIAL.md`
- `FLUJO_BRIDGE_MANTENIMIENTO.md`
- `REQUERIMIENTOS_CASOS_DESPACHO.md`
- `CORRECCION_MODELO_OS_ACTIVOS.md`
- `MODELO_DEFINITIVO_ACTIVOS.md`
- `NOMENCLATURA_LOGISTICA.md`
- `UX_DESPACHO_BODEGA.md`
- `UX_Sin_Ventanas_Operacionales.md`
- `QA_Custodia_Asignacion.md`
- `Entorno_Manual_Un_Equipo_2026-10-07.md`

Cuando un documento histórico contradice el contrato vigente, usar requisitos/arquitectura actuales y la evidencia más reciente.

## Criterios de evidencia

- indicar fecha y versión/commit;
- distinguir mocks, simulación de navegador y dispositivo físico;
- no llamar «aprobada» a una prueba que no se ejecutó;
- usar PostgreSQL efímero/desechable para escrituras destructivas;
- no exponer contraseñas, tokens, service accounts ni datos sensibles;
- conservar resultados fallidos conocidos en vez de ocultarlos.

## Estado resumido

Consultar `INFORME_PRUEBAS.md`: backend 118/118; Web 176/177; Mobile 210/210; build aprobado; RBAC/E2E aislados aprobados según evidencia fechada del 09-10-2026.
