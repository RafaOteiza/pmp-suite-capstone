# Informe de Avance — Proyecto APT PMP Suite V2.0

**Fase 2 · Desarrollo Proyecto APT**  
**Equipo:** Rafael Oteiza · Matías Garrido · Luis Arenas  
**Carrera:** Ingeniería en Informática  
**Actualización:** 09-10-2026

## Abstract — Español

PMP Suite es una plataforma integral orientada a centralizar la gestión y trazabilidad del mantenimiento de validadores y consolas utilizados en transporte público. Durante la Fase 2 se consolidó el núcleo Web, API, PostgreSQL, Firebase y Mobile, incorporando identidad física, custodia Physical First, RBAC, gestión de activos, requerimientos, órdenes de servicio, Bodega, Laboratorio, QA, repuestos, trazabilidad y una capa de analítica de reincidencia. El avance obligó a revisar decisiones iniciales para separar explícitamente consulta, validación y movimiento físico, así como administración, custodia y trabajo técnico. La solución se encuentra funcionalmente avanzada y cuenta con pruebas automatizadas, E2E aisladas y documentación V2.0 en proceso de cierre.

## Abstract — English

PMP Suite is an integrated platform designed to centralize maintenance management and traceability for validators and onboard consoles used in public transport operations. During Phase 2, the team consolidated the Web application, REST API, PostgreSQL, Firebase and Mobile components, adding physical identity controls, Physical First custody, RBAC, asset management, requirements, service orders, warehouse operations, laboratory work, QA, spare parts, traceability and recurrence analytics. The implementation required several design refinements to separate consultation, validation and physical movement, as well as administration, custody and technical execution. The solution is currently functionally advanced and supported by automated tests, isolated end-to-end verification and a V2.0 documentation baseline.

# 1. Resumen de avance

La Fase 2 permitió pasar desde una propuesta funcional a una plataforma integrada con reglas de negocio explícitas.

Principales avances:

- ERS V2.0 consolidada;
- problemática AS-IS documentada;
- BPMN AS-IS y TO-BE;
- arquitectura integral;
- modelo físico de datos/diccionario;
- RBAC de siete roles;
- administración de usuarios;
- gestión de activos;
- recepción inicial sin OS;
- casos/requerimientos;
- nomenclatura MV/MC/PDV/PDC/IN;
- retiro e instalación Terreno;
- Bodega Physical First;
- Laboratorio con Jefatura independiente;
- trabajo técnico con diagnóstico/intervenciones/pruebas;
- repuestos administrados exclusivamente por Logística;
- QA autónomo por etapas;
- trazabilidad por tipo+serie;
- Bridge como correlación;
- dashboards;
- Mobile;
- analítica de reincidencia;
- pruebas automatizadas/E2E;
- documentación técnica V2.0.

# 2. Problemática abordada

El proceso previo utiliza información distribuida entre Bodega/Mersan, Laboratorio, QA, analistas, controles PoD, correos, guías y registros internos.

En Laboratorio se observan situaciones como:

- llegada con o sin guía en situaciones urgentes;
- tarjetón faltante o con información inconsistente;
- series enviadas por correo;
- conciliación manual;
- seguimiento mediante reporte interno;
- reparación y pruebas;
- PoD documentado en informe/planilla separada;
- despachos en lotes y fechas diferentes.

Esta fragmentación dificulta reconstruir el estado real de un equipo y su historial.

El detalle se formalizó en:

`Documentacion Capstone/00_PROBLEMATICA_Y_CONTEXTO_V2.0.md`.

# 3. Procesos AS-IS y TO-BE

## AS-IS

Representa el proceso previo basado en registros separados, conciliación manual y coordinación entre áreas.

## TO-BE

El flujo PMP Suite incorpora:

```text
Terreno
→ Bodega
→ Laboratorio
→ Bodega
→ QA
→ Bodega
→ Terreno
```

Cada cambio de custodia requiere evidencia física vigente y confirmación independiente.

Documentos:

- `Documentacion Capstone/BPMN/BPMN_AS_IS_V2.0.md`
- `Documentacion Capstone/BPMN/BPMN_TO_BE_V2.0.md`

# 4. Requerimientos

La ERS V2.0 cubre:

- autenticación;
- usuarios;
- maestros;
- activos;
- casos;
- OS;
- Terreno;
- Bodega;
- Laboratorio;
- repuestos;
- QA;
- inventario/instalación;
- Bridge;
- trazabilidad;
- dashboards;
- IA;
- Web/Mobile;
- seguridad/integridad/rendimiento/UX.

Se formalizaron más de cien requisitos funcionales agrupados por dominio y RNF de seguridad, integridad, rendimiento, disponibilidad, usabilidad, mantenibilidad y compatibilidad.

Fuente:

`01_Requerimientos/ERS_PMP_Suite_V2.0.md`.

# 5. Arquitectura desarrollada

## Contenedores

