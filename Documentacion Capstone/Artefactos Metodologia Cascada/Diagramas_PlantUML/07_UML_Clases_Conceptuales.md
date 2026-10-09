# UML conceptual de clases del dominio

> **FLUJO RETIRADO / HISTÓRICO.** Las responsabilidades operativas atribuidas a Bridge describen la versión anterior y se conservan como evidencia. El modelo vigente separa caso, OS, activo físico y referencia externa: [adenda funcional y técnica](../../../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md), [índice documental](../README_VIGENCIA.md).

Corresponde a la Figura 5 del Documento de Diseño. Es un modelo conceptual: las clases representan conceptos y responsabilidades del dominio, no clases ejecutables equivalentes uno a uno en Express.

```plantuml
@startuml PMP_Clases_Conceptuales
title UML conceptual de clases - Dominio de mantenimiento

hide empty members
skinparam backgroundColor #F5F7FA
skinparam defaultFontName Arial
skinparam defaultFontColor #0D1B2A
skinparam ArrowColor #1565C0
skinparam class {
  BorderColor #1565C0
  BackgroundColor #FFFFFF
  HeaderBackgroundColor #DCE9F8
  FontColor #0D1B2A
}

enum Rol {
  admin
  gerente
  logistica
  qa
  tecnico_laboratorio
  tecnico_terreno
}

class Usuario {
  +id: UUID
  +correo: string
  +rol: Rol
  +activo: boolean
  +firebaseUid: string
}

abstract class Equipo {
  +serie: string
  +modelo: string
  +marca: string
}

class Validador
class Consola

class Bridge {
  +codigo: string
  +estado: EstadoBridge
  +origen: string
  +equipoPreparadoSerie: string
  +motivo: string
  +iniciarIntervencion()
  +completarIntervencion()
}

class InstalacionEquipo {
  +equipoRetiradoSerie: string
  +equipoInstaladoSerie: string
  +busPpu: string
  +intervencionEn: DateTime
}

class VinculoBridgeMantenimiento {
  +bridgeCodigo: string
  +codigoOs: string
}

class OrdenServicio {
  +codigo: string
  +falla: string
  +estado: EstadoOS
  +ubicacion: Ubicacion
  +registrarEvento()
}

class EventoFlujo {
  +tipo: string
  +rol: Rol
  +fecha: DateTime
  +comentario: string
  +metadata: JSON
}

class Reparacion {
  +diagnostico: string
  +accion: string
  +prueba: string
  +resultado: string
  +completar()
}

class SolicitudRepuesto {
  +estado: EstadoSolicitud
  +fechaSolicitud: DateTime
  +entregar()
}

class ItemSolicitud {
  +cantidad: int
}

class Repuesto {
  +nombre: string
  +categoria: string
  +stock: int
  +stockCritico: int
}

class InspeccionQA {
  +resultado: ResultadoQA
  +comentario: string
  +certificacion: string
  +fecha: DateTime
}

class EstadoOS {
  +id: int
  +nombre: string
}

class Ubicacion {
  +id: int
  +nombre: string
  +tipo: string
}

Equipo <|-- Validador
Equipo <|-- Consola
Usuario --> Rol
Usuario "1" -- "0..*" Bridge : crea / asigna / ejecuta
Bridge "1" *-- "0..1" InstalacionEquipo
Bridge "1" *-- "0..1" VinculoBridgeMantenimiento
VinculoBridgeMantenimiento "1" --> "1" OrdenServicio
OrdenServicio "0..*" --> "1" Equipo
OrdenServicio "0..*" --> "1" EstadoOS
OrdenServicio "0..*" --> "0..1" Ubicacion
OrdenServicio "1" *-- "0..*" EventoFlujo
Bridge "1" *-- "0..*" EventoFlujo
OrdenServicio "1" *-- "0..*" Reparacion
OrdenServicio "1" *-- "0..*" SolicitudRepuesto
SolicitudRepuesto "1" *-- "0..*" ItemSolicitud
ItemSolicitud "0..*" --> "1" Repuesto
OrdenServicio "1" *-- "0..*" InspeccionQA
Usuario "1" -- "0..*" EventoFlujo : registra
Usuario "1" -- "0..*" Reparacion : ejecuta
Usuario "1" -- "0..*" InspeccionQA : certifica

note bottom
Modelo conceptual: las reglas y operaciones se implementan mediante
rutas, middlewares, servicios y transacciones, no mediante un ORM de clases.
end note
@enduml
```
