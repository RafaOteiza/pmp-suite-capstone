# 00 — Documento de Inicio de Proyecto PMP Suite V2.0

**Proyecto:** PMP Suite  
**Versión:** V2.0  
**Fecha de actualización:** 09-10-2026  
**Equipo:** Rafael Oteiza · Matías Garrido · Luis Arenas  
**Carrera:** Ingeniería en Informática  
**Enfoque académico:** metodología tradicional/Cascada, con construcción incremental dentro de las fases.

## 1. Propósito del documento

Establecer la línea base del proyecto: problema, contexto, stakeholders, objetivos, alcance, restricciones, riesgos, entregables, criterios de éxito y organización del equipo. La especificación técnica detallada se desarrolla en la ERS, arquitectura, BPMN, modelo de datos y plan de pruebas V2.0.

## 2. Contexto operacional

El proyecto se sitúa en la gestión del mantenimiento de validadores y consolas asociados a transporte público. El ciclo involucra Terreno, Bodega/Mersan, Laboratorio de Garantías, QA, analistas/cliente, gestión PoD y supervisión.

En el proceso previo, la información del mismo equipo puede encontrarse en:

- planillas de Bodega/Mersan;
- reporte interno de Laboratorio;
- registros QA;
- planillas PoD;
- correos;
- guías de despacho;
- tarjetones físicos;
- referencias externas;
- registros técnicos separados.

Por ello, reparar el equipo no es el único problema: también es necesario saber con certeza **qué activo es, dónde está, quién lo custodia, qué intervención lo afecta y qué ocurrió en cada etapa**.

## 3. Problemática

### 3.1 Problema central

No existe una única fuente operacional capaz de relacionar identidad física, custodia, caso, OS, movimientos, diagnóstico, reparación, QA, stock e historial por activo durante todo el ciclo.

### 3.2 Ejemplos reales del AS-IS

- equipos pueden llegar a Laboratorio con guía o, en urgencias, antes de ella;
- series pueden ser enviadas por correo;
- tarjetones pueden faltar o contener datos inconsistentes;
- Laboratorio registra ingresos en un control interno propio;
- diagnóstico puede confirmar o cambiar la falla reportada;
- existen equipos que esperan repuesto;
- PoD requiere informe/seguimiento separado;
- QA mantiene información propia;
- despachos se realizan en diferentes lotes/fechas;
- el cliente puede consultar estados que requieren reconciliar varias fuentes.

### 3.3 Consecuencias

- pérdida o demora de trazabilidad;
- riesgo de identificar mal un equipo;
- confusión entre tránsito y recepción;
- duplicidad de registros;
- estados desactualizados;
- mayor esfuerzo de conciliación;
- dificultad para medir SLA reales;
- dificultad para distinguir stock nuevo/reparado;
- poca visibilidad de reincidencias por serie;
- dificultad para separar equipo retirado y reemplazo;
- dependencia del conocimiento tácito de personas.

La problemática extendida está en `Documentacion Capstone/00_PROBLEMATICA_Y_CONTEXTO_V2.0.md`.

## 4. Solución propuesta

PMP Suite centraliza la operación en PostgreSQL y expone procesos Web/Mobile gobernados por una API de dominio. La solución incorpora:

- identidad física por tipo+serie;
- casos y OS independientes;
- trazabilidad por eventos;
- custodia Physical First;
- Bodega/inventario/repuestos;
- Laboratorio con Jefatura y técnicos separados;
- QA autónomo;
- Terreno Mobile;
- Bridge para correlación externa;
- dashboards/reportes;
- seguridad RBAC;
- analítica de reincidencia de solo lectura.

## 5. Objetivo general

Desarrollar e integrar PMP Suite como una plataforma funcional que centralice y haga trazable el ciclo físico y técnico de validadores y consolas, apoyando la gestión operacional y la toma de decisiones.

## 6. Objetivos específicos

1. Documentar la problemática y el proceso AS-IS.
2. Diseñar el proceso TO-BE.
3. Formalizar requisitos funcionales y no funcionales.
4. Diseñar arquitectura Web/API/Mobile/DB/Firebase/IA.
5. Implementar identidad física y reglas de autocompletado.
6. Separar caso, OS, activo y referencia externa.
7. Controlar custodia mediante evidencia por movimiento/ciclo.
8. Implementar Bodega, Laboratorio, QA y Terreno.
9. Implementar RBAC de mínimo privilegio.
10. Integrar repuestos y stock bajo responsabilidad logística.
11. Mantener trazabilidad por activo y eventos.
12. Validar mediante pruebas unitarias, integración, E2E, visuales y manuales.
13. Documentar resultados, limitaciones y pendientes.

## 7. Stakeholders

| Stakeholder | Interés | Acción principal |
|---|---|---|
| Técnico Terreno | OS propias, historial técnico | reportar, retirar, instalar |
| Logística/Bodega | custodia, stock, despachos | recibir, despachar, entregar repuesto |
| Jefe Laboratorio | recepción, carga, SLA | recibir, asignar, supervisar, despachar |
| Técnico Laboratorio | antecedentes técnicos | diagnosticar, reparar, probar |
| QA | ciclo de certificación | recibir, Ambiente, probar, dictaminar, salir |
| Admin | seguridad/cuentas | administrar usuarios/roles |
| Gerencia | visión ejecutiva | consultar KPI/trazabilidad |
| Analistas/cliente | estado coherente | seguimiento |
| Gestión PoD | respaldo técnico | informe/seguimiento |

## 8. Alcance funcional V2.0

### Incluido

