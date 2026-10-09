# PMP Suite — Arquitectura V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026

La arquitectura V2.0 documenta la solución desde contexto de negocio hasta detalle físico de datos, API, estados, flujos y despliegue.

## 1. Documento maestro

[Arquitectura_Integral_PMP_Suite_V2.0.md](Arquitectura_Integral_PMP_Suite_V2.0.md)

Incluye:

- C4/contexto;
- contenedores;
- capas Backend;
- seguridad/RBAC;
- Web;
- Mobile;
- identidad física;
- Physical First;
- estados/custodia;
- eventos;
- trazabilidad;
- stock;
- repuestos;
- QA;
- integración Firebase/Aranda/Python;
- despliegue;
- decisiones arquitectónicas.

## 2. Documentos especializados

1. [Contexto](Arquitectura_01_Contexto_V2.0.md)
2. [Backend](Arquitectura_02_Backend_V2.0.md)
3. [Frontend Web](Arquitectura_03_Frontend_Web_V2.0.md)
4. [Frontend Mobile](Arquitectura_04_Frontend_Mobile_V2.0.md)
5. [Despliegue](Arquitectura_05_Despliegue_V2.0.md)
6. [Flujos de Datos](Arquitectura_06_Flujos_Datos_V2.0.md)
7. [ERD](Arquitectura_07_Base_Datos_ERD_V2.0.md)
8. [Modelo/Diccionario Físico](MODELO_DATOS_DICCIONARIO_V2.0.md)
9. [Modelo de Estados, Custodia y Eventos](MODELO_ESTADOS_EVENTOS_V2.0.md)
10. [Catálogo API](CATALOGO_API_V2.0.md)
11. [Casos/Requerimientos/Despacho](CASOS_REQUERIMIENTOS_DESPACHO_V2.0.md)
12. [Proyección Ubuntu](DEPLOYMENT_UBUNTU_V2.0.md)

## 3. BPMN

- [AS-IS](../Documentacion%20Capstone/BPMN/BPMN_AS_IS_V2.0.md)
- [TO-BE](../Documentacion%20Capstone/BPMN/BPMN_TO_BE_V2.0.md)
- [Matriz BPMN → Sistema](../Documentacion%20Capstone/BPMN/MATRIZ_BPMN_SISTEMA_V2.0.md)
- archivos `.bpmn` para modelador.

## 4. Diagramas UML/PlantUML

`Documentacion Capstone/Artefactos Metodologia Cascada/Diagramas_PlantUML/`

Incluye:

- arquitectura lógica;
- componentes;
- comunicación;
- ERD;
- casos de uso;
- clases conceptuales;
- secuencia E2E;
- ejecución local.

## 5. Decisiones clave

| Decisión | Motivo |
|---|---|
| PostgreSQL como rol efectivo | no depender de claims obsoletos |
| autorización por acción | mínimo privilegio |
| scope por recurso | técnico solo carga propia |
| Physical First | alinear digital y físico |
| eventos append-only | auditoría/trazabilidad |
| stock inicial sin OS | no inventar mantenimiento |
| IN en despacho | representar hecho físico |
| Bridge correlación | evitar segundo motor |
| QA autónomo | responsabilidad real |
| Jefe Lab separado | segregación de funciones |

## 6. Fuente de verdad

Código + PostgreSQL/migraciones son la fuente física. La documentación explica el diseño y debe permanecer alineada con ellos.
