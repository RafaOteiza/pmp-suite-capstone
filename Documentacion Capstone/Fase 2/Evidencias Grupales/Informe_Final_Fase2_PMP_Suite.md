# Informe Final — Proyecto APT PMP Suite

**Estado:** borrador de cierre actualizado al 09-10-2026  
**Equipo:** Rafael Oteiza, Matías Garrido, Luis Arenas

## Abstract — Español

PMP Suite es una plataforma tecnológica orientada a centralizar la trazabilidad y gestión del ciclo de mantenimiento de validadores y consolas del transporte público. La solución integra aplicación Web, API REST, PostgreSQL, Firebase Authentication, aplicación móvil Expo y una capa de analítica operacional. El proyecto permite administrar activos, requerimientos, órdenes de servicio, retiros, recepciones, movimientos físicos, diagnóstico, reparación, QA, repuestos y reinstalación, aplicando control por roles y trazabilidad por tipo y serie. Durante el desarrollo se reforzaron la seguridad, la separación de responsabilidades y el modelo Physical First, evitando que una consulta o validación se interprete como cambio de custodia. El resultado es una solución funcional y demostrable en entorno académico, con pruebas automatizadas y E2E aisladas, además de brechas de cierre claramente identificadas.

## Abstract — English

PMP Suite is a technology platform designed to centralize traceability and maintenance-cycle management for validators and onboard consoles used in public transport. The solution integrates a Web application, REST API, PostgreSQL, Firebase Authentication, an Expo mobile application and an operational analytics layer. It manages assets, requirements, service orders, withdrawals, physical receipts and dispatches, diagnosis, repairs, QA, spare parts and reinstallation while enforcing role-based access and type-plus-serial traceability. During development, the team strengthened security, segregation of duties and the Physical First model so that consultation or validation cannot be interpreted as a custody change. The result is a functional and demonstrable academic solution supported by automated and isolated end-to-end tests, with the remaining closing gaps explicitly identified.

## 1. Relevancia del proyecto APT

El mantenimiento de equipos tecnológicos embarcados requiere coordinar Terreno, Bodega, Laboratorio, QA y supervisión. Cuando cada área utiliza registros separados, aparecen conciliaciones manuales, inconsistencias y pérdida de trazabilidad.

PMP Suite centraliza el historial de cada activo y diferencia claramente caso, OS, activo físico y referencia externa. Su valor para Ingeniería en Informática está en integrar procesos, datos, seguridad, arquitectura, software Web/Mobile y pruebas en una solución sistémica.

## 2. Objetivos

### Objetivo general

Desarrollar e integrar PMP Suite como una plataforma funcional que centralice y haga trazable el ciclo de mantenimiento de validadores y consolas del transporte público, apoyando la gestión operacional y la toma de decisiones.

### Objetivos específicos

1. Analizar y documentar problemática, actores, requisitos y reglas de negocio.
2. Diseñar arquitectura y modelo de datos relacional con integridad y trazabilidad.
3. Desarrollar e integrar usuarios, activos, OS, eventos, Terreno, Bodega, Laboratorio, QA y repuestos.
4. Validar mediante pruebas funcionales, roles, reglas de negocio e integración.
5. Documentar resultados, limitaciones y continuidad.

## 3. Metodología

Se aplicó una secuencia de ingeniería compatible con el enfoque tradicional solicitado para los artefactos académicos: definición, diseño, construcción, pruebas y cierre. Dentro de la construcción se utilizaron incrementos cortos para validar procesos complejos antes de consolidarlos.

Esta combinación fue pertinente porque el dominio exigía trazabilidad documental, pero también retroalimentación frecuente sobre reglas físicas y permisos.

## 4. Desarrollo

### 4.1 Arquitectura

- Frontend Web React/TypeScript/Vite.
- Backend Node/Express.
- PostgreSQL, esquema `pmp`.
- Firebase Authentication/Admin.
- Mobile Expo/React Native.
- Analítica Python.

### 4.2 Modelo operacional

El sistema implementa:

