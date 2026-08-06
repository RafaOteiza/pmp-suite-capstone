# 7. Diseño de Base de Datos (ERD)

Este documento describe el esquema de la base de datos PostgreSQL del Sistema PMP Suite, mostrando las tablas principales, sus atributos y las relaciones entre ellas. Se utiliza la notación para Diagramas Entidad-Relación (ERD).

## Descripción

La base de datos PostgreSQL es el repositorio central de toda la información transaccional y de configuración del sistema PMP Suite. Su diseño es relacional, con un esquema `pmp` que organiza las tablas principales, las cuales están interconectadas a través de claves primarias y foráneas para garantizar la integridad referencial. Se hace un uso extensivo de tipos `ENUM` para campos con valores discretos y triggers para hacer cumplir la lógica de negocio a nivel de base de datos.

## Entidades (Tablas) Clave

*   **pmp.usuarios:** Información de los usuarios del sistema, incluyendo rol y vínculo con Firebase UID.
*   **pmp.estados:** Catálogo de estados posibles para una Orden de Servicio.
*   **pmp.ubicaciones:** Catálogo de ubicaciones físicas (bodegas, laboratorios, QA).
*   **pmp.terminales:** Catálogo de terminales de equipos.
*   **pmp.pst:** Catálogo de códigos de operadores PST.
*   **pmp.terminal_pst:** Tabla de unión para la autorización de operadores PST en terminales.
*   **pmp.buses:** Catálogo de buses PPU.
*   **pmp.validadores:** Catálogo de validadores de equipos (series, modelos, marcas).
*   **pmp.consolas:** Catálogo de consolas de equipos (series, modelos, marcas).
*   **pmp.ordenes_servicio:** Tabla principal de Órdenes de Servicio (OS), con detalles del equipo, falla, estado, técnicos asignados y ubicación.
*   **pmp.os_eventos:** Historial de eventos y cambios para cada OS (cambios de estado, comentarios, alertas IA).
*   **pmp.os_transiciones:** Reglas que definen las transiciones de estado permitidas para las OS, por rol.
*   **pmp.config_estado_ubicacion:** Configuración de validación entre estados de OS y tipos de ubicación.
*   **pmp.registro_reparaciones:** Registros detallados de las reparaciones realizadas en una OS.
*   **pmp.repuestos:** Catálogo de repuestos con información de stock y categorías.
*   **pmp.solicitudes_repuestos:** Solicitudes de repuestos generadas por laboratorio.
*   **pmp.solicitud_items:** Detalle de los repuestos solicitados en cada `pmp.solicitudes_repuestos`.
*   **pmp.guias:** Registro de guías de despacho/recepción.
*   **pmp.guia_detalle:** Detalle de los equipos asociados a cada guía.

## Diagrama Entidad-Relación (ERD) (Prompt PlantUML)

Aquí tienes un prompt para generar un Diagrama Entidad-Relación utilizando PlantUML. Puedes copiar este código en una herramienta que soporte PlantUML para visualizar el diagrama. Debido a la complejidad y el número de tablas, este diagrama puede ser denso, pero representa todas las relaciones identificadas en `pmp_backup.sql`.