```text
React/Vite ─┐
            ├─ Node/Express ─ PostgreSQL
Expo ───────┘       │
                    ├─ Firebase
                    └─ Python
```

## Principios

- PostgreSQL define rol efectivo;
- Firebase autentica;
- autorización por acción/recurso;
- Physical First;
- eventos append-only;
- transacciones;
- historial por activo;
- stock inicial y reparado con origen explícito.

Fuente:

`02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md`.

# 6. Modelo de datos

El esquema `pmp` contiene tablas de:

- usuarios;
- activos;
- maestros;
- casos;
- órdenes;
- eventos;
- escaneos;
- historial de OS;
- reparaciones;
- solicitudes/repuestos;
- QA;
- guías;
- Bridge/referencias.

La documentación actual incorpora tablas, campos, relaciones, restricciones, secuencias, vistas y triggers.

Fuente:

`02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md`.

# 7. Seguridad y RBAC

Roles oficiales:

- admin;
- gerente;
- jefe_laboratorio;
- logistica;
- qa;
- tecnico_laboratorio;
- tecnico_terreno.

Cambios relevantes:

- Admin dejó de tener permisos físicos automáticos.
- Gerente es solo lectura.
- Jefe Lab controla recepción/asignación/salida Lab.
- QA es autónomo.
- técnicos trabajan recursos propios/asignados.

El backend es la autoridad final.

# 8. Desarrollo por dominio

## Terreno

- Mis órdenes.
- Falla.
- Retiro físico.
- PoD/evidencia.
- Instalación.
- Historial técnico.

## Bodega

- Recepciones.
- Despachos.
- Inventario.
- Repuestos.
- Stock.
- Nueva instalación.

## Laboratorio

- En camino.
- Recibidos.
- Incidencias.
- Historial.
- Asignación.
- Mi carga.
- diagnóstico;
- reparación;
- pruebas Manual/Test MK;
- solicitud PoD;
- cierre técnico;
- salida.

## QA

- Recepción.
- Ambiente.
- Pruebas.
- Dictamen.
- Salida.

# 9. Evidencias de avance

| Evidencia | Estado |
|---|---|
| ERS V2.0 | desarrollada |
| Arquitectura Integral | desarrollada |
| Diccionario DB | desarrollado |
| BPMN AS-IS/TO-BE | desarrollado |
| Catálogo API | desarrollado |
| Casos de uso | desarrollados |
| Reportes/KPI | desarrollados |
| Matriz de trazabilidad | desarrollada |
| Backend | funcional |
| Web | funcional |
| Mobile | funcional, hardware pendiente |
| E2E | aprobados según informe |
| recorrido manual | parcial, hasta salida Lab→Bodega |

# 10. Monitoreo del plan

| Actividad | Responsable | Estado |
|---|---|---|
| Requerimientos | Matías/Rafael | Completado + mantenimiento |
| Arquitectura | Rafael | Completado |
| Base de datos | Rafael | Completado funcional |
| Backend | Rafael | Completado funcional |
| Frontend Web | Luis/Rafael | Completado funcional |
| Mobile | Luis/Rafael | Completado funcional |
| Pruebas | Equipo | En curso de cierre |
| Documentación | Matías/Rafael | En curso de cierre |
| Presentación | Equipo | Pendiente |

# 11. Factores facilitadores

- conocimiento del proceso real;
- trabajo por roles;
- arquitectura modular;
- PostgreSQL central;
- suites automáticas;
- pruebas aisladas;
- control de versiones;
- retroalimentación continua sobre UX/reglas.

# 12. Dificultades

- crecimiento del alcance;
- complejidad de custodia;
- documentación desfasada durante evolución;
- permisos históricos demasiado amplios;
- QA y Laboratorio con responsabilidades inicialmente mezcladas;
- diferencias entre validación simulada y hardware real;
- necesidad de consolidar una única línea documental.

# 13. Ajustes realizados

- Physical First.
- Jefe Laboratorio.
- Admin sin wildcard.
- QA autónomo.
- Bridge solo correlación.
- IN al despacho físico.
- stock inicial sin OS.
- técnicos sin acceso indebido a stock.
- historial técnico restringido.
- documentación V2.0 completa.

# 14. Pruebas

Última línea documentada:

- Backend 118/118.
- Web 176/177.
- Mobile 210/210 mocks.
- Build Web aprobado.
- RBAC HTTP 99 requests.
- E2E Lab aprobado.
- E2E integral aprobado.
- responsive 150 renders.

# 15. Pendientes de avance

- corregir fixture Web;
- validar Mobile en dispositivo físico;
- completar QA→Bodega→reinstalación manual;
- repetir seguridad/rendimiento aislados;
- preparar Fase 3.

# 16. Conclusión de avance

PMP Suite ya no corresponde a un prototipo aislado. Es una solución integrada con reglas de negocio explícitas, seguridad por rol, modelo relacional, trazabilidad y múltiples canales de uso.

El foco restante es validación, evidencia y cierre documental, no ampliar el sistema con nuevos módulos.
