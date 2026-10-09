# PMP Suite — Problemática y Contexto V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026

## 1. Contexto del problema

PMP Suite nace de un proceso real de mantenimiento de equipamiento tecnológico asociado al transporte público, principalmente **validadores** y **consolas**. El ciclo operacional involucra varias áreas con responsabilidades distintas: Terreno, Logística/Bodega, Laboratorio, Control de Calidad (QA), jefaturas, administración y supervisión.

El problema no es solamente reparar un equipo. El desafío es mantener una **trazabilidad continua y verificable** sobre:

- qué equipo físico se está tratando;
- dónde se encuentra;
- quién tiene su custodia;
- qué orden/caso originó el trabajo;
- qué falla fue reportada y qué falla se confirmó;
- qué reparación se realizó;
- qué pruebas fueron ejecutadas;
- si existió PoD;
- qué repuestos fueron requeridos/entregados;
- si QA aprobó o rechazó;
- cuándo el equipo volvió a Bodega;
- qué activo fue instalado posteriormente;
- qué antecedentes históricos deben ver los distintos roles.

## 2. Situación AS-IS observada

### 2.1 Recepción hacia Laboratorio

Los equipos llegan al Laboratorio desde Bodega/Mersan. Normalmente se reciben con guía de despacho, pero existen situaciones urgentes donde un equipo puede arribar antes que la documentación formal. Las series también pueden ser informadas por correo.

Los equipos pueden venir con tarjetón físico, pero existen casos donde:

- el tarjetón no está presente;
- la información está incompleta;
- algún dato no coincide con el equipo físico;
- la serie entregada por otro canal requiere conciliación.

El Laboratorio registra los ingresos en un control interno, revisa antecedentes y luego distribuye el trabajo técnico.

### 2.2 Trabajo técnico

El flujo real de Laboratorio comprende:

1. recepción;
2. registro;
3. verificación de antecedentes;
4. diagnóstico;
5. reparación;
6. pruebas;
7. preparación de salida;
8. despacho;
9. registro de solución.

El diagnóstico puede confirmar la falla reportada, detectar una falla distinta, determinar NFF, identificar un PoD o detectar una condición que requiera repuesto.

### 2.3 Fragmentación de información

Antes de PMP Suite, la información del mismo activo/caso puede quedar distribuida entre:

- registros de Bodega/Mersan;
- planillas del Laboratorio;
- registros de QA;
- información de analistas;
- controles de PoD;
- correos;
- guías de despacho;
- referencias externas como Aranda;
- registros independientes de técnicos.

La fragmentación obliga a realizar conciliaciones manuales. Un mismo equipo puede aparecer en varias planillas con estados o datos distintos.

### 2.4 Efectos de la fragmentación

Los principales efectos son:

- dificultad para determinar la ubicación física vigente;
- dificultad para determinar quién tiene la custodia;
- duplicidad de registros;
- estados desactualizados;
- pérdida de contexto entre áreas;
- dependencia de correos/personas para reconstruir antecedentes;
- dificultad para calcular tiempos/SLA;
- mayor riesgo de asignar o despachar un equipo no elegible;
- dificultad para distinguir stock inicial de stock reparado;
- dificultad para reconstruir reincidencias por serie;
- poca claridad entre caso, OS, activo y referencia externa;
- riesgo de mezclar la historia de un equipo retirado con un reemplazo;
- mayor esfuerzo para auditar PoD, repuestos y QA.

## 3. Problema central

> No existe una única fuente operacional que relacione identidad física, custodia, órdenes, casos, movimientos, reparación, QA, stock e historial por activo durante todo el ciclo.

Esto genera una brecha entre el **estado administrativo registrado** y el **estado físico real**.

## 4. Causas

### 4.1 Causas de información

- planillas independientes;
- registros no sincronizados;
- información duplicada;
- referencias externas no normalizadas;
- dependencia de digitación manual;
- relaciones serie/PPU/terminal/operador no siempre autocompletadas.

### 4.2 Causas de proceso

- recepción y despacho tratados históricamente como un solo cambio de estado;
- evidencia física reutilizada entre movimientos;
- funciones de jefatura/operación mezcladas;
- falta de separación entre diagnóstico técnico y custodia;
- falta de separación entre dictamen QA y despacho;
- creación histórica de OS/Bridge con responsabilidades superpuestas.

### 4.3 Causas tecnológicas

- falta de modelo único de identidad;
- ausencia de un historial append-only transversal;
- permisos demasiado amplios en etapas anteriores;
- múltiples vistas/estados calculados con criterios diferentes;
- ausencia de un contrato común para captura física.

## 5. Usuarios afectados

| Actor | Necesidad |
|---|---|
| Técnico Terreno | saber qué OS tiene asignadas, qué retirar/instalar y antecedentes técnicos útiles |
| Logística | conocer custodia, disponibilidad, stock, recepciones y despachos |
| Jefe Laboratorio | ver equipos en camino/recibidos, asignar carga, supervisar SLA y despachar |
| Técnico Laboratorio | diagnosticar/reparar su carga sin administrar inventario |
| QA | recibir, preparar ambiente, probar, dictaminar y despachar |
| Admin | administrar cuentas/roles y supervisar, sin reemplazar actores operacionales |
| Gerencia | obtener indicadores y trazabilidad de solo lectura |
| Analistas/cliente | disponer de antecedentes consistentes de cada activo/caso |

## 6. Objetivo de PMP Suite

### Objetivo general

Desarrollar e integrar una plataforma que centralice y haga trazable el ciclo físico y técnico de validadores y consolas, desde operación hasta mantenimiento, QA, retorno a stock y reinstalación.

### Objetivos específicos

1. Mantener identidad única por **tipo + serie**.
2. Diferenciar activo, caso, OS y referencia externa.
3. Controlar custodia mediante evidencia física por movimiento.
4. Separar responsabilidades por rol.
5. Mantener historial append-only.
6. Integrar Web, Mobile, Backend y PostgreSQL.
7. Gestionar stock/repuestos desde Logística.
8. Mantener QA como proceso autónomo.
9. Proporcionar indicadores y reportes coherentes.
10. Entregar analítica de reincidencia como apoyo, no automatismo.

## 7. Principios de diseño derivados del problema

### Physical First

Una lectura o selección **no mueve un equipo**. Cada cambio de custodia requiere validación y confirmación del movimiento actual.

### Identidad autoritativa

- Validador 72… → CVB35 / Mikroelektronika.
- Validador 74…/75… → CVB45 / Mikroelektronika.
- Consola → N9715 / Waysion.

### Independencia de OS

Cada OS representa una intervención concreta. Una reparación del equipo retirado no se reutiliza para representar la instalación de un reemplazo.

### Historial por activo

La serie mantiene su historia aunque cambie de bus, estado, ubicación o caso.

### Segregación de funciones

Administrar el sistema, custodiar un equipo, repararlo, certificarlo y mover stock son permisos distintos.

## 8. Alcance actual

Incluye:

- gestión de activos;
- recepción inicial;
- casos/requerimientos;
- OS MV/MC/PDV/PDC/IN;
- retiros Terreno;
- Bodega;
- Laboratorio;
- QA;
- repuestos;
- trazabilidad;
- Bridge de referencias externas;
- dashboards;
- Mobile;
- seguridad/RBAC;
- analítica de reincidencia.

No se presenta como implementada una integración automática con Aranda ni un despliegue productivo certificado.
