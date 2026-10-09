# 05 — Modelo de Datos ERD V2.0

**Fuente:** `02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md`

```plantuml
@startuml
hide circle
skinparam linetype ortho

entity usuarios {
  * id : uuid
  --
  nombre
  apellido
  correo
  rol
  activo
  firebase_uid
}
entity validadores {
  * serie
  --
  modelo
  marca
  amid
  origen_registro
  fecha_ingreso
  registrado_por
}
entity consolas {
  * serie
  --
  modelo
  marca
  origen_registro
  fecha_ingreso
  registrado_por
}
entity buses { * ppu }
entity terminales { * id -- nombre }
entity pst { * codigo -- nombre }
entity terminal_pst { * terminal_id * pst_codigo }
entity estados { * id -- nombre }
entity ubicaciones { * id -- nombre tipo }
entity config_estado_ubicacion { * estado_id * tipo_ubicacion }

entity casos_operacionales {
 * id
 --
 codigo_caso
 origen
 referencia_externa
 tipo_equipo
 serie_origen
 bus_ppu
 terminal_id
 pst_codigo
 falla_reportada
 creado_por
}

entity ordenes_servicio {
 * codigo_os
 --
 tipo_equipo
 validador_serie
 consola_serie
 es_pod
 es_instalacion
 estado_id
 ubicacion_id
 tecnico_terreno_id
 tecnico_laboratorio_id
 qa_usuario_id
 caso_id
 os_origen
 stock_origen_os
 stock_origen_evento
}

entity flujo_eventos {
 * id
 --
 codigo_os
 tipo_equipo
 serie
 tipo
 usuario_id
 rol
 fecha
 metadata
}

entity escaneos_equipos {
 * id
 --
 codigo_leido
 tipo_codigo
 estacion
 tipo_equipo
 serie
 codigo_os
 ubicacion_id
 usuario_id
 resultado
 metadata
}

entity os_historial_activo {
 * id
 --
 codigo_os
 tipo_equipo
 serie
 fecha
 evento
 anterior
 actual
}

entity registro_reparaciones {
 * id
 --
 codigo_os
 tecnico_id
 falla_detectada
 accion_realizada
 prueba_realizada
 resultado_prueba
}

entity repuestos {
 * id
 --
 nombre
 categoria
 stock
 stock_critico
}
entity solicitudes_repuestos {
 * id
 --
 codigo_os
 solicitado_por
 estado
 repuesto_solicitado
 comentario
}
entity solicitud_items {
 * id
 --
 solicitud_id
 repuesto_id
 cantidad
}
entity bridge_referencias {
 * id
 --
 tipo_equipo
 serie
 codigo_os
 sistema_externo
 referencia_externa
 creado_por
}
entity bridges
entity bridge_mantenimiento
entity instalaciones_equipos
entity qa_inspecciones
entity guias
entity guia_detalle

usuarios ||--o{ ordenes_servicio
usuarios ||--o{ flujo_eventos
usuarios ||--o{ registro_reparaciones
usuarios ||--o{ solicitudes_repuestos
usuarios ||--o{ bridge_referencias
usuarios ||--o{ validadores
usuarios ||--o{ consolas

validadores ||--o{ ordenes_servicio
consolas ||--o{ ordenes_servicio
casos_operacionales ||--o{ ordenes_servicio
buses ||--o{ ordenes_servicio
terminales ||--o{ ordenes_servicio
pst ||--o{ ordenes_servicio
ubicaciones ||--o{ ordenes_servicio
estados ||--o{ ordenes_servicio

terminales ||--o{ terminal_pst
pst ||--o{ terminal_pst
estados ||--o{ config_estado_ubicacion

ordenes_servicio ||--o{ flujo_eventos
ordenes_servicio ||--o{ escaneos_equipos
ordenes_servicio ||--o{ os_historial_activo
ordenes_servicio ||--o{ registro_reparaciones
ordenes_servicio ||--o{ solicitudes_repuestos
ordenes_servicio ||--o{ bridge_referencias
ordenes_servicio ||--o{ qa_inspecciones

solicitudes_repuestos ||--o{ solicitud_items
repuestos ||--o{ solicitud_items

bridges ||--|| bridge_mantenimiento
bridges ||--|| instalaciones_equipos
guias ||--o{ guia_detalle
ordenes_servicio ||--o{ guia_detalle
@enduml
```

## Notas

- La identidad transversal del activo es `tipo_equipo + serie`.
- `bridges`, `bridge_mantenimiento` e `instalaciones_equipos` se mantienen por compatibilidad histórica; Bridge V2.0 usa `bridge_referencias`.
- El flujo QA V2.0 utiliza principalmente `flujo_eventos`; `qa_inspecciones` mantiene compatibilidad histórica.
- La custodia no se deduce únicamente desde `estado_id`: se combina con ubicación, eventos y evidencia.