- autenticación y sesión;
- usuarios/RBAC;
- maestros operacionales;
- activos;
- recepción inicial;
- casos/requerimientos;
- OS MV/MC/PDV/PDC/IN;
- Terreno;
- Bodega;
- Laboratorio;
- repuestos;
- QA;
- inventario/instalación;
- Bridge;
- trazabilidad;
- dashboards/reportes;
- Mobile;
- inteligencia operacional;
- temas y UX responsive.

### Fuera de alcance

- integración automática con Aranda;
- automatización de decisiones mediante IA;
- procedimiento técnico no definido de Instalación Ambiente;
- producción certificada de infraestructura;
- motor dinámico de roles/transiciones administrable por UI.

## 9. Principios de diseño

### Identidad autoritativa

- 72… → CVB35 / Mikroelektronika.
- 74…/75… → CVB45 / Mikroelektronika.
- Consola → N9715 / Waysion.

### Physical First

Validar/leer no equivale a mover. Cada recepción/salida se confirma con evidencia del propósito y ciclo vigente.

### Segregación de funciones

Admin, Gerente, Jefe Lab, Logística, QA, Técnico Lab y Técnico Terreno tienen capacidades diferentes.

### Historial

La identidad del activo y la OS no se reescriben para representar otro equipo o intervención.

## 10. Requisitos de alto nivel

La ERS V2.0 contiene:

- **20 reglas de negocio transversales**;
- **210 requisitos funcionales**;
- **38 requisitos no funcionales**.

La trazabilidad detallada está en `08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md`.

## 11. Arquitectura objetivo

```text
Web React/Vite ─┐
                ├─ API Node/Express ─ PostgreSQL (pmp)
Mobile Expo ────┘         │
                          ├─ Firebase
                          └─ Python (lectura)
```

PostgreSQL define rol efectivo/estado del usuario; Firebase autentica. La API contiene las reglas críticas.

## 12. Modelo operacional objetivo

```text
Operación
→ Falla/Requerimiento
→ Retiro Terreno
→ Bodega
→ Laboratorio
→ Bodega
→ QA
→ Bodega
→ Despacho/IN
→ Instalación
→ Operación
```

Los BPMN AS-IS y TO-BE se encuentran en `Documentacion Capstone/BPMN/`.

## 13. Restricciones

- preservar historial real;
- no exponer secretos;
- no usar la base habitual para pruebas destructivas;
- no inventar datos técnicos;
- Mobile requiere conectividad a API durante desarrollo;
- hardware de cámara/lector requiere validación física;
- documentación debe corresponder al código vigente.

## 14. Supuestos

- todo activo dispone de una serie;
- existe relación operacional bus/terminal/PST cuando corresponde;
- Firebase está disponible;
- PostgreSQL es persistencia central;
- usuarios tienen un rol oficial;
- los eventos y evidencias tienen fecha/actor/contexto.

## 15. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| crecimiento de alcance | retraso | priorización de flujo crítico |
| permisos demasiado amplios | seguridad/integridad | autorización por acción |
| evidencia reutilizada | custodia incorrecta | ciclo + propósito + estación |
| desalineación docs/código | defensa débil | línea V2.0 + revisión cruzada |
| datos incompatibles | errores de negocio | constraints/FKs/transacciones |
| concurrencia | doble consumo/sobrescritura | locks/idempotencia |
| pruebas destructivas | pérdida de datos | DB efímera |
| hardware no validado | evidencia incompleta | prueba física de cierre |
| dependencia de conocimiento tácito | operación frágil | BPMN/casos/manuales |

## 16. Organización del equipo

| Integrante | Responsabilidad principal |
|---|---|
| Rafael Oteiza | liderazgo técnico, arquitectura, backend, BD, integración |
| Matías Garrido | requerimientos, documentación, trazabilidad, evidencias |
| Luis Arenas | Web, Mobile, UX/UI, visualización |

Los tres participan en integración, revisión y pruebas.

## 17. Entregables

1. Documento de Inicio V2.0.
2. ERS V2.0.
3. SRS simplificado.
4. Arquitectura integral.
5. Diseño técnico.
6. Modelo/diccionario de datos.
7. Modelo de estados/eventos.
8. Catálogo API.
9. BPMN AS-IS/TO-BE.
10. Casos de uso.
11. Reportes/KPI.
12. Matriz de trazabilidad.
13. Plan de pruebas/evidencias.
14. Manual técnico.
15. Aplicación Web/Mobile/API/DB/IA.
16. Entregables académicos Fase 2.

## 18. Criterios de éxito

- identidad física coherente;
- roles no operan fuera de dominio;
- tránsito y custodia distinguibles;
- historial por serie reconstruible;
- stock no se consume dos veces;
- QA/reingresos conservan contexto;
- dashboards no duplican activos;
- error no se muestra como cero;
- E2E crítico reproducible;
- documentación permite explicar la solución sin depender de memoria informal.

## 19. Estado de validación al 09-10-2026

- Backend: 118/118.
- Web: 176/177.
- Mobile con mocks: 210/210.
- Build Web: aprobado.
- RBAC HTTP aislado: 99 solicitudes.
- E2E Lab: aprobado.
- E2E operacional: aprobado.
- responsive/RBAC: 150 renders.

Pendientes: fixture Web, dispositivo físico, cierre manual QA→Bodega→reinstalación y repetición final de rendimiento/seguridad.

## 20. Referencias documentales

- Problemática: `00_PROBLEMATICA_Y_CONTEXTO_V2.0.md`.
- ERS: `01_Requerimientos/ERS_PMP_Suite_V2.0.md`.
- Arquitectura: `02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md`.
- Datos: `02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md`.
- BPMN: `Documentacion Capstone/BPMN/`.
- Pruebas: `08_Pruebas/INFORME_PRUEBAS_V2.0.md`.
