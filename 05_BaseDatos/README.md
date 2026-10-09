# Base de Datos PMP Suite V2.0

**Versión documental:** V2.0  
**Motor:** PostgreSQL  
**Esquema:** `pmp`

## 1. Objetivo

Persistir maestros, activos, OS, casos, evidencia, eventos, reparación, QA, stock, referencias y auditoría.

## 2. Modelo

La V2.0 documenta **26 tablas clasificadas** en maestros/configuración y operación/historia.

Diccionario completo:

`02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md`.

ERD:

`02_Arquitectura/Arquitectura_07_Base_Datos_ERD_V2.0.md`.

## 3. Migraciones vigentes

### Bridge

- schema inicial;
- identificación física;
- correlación externa.

### Requerimientos

- casos operacionales;
- OS independientes;
- gestión de activos;
- recepción inicial sin OS.

## 4. Integridad

- PK/FK;
- CHECK;
- UNIQUE;
- índices parciales;
- triggers;
- append-only;
- identidad inmutable;
- secuencias;
- locks transaccionales.

## 5. Identidad

- Validador serie 72 → CVB35.
- Validador 74/75 → CVB45.
- Consola → N9715.
- Identidad transversal = tipo+serie.

## 6. Historial

Tablas/eventos principales:

- `flujo_eventos`;
- `os_historial_activo`;
- `escaneos_equipos`;
- `registro_reparaciones`;
- `bridge_referencias`.

## 7. Stock

Equipos:

- origen inicial = evento;
- origen reparado = OS.

Repuestos:

- `repuestos`;
- `solicitudes_repuestos`;
- `solicitud_items`.

## 8. Aplicación de cambios

Antes de migrar:

1. respaldo;
2. verificar restauración;
3. revisar SQL;
4. dry-run si existe;
5. aplicar en orden;
6. verificar;
7. ejecutar tests.

## 9. Base habitual

No debe recibir:

- pruebas destructivas;
- stress;
- reset;
- fixtures masivos no autorizados.

Los E2E usan PostgreSQL efímero/desechable.

## 10. Backups

Backups son artefactos locales/operacionales y no deben mantenerse en Git.

## 11. Fuente de verdad

La documentación ayuda a entender, pero el esquema físico real + migraciones son la autoridad definitiva.
