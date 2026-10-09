# 04 — Comunicación entre servicios

```plantuml
@startuml
participant "Web / Mobile" as C
participant "API" as A
participant "Firebase" as F
database "PostgreSQL" as P
participant "Python IA" as I

C -> F : login
F --> C : ID token
C -> A : HTTP + Bearer token
A -> F : verifyIdToken()
F --> A : identidad válida
A -> P : resolver pmp.usuarios
activo + rol
P --> A : usuario efectivo
A -> A : authorize(action)
A -> P : servicio de dominio
P --> A : resultado
A --> C : JSON

opt análisis IA
A -> I : ejecutar --json
I -> P : SELECT históricos
P --> I : datos
I --> A : JSON score
end
@enduml
```
