# Arquitectura 06 — Flujos de Datos V2.0

**Versión:** V2.0

## 1. Login

```text
Usuario
→ Firebase
→ ID Token
→ API
→ pmp.usuarios
→ rol/activo
→ sesión autorizada
```

## 2. Alta y recepción inicial

```text
Formulario activo
→ POST /activos
→ maestro + ALTA_ACTIVO
→ validar captura Bodega
→ confirmar recepción
→ RECEPCION_INICIAL
→ HABILITADO_INSTALACION
```

No aparece una OS hasta un despacho real.

## 3. Requerimiento

```text
buscar activo operativo
→ seleccionar
→ autocompletar bus/terminal/PST
→ validar contexto
→ crear caso
→ crear OS
→ correlacionar referencia
→ REQUERIMIENTO_INGRESADO
```

## 4. Retiro Terreno

```text
Logística asigna
→ Técnico recibe OS
→ validar identidad
→ confirmar retiro
→ evento/evidencia
→ tránsito Bodega
```

## 5. Recepción Bodega

```text
cola
→ validar captura BODEGA
→ revalidar estado
→ confirmar
→ ubicación/custodia Bodega
```

## 6. Bodega→Lab

```text
OS en Bodega
→ validar salida
→ confirmación
→ SALIDA_BODEGA_LABORATORIO
→ tránsito
```

## 7. Recepción Lab / SLA

```text
En camino
→ Jefe Lab valida en estación LABORATORIO
→ confirma
→ RECEPCION_LABORATORIO_CONFIRMADA
→ ciclo recibido
→ SLA
```

## 8. Asignación Lab

```text
OS recibida
→ Jefe selecciona técnico activo
→ UPDATE tecnico_laboratorio_id
→ Mi carga
```

No existe movimiento físico.

## 9. Trabajo Lab

```text
Mi carga
→ start
→ LAB_TRABAJO_INICIADO
→ save draft/revision
→ diagnóstico
→ acciones
→ pruebas
→ finish
→ registro_reparaciones
→ LAB_REPARACION_FINALIZADA
→ LAB_LISTO_QA
```

### Con repuesto

```text
PoD
→ necesidad/motivo
→ solicitudes_repuestos
→ espera
→ Bodega entrega
→ stock--
→ evento entrega
→ vuelve a reparación
```

## 10. Lab→Bodega→QA

Cada flecha física tiene:

1. evidencia origen/destino correspondiente;
2. confirmación;
3. evento;
4. estado/custodia.

```text
Lab salida
→ tránsito
→ Bodega recepción
→ Bodega salida QA
→ tránsito
→ QA recepción
```

## 11. QA

```text
recepción
→ snapshot/ciclo
→ Ambiente
→ pruebas
→ dictamen
→ evidencia salida
→ salida
```

### Rechazado

```text
QA salida
→ Bodega recibe
→ Bodega despacha Lab
→ nuevo ciclo Lab
```

### Operativo

```text
QA salida
→ Bodega recibe
→ stock reparado elegible
```

## 12. Nueva instalación

### Preparación

El cliente obtiene destinos/elegibles.

### Validación

Captura identifica el activo y fija contexto.

### Confirmación

```text
transacción
→ lock origen stock
→ validar técnico/bus/terminal/PST
→ INSERT IN
→ SALIDA_BODEGA_TERRENO
→ commit
```

## 13. Completar instalación

```text
Técnico Terreno
→ OS propia IN
→ confirmar instalación
→ evento
→ activo en operación
```

## 14. Historial

```text
tipo+serie
→ OS
→ os_historial
→ flujo_eventos
→ scans
→ reparación
→ referencias
→ timeline
```

Luego se aplica una proyección según rol.

## 15. Dashboard

```text
consultas read-only
→ CTE/proyecciones asset-centric
→ KPI
→ JSON
→ cards/gráficos
```

No modificar datos al consultar.

## 16. IA

```text
Web
→ API ai
→ spawn Python
→ DB SELECT
→ JSON
→ Web
```

## 17. Principio de consistencia

Los flujos V2.0 evitan inferir hechos físicos a partir de una acción de pantalla. Solo un evento confirmado por Backend representa el hecho de negocio.
