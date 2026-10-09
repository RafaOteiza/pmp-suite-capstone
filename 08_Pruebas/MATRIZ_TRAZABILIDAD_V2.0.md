# Matriz de Trazabilidad — PMP Suite V2.0

**Versión:** V2.0  
**Objetivo:** relacionar requisito, implementación, verificación y evidencia.

## 1. Matriz por dominio

| Grupo | Requisitos | Implementación principal | Verificación |
|---|---|---|---|
| Autenticación | RF-AUT-* | auth.routes, middleware Firebase/ensureUser | Backend tests + RBAC E2E |
| Usuarios | RF-USR-* | users.routes, admin.users.routes | tests Admin/último Admin |
| Maestros | RF-MST-* | master.routes, DB FKs | pruebas de requerimientos |
| Activos | RF-ACT-* | assets.routes, assetManagement, assetIdentity | escenarios activos/recepción |
| Requerimientos | RF-REQ-* | requirements.routes/services | requirements E2E |
| OS | RF-OS-* | DB generar_id_os + services | E2E OS/casos |
| Terreno | RF-TER-* | os.routes, terrainWithdrawal | withdrawal scenarios |
| Bodega | RF-BOD-* | bodega.routes, warehouse* | logistics E2E |
| Laboratorio custodia | RF-LAB-* | lab.routes, labCustody/labReception | lab E2E |
| Trabajo Lab | RF-LTW-* | labWork | tests cierre/avance/repuesto |
| Repuestos | RF-REP-* | warehouseParts | entrega transaccional |
| QA | RF-QA-* | qa.routes, qaCustody/qaWork | QA scenarios/E2E |
| Inventario | RF-INV-* | logisticsInventory/warehouseDispatch | inventory/installation E2E |
| Bridge | RF-BRG-* | bridge.routes, assetHistory | correlation E2E |
| Trazabilidad | RF-TRZ-* | assetHistory/technicalAssetHistory | búsquedas + proyección Mobile |
| Dashboards | RF-DASH-* | executiveDashboard/labSupervision/etc. | KPI/render tests |
| IA | RF-IA-* | ai.routes + analyzer.py | endpoint/JSON |
| UX/Mobile | RF-UX-*, RF-MOB-* | Web pages, Mobile screens | mocks/render/device pendiente |

## 2. Trazabilidad de reglas críticas

| Regla | Código | Dato / evidencia | Prueba esperada |
|---|---|---|---|
| tipo+serie inmutable | assetIdentity + triggers | maestros/OS | intento identidad incompatible bloqueado |
| validar ≠ confirmar | custody/dispatch services | escaneo/evento | validar no cambia OS |
| evidencia por ciclo | requireLatest*Scan | metadata ciclo | evidencia vieja rechazada |
| Admin sin wildcard | authorization.js | POLICY | escrituras operacionales 403 |
| Gerente read-only | authorization.js | POLICY | mutaciones 403 |
| Jefe Lab solo Lab | POLICY + routes | usuario rol | Bodega/QA 403 |
| técnico carga propia | permits(resource) | tecnico_*_id | OS ajena 403 |
| Bridge solo correlación | bridge.routes | bridge_referencias | endpoints legacy 410/ausentes |
| IN en despacho | warehouseDispatch | SALIDA_BODEGA_TERRENO | seleccionar no crea IN |
| stock inicial sin OS | initialAssetStock | HABILITADO_INSTALACION | 0 OS hasta despacho |
| stock no doble consumo | índices + service | stock_origen_* | segundo consumo bloqueado |
| técnico no consume repuesto | labWork | solicitud descriptiva | repuesto_id/cantidad rechazados |
| QA autónomo | qaWork | flujo_eventos | assign legacy 410 |
| dictamen ≠ salida | qaWork/qaCustody | eventos separados | dictamen conserva custodia QA |

## 3. Trazabilidad requisito → endpoint

### Activos

- RF-ACT-001…007 → `GET/POST /api/activos`
- RF-ACT-008…015 → `POST /api/activos/recepcion/validar`, `/recepcion`

### Requerimientos

- RF-REQ-001…018 → `/api/requerimientos`

### Terreno

- RF-TER-001…013 → `/api/os/*`

### Bodega

- RF-BOD-001…013 → `/api/bodega/*`

### Laboratorio

- RF-LAB-* → `/api/lab/reception`, `/custody`, `/assign`
- RF-LTW-* → `/api/lab/work`, `/finish`, `/request-part`

### QA

- RF-QA-* → `/api/qa/*`

### Bridge/Trazabilidad

- RF-BRG-* → `/api/bridge/*`
- RF-TRZ-* → Bridge/history/global search + technical history

## 4. Evidencia de calidad

Última línea documentada:

- Backend 118/118.
- Web 176/177.
- Mobile 210/210 con mocks.
- RBAC aislado: 99 requests.
- E2E Lab: aprobado.
- E2E operacional integral: aprobado.
- render responsive: 150 casos.

## 5. Pendientes trazados

| Pendiente | Requisito afectado | Estado |
|---|---|---|
| fixture Web useAuth | RNF mantenibilidad/pruebas | pendiente |
| cámara/QR en dispositivo | RF-TER, RF-MOB | pendiente físico |
| Safe Area/teclado real | RNF UX Mobile | pendiente físico |
| recorrido QA→Bodega→reinstalación manual | RF-QA/RF-INV | pendiente manual |
| rendimiento/seguridad dedicado | RNF-PER/RNF-SEC | pendiente de repetición |

## 6. Criterio de cierre

Un requisito se considera:

- **Implementado:** existe código/ruta/BD.
- **Verificado:** existe prueba reproducible.
- **Validado manualmente:** recorrido humano documentado.
- **Pendiente:** falta alguna evidencia requerida.

No se utiliza “completado” como sinónimo de “implementado” cuando falta validación.