- identidad de activo tipo + serie;
- maestro de validadores y consolas;
- casos y OS PMP;
- referencias externas mediante Bridge;
- retiro e instalación Terreno;
- custodia Bodega;
- recepción, asignación y trabajo técnico Lab;
- QA autónomo por etapas;
- repuestos/stock;
- historial y trazabilidad.

### 4.3 Seguridad y roles

Roles oficiales:

`admin`, `gerente`, `jefe_laboratorio`, `logistica`, `qa`, `tecnico_laboratorio`, `tecnico_terreno`.

Firebase autentica; PostgreSQL define rol efectivo. Admin no tiene wildcard operacional y Gerencia es de solo lectura.

### 4.4 Aplicación Mobile

Terreno dispone de Mis órdenes, instalación, reporte de falla, retiro con cámara/contingencia, historial técnico, perfil, seguridad y tema automático/claro/oscuro.

### 4.5 Validación

Última línea documentada:

- Backend: 118/118.
- Web: 176/177.
- Mobile con mocks: 210/210.
- Build Web: aprobado.
- RBAC HTTP: 99 solicitudes aprobadas.
- E2E operacional y Laboratorio: aprobados en entorno aislado.

## 5. Dificultades, facilitadores y ajustes

### Dificultades

- el alcance inicial creció;
- las reglas de custodia exigieron mayor separación de estados/eventos;
- permisos históricos eran demasiado amplios;
- la documentación quedó desfasada respecto del código;
- Mobile requirió resolver red, Expo y comportamiento nativo;
- la evidencia académica y técnica necesitó normalización.

### Ajustes

- Physical First;
- Jefe Laboratorio como rol independiente;
- Admin sin permisos físicos implícitos;
- Gerente solo lectura;
- Bridge solo correlación;
- QA autónomo;
- historial Terreno restringido;
- UI Web/Mobile normalizada;
- documentación de IA corregida para no confundir heurística con probabilidad ML.

## 6. Evidencias y resultados

La evidencia está distribuida en:

- código y commits;
- ERS y arquitectura;
- migraciones/modelo;
- pruebas y reportes de `08_Pruebas/`;
- capturas Web/Mobile;
- recorridos manuales;
- bitácora de cierre;
- artefactos Cascada vigentes.

## 7. Innovación y aporte de valor

PMP Suite no se limita a digitalizar una planilla. Su aporte está en integrar identidad física, custodia, órdenes, historial, roles, Web/Mobile y analítica bajo un mismo modelo.

Elementos diferenciadores:

- Physical First;
- historial unificado por activo;
- separación caso/OS/referencia;
- RBAC por responsabilidad real;
- continuidad Web/Mobile;
- analítica de reincidencia como apoyo y no como automatismo.

## 8. Limitaciones y pendientes

- Validación nativa completa de cámara/lector.
- Un fixture Web pendiente.
- Rendimiento y seguridad dedicados aún por documentar.
- Docker solicitado por el instructivo aún no implementado.
- El despliegue Ubuntu/Nginx/PM2 es una proyección, no producción certificada.
- La analítica actual no debe presentarse como probabilidad calibrada de falla.

## 9. Intereses y proyección profesional

El proyecto permitió aplicar gestión, arquitectura, modelamiento de datos, backend, frontend, Mobile, seguridad y QA sobre un problema real. También confirmó la relevancia de roles profesionales vinculados a arquitectura de soluciones, liderazgo técnico, desarrollo Full Stack, ingeniería de datos y aseguramiento de calidad.

Las reflexiones individuales de cada integrante deben incorporarse en inglés en la versión entregable, conforme a la pauta oficial.

## 10. Conclusión grupal

PMP Suite demuestra la integración de competencias del perfil de egreso en una solución sistémica y trazable. El principal aprendizaje fue que la calidad no depende solo de que una pantalla funcione, sino de que identidad, permisos, datos, custodia, pruebas y documentación sean coherentes entre sí. El proyecto alcanzó un estado funcional avanzado; el cierre debe concentrarse en las brechas declaradas y no en incorporar módulos nuevos.
