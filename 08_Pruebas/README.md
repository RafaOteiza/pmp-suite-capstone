# Pruebas y evidencias PMP Suite

Esta carpeta contiene resultados fechados de evolución, regresión y validación. **Los informes fechados son evidencia histórica y no deben reescribirse para que parezcan actuales.**

## Resumen vigente

Usar [INFORME_PRUEBAS.md](INFORME_PRUEBAS.md) como índice actual.

Evidencias recientes:

- [Separación RBAC — 09-10-2026](Separacion_Roles_RBAC_2026-10-09.md)
- [Consolidación seguridad/identidad/UX — 08-10-2026](Consolidacion_Seguridad_Identidad_UX_2026-10-08.md)
- [Laboratorio Physical First](Laboratorio_Custodia_Physical_First.md)
- [Trabajo técnico integral](Laboratorio_Trabajo_Tecnico_Integral.md)
- [QA autónomo](QA_Dashboard_Flujo_Autonomo.md)
- [Recepción Bodega Physical First](Recepcion_Bodega_Physical_First.md)
- [Experiencia por rol](EXPERIENCIA_POR_ROL.md)

## Regla de evidencia

Una prueba es «aprobada» solo si existe una ejecución identificable con versión/fecha/resultado. Las capturas simuladas se distinguen de pruebas nativas o integradas.

## Base habitual

No ejecutar estrés, reset o pruebas destructivas sobre `pmp_suite`. Las regresiones con escritura deben usar PostgreSQL efímero/desechable cuando sea posible.
