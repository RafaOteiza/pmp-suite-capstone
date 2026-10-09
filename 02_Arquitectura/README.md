# PMP Suite — Arquitectura

**Versión documental:** V2.0  
**Actualización:** 09-10-2026

Esta carpeta contiene la única línea arquitectónica vigente del proyecto.

## Documentos V2.0

1. [Contexto](Arquitectura_01_Contexto_V2.0.md)
2. [Backend](Arquitectura_02_Backend_V2.0.md)
3. [Frontend Web](Arquitectura_03_Frontend_Web_V2.0.md)
4. [Frontend Mobile](Arquitectura_04_Frontend_Mobile_V2.0.md)
5. [Despliegue](Arquitectura_05_Despliegue_V2.0.md)
6. [Flujos de datos](Arquitectura_06_Flujos_Datos_V2.0.md)
7. [Base de datos / ERD](Arquitectura_07_Base_Datos_ERD_V2.0.md)
8. [Casos, requerimientos y despacho](CASOS_REQUERIMIENTOS_DESPACHO_V2.0.md)
9. [Proyección Ubuntu](DEPLOYMENT_UBUNTU_V2.0.md)

## Decisiones vigentes

- Web React/Vite + API Node/Express + PostgreSQL + Firebase + Python + Expo.
- PostgreSQL define rol/estado efectivo; Firebase autentica.
- Autorización por acción, sin wildcard Admin.
- Custodia Physical First por movimiento/ciclo.
- Bridge solo correlaciona.
- Activo = tipo + serie.
- Regla modelo/marca compartida en `shared/assetIdentity.js`.
- Escrituras críticas transaccionales e idempotentes.
- Pruebas destructivas únicamente en PostgreSQL efímero/desechable.