```plantuml
@startuml PMP_ERD

'!theme plain
skinparam defaultFontSize 12
skinparam linetype ortho

entity "pmp.usuarios" as usuarios {
  *id: UUID <<PK>>
  --
  nombre: VARCHAR(100)
  apellido: VARCHAR(100)
  *correo: VARCHAR(150) <<Unique>>
  rol: VARCHAR(50) 
  activo: BOOLEAN
  firebase_uid: VARCHAR(128) <<Unique, Index>>
}

entity "pmp.estados" as estados {
  *id: INTEGER <<PK>>
  --
  *nombre: VARCHAR(50) <<Unique>>
}

entity "pmp.ubicaciones" as ubicaciones {
  *id: INTEGER <<PK>>
  --
  *nombre: VARCHAR(100)
  tipo: pmp.tipo_ubicacion_enum
}

entity "pmp.terminales" as terminales {
  *id: INTEGER <<PK>>
  --
  *nombre: VARCHAR(100) <<Unique>>
}

entity "pmp.pst" as pst {
  *codigo: VARCHAR(20) <<PK>>
  --
  nombre: VARCHAR(120)
}

entity "pmp.terminal_pst" as terminal_pst {
  *terminal_id: INTEGER <<PK, FK>>
  *pst_codigo: VARCHAR(20) <<PK, FK>>
}

entity "pmp.buses" as buses {
  *ppu: VARCHAR(10) <<PK>>
}

entity "pmp.validadores" as validadores {
  *serie: VARCHAR(50) <<PK>>
  --
  modelo: VARCHAR(50)
  marca: VARCHAR(50)
}

entity "pmp.consolas" as consolas {
  *serie: VARCHAR(50) <<PK>>
  --
  modelo: VARCHAR(50)
  marca: VARCHAR(50)
}

entity "pmp.ordenes_servicio" as os {
  *codigo_os: VARCHAR(50) <<PK>>
  --
  fecha: TIMESTAMP
  tipo_equipo: VARCHAR(20)
  es_pod: BOOLEAN
  validador_serie: VARCHAR(50) <<FK>>
  consola_serie: VARCHAR(50) <<FK>>
  falla: TEXT
  estado_id: INTEGER <<FK>>
  bus_ppu: VARCHAR(10) <<FK>>
  terminal_id: INTEGER <<FK>>
  pst_codigo: VARCHAR(20) <<FK>>
  ubicacion_id: INTEGER <<FK>>
  tecnico_terreno_id: UUID <<FK>>
  tecnico_laboratorio_id: UUID <<FK>>
  actualizado_en: TIMESTAMP
}

entity "pmp.os_eventos" as os_eventos {
  *id: SERIAL <<PK>>
  --
  os_id: VARCHAR(50) <<FK>>
  evento_tipo: pmp.tipo_evento_os
  desde_estado: INTEGER <<FK>>
  hacia_estado: INTEGER <<FK>>
  usuario_id: UUID <<FK>>
  rol: VARCHAR(50)
  comentario: TEXT
  meta: JSONB
  fecha: TIMESTAMP
}

entity "pmp.os_transiciones" as os_transiciones {
  *desde_estado: INTEGER <<PK, FK>>
  *hacia_estado: INTEGER <<PK, FK>>
  *rol_requerido: VARCHAR(50) <<PK>>
  --
  requiere_guia: BOOLEAN
  requiere_comentario: BOOLEAN
  activo: BOOLEAN
}

entity "pmp.config_estado_ubicacion" as config_estado_ubicacion {
  *estado_id: INTEGER <<PK, FK>>
  *tipo_ubicacion: pmp.tipo_ubicacion_enum <<PK>>
}

entity "pmp.registro_reparaciones" as registro_reparaciones {
  *id: UUID <<PK>>
  --
  codigo_os: VARCHAR(50) <<FK>>
  tecnico_id: UUID <<FK>>
  falla_detectada: TEXT
  accion_realizada: TEXT
  repuestos_usados: TEXT 'Considerar tabla de detalle si es necesario'
  comentario: TEXT
  fecha_registro: TIMESTAMP
}

entity "pmp.repuestos" as repuestos {
  *id: INTEGER <<PK>>
  --
  *nombre: VARCHAR(150)
  categoria: pmp.categoria_equipo
  stock: INTEGER
  stock_critico: INTEGER
}

entity "pmp.solicitudes_repuestos" as solicitudes_repuestos {
  *id: INTEGER <<PK>>
  --
  codigo_os: VARCHAR(50) <<FK>>
  solicitado_por: UUID <<FK>>
  estado: pmp.estado_solicitud
  fecha_solicitud: TIMESTAMP
  fecha_despacho: TIMESTAMP
}

entity "pmp.solicitud_items" as solicitud_items {
  *id: INTEGER <<PK>>
  --
  *solicitud_id: INTEGER <<FK>>
  *repuesto_id: INTEGER <<FK>>
  cantidad: INTEGER
}

entity "pmp.guias" as guias {
  *numero: VARCHAR(50) <<PK>>
  --
  fecha: DATE
  origen_id: INTEGER <<FK>>
  destino_id: INTEGER <<FK>>
  creado_por: UUID <<FK>>
}

entity "pmp.guia_detalle" as guia_detalle {
  *id: INTEGER <<PK>>
  --
  guia_numero: VARCHAR(50) <<FK>>
  tipo_equipo: VARCHAR(20)
  validador_serie: VARCHAR(50) <<FK>>
  consola_serie: VARCHAR(50) <<FK>>
  bus_ppu: VARCHAR(10) <<FK>>
  codigo_os: VARCHAR(50) <<FK>>
  nota: VARCHAR(255)
}

' -- Relaciones --

usuarios "1" --o{ "*" os : "tiene/es asignado a"
usuarios "1" --o{ "*" registro_reparaciones : "realiza"
usuarios "1" --o{ "*" solicitudes_repuestos : "solicita"
usuarios "1" --o{ "*" guias : "crea"

estados "1" --o{ "*" os : "tiene"
estados "1" --o{ "*" os_eventos : "desde/hacia"
estados "1" --o{ "*" os_transiciones : "desde/hacia"

ubicaciones "1" --o{ "*" os : "ubicado en"
ubicaciones "1" --o{ "*" guias : "origen/destino"

terminales "1" --o{ "*" os : "tiene"
terminales "1" --o{ "*" terminal_pst : "es asignado a"
pst "1" --o{ "*" terminal_pst : "está autorizado en"

buses "1" --o{ "*" os : "instalado en"
buses "1" --o{ "*" guia_detalle : "en"

validadores "1" --o{ "*" os : "equipo"
consolas "1" --o{ "*" os : "equipo"

os "1" --o{ "*" os_eventos : "tiene"
os "1" --o{ "*" registro_reparaciones : "pertenece a"
os "1" --o{ "*" solicitudes_repuestos : "genera"
os "1" --o{ "*" guia_detalle : "es parte de"

repuestos "1" --o{ "*" solicitud_items : "es"
repuestos "1" --o{ "*" registro_reparaciones : "usa" 'Considerar relación más formal'

solicitudes_repuestos "1" --o{ "*" solicitud_items : "contiene"

guias "1" --o{ "*" guia_detalle : "incluye"

os_transiciones "1" --o{ "*" config_estado_ubicacion : "valida estado de" 'Considerar relación más formal'

config_estado_ubicacion "1" --o{ "*" estados : "configura"
config_estado_ubicacion "1" --o{ "*" ubicaciones : "configura tipo de"

@enduml
```

---

## 7.4. Fuente de Datos para el Módulo de IA

El Módulo de Mantenimiento Predictivo (v5.0) actúa como un consumidor analítico de solo lectura de las tablas transaccionales. Su lógica de inferencia se basa principalmente en:

1.  **pmp.ordenes_servicio:** Provee el historial base de fallas, permitiendo el cálculo de reincidencias por número de serie (`validador_serie` / `consola_serie`) y el tiempo medio entre fallas (MTBF).
2.  **pmp.os_eventos:** El campo `meta` (JSONB) es utilizado para análisis post-mortem de reparaciones complejas y para el entrenamiento del modelo de detección de anomalías ("Equipos Limón").
3.  **Análisis de Criticidad:** El modelo pondera tipos de falla específicos (ej: fallas EMV o de comunicación) para ajustar el `score_riesgo` que se muestra en los dashboards estratégicos.

---
