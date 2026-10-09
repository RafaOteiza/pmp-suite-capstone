# Informe Final — Proyecto APT PMP Suite V2.0

**Versión:** V2.0  
**Estado:** borrador final técnico-académico  
**Equipo:** Rafael Oteiza · Matías Garrido · Luis Arenas  
**Actualización:** 09-10-2026

## Abstract — Español

PMP Suite es una plataforma integral de gestión y trazabilidad orientada al mantenimiento de validadores y consolas utilizados en transporte público. La solución integra una aplicación Web, API REST, PostgreSQL, Firebase Authentication, aplicación Mobile Expo y analítica operacional. El sistema administra activos, casos, órdenes de servicio, fallas, retiros, recepciones, despachos, Laboratorio, QA, repuestos, stock, instalación y trazabilidad por activo. La arquitectura adopta un modelo Physical First para mantener coherencia entre el registro y la custodia real, junto con RBAC de siete roles y eventos históricos append-only. El proyecto alcanzó una versión funcional avanzada y demostrable en un entorno académico, respaldada por pruebas automatizadas, E2E y documentación técnica V2.0.

## Abstract — English

PMP Suite is an integrated maintenance management and traceability platform for validators and onboard consoles used in public transport operations. The solution combines a Web application, REST API, PostgreSQL, Firebase Authentication, an Expo Mobile application and operational analytics. The system manages assets, cases, service orders, failures, withdrawals, physical receipts and dispatches, laboratory work, QA, spare parts, stock, installation and asset-level traceability. Its architecture adopts a Physical First model to keep system records aligned with actual custody, together with seven-role RBAC and append-only historical events. The project reached an advanced, functional and demonstrable academic version supported by automated tests, isolated end-to-end verification and V2.0 technical documentation.

# 1. Relevancia del proyecto

## 1.1 Situación inicial

El proceso de mantenimiento involucra múltiples áreas y registros.

En el AS-IS:

- Bodega/Mersan prepara y envía equipos;
- Laboratorio recibe guía/tarjetón/series por distintos canales;
- pueden existir ingresos urgentes sin guía;
- información puede estar incompleta;
- el Laboratorio mantiene control interno;
- técnicos diagnostican/reparan;
- PoD se controla adicionalmente;
- QA mantiene su propio registro;
- analistas consultan estado por correo/reportes;
- las áreas concilian manualmente.

## 1.2 Problema

No existía una única fuente para responder:

- ubicación;
- custodia;
- OS/caso;
- diagnóstico;
- reparación;
- QA;
- repuestos;
- disponibilidad;
- historial.

## 1.3 Valor

PMP Suite centraliza estos datos y agrega controles que evitan inconsistencias.

# 2. Objetivos

## General

Desarrollar e integrar PMP Suite como plataforma funcional que centralice y haga trazable el ciclo de mantenimiento de validadores y consolas.

## Específicos

1. formalizar problemática/requisitos;
2. diseñar arquitectura;
3. construir modelo de datos;
4. implementar módulos;
5. aplicar seguridad;
6. validar procesos;
7. documentar resultados.

# 3. Metodología

Se utilizó una secuencia de ingeniería compatible con Cascada:

1. definición;
2. requisitos;
3. diseño;
4. construcción;
5. integración;
6. pruebas;
7. cierre.

La implementación interna fue incremental para reducir riesgo técnico.

# 4. AS-IS / TO-BE

## AS-IS

Información distribuida y conciliación manual.

## TO-BE

```text
Operación
→ Falla
→ Retiro
→ Bodega
→ Laboratorio
→ Bodega
→ QA
→ Bodega
→ Instalación
→ Operación
```

Los diagramas BPMN están disponibles en `Documentacion Capstone/BPMN/`.

# 5. Requisitos

La ERS V2.0 contiene el contrato vigente por dominio:

- Auth.
- Usuarios.
- Activos.
- Requerimientos.
- OS.
- Terreno.
- Bodega.
- Laboratorio.
- Repuestos.
- QA.
- Inventario.
- Bridge.
- Trazabilidad.
- Dashboards.
- IA.
- Web/Mobile.
- RNF.

La matriz de trazabilidad conecta requisito→implementación→prueba.

# 6. Arquitectura

## 6.1 Contenedores

| Contenedor | Tecnología |
|---|---|
| Web | React/Vite |
| Mobile | Expo/React Native |
| API | Node/Express |
| DB | PostgreSQL |
| Auth | Firebase |
| IA | Python |

## 6.2 Seguridad

```text
Firebase
→ usuario PostgreSQL
→ rol efectivo
→ autorización por acción
→ scope por recurso
→ servicio
→ transacción
```

## 6.3 Physical First

Validar evidencia no equivale a confirmar movimiento.

Cada entrada/salida tiene evidencia independiente.

# 7. Modelo de datos

El esquema `pmp` contiene 26 tablas clasificadas entre maestros/configuración y operación/historia.

