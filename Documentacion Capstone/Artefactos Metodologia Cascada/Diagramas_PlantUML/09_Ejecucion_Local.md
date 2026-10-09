# 09 — Ejecución local

```plantuml
@startuml
node "PC desarrollo" {
  component "Vite :5173" as WEB
  component "Node API :4000" as API
  database "PostgreSQL :5432
pmp_suite" as DB
  component "Python IA" as PY
  component "Metro / Expo" as EXPO
}
cloud Firebase
node "Teléfono" {
  component "Expo Go / PMP Mobile" as MOB
}
WEB --> API
API --> DB
API --> Firebase
API --> PY
PY --> DB
EXPO --> MOB
MOB --> API : LAN
@enduml
```

