# Artefactos Metodología Cascada — PMP Suite V2.0

**Actualización:** 09-10-2026

## 1. Artefactos principales

1. [Documento de Inicio](00_Documento_Inicio_Proyecto_PMP_Suite_V2.0.md)
2. [SRS Simplificado](01_SRS_Simplificado_PMP_Suite_V2.0.md)
3. [Documento de Diseño](02_Documento_Diseno_PMP_Suite_V2.0.md)
4. [Plan de Pruebas y Evidencias](03_Plan_Pruebas_Evidencias_PMP_Suite_V2.0.md)
5. [Manual Técnico / Despliegue](04_Manual_Tecnico_Despliegue_PMP_Suite_V2.0.md)

Estos artefactos son documentos de entrega académica. Su detalle técnico se apoya en documentos maestros para evitar perder profundidad.

## 2. Documentos maestros de profundidad

- [Problemática y contexto](../00_PROBLEMATICA_Y_CONTEXTO_V2.0.md)
- [ERS completa](../../01_Requerimientos/ERS_PMP_Suite_V2.0.md)
- [Arquitectura Integral](../../02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md)
- [Modelo/Diccionario de Datos](../../02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md)
- [Modelo de Estados/Eventos](../../02_Arquitectura/MODELO_ESTADOS_EVENTOS_V2.0.md)
- [Catálogo API](../../02_Arquitectura/CATALOGO_API_V2.0.md)
- [BPMN AS-IS](../BPMN/BPMN_AS_IS_V2.0.md)
- [BPMN TO-BE](../BPMN/BPMN_TO_BE_V2.0.md)
- [Matriz BPMN → Sistema](../BPMN/MATRIZ_BPMN_SISTEMA_V2.0.md)
- [Casos de Uso](../06_CASOS_DE_USO_Y_ESCENARIOS_V2.0.md)
- [Reportes/KPI](../07_REPORTES_KPI_V2.0.md)
- [Matriz de Trazabilidad](../../08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md)
- [Informe de Pruebas](../../08_Pruebas/INFORME_PRUEBAS_V2.0.md)

## 3. Diagramas

`Diagramas_PlantUML/` conserva fuentes versionadas para arquitectura lógica, componentes, comunicación, ERD, casos de uso, clases conceptuales, secuencia y ejecución local.

Los BPMN editables están en `../BPMN/`.

## 4. Precedencia

~~~text
Código / migraciones vigentes
→ ERS V2.0
→ Arquitectura y modelo de datos V2.0
→ pruebas/trazabilidad
→ artefactos académicos derivados
~~~

## 5. Regla de mantenimiento

Los artefactos Cascada no deben convertirse en resúmenes desconectados. Si cambia un requisito, proceso, modelo físico o prueba, se actualiza primero la fuente maestra y luego el artefacto que la resume.
