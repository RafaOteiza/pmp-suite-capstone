# Comunicación entre servicios y autorización

Complementa las secciones 4, 5.1 y 8 del Documento de Diseño. Muestra el recorrido de una solicitud protegida y la ejecución opcional del reporte IA.

```plantuml
@startuml PMP_Comunicacion_Servicios
title Comunicación entre servicios y cadena de autorización

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

actor Usuario
participant "Web o Mobile" as CLIENTE
participant "Firebase Client" as FBCLIENT
participant "API Express" as API
participant "Firebase Admin" as FBADMIN
database "PostgreSQL" as DB
participant "analyzer.py" as AI

Usuario -> CLIENTE : ingresa credenciales
CLIENTE -> FBCLIENT : signIn
FBCLIENT --> CLIENTE : ID token o error controlado
CLIENTE -> API : solicitud HTTPS/JSON + Bearer token

group Autenticación e identidad efectiva
  API -> FBADMIN : verifyIdToken(token, checkRevoked=true)
  FBADMIN --> API : UID y correo verificados
  API -> DB : SELECT pmp.usuarios por firebase_uid
  DB --> API : usuario, activo y rol PostgreSQL
end

alt token inválido, expirado o revocado
  API --> CLIENTE : 401 + código seguro
else usuario ausente o inactivo
  API --> CLIENTE : 403
else identidad válida
  API -> API : enforceReadOnlyRole
  alt gerente intenta escritura operacional
    API --> CLIENTE : 403 READ_ONLY_ROLE
  else método y rol autorizados
    API -> API : requireAnyRole / asignación
    API -> DB : consulta o transacción parametrizada
    DB --> API : filas / resultado

    opt GET /api/ai/predictive-report
      API -> AI : execFile analyzer.py --json
      AI -> DB : SELECT histórico de OS
      DB --> AI : dataset
      AI --> API : JSON de riesgo
    end

    API --> CLIENTE : JSON + estado HTTP
  end
end

note over API,DB
Firebase autentica la identidad.
PostgreSQL determina rol y estado activo.
end note
@enduml
```

