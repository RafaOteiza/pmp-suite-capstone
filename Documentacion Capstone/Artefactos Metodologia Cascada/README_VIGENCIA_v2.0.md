# Vigencia de los artefactos Cascada

Actualización: 23 de septiembre de 2026.

## Línea base vigente

Los documentos DOCX 00–04 fueron actualizados a **versión 2.0 · Línea base final Capstone** y pasan a ser documentación funcional vigente. Deben leerse junto con los informes técnicos/evidencias que registran las migraciones y resultados de prueba.

- `00_Documento_Inicio_Proyecto_PMP_Suite_v2.0.docx` — alcance, problema, objetivos y proyección de integración Aranda actualizados.
- `01_SRS_Simplificado_PMP_Suite_v2.0.docx` — requisitos vigentes de activos, requerimientos, Bridge como correlación, OS independientes, Bodega physical-first, laboratorio y QA.
- `02_Documento_Diseno_PMP_Suite_v2.0.docx` — arquitectura y diagramas vigentes: activo, caso, OS, Bridge, escaneos, eventos y flujo de instalación.
- `03_Plan_Pruebas_Evidencias_PMP_Suite_v2.0.docx` — resultados vigentes 56/56 backend, 62/62 frontend, build/export y E2E; mantiene pendiente la validación física final.
- `04_Manual_Tecnico_Despliegue_PMP_Suite_v2.0.docx` — ejecución local, Expo SDK 57 y migraciones aditivas 003–006.

## Referencias funcionales complementarias

- `02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md`: casos, ingreso asistido, OS independientes y despacho por escaneo.
- `08_Pruebas/BRIDGE_CORRELACION_Y_HISTORIAL.md`: Bridge exclusivamente como correlación externa e historial.
- `08_Pruebas/NOMENCLATURA_LOGISTICA.md`: stock, asignación, En ruta y equipos en operación.
- `08_Pruebas/RECEPCION_INICIAL_SIN_OS.md` o informe equivalente: alta de maestro, recepción inicial conforme y habilitación de stock sin OS ficticias.

En caso de contradicción con versiones anteriores, prevalece esta línea base v2.0 y los informes técnicos más recientes.

## Contrato funcional consolidado

- La identidad del activo es **tipo + serie** y su historial reúne todas sus OS y eventos.
- Ingreso de requerimientos trabaja solo con activos existentes; Aranda es una referencia externa asistida dentro del alcance Capstone.
- `MV`, `MC`, `PDV` y `PDC` representan mantención/PoD; `IN` usa correlativo PMP independiente.
- Bridge mantiene **referencia externa ↔ OS PMP** y no ejecuta lógica operacional.
- Un activo nuevo se registra en Gestión de activos y se habilita mediante recepción física/conformidad inicial **sin crear OS**.
- La selección para instalación es **physical-first**: el escaneo identifica el equipo y la confirmación del despacho crea la IN y `SALIDA_BODEGA_TERRENO`.
- `Disponible para instalación`, `Asignado`, `En ruta` y `En operación` son conceptos distintos.

## Alcance académico

PMP Suite es autónomo. Durante el Capstone, Aranda u otras fuentes externas se registran de forma asistida. Una futura integración mediante API/Web Service/webhook/ETL queda como proyección productiva/comercial y no modifica el modelo central de trazabilidad.

Se mantiene Expo SDK 57. Docker, Dockerfile, docker-compose y diagramas Docker no forman parte de la entrega. La exportación móvil no sustituye la validación en un dispositivo físico.
