# Informe de Avance — Proyecto APT PMP Suite

**Versión:** V2.0

**Fase 2 · Desarrollo Proyecto APT**  
**Equipo:** Rafael Oteiza, Matías Garrido, Luis Arenas  
**Carrera:** Ingeniería en Informática

## Abstract — Español

PMP Suite es una plataforma integral para centralizar la gestión y trazabilidad del mantenimiento de validadores y consolas utilizados en transporte público. Durante la Fase 2 se consolidó el núcleo funcional Web, API, base de datos y aplicación móvil, incorporando control de identidad física, custodia por movimiento, roles diferenciados, trazabilidad por activo, operaciones de Bodega, Laboratorio y QA, administración de usuarios y análisis de reincidencia. La evolución del sistema obligó a ajustar reglas operacionales y documentación para separar claramente consulta, validación y confirmación física. El proyecto se encuentra en etapa avanzada de validación y cierre, con suites automatizadas aprobadas en su mayoría y brechas identificadas en validación nativa, rendimiento/seguridad y documentación final.

## Abstract — English

PMP Suite is an integrated platform designed to centralize maintenance management and traceability for validators and onboard consoles used in public transport operations. During Phase 2, the team consolidated the Web application, API, database and mobile application, including physical identity controls, movement-based custody, role-based access, asset traceability, warehouse, laboratory and QA workflows, user administration and recurrence analysis. System evolution required adjustments to operational rules and documentation in order to clearly separate consultation, validation and physical confirmation. The project is currently in an advanced validation and closing stage, with most automated suites approved and remaining gaps identified in native-device validation, performance/security testing and final documentation.

## 1. Resumen de avance

Durante la Fase 2 se desarrollaron y consolidaron las actividades principales definidas en el plan:

- revisión y actualización de requerimientos;
- separación entre maestro de activos, requerimientos, casos y OS;
- arquitectura Web/API/PostgreSQL/Firebase/Mobile;
- trazabilidad por tipo + serie;
- modelo Physical First para recepciones y despachos;
- operación de Terreno, Bodega, Laboratorio y QA;
- Bridge como capa de correlación externa;
- administración de usuarios y RBAC de siete roles;
- aplicación móvil para Técnico de Terreno;
- temas claro/oscuro y rediseño UX;
- historial técnico restringido por rol;
- analítica de reincidencia de solo lectura;
- suites automatizadas y E2E aislados;
- documentación técnica y académica actualizada.

La última línea documentada registra 118/118 pruebas Backend, 176/177 Web, 210/210 Mobile con mocks, build Web aprobado y verificaciones RBAC/E2E aisladas aprobadas.

## 2. Objetivos

El objetivo general definido en Fase 1 se mantiene:

> Desarrollar e integrar PMP Suite como una plataforma funcional que centralice y haga trazable el ciclo de mantenimiento de validadores y consolas del transporte público, apoyando la gestión operacional y la toma de decisiones.

Los objetivos específicos también se mantienen. El cambio principal ha sido precisar el alcance: el cierre académico prioriza un sistema funcional, demostrable y documentado; una implantación productiva real queda fuera de esta entrega.

## 3. Metodología y ajustes

Se mantuvo la secuencia de ingeniería definida en Fase 1: definición, diseño, construcción, verificación y cierre. La construcción se ejecutó incrementalmente dentro de esas fases para validar reglas complejas antes de consolidarlas.

Ajustes relevantes:

1. **Physical First:** lectura/validación y confirmación de custodia se separaron.
2. **RBAC:** Admin, Gerente y Jefe Laboratorio se separaron; Admin ya no hereda operaciones físicas.
3. **Bridge:** quedó limitado a correlación e historial.
4. **Laboratorio:** recepción, asignación y trabajo técnico se separaron por responsabilidad.
5. **QA:** adoptó flujo autónomo por etapas.
6. **Mobile:** se incorporaron perfil, seguridad, apariencia y retiro físico con cámara/contingencia.
7. **IA:** la vista identifica la heurística real utilizada y no presenta métricas ML no verificadas.
8. **Despliegue:** el entorno actual usa servicios nativos y dispone de instrucciones reproducibles para Web, API, PostgreSQL, Mobile y analítica.

## 4. Evidencias de avance

| Evidencia | Qué demuestra |
|---|---|
| Repositorio público `pmp-suite-capstone` | evolución del código, documentación y control de versiones |
| `01_Requerimientos/` | ERS v5 y requisitos por módulo |
| `02_Arquitectura/` | arquitectura, flujos, datos y despliegue |
| `08_Pruebas/` | pruebas, E2E, RBAC, UX y regresiones |
| Aplicación Web | operación por rol, dashboards, custodia y administración |
| Aplicación Mobile | jornada Terreno, órdenes, retiro, historial y cuenta |
| PostgreSQL + migraciones | integridad, relaciones y trazabilidad |
| Evidencias visuales | estados y flujos ejecutados en Web/Mobile |

Estas evidencias permiten demostrar competencias de gestión, arquitectura, datos, desarrollo, integración y pruebas.

## 5. Monitoreo del plan de trabajo

| Actividad | Responsable principal | Estado | Ajuste |
|---|---|---|---|
| Requerimientos y documentación | Matías / Rafael | Completado, mantenimiento continuo | ERS y RBAC actualizados |
| Arquitectura y modelo de datos | Rafael | Completado | Physical First, casos/OS/activo/Bridge separados |
| Backend, DB e integración | Rafael | Completado funcional | hardening y autorización por acción |
| Frontend Web y Mobile | Luis / Rafael | Completado funcional | rediseño, temas, cuenta, UX por rol |
| Integración y pruebas | Equipo | En curso | ampliar dispositivo físico, rendimiento y seguridad |
| Documentación y cierre | Equipo | En curso | limpieza Git, Fase 2, presentación y despliegue |

## 6. Factores facilitadores y dificultades

### Facilitadores

- conocimiento real del proceso de mantenimiento;
- arquitectura modular;
- base de datos centralizada;
- suites automatizadas;
- trabajo por roles dentro del equipo;
- control de versiones;
- pruebas aisladas que evitan dañar la base habitual.

### Dificultades

- crecimiento del alcance;
- reglas físicas más complejas de lo previsto;
- evolución de roles y permisos;
- coherencia entre Web, Mobile y API;
- actualización de documentación histórica;
- diferencias entre simulación y dispositivo físico;

Las dificultades se abordaron reduciendo ambigüedades, creando contratos explícitos de dominio y priorizando flujos críticos.

## 7. Actividades retrasadas o pendientes

- validación nativa final de cámara/QR/Safe Area;
- corregir el fixture Web pendiente;
- pruebas dedicadas de rendimiento y seguridad;
- completar evidencia manual hasta QA, retorno a Bodega y reinstalación;
- preparar cierre y presentación Fase 3.
