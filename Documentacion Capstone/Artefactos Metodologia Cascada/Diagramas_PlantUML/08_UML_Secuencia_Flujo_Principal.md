# UML de secuencia - Bridge a mantenimiento, laboratorio y QA

> **FLUJO RETIRADO / HISTÓRICO.** Esta secuencia no debe ejecutarse ni presentarse como comportamiento vigente. Los endpoints operacionales Bridge se retiraron y responden 410. Ingreso de requerimientos crea OS y el despacho físico confirmado crea IN; Bridge solo correlaciona. Consultar los flujos de la [adenda vigente](../../../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md) y el [índice documental](../README_VIGENCIA.md).

Corresponde a la Figura 6 del Documento de Diseño y al flujo principal descrito por CU-04, CU-05, CU-06 y CU-08. Los nombres de las acciones coinciden con las rutas semánticas vigentes del backend.

```plantuml
@startuml PMP_Secuencia_Bridge_Mantenimiento
title UML de secuencia - Flujo Bridge a mantenimiento

skinparam backgroundColor #F5F7FA
skinparam defaultFontName Arial
skinparam defaultFontColor #0D1B2A
skinparam sequenceArrowColor #1565C0
skinparam sequenceLifeLineBorderColor #6B7280
skinparam sequenceParticipantBorderColor #1565C0
skinparam sequenceParticipantBackgroundColor #E8F1FC
skinparam sequenceGroupBorderColor #00B4B0
skinparam sequenceGroupBackgroundColor #F5FBFB
autonumber

actor "Logística" as LOG
actor "Técnico terreno" as TER
actor Admin as ADM
actor "Técnico laboratorio" as LAB
actor QA
participant "API PMP" as API
database PostgreSQL as DB

group Preparación e intervención Bridge
  LOG -> API : POST /api/bridge\ncrear y asignar Bridge
  API -> DB : BEGIN; validar catálogos y stock\nINSERT bridges + flujo_eventos; COMMIT
  DB --> API : Bridge ASIGNADA
  API --> LOG : 201 + Bridge

  TER -> API : POST /api/bridge/{codigo}/iniciar
  API -> DB : validar asignación\nASIGNADA -> EN_TERRENO + evento
  API --> TER : intervención iniciada

  TER -> API : POST /api/bridge/{codigo}/completar\ndatos reales y evidencia
  API -> DB : BEGIN; bloquear Bridge y equipo preparado
  API -> DB : registrar instalación
  API -> DB : crear OS PENDIENTE_RECEPCIÓN
  API -> DB : crear bridge_mantenimiento y eventos
  API -> DB : marcar Bridge COMPLETADA; COMMIT
  DB --> API : Bridge + OS vinculada
  API --> TER : 201 + mantenimiento
end

group Recepción y envío a laboratorio
  LOG -> API : POST /mantenimiento/{os}/recibir-terreno
  API -> DB : validar equipo y bodega\nactualizar OS + evento
  API --> LOG : recepción confirmada

  ADM -> API : PATCH /mantenimiento/{os}/asignar-lab
  API -> DB : validar técnico activo\nasignar carga + evento
  API --> ADM : asignación confirmada

  LOG -> API : POST /mantenimiento/{os}/despachar-lab
  API -> DB : validar asignación y ubicación\nEN_DIAGNÓSTICO + evento
  API --> LOG : despacho confirmado
end

group Diagnóstico y reparación
  LAB -> API : POST /mantenimiento/{os}/iniciar-reparacion
  API -> DB : validar técnico asignado\nEN_REPARACIÓN + evento

  alt se necesita repuesto
    LAB -> API : POST /mantenimiento/{os}/solicitar-repuesto
    API -> DB : crear solicitud\nESPERA_REPUESTO + evento
    API --> LAB : solicitud registrada
  else reparación completada
    LAB -> API : POST /mantenimiento/{os}/completar-reparacion
    API -> DB : BEGIN; INSERT registro_reparaciones\nPENDIENTE_QA + evento; COMMIT
    API --> LAB : reparación registrada
  end
end

group Certificación QA
  ADM -> API : PATCH /mantenimiento/{os}/asignar-qa
  API -> DB : validar QA activo\nasignar carga + evento
  API --> ADM : asignación confirmada

  QA -> API : POST /mantenimiento/{os}/qa\nAPROBAR o RECHAZAR
  API -> DB : BEGIN; INSERT qa_inspecciones
  alt QA aprueba
    API -> DB : APROBADO_PENDIENTE_LOGÍSTICA + evento
    API -> DB : COMMIT
    API --> QA : aprobación registrada
    LOG -> API : POST /mantenimiento/{os}/recibir-qa
    API -> DB : validar aprobación y bodega\nDISPONIBLE + evento
    API --> LOG : flujo recibido y disponible
  else QA rechaza con comentario
    API -> DB : EN_REPARACIÓN + evento de retrabajo
    API -> DB : COMMIT
    API --> QA : rechazo registrado
  end
end

note over API,DB
Cada acción valida rol, asignación y estado previo.
Los cambios críticos se ejecutan dentro de transacciones.
end note
@enduml
```
