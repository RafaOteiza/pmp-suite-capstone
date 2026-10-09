# EV-OP-001 — Flujo operacional con validación física

## Identificación

| Campo | Valor |
|---|---|
| Fecha | 14 de septiembre de 2026 |
| Proyecto | PMP Suite |
| Tipo | Integración E2E sobre base aislada |
| Script | `03_Backend/pmp-api/verification/equipment_scan_flow_e2e.mjs` |
| Resultado final | APROBADO |

## Objetivo

Comprobar el recorrido de un validador desde terreno hasta su asignación final
para instalación, validando la identidad física por serie o AMID en cada
estación y respetando la responsabilidad de cada rol.

## Aislamiento

El script creó un clúster PostgreSQL efímero, copió solamente el esquema de la
base principal e insertó fixtures propias. Al finalizar comprobó que la base
principal no había cambiado, detuvo el clúster temporal y eliminó sus archivos.

## Datos controlados

| Dato | Valor |
|---|---|
| Tipo | VALIDADOR |
| Serie | `7405020` |
| AMID | `280000050209` |
| Bus | `E2ESF001` |
| OS de mantenimiento | `MV-000001` en el entorno efímero |
| OS de instalación | `IN-000001` en el entorno efímero |

## Secuencia validada

| Paso | Actor | Acción | HTTP | Estado resultante |
|---:|---|---|---:|---|
| 1 | Técnico de terreno | Escanea serie/AMID y crea la OS | 201 | EN_TRANSITO (2) |
| 2 | Logística | Escanea y confirma recepción en bodega | 200 | EN_BODEGA (3) |
| 3 | Admin + logística | Admin asigna técnico; logística despacha a laboratorio | 200 | EN_DIAGNOSTICO (4) |
| 4 | Admin + técnico de laboratorio | Admin escanea y recibe; técnico diagnostica y repara | 200 | FINALIZADO_TALLER (10) |
| 5 | Admin | Como jefe de laboratorio, despacha a bodega | 200 | EN_TRAYECTO_BODEGA (11) |
| 6 | Logística | Recibe, asigna responsable QA y despacha | 200 | EN_QA (6) |
| 7 | QA | Escanea, prueba y aprueba | 200 | EN_TRAYECTO_BODEGA (11) |
| 8 | Logística | Escanea y recibe el equipo aprobado | 200 | OS original cerrada; equipo disponible |
| 9 | Logística | Escanea y asigna la OS de instalación a terreno | 200 | EN_RUTA (1) |

## Controles negativos aprobados

| Caso | Resultado esperado y obtenido |
|---|---|
| Recepción en bodega sin escaneo | 409 `PHYSICAL_SCAN_REQUIRED` |
| Inicio de reparación sin escaneo en laboratorio | 409 `PHYSICAL_SCAN_REQUIRED` |
| Escaneo QA antes del despacho físico | 409 `UNEXPECTED_SCAN_STATION` |
| Despacho a QA sin responsable activo | 422 `QA_ASSIGNEE_REQUIRED` |

## Auditoría final

- Escaneos validados: 6.
- Escaneos rechazados registrados: 1.
- Estaciones cubiertas: bodega, laboratorio y QA.
- Reparaciones registradas: 1.
- Hallazgos pendientes del flujo: 0.
- Base principal sin cambios: confirmado.
- Clúster temporal eliminado: confirmado.

## Hallazgo y corrección del guion

La primera ejecución intentó que el técnico de laboratorio confirmara la
recepción física y obtuvo 403. La regla vigente indica que el admin actúa como
jefe de laboratorio: recibe y despacha físicamente, mientras el técnico ejecuta
diagnóstico y reparación. Se corrigió únicamente el actor del guion E2E; no se
ampliaron los permisos del técnico.

## Comando reproducible

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\03_Backend\pmp-api
node verification/equipment_scan_flow_e2e.mjs
```

No debe sustituirse este procedimiento por `e2e_full_v2.js` o
`stress_test.js` sobre la base principal.
