# Documentación de Arquitectura del Sistema PMP Suite

Este directorio contiene la documentación arquitectónica detallada del sistema PMP Suite, organizada por vistas clave.

La [adenda de casos, Ingreso de requerimientos y despacho por escaneo](CASOS_REQUERIMIENTOS_DESPACHO.md) define la evolución operacional vigente: caso, OS, activo y referencia externa separados, Bridge exclusivamente de correlación y alcance Capstone asistido frente a integración productiva futura.

## Vistas Arquitectónicas

### Consolidación de seguridad, identidad y UX (08-10-2026)

- `shared/assetIdentity.js` define modelo/marca; backend valida el alta y web/Mobile comparten la regla. Validadores 72 → CVB35, 74/75 → CVB45, marca Mikroelektronika; consola → N9715 / Waysion. Prefijos desconocidos bloquean alta; consultas no corrigen el maestro ni snapshots.
- `labCustody.js` separa validación y confirmación por propósito/ciclo/revisión. `labArrival.js` usa recepción confirmada como ingreso/SLA. Salir de un área no confirma llegada a otra.
- Firebase identifica; PostgreSQL decide usuario activo y rol. Una vinculación UID/correo contradictoria o ambigua bloquea acceso y requiere revisión administrativa. No se repara durante login.
- `shared/sessionToken.js` coordina token vigente y refresh del SDK. Web/Mobile conservan borradores ante red/servidor; no repiten automáticamente escrituras al renovar.
- Operaciones en páginas/paneles inline, sin nuevos modales. `PageHeader`, `StatCard`, `StatusBadge`, `FeedbackBanner`, `EmptyState`, tablas y tokens PMP siguen siendo la base visual; selección relacional completa datos conocidos.
- Rutas antiguas de asignación/despacho incompatibles están retiradas; la estación genérica solo consulta. Nueva IN conserva ambos contextos y exige evidencia propia de salida.

Detalle de entradas, permisos, pruebas, límites y decisiones pendientes en el
[informe de consolidación](../08_Pruebas/Consolidacion_Seguridad_Identidad_UX_2026-10-08.md).
Los artefactos Capstone v2.0 y las evidencias históricas no se regeneran.

1.  **[Visión General del Sistema (Contexto)](Arquitectura_01_Contexto.md)**
    *   Define los actores externos e internos y la interacción de alto nivel.
2.  **[Arquitectura de Componentes del Backend](Arquitectura_02_Backend.md)**
    *   Detalle de la estructura interna del servicio REST API del Backend.
3.  **[Arquitectura de Componentes del Frontend Web](Arquitectura_03_Frontend_Web.md)**
    *   Detalle de la estructura interna de la aplicación web React.
4.  **[Arquitectura de Componentes del Frontend Móvil](Arquitectura_04_Frontend_Mobile.md)**
    *   Detalle de la estructura interna de la aplicación móvil React Native.
5.  **[Diagrama de Despliegue](Arquitectura_05_Despliegue.md)**
    *   Representa cómo los componentes del sistema se distribuyen en entornos de ejecución.
6.  **[Flujos de Datos Clave](Arquitectura_06_Flujos_Datos.md)**
    *   Detalle de los flujos de información críticos, como el ciclo de vida de una OS o el proceso de autenticación.
7.  **[Diseño de Base de Datos (ERD)](Arquitectura_07_Base_Datos_ERD.md)**
    *   Diagrama Entidad-Relación que muestra las tablas y sus relaciones.

---
