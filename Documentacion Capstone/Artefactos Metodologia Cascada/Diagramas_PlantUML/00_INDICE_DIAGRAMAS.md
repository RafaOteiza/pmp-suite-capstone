# Diagramas oficiales de los artefactos Cascada - PMP Suite

Esta carpeta conserva fuentes históricas y diagramas de arquitectura general. La fuente normativa es el [índice de vigencia v2.0](../README_VIGENCIA_v2.0.md) y los cinco DOCX Capstone v2.0 actualizados manualmente. Los diagramas 05–08 describen Bridge operacional retirado: no son las fuentes vigentes de las figuras manualmente actualizadas de v2.0. Consultar también la [adenda funcional vigente](../../../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md).

## Cómo generar las imágenes

Estas instrucciones sirven únicamente para una exportación futura expresamente requerida. No regenerar ni sobrescribir los DOCX v2.0 ni sustituir sus figuras con fuentes históricas.

1. Abre el [editor web oficial de PlantUML](https://editor.plantuml.com/).
2. Abre uno de los archivos Markdown de esta carpeta.
3. Copia únicamente el contenido comprendido entre `@startuml` y `@enduml`.
4. Pégalo en el editor.
5. Exporta el resultado como SVG para incorporarlo en Word sin pérdida de calidad. Usa PNG solo cuando la plataforma de destino no admita SVG.

Todos los diagramas son autocontenidos: no utilizan `!include` ni recursos externos.

## Inventario y correspondencia documental

La correspondencia siguiente pertenece a la **edición anterior sin sufijo v2.0**. No afirma equivalencia con la numeración o contenido de las figuras vigentes. Las fuentes generales 02–04 y 09 siguen siendo compatibles en su alcance, pero debe comprobarse cualquier reutilización contra el DOCX v2.0.

| Archivo | Diagrama | Documento y sección |
|---|---|---|
| `01_Plan_Trabajo_Cascada.md` | Plan de trabajo de 18 semanas | Documento de Inicio, sección 8, Figura 1 |
| `02_Arquitectura_Logica.md` | Arquitectura lógica vigente | Documento de Diseño, sección 2, Figura 1 |
| `03_Componentes_Principales.md` | Componentes principales | Documento de Diseño, sección 3, Figura 2 |
| `04_Comunicacion_Entre_Servicios.md` | Comunicación y cadena de autorización | Documento de Diseño, secciones 4, 5.1 y 8 |
| `05_Modelo_Datos_ERD.md` | ERD histórico con Bridge operacional retirado | Documento de Diseño, sección 6, Figura 3 histórica |
| `06_UML_Casos_de_Uso.md` | Casos de uso históricos | SRS, sección 7, Figura 1; Diseño, sección 7.1, Figura 4 históricas |
| `07_UML_Clases_Conceptuales.md` | Clases históricas con responsabilidades Bridge retiradas | Documento de Diseño, sección 7.2, Figura 5 histórica |
| `08_UML_Secuencia_Flujo_Principal.md` | Flujo Bridge a mantenimiento retirado | Documento de Diseño, sección 7.3, Figura 6 histórica |
| `09_Ejecucion_Local.md` | Ejecución local de los componentes | Documento de Diseño, sección 10, Figura 7; Manual Técnico, sección 10 |

## Criterios de consistencia aplicados

- PostgreSQL es la autoridad efectiva del rol.
- Firebase autentica y verifica identidad, pero sus Custom Claims no autorizan por sí solos.
- La cadena protegida del backend es `firebaseAuth -> ensureUser -> enforceReadOnlyRole -> autorización específica -> handler`.
- Bridge vigente únicamente correlaciona referencias con OS existentes. Ingreso de requerimientos crea la OS operacional; el despacho por escaneo confirmado crea IN.
- Gestión de activos registra el maestro; Requerimientos opera solo sobre activos existentes vinculados al bus.
- La recepción inicial registra eventos por tipo + serie y escaneo en BODEGA, con conformidad explícita y sin OS ni bus ficticio. No exige mantenimiento ni QA de reparación.
- Stock inicial conforme y stock reparado aprobado comparten disponibilidad. Solo el despacho physical-first confirmado crea IN con correlativo PMP independiente y SALIDA_BODEGA_TERRENO.
- Disponible para instalación, Asignado, En ruta y Equipos en operación tienen significados distintos; un técnico seleccionado no prueba salida.
- El historial vigente se conserva en `pmp.flujo_eventos`; no se representa una tabla inexistente `os_eventos`.
- `bridge_mantenimiento` conserva relaciones históricas. El modelo vigente usa `bridge_referencias` para múltiples OS por referencia, junto con relaciones explícitas del caso operacional.
- El módulo IA es invocado bajo demanda mediante `analyzer.py --json` y consulta PostgreSQL en modo lectura.
- La vista de ejecución representa el entorno local utilizado y comprobado durante el Capstone.
- El esquema vigente incluye migraciones 003–006. Expo conserva SDK 57 y Docker no forma parte del alcance.

## Uso académico recomendado

- Preservar los diagramas históricos 05–08 y las versiones anteriores de los DOCX sin modificaciones.
- Utilizar los DOCX v2.0 como autoridad para contenido y figuras; no asumir que las fuentes anteriores permiten regenerarlos.
- Para futuras fuentes vigentes, partir del modelo y de la numeración de v2.0, con control documental separado de las fuentes históricas.
- Consultar las fuentes actuales del flujo y ERD en `02_Arquitectura/Arquitectura_06_Flujos_Datos.md` y `Arquitectura_07_Base_Datos_ERD.md`, sin sobrescribir los cinco DOCX protegidos.
