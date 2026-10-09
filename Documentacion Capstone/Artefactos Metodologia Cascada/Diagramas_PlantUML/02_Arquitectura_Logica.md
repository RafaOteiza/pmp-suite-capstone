# Arquitectura lógica vigente de PMP Suite

Representa la Figura 1 del Documento de Diseño. Distingue la autenticación Firebase de la autorización efectiva basada en PostgreSQL y muestra que el analizador Python es invocado como proceso local por la API.

```plantuml
@startuml PMP_Arquitectura_Logica
title Arquitectura lógica vigente de PMP Suite

left to right direction
skinparam backgroundColor #F5F7FA
skinparam defaultFontName Arial
skinparam defaultFontColor #0D1B2A
skinparam componentStyle rectangle
skinparam ArrowColor #1565C0
skinparam ArrowThickness 2
skinparam packageBorderColor #6B7280
skinparam packageBackgroundColor #FFFFFF

package "Interfaces de usuario" {
  component "Frontend web\nReact 18 + TypeScript + Vite" as WEB #E8F1FC
  component "Aplicación móvil\nReact Native + Expo" as MOBILE #E8F1FC
}

component "API REST PMP\nNode.js + Express\nRBAC + reglas + transacciones" as API #DCE9F8
cloud "Firebase Authentication\nIdentidad y recuperación" as FIREBASE #FFF4D6
database "PostgreSQL\nEsquema pmp\nRol efectivo y datos" as DB #E6F7F6
component "Motor IA\nPython + Psycopg2\nanalyzer.py --json" as AI #EEF1F5

WEB --> FIREBASE : credenciales / ID token
MOBILE --> FIREBASE : credenciales / ID token
WEB --> API : HTTPS + JSON\nBearer ID token
MOBILE --> API : HTTPS + JSON\nBearer ID token
API --> FIREBASE : Firebase Admin\nverifica token y revocación
API --> DB : SQL parametrizado / TCP\nusuario, rol y operación
API --> AI : execFile\nproceso local + JSON
AI --> DB : SELECT histórico\nsolo lectura

note bottom of API
Cadena protegida:
firebaseAuth -> ensureUser -> enforceReadOnlyRole
-> autorización específica -> handler
end note

note bottom of DB
PostgreSQL prevalece sobre Custom Claims
para rol y estado activo del usuario.
end note
@enduml
```

