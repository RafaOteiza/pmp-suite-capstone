# 01 — Plan de trabajo

```plantuml
@startuml
left to right direction
rectangle "Fase 1
Definición" as F1
rectangle "Fase 2A
Requerimientos y diseño" as F2A
rectangle "Fase 2B
Construcción e integración" as F2B
rectangle "Fase 2C
Pruebas y evidencias" as F2C
rectangle "Fase 2D
Cierre documental" as F2D
rectangle "Fase 3
Presentación" as F3
F1 --> F2A
F2A --> F2B
F2B --> F2C
F2C --> F2D
F2D --> F3
note bottom of F2B
Construcción incremental dentro
de la secuencia académica.
end note
@enduml
```
