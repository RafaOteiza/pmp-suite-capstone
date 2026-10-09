# 02 — Arquitectura lógica

```plantuml
@startuml
actor "Usuarios Web" as WebUser
actor "Técnico Terreno" as Terrain
component "Frontend Web
React + Vite" as Web
component "Mobile
Expo + React Native" as Mobile
component "API REST
Node + Express" as API
database "PostgreSQL
schema pmp" as DB
cloud "Firebase Auth/Admin" as FB
component "Analizador Python" as IA

WebUser --> Web
Terrain --> Mobile
Web --> API
Mobile --> API
API --> FB : autenticación
API --> DB : dominio / persistencia
API --> IA : análisis bajo demanda
IA --> DB : lectura
@enduml
```