Entidades principales:

- usuarios;
- validadores;
- consolas;
- casos_operacionales;
- ordenes_servicio;
- flujo_eventos;
- escaneos_equipos;
- os_historial_activo;
- registro_reparaciones;
- repuestos;
- solicitudes;
- bridge_referencias;
- QA;
- guías.

Se utilizan:

- FKs;
- checks;
- índices;
- secuencias;
- triggers;
- vistas;
- locks;
- transacciones.

Fuente: `02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md`.

# 8. Nomenclatura OS

- MV: mantenimiento validador.
- MC: mantenimiento consola.
- PDV: PoD validador.
- PDC: PoD consola.
- IN: instalación.

La IN es independiente y se crea al despacho.

# 9. Gestión de activos

## Alta

Registra maestro + ALTA_ACTIVO.

## Recepción inicial

Genera:

- RECEPCION_INICIAL;
- HABILITADO_INSTALACION.

No genera mantenimiento.

# 10. Terreno

Mobile/Web permiten:

- reporte de falla;
- retiro;
- discrepancia;
- PoD;
- instalación;
- historial técnico.

# 11. Bodega

Gestiona:

- recepciones;
- despachos;
- inventario;
- stock;
- repuestos;
- retiros;
- instalación.

# 12. Laboratorio

## Jefe Laboratorio

- recepción;
- asignación;
- supervisión;
- SLA;
- salida.

## Técnico

- diagnóstico;
- reparación;
- Manual/Test MK;
- PoD;
- solicitud descriptiva de repuesto;
- cierre técnico.

# 13. Repuestos

El técnico no administra inventario.

Logística:

- selecciona repuesto;
- define cantidad;
- valida stock;
- entrega;
- descuenta en transacción.

# 14. QA

Etapas:

1. recepción;
2. Ambiente;
3. pruebas;
4. dictamen;
5. salida.

OPERATIVO/RECHAZADO no implica despacho.

# 15. Trazabilidad

Por tipo+serie se combinan:

- OS;
- eventos;
- evidencia;
- reparación;
- QA;
- referencias;
- instalaciones.

Terreno recibe una proyección técnica reducida.

# 16. Bridge

Bridge V2.0 es correlación.

No:

- crea mantenimiento;
- asigna técnico;
- cambia custodia;
- mueve stock.

# 17. Dashboards

## Ejecutivo

Parque, OS, distribución y tendencias.

## Bodega

Stock, custodia, pendientes y repuestos.

## Laboratorio

SLA, carga, estados e incidencias.

## QA

Etapas y dictámenes.

# 18. IA

`analyzer.py` calcula una heurística:

```text
fallas_previas * 0.3 + es_emv * 0.5
```

No es una probabilidad calibrada.

# 19. Pruebas

| Verificación | Resultado |
|---|---:|
| Backend | 118/118 |
| Web | 176/177 |
| Mobile mocks | 210/210 |
| Build Web | aprobado |
| RBAC HTTP | 99 |
| E2E Lab | aprobado |
| E2E integral | aprobado |
| responsive | 150 |

# 20. Evidencias

- código;
- commits;
- ERS;
- arquitectura;
- DB;
- BPMN;
- API;
- casos;
- reportes;
- matriz de trazabilidad;
- pruebas;
- capturas;
- recorrido manual.

# 21. Innovación

El valor diferencial no es solo digitalizar registros.

PMP Suite integra:

- identidad física;
- custodia;
- trazabilidad;
- roles;
- Web/Mobile;
- stock;
- QA;
- analítica.

El principio Physical First reduce la brecha entre estado digital y realidad física.

# 22. Dificultades y ajustes

### Dificultades

- alcance;
- custodia;
- roles;
- documentación;
- Mobile/hardware;
- coherencia entre módulos.

### Ajustes

- Jefe Lab;
- Admin sin wildcard;
- QA autónomo;
- Bridge correlación;
- IN al despacho;
- stock inicial sin OS;
- historial técnico restringido;
- documentación V2.0.

# 23. Limitaciones

- hardware Mobile aún requiere validación completa;
- un fixture Web pendiente;
- rendimiento/seguridad de cierre pendientes;
- no existe integración automática Aranda;
- Ubuntu es proyección, no producción certificada.

# 24. Proyección

El proyecto puede evolucionar hacia:

- integración empresarial;
- analítica con datasets evaluados;
- automatización de reportes;
- monitoreo/observabilidad;
- despliegue productivo.

# 25. Conclusión

PMP Suite cumple el objetivo de integrar múltiples competencias de Ingeniería en Informática en una solución sistémica.

El resultado demuestra que una plataforma operacional robusta requiere coherencia entre:

- procesos;
- datos;
- roles;
- evidencia;
- arquitectura;
- pruebas;
- documentación.

El cierre del Capstone debe priorizar la validación final y la demostración de estos elementos, no aumentar el alcance.
