# BPMN TO-BE — PMP Suite V2.0

**Versión:** V2.0

## 1. Objetivo

Representar el flujo integrado con PMP Suite, manteniendo separación de responsabilidades y custodia Physical First.

## 2. Pools/Lanes

- Técnico Terreno
- Logística/Bodega
- Jefe Laboratorio
- Técnico Laboratorio
- QA
- Sistema PMP Suite
- Admin/Gerencia (supervisión)

## 3. Flujo principal TO-BE

```mermaid
flowchart TB
 subgraph TT["Técnico Terreno"]
  T1[Reportar falla]
  T2[Validar identidad del retiro]
  T3[Confirmar retiro físico]
  T4[Instalar equipo]
 end
 subgraph BO["Logística / Bodega"]
  B1[Confirmar recepción desde Terreno]
  B2[Confirmar salida a Laboratorio]
  B3[Recibir desde Laboratorio]
  B4[Confirmar salida a QA]
  B5[Recibir desde QA]
  B6{¿Equipo elegible?}
  B7[Validar despacho a Terreno]
  B8[Confirmar despacho]
  BP[Entregar repuesto]
 end
 subgraph JL["Jefe Laboratorio"]
  L1[Confirmar recepción Lab]
  L2[Asignar técnico]
  L3[Supervisar SLA/carga]
  L4[Confirmar salida Lab]
 end
 subgraph TL["Técnico Laboratorio"]
  D1[Diagnóstico]
  D2[Iniciar reparación]
  D3{¿Requiere repuesto PoD?}
  D4[Solicitar necesidad]
  D5[Intervenciones]
  D6[Manual / Test MK]
  D7[Finalizar trabajo técnico]
 end
 subgraph QA["QA"]
  Q1[Confirmar recepción]
  Q2[Instalación Ambiente]
  Q3[Pruebas]
  Q4{Dictamen}
  Q5[Confirmar salida]
 end
 subgraph SYS["PMP Suite"]
  S1[Crear caso/OS]
  S2[Registrar eventos append-only]
  S3[Actualizar proyección de custodia]
  S4[Crear IN al confirmar despacho]
  S5[Trazabilidad / KPI / historial]
 end

 T1-->S1-->T2-->T3-->S2-->B1
 B1-->S3-->B2-->L1
 L1-->L2-->L3
 L2-->D1-->D2-->D3
 D3--Sí-->D4-->BP-->D5
 D3--No-->D5
 D5-->D6-->D7-->L4
 L4-->B3-->B4-->Q1-->Q2-->Q3-->Q4
 Q4--Rechazado-->Q5-->B5-->B2
 Q4--Operativo-->Q5-->B5-->B6
 B6--Sí-->B7-->B8-->S4-->T4
 B6--No-->S5
 S2-->S5
 S3-->S5
 S4-->S5
```

## 4. Reglas BPMN TO-BE

### R1 — Validar ≠ confirmar

El sistema puede validar identidad/contexto sin cambiar la custodia. La transición se registra únicamente con confirmación explícita.

### R2 — Evidencia por movimiento

La evidencia de recepción no puede reutilizarse para despacho. Cada ciclo genera su propia evidencia.

### R3 — Laboratorio

- Jefe Laboratorio: recepción, asignación, supervisión y salida.
- Técnico: trabajo técnico de su carga.
- Técnico no administra stock.

### R4 — QA

QA inicia/toma su propio trabajo. Dictamen y despacho son acciones separadas.

### R5 — Instalación

La OS IN nace al confirmar el despacho desde Bodega a Terreno, no al seleccionar técnico o serie.

### R6 — Reingresos

Un rechazo QA retorna al circuito Bodega → Laboratorio con un nuevo ciclo físico. No hereda evidencia anterior.

## 5. Mejoras frente al AS-IS

| AS-IS | TO-BE |
|---|---|
| planillas por área | PostgreSQL central |
| conciliación de serie manual | identidad tipo + serie |
| estado ambiguo | custodia derivada de eventos/evidencia |
| correo como contexto principal | caso/OS/historial |
| asignación informal | carga asignada y RBAC |
| reparación y stock mezclables | responsabilidades separadas |
| QA y despacho acoplados | etapas QA + salida física |
| trazabilidad reconstruida | eventos append-only |
| consulta manual | dashboards, historial, búsqueda |
