# Ejecución local de PMP Suite

Corresponde a la Figura 7 del Documento de Diseño y a la sección de ejecución
del Manual Técnico. Representa el entorno utilizado para la validación y
demostración Capstone.

```plantuml
@startuml PMP_Ejecucion_Local
title Ejecución local de PMP Suite

left to right direction
skinparam backgroundColor #F5F7FA
skinparam defaultFontName Arial
skinparam defaultFontColor #0D1B2A
skinparam ArrowColor #1565C0
skinparam ArrowThickness 2
skinparam node {
  BorderColor #1565C0
  BackgroundColor #FFFFFF
  FontColor #0D1B2A
}
skinparam componentStyle rectangle

actor "Usuario web" as USER
node "Navegador" as BROWSER #E8F1FC {
  component "Frontend React\nVite 5173" as WEB
}
node "Dispositivo móvil" as MOBILE #E8F1FC {
  component "Aplicación Expo" as APP
}
cloud "Firebase Authentication" as FIREBASE #FFF4D6

node "Equipo de ejecución" as HOST {
  component "API Node.js y Express\nPuerto 4000" as API #E6F7F6
  database "PostgreSQL\nEsquema pmp" as DB #E6F7F6
  component "Analizador Python\nEntorno .venv" as AI #EEF1F5
  artifact "Variables de entorno\nno versionadas" as ENV
  artifact "Credencial Firebase\nfuera del repositorio" as CREDENTIAL
}

USER --> WEB
WEB --> API : HTTP y JSON
APP --> API : HTTP y JSON por red local
API --> FIREBASE : verifica token
API --> DB : SQL parametrizado
API --> AI : execFile y JSON
AI --> DB : consultas de lectura
ENV --> API
CREDENTIAL --> API

note bottom of HOST
Entorno utilizado para desarrollo, pruebas y demostración.
La API se comprueba mediante GET /api/health.
end note
@enduml
```
