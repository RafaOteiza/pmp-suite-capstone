# PMP Suite — V2.0

PMP Suite es una plataforma de gestión operacional para centralizar y hacer trazable el ciclo de mantenimiento de validadores y consolas utilizados en transporte público.

**Versión documental del proyecto:** V2.0  
**Actualización:** 09-10-2026

## Estado

El núcleo funcional Web/API/PostgreSQL/Firebase/Mobile está implementado y en etapa de validación/cierre. La V2.0 consolida una única línea de documentación, elimina archivos obsoletos y mantiene únicamente código, pruebas, migraciones y entregables vigentes.

## Equipo

- Rafael Oteiza — liderazgo técnico, arquitectura, backend, datos e integración.
- Matías Garrido — requerimientos, documentación, trazabilidad y evidencias.
- Luis Arenas — frontend Web, UX/UI y Mobile.

## Arquitectura

```text
Web React/Vite ─┐
                ├─ API Node/Express ─ PostgreSQL
Mobile Expo ────┘         │
                          ├─ Firebase
                          └─ Analítica Python
```

## Reglas transversales

- activo = tipo + serie;
- 72 → CVB35 / Mikroelektronika;
- 74/75 → CVB45 / Mikroelektronika;
- Consola → N9715 / Waysion;
- Physical First: validar no equivale a mover;
- salida y recepción usan evidencia independiente;
- Admin administra/supervisa sin wildcard operacional;
- Gerente es de solo lectura;
- Jefe Laboratorio gestiona Laboratorio;
- Bridge solo correlaciona;
- la IN se crea al confirmar despacho físico a Terreno.

## Roles

`admin`, `gerente`, `jefe_laboratorio`, `logistica`, `qa`, `tecnico_laboratorio`, `tecnico_terreno`.

## Documentación V2.0

- [Requerimientos](01_Requerimientos/README.md)
- [Arquitectura](02_Arquitectura/README.md)
- [Backend](03_Backend/README.md)
- [Frontend Web](04_Frontend/README.md)
- [Base de Datos](05_BaseDatos/README.md)
- [Inteligencia Operacional](06_ModelosIA/README.md)
- [Mobile](07_Mobile/README.md)
- [Pruebas](08_Pruebas/README.md)
- [Brand Kit](09_BrandKit/README.md)
- [Documentación Capstone](Documentacion%20Capstone/README.md)

## Pruebas vigentes

- Backend: **118/118**
- Web: **176/177**
- Mobile con mocks: **210/210**
- Build Web: aprobado
- RBAC HTTP aislado: 99 solicitudes aprobadas
- E2E Laboratorio: aprobado
- E2E operacional integral: aprobado

Ver [Informe de Pruebas V2.0](08_Pruebas/INFORME_PRUEBAS_V2.0.md).

## Pendientes de cierre

- corregir el fixture Web restante;
- validar cámara/lector/Safe Area en dispositivo físico;
- completar recorrido manual QA → Bodega → reinstalación;
- repetir rendimiento/seguridad en entorno aislado;
- preparar presentación final.

## Nota documental

La carpeta `Documentacion Capstone/Fase 1/` se conserva intacta por decisión del equipo. El resto del repositorio utiliza la línea vigente V2.0 o nombres sin versión cuando corresponden a código y activos técnicos.
