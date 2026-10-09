# Mapa Documental — PMP Suite V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026

## 1. Propósito

Definir qué documento responde cada pregunta del proyecto y evitar duplicidad o contradicción.

## 2. Fuente de verdad por tema

| Pregunta | Documento principal |
|---|---|
| ¿Qué problema resuelve? | `Documentacion Capstone/00_PROBLEMATICA_Y_CONTEXTO_V2.0.md` |
| ¿Qué debe hacer el sistema? | `01_Requerimientos/ERS_PMP_Suite_V2.0.md` |
| ¿Cómo se relacionan requisitos y pruebas? | `08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md` |
| ¿Cómo está diseñado? | `02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md` |
| ¿Qué endpoints existen? | `02_Arquitectura/CATALOGO_API_V2.0.md` |
| ¿Cómo está modelada la BD? | `02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md` |
| ¿Cómo funcionan estados/custodia? | `02_Arquitectura/MODELO_ESTADOS_EVENTOS_V2.0.md` |
| ¿Cómo era el proceso? | `Documentacion Capstone/BPMN/BPMN_AS_IS_V2.0.md` |
| ¿Cómo queda con PMP? | `Documentacion Capstone/BPMN/BPMN_TO_BE_V2.0.md` |
| ¿Qué paso BPMN corresponde a qué sistema? | `Documentacion Capstone/BPMN/MATRIZ_BPMN_SISTEMA_V2.0.md` |
| ¿Qué casos de uso existen? | `Documentacion Capstone/06_CASOS_DE_USO_Y_ESCENARIOS_V2.0.md` |
| ¿Qué KPI/reportes existen? | `Documentacion Capstone/07_REPORTES_KPI_V2.0.md` |
| ¿Cómo se valida? | `08_Pruebas/INFORME_PRUEBAS_V2.0.md` + Plan de Pruebas |
| ¿Cómo se ejecuta? | `Documentacion Capstone/Artefactos Metodologia Cascada/04_Manual_Tecnico_Despliegue_PMP_Suite_V2.0.md` |
| ¿Qué se entrega académicamente? | `Documentacion Capstone/Fase 2/` |

## 3. Documentos maestros

### Requerimientos

- ERS completa V2.0.
- Documentos modulares de Administración, Auth/Users, Bodega, Lab, QA, OS e IA.

### Arquitectura

- Arquitectura Integral.
- Contexto.
- Backend.
- Frontend Web.
- Frontend Mobile.
- Despliegue.
- Flujos de datos.
- ERD.
- Diccionario físico.
- Estados/eventos.
- Catálogo API.
- Casos/requerimientos/despacho.

### Proceso

- problemática;
- BPMN AS-IS;
- BPMN TO-BE;
- matriz BPMN→Sistema;
- casos de uso;
- reportes/KPI.

### Calidad

- Informe de Pruebas;
- RBAC/Seguridad;
- Flujos Operacionales;
- UX/Experiencia;
- Matriz de Trazabilidad.

### Cascada

- Documento de Inicio;
- SRS simplificado;
- Documento de Diseño;
- Plan de Pruebas;
- Manual Técnico.

## 4. Regla de precedencia

Cuando exista una contradicción:

1. código y migraciones vigentes;
2. ERS V2.0;
3. arquitectura/diccionario V2.0;
4. documentación de proceso;
5. artefactos académicos derivados.

Una evidencia de una fecha anterior demuestra lo ejecutado en esa fecha, pero no reemplaza el contrato actual.

## 5. Regla de mantenimiento

Un cambio de negocio debe revisar como mínimo:

- ERS;
- matriz de trazabilidad;
- arquitectura;
- modelo de datos si aplica;
- BPMN si cambia proceso;
- API si cambia contrato;
- pruebas;
- informe académico si afecta el alcance.

## 6. Fase 1

`Documentacion Capstone/Fase 1/` permanece intacta por decisión del equipo y se trata como evidencia académica cerrada.
