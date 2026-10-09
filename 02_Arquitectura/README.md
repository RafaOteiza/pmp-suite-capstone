# PMP Suite — Arquitectura V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026

## Documento maestro

[Arquitectura_Integral_PMP_Suite_V2.0.md](Arquitectura_Integral_PMP_Suite_V2.0.md)

Describe C4, contenedores, capas, seguridad, Web, Mobile, Physical First, eventos, stock, QA, trazabilidad, despliegue e integraciones.

## Documentos especializados

1. [Contexto](Arquitectura_01_Contexto_V2.0.md)
2. [Backend](Arquitectura_02_Backend_V2.0.md)
3. [Frontend Web](Arquitectura_03_Frontend_Web_V2.0.md)
4. [Mobile](Arquitectura_04_Frontend_Mobile_V2.0.md)
5. [Despliegue](Arquitectura_05_Despliegue_V2.0.md)
6. [Flujos](Arquitectura_06_Flujos_Datos_V2.0.md)
7. [ERD](Arquitectura_07_Base_Datos_ERD_V2.0.md)
8. [Diccionario físico](MODELO_DATOS_DICCIONARIO_V2.0.md)
9. [Catálogo API](CATALOGO_API_V2.0.md)
10. [Casos/requerimientos/despacho](CASOS_REQUERIMIENTOS_DESPACHO_V2.0.md)
11. [Ubuntu](DEPLOYMENT_UBUNTU_V2.0.md)

## BPMN

- `Documentacion Capstone/BPMN/BPMN_AS_IS_V2.0.md`
- `Documentacion Capstone/BPMN/BPMN_AS_IS_V2.0.bpmn`
- `Documentacion Capstone/BPMN/BPMN_TO_BE_V2.0.md`
- `Documentacion Capstone/BPMN/BPMN_TO_BE_V2.0.bpmn`

## Decisiones clave

- PostgreSQL = rol efectivo.
- autorización por acción/recurso.
- custodia Physical First.
- eventos append-only.
- stock inicial sin OS.
- IN en despacho.
- Bridge solo correlación.
- segregación Jefe Lab/Técnico/QA/Logística.
