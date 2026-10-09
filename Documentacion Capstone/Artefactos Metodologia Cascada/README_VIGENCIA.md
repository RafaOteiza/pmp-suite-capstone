# Vigencia de los artefactos Cascada

Actualización: 15 de septiembre de 2026.

## Referencias funcionales vigentes

- [Casos, Ingreso de requerimientos y despacho por escaneo](../../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md): diagnóstico, modelo, códigos, Capstone frente a integración futura y guión E2E.
- [Bridge: correlación externa e historial del activo](../../08_Pruebas/BRIDGE_CORRELACION_Y_HISTORIAL.md): contrato Bridge vigente y preservación de datos históricos.
- [Nomenclatura logística](../../08_Pruebas/NOMENCLATURA_LOGISTICA.md): separación de stock, asignación, tránsito físico y equipos en operación.
- [UX del despacho desde Bodega](../../08_Pruebas/UX_DESPACHO_BODEGA.md): evidencia del ajuste previo de errores inline y validación física.

En caso de contradicción, las descripciones operacionales Bridge anteriores quedan sustituidas por las dos primeras referencias. Las pruebas de cada documento corresponden a su fecha y versión; no prueban automáticamente la evolución siguiente.

## DOCX conservados como evidencia histórica

Los binarios no se eliminaron ni se modificaron en esta actualización. Se mantienen sus contenidos e imágenes para preservar la evidencia académica. Esta tabla delimita su vigencia:

| Archivo | Clasificación y advertencia |
|---|---|
| `00_Documento_Inicio_Proyecto_PMP_Suite.docx` | **FLUJO RETIRADO / HISTÓRICO** en la descripción de Bridge como preparación, asignación y creación de mantenimiento. El contexto académico conserva su valor histórico. |
| `01_SRS_Simplificado_PMP_Suite.docx` | **FLUJO RETIRADO / HISTÓRICO** en RF-BRG-01 a RF-BRG-05 y definición de Bridge operacional. Sustituir su lectura funcional por las referencias vigentes. |
| `02_Documento_Diseno_PMP_Suite.docx` | **FLUJO RETIRADO / HISTÓRICO** en clases/ERD Bridge operativo, relación uno a uno como proceso actual y Figura 6. Las tablas antiguas siguen conservadas para datos históricos. |
| `03_Plan_Pruebas_Evidencias_PMP_Suite.docx` | **EVIDENCIA HISTÓRICA** en escenarios que crean/asignan/completan Bridge y resultados de la línea base previa. Las pruebas vigentes deben ejecutarse sobre el contrato de correlación. |
| `04_Manual_Tecnico_Despliegue_PMP_Suite.docx` | Manual de la línea base anterior. Sus instrucciones deben complementarse con las migraciones aditivas actuales; no ejecutar rollback/reset históricos para adoptar el nuevo flujo. |
| `Historial/2026-09-12_pre_actualizacion/*.docx` | **ARCHIVO HISTÓRICO** anterior a la línea base documentada. No constituye especificación funcional vigente. |

Las fuentes PlantUML 05, 06, 07 y 08 también contienen avisos históricos. Sus imágenes antiguas incrustadas en DOCX conservan esa misma condición; no deben reutilizarse en una nueva defensa como representación actual de Bridge.

## Alcance académico

PMP Suite es autónomo. Durante el Capstone, Aranda u otros requerimientos externos se registran de forma asistida en **Ingreso de requerimientos**. PMP genera sus propias OS y Bridge conserva las referencias externas. Una futura integración comercial en SONDA podrá automatizar el ingreso mediante API/Web Service/webhook/ETL; no forma parte del alcance implementado para el Capstone y no cambia el modelo central de trazabilidad.

Se mantiene Expo SDK 57. Esta actualización documental no agrega Docker ni diagramas Docker. La exportación móvil no sustituye la validación en un dispositivo físico.
