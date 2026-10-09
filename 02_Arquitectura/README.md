# PMP Suite — Arquitectura

**Estado:** vigente — 09-10-2026

Esta carpeta describe la arquitectura real del sistema. Los diagramas y textos se subordinan al código vigente y a las evidencias de `08_Pruebas/`.

## Mapa documental

1. [Contexto](Arquitectura_01_Contexto.md)
2. [Backend](Arquitectura_02_Backend.md)
3. [Frontend Web](Arquitectura_03_Frontend_Web.md)
4. [Frontend Mobile](Arquitectura_04_Frontend_Mobile.md)
5. [Despliegue](Arquitectura_05_Despliegue.md)
6. [Flujos de datos](Arquitectura_06_Flujos_Datos.md)
7. [Base de datos / ERD](Arquitectura_07_Base_Datos_ERD.md)
8. [Casos, requerimientos y despacho](CASOS_REQUERIMIENTOS_DESPACHO.md)
9. [Proyección Ubuntu](DEPLOYMENT_UBUNTU.md)

## Decisiones vigentes

- Arquitectura Web + API Node/Express + PostgreSQL + Firebase + Python + Expo.
- PostgreSQL es autoridad de rol/estado activo; Firebase autentica.
- Autorización sensible centralizada, sin wildcard Admin.
- Custodia Physical First y evidencia por movimiento/ciclo.
- Bridge es correlador, no motor operacional.
- Identidad de activo: tipo + serie.
- Regla modelo/marca compartida en `shared/assetIdentity.js`.
- Estado derivado de hechos/eventos; no confiar solo en representación visual.
- Escrituras críticas transaccionales e idempotencia controlada.
