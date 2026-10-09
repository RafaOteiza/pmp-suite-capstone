# Arquitectura 02 — Backend V2.0

**Versión:** V2.0  
**Stack:** Node.js + Express + PostgreSQL `pg` + Firebase Admin

## 1. Responsabilidad

El Backend es la autoridad sobre:

- autenticación verificada;
- usuario/rol efectivo;
- autorización;
- reglas de negocio;
- transiciones;
- evidencia;
- transacciones;
- idempotencia;
- persistencia.

El frontend no puede conceder permisos ni decidir por sí solo que una transición es válida.

## 2. Flujo de request

```text
HTTP
→ JSON parser condicionado
→ Firebase Auth
→ ensureUser
→ enforceReadOnlyRole
→ router
→ authorize(action)
→ validación de recurso
→ service
→ transaction
→ response
```

El parser global evita procesar body sensible innecesariamente antes de identidad en ciertas rutas; rutas con fotografías usan límites específicos después de autorización.

## 3. Estructura

### `src/routes/`

Contrato HTTP.

### `src/services/`

Reglas de dominio y SQL.

### `src/security/`

Política por acción y helpers de scope.

### `src/middleware/`

Firebase, usuario PMP, autorización tradicional compatible.

### `src/db.js`

Pool PostgreSQL.

### `src/firebase.js`

Firebase Admin.

## 4. Routers

- auth;
- os;
- requerimientos;
- activos;
- users/admin users;
- dashboard;
- lab;
- qa;
- bodega;
- admin;
- master;
- badges;
- ai;
- bridge;
- equipment scan.

## 5. Servicios

| Servicio | Responsabilidad |
|---|---|
| assetIdentity | reglas modelo/marca |
| assetManagement | alta/recepción inicial |
| initialAssetStock | stock inicial |
| requirements | caso + OS |
| requirementSearch | activos/buses de requerimiento |
| terrainWithdrawal | retiro |
| warehouseReceipt | recepción Bodega |
| warehouseDispatch | instalación/IN |
| warehouseLabDispatch | Bodega→Lab |
| warehouseParts | entrega repuesto |
| logisticsInventory | proyección inventario |
| logisticsPresentation | estados derivados |
| labArrival | tránsito/recepción Lab |
| labCustody | evidencia recepción/salida |
| labReceptionRead | bandeja |
| labSupervision | KPI/carga/SLA |
| labWork | diagnóstico/reparación/pruebas |
| qaCustody | ciclo/custodia QA |
| qaWork | Ambiente/prueba/dictamen/salida |
| equipmentScan | resolución/captura |
| assetHistory | historial completo |
| technicalAssetHistory | proyección Terreno |
| executiveDashboard | KPI ejecutivo |
| bridgeFlow | validadores/helpers transaccionales |

## 6. Patrón de errores

`FlowError(status, code, message)` permite respuestas de dominio.

### Códigos típicos

- VALIDATION_ERROR;
- UNKNOWN_EQUIPMENT;
- PHYSICAL_SCAN_REQUIRED;
- STALE_PHYSICAL_SCAN;
- SCAN_STATION_FORBIDDEN;
- LAB_NOT_ASSIGNED;
- LAB_RECEIPT_REQUIRED;
- LAB_DRAFT_CONFLICT;
- QA_CONFLICT;
- EQUIPMENT_NOT_ELIGIBLE;
- INSUFFICIENT_STOCK;
- DISPATCH_RETRY_CONFLICT.

## 7. Transacciones

`withTransaction`:

1. obtiene client;
2. BEGIN;
3. ejecuta;
4. COMMIT;
5. ROLLBACK en error;
6. release.

### Locks

Se usan:

- `SELECT ... FOR UPDATE`;
- `pg_advisory_xact_lock(hashtext(...))`;
- índices únicos como última barrera.

## 8. Idempotencia

Operaciones críticas guardan:

- ID de evidencia;
- metadata;
- solicitud/fingerprint;
- firma SHA cuando corresponde.

### Reintento idéntico

Puede devolver `duplicado: true`.

### Reintento diferente

409 para impedir reinterpretar la misma evidencia.

## 9. Seguridad

### RBAC

`src/security/authorization.js` contiene POLICY.

### Resource scopes

`permits(action, req)` restringe OS propias en:

- lab.work;
- terrain.work.

### Roles explícitos

No existe wildcard Admin.

### Logs

El audit de autorización excluye secretos/identidad sensible y registra acción/ruta/estado/latencia.

## 10. Evidencia Physical First

El Backend diferencia:

```text
validate*
confirm*
```

Validar crea/consulta evidencia; confirmar revalida y mueve.

## 11. Identidad

El Backend usa tipo+serie y reglas comunes de modelo/marca. Los servicios verifican maestro antes de generar evidencia sobre activo.

## 12. Persistencia histórica

Los cambios relevantes producen eventos append-only. Se evita depender únicamente del valor actual de una fila.

## 13. Compatibilidad legacy

Algunas columnas/tablas/endpoints se conservan para leer historia o responder explícitamente 410. Esto no significa que sean parte del flujo operacional actual.

## 14. API

Catálogo completo: `02_Arquitectura/CATALOGO_API_V2.0.md`.

## 15. Pruebas

- Node Test Runner;
- servicios/helpers;
- HTTP;
- E2E PostgreSQL efímero;
- RBAC aislado;
- verificación read-only cuando corresponde.

## 16. Reglas de mantenimiento

Al agregar una nueva mutación:

1. definir acción;
2. asignar roles mínimos;
3. decidir scope de recurso;
4. definir transacción;
5. definir evidencia/idempotencia;
6. registrar evento;
7. probar caso feliz y denegaciones;
8. actualizar ERS/API/traceability.
