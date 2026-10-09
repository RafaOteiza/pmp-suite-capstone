# 00 — Documento de Inicio de Proyecto PMP Suite V2.0

## 1. Identificación

**Proyecto:** PMP Suite  
**Versión:** V2.0  
**Equipo:** Rafael Oteiza, Matías Garrido, Luis Arenas  
**Carrera:** Ingeniería en Informática  
**Metodología académica:** enfoque tradicional/Cascada con construcción incremental dentro de las fases.

## 2. Problema

El mantenimiento de validadores y consolas exige coordinar Terreno, Bodega, Laboratorio, QA y supervisión. En el proceso previo, la información puede quedar distribuida entre planillas, correos, guías, tarjetones, controles PoD y registros propios de cada área.

Esta fragmentación dificulta responder preguntas simples pero críticas:

- ¿dónde está físicamente el equipo?;
- ¿quién tiene su custodia?;
- ¿qué falla originó el caso?;
- ¿qué técnico lo reparó?;
- ¿qué pruebas fueron realizadas?;
- ¿qué repuesto fue entregado?;
- ¿QA lo aprobó o rechazó?;
- ¿qué equipo fue posteriormente instalado?;
- ¿cuántas veces ha reingresado la misma serie?

La problemática completa se encuentra en `Documentacion Capstone/00_PROBLEMATICA_Y_CONTEXTO_V2.0.md`.

## 3. Justificación

La Ingeniería en Informática aporta valor al problema mediante:

- modelamiento de procesos;
- arquitectura de software;
- modelo relacional;
- desarrollo Web/Mobile;
- seguridad y control por roles;
- integración de servicios;
- pruebas;
- trazabilidad;
- analítica.

PMP Suite transforma un proceso fragmentado en una fuente operacional centralizada.

## 4. Objetivo general

Desarrollar e integrar PMP Suite como plataforma funcional para centralizar y hacer trazable el ciclo físico y técnico de validadores y consolas, apoyando la gestión operacional y la toma de decisiones.

## 5. Objetivos específicos

1. Levantar y formalizar procesos AS-IS.
2. Diseñar procesos TO-BE soportados por PMP Suite.
3. Definir requisitos funcionales/no funcionales.
4. Construir arquitectura Web/API/Mobile/PostgreSQL/Firebase.
5. Implementar modelo de identidad física y custodia.
6. Integrar Bodega, Laboratorio, QA y Terreno.
7. Implementar RBAC.
8. Mantener historial por activo.
9. Incorporar repuestos/stock.
10. Validar mediante pruebas y E2E.
11. Documentar arquitectura, modelo de datos, casos, reportes y resultados.

## 6. Alcance funcional

### Módulos

- Autenticación/usuarios.
- Maestros.
- Activos.
- Requerimientos/casos.
- OS.
- Terreno.
- Bodega.
- Laboratorio.
- QA.
- Repuestos.
- Bridge.
- Trazabilidad.
- Dashboards/reportes.
- Mobile.
- Inteligencia operacional.

### No incluido

- integración automática Aranda;
- decisiones autónomas IA;
- producción certificada.

## 7. Stakeholders

| Stakeholder | Interés |
|---|---|
| Terreno | instalación/retiro y antecedentes técnicos |
| Logística | custodia, stock y movimientos |
| Jefatura Lab | SLA, asignación y salida |
| Técnico Lab | diagnóstico/reparación/pruebas |
| QA | certificación por etapas |
| Admin | identidades y supervisión |
| Gerencia | indicadores y trazabilidad |
| Cliente/analistas | información consistente |

## 8. Restricciones

- mantener trazabilidad histórica;
- proteger datos/credenciales;
- no usar base habitual para pruebas destructivas;
- Mobile depende de conectividad LAN/API durante desarrollo;
- procedimientos técnicos QA no definidos no deben inventarse;
- código y documentación deben corresponder al estado real.

## 9. Supuestos

- cada activo posee serie identificable;
- la operación conoce bus/terminal/operador vigente;
- Firebase está disponible para autenticación;
- PostgreSQL es persistencia central;
- roles oficiales son conocidos por Backend.

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| crecimiento del alcance | priorizar flujos críticos |
| mezcla de responsabilidades | RBAC por acción |
| evidencia reutilizada | Physical First por ciclo |
| documentación obsoleta | línea V2.0 única |
| datos inconsistentes | FKs/checks/transacciones |
| pruebas destructivas | PostgreSQL efímero |
| hardware Mobile no validado | prueba física de cierre |
| dependencia de conocimiento tácito | BPMN/casos/manuales |

## 11. Equipo y responsabilidades

- **Rafael Oteiza:** liderazgo técnico, arquitectura, backend, datos e integración.
- **Matías Garrido:** requerimientos, documentación, trazabilidad y evidencias.
- **Luis Arenas:** Web, Mobile, UX/UI y visualización.

## 12. Entregables

- ERS V2.0 detallada.
- Arquitectura integral.
- Modelo/diccionario de datos.
- BPMN AS-IS/TO-BE.
- Catálogo API.
- Casos de uso.
- Reportes/KPI.
- Matriz de trazabilidad.
- Plan de pruebas.
- Manual técnico.
- Código integrado.
- Evidencias Fase 2.

## 13. Criterio de éxito

El proyecto se considera académicamente demostrable cuando:

1. flujo crítico puede ejecutarse sin inconsistencias;
2. roles no pueden operar fuera de su dominio;
3. trazabilidad reconstruye la historia del activo;
4. movimientos físicos requieren evidencia vigente;
5. documentación permite comprender/reproducir la solución;
6. pruebas y pendientes se declaran sin ocultamiento.
