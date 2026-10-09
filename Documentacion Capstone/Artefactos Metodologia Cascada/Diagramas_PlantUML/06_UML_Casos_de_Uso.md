# UML de casos de uso consolidado

> **FLUJO RETIRADO / HISTÓRICO.** «Crear y asignar Bridge» pertenece a una versión retirada. Ingreso de requerimientos y despacho operan las OS; Bridge solo mantiene correlaciones. Consultar la [adenda vigente](../../../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md) y el [índice documental](../README_VIGENCIA.md).

Fuente compartida para la Figura 1 del SRS y la Figura 4 del Documento de Diseño. Incluye los doce casos de uso definidos en la especificación y los seis roles oficiales.

```plantuml
@startuml PMP_Casos_Uso
title UML de casos de uso - Vista consolidada

left to right direction
skinparam backgroundColor #F5F7FA
skinparam defaultFontName Arial
skinparam defaultFontColor #0D1B2A
skinparam ArrowColor #6B7280
skinparam actorBorderColor #0D1B2A
skinparam actorFontColor #0D1B2A
skinparam usecase {
  BorderColor #00B4B0
  BackgroundColor #E6F7F6
  FontColor #0D1B2A
}
skinparam rectangle {
  BorderColor #1565C0
  BackgroundColor #FFFFFF
}

actor "Usuario PMP" as USER
actor Administrador as ADMIN
actor Gerente as GERENTE
actor "Logística" as LOGISTICA
actor "Técnico de terreno" as TERRENO
actor "Técnico de laboratorio" as LAB
actor QA

USER <|-- ADMIN
USER <|-- GERENTE
USER <|-- LOGISTICA
USER <|-- TERRENO
USER <|-- LAB
USER <|-- QA

rectangle "PMP Suite" {
  usecase "CU-01\nIniciar sesión" as UC01
  usecase "CU-02\nAdministrar usuarios" as UC02
  usecase "CU-03\nCrear y asignar Bridge" as UC03
  usecase "CU-04\nEjecutar intervención" as UC04
  usecase "CU-05\nRecibir y despachar" as UC05
  usecase "CU-06\nDiagnosticar y reparar" as UC06
  usecase "CU-07\nGestionar repuestos" as UC07
  usecase "CU-08\nCertificar QA" as UC08
  usecase "CU-09\nConsultar trazabilidad" as UC09
  usecase "CU-10\nSupervisar operación" as UC10
  usecase "CU-11\nConsultar IA" as UC11
  usecase "CU-12\nGestionar contraseña propia" as UC12
}

USER --> UC01
USER --> UC12

ADMIN --> UC02
ADMIN --> UC03
ADMIN --> UC09
ADMIN --> UC10
ADMIN --> UC11

GERENTE --> UC09
GERENTE --> UC10
GERENTE --> UC11

LOGISTICA --> UC03
LOGISTICA --> UC05
LOGISTICA --> UC07
LOGISTICA --> UC09

TERRENO --> UC04
TERRENO --> UC09

LAB --> UC06
LAB --> UC07
LAB --> UC09

QA --> UC08
QA --> UC09

UC03 ..> UC04 : habilita
UC04 ..> UC05 : genera mantenimiento
UC05 ..> UC06 : entrega a laboratorio
UC06 ..> UC08 : entrega a calidad

note right of GERENTE
Lectura global.
Sin escritura operacional.
end note

note bottom of ADMIN
Admin administra y asigna globalmente,
pero no suplanta acciones técnicas
reservadas al ejecutor asignado.
end note
@enduml
```
