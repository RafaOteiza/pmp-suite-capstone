# 02 — Documento de Diseño PMP Suite V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026  
**Arquitectura maestra:** `02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md`

## 1. Objetivo

Definir cómo PMP Suite implementa los requisitos vigentes: arquitectura lógica, componentes, seguridad, datos, custodia, eventos, estados, integraciones, concurrencia, Web, Mobile y despliegue.

## 2. Vista de contexto

~~~mermaid
flowchart LR
 TT[Técnico Terreno] --> MOB[Mobile]
 USR[Admin / Gerente / Logística / Lab / QA] --> WEB[Web]
 MOB --> API[API Node/Express]
 WEB --> API
 API --> DB[(PostgreSQL pmp)]
 API --> FB[Firebase]
 API --> PY[Analizador Python]
 PY --> DB
 EXT[Aranda / referencia externa] -. ingreso asistido .-> API
~~~

PMP Suite no delega reglas críticas a clientes Web/Mobile. Ambos son canales de presentación; la autoridad de negocio está en API/BD.

## 3. Contenedores

| Contenedor | Tecnología | Responsabilidad |
|---|---|---|
| Web | React 18, TypeScript, Vite | operación, supervisión, administración |
| Mobile | Expo SDK 57, React Native | Terreno y cuenta personal |
| API | Node.js, Express | reglas, Auth/RBAC, transacciones |
| PostgreSQL | esquema pmp | persistencia, constraints, eventos |
| Firebase | Auth/Admin SDK | identidad/credenciales |
| Python | pandas/psycopg2 | heurística de lectura |
| Shared | JS compartido | reglas de identidad de activo |

## 4. Capas de Backend

~~~text
Route
↓
Firebase Auth
↓
ensureUser PostgreSQL
↓
enforceReadOnlyRole / authorize(action)
↓
Service de dominio
↓
Transacción / locks / validación
↓
PostgreSQL + evento/evidencia
~~~

### 4.1 Routers principales

auth, os, requerimientos, activos, users/admin users, dashboard, lab, qa, bodega, admin, master, ai, bridge y equipment-scan.

### 4.2 Servicios principales

| Servicio | Responsabilidad |
|---|---|
| assetIdentity | identidad tipo/serie/modelo/marca |
| assetManagement | alta y consulta de activos |
| initialAssetStock | recepción/habilitación inicial |
| requirements | caso + OS + referencia |
| requirementSearch | activos/buses elegibles |
| terrainWithdrawal* | retiro y evidencia Terreno |
| warehouseReceipt | recepción Bodega |
| warehouseDispatch | despacho instalación / IN |
| warehouseLabDispatch | salida a Lab |
| warehouseQueue | cola Bodega |
| logisticsInventory | parque/stock/elegibilidad |
| logisticsPresentation | estados derivados |
| warehouseParts | repuestos/solicitudes |
| labArrival | ciclo/recepción Lab |
| labCustody | Physical First Lab |
| labReceptionRead | bandeja recepción |
| labSupervision | KPI/SLA/carga |
| labWork | diagnóstico/reparación/pruebas |
| qaCustody | ciclo/custodia QA |
| qaWork | etapas QA |
| equipmentScan | resolución/captura |
| assetHistory | historial completo |
| technicalAssetHistory | proyección técnica |
| executiveDashboard | KPI ejecutivo |
| bridgeFlow | errores/compatibilidad Bridge |

## 5. Seguridad

### 5.1 Identidad

Firebase valida la credencial. PostgreSQL valida existencia, estado activo, coherencia UID/correo y rol oficial.

### 5.2 Autorización

`src/security/authorization.js` define acciones explícitas. No existe wildcard Admin.

| Acción | Actor |
|---|---|
| users.manage | Admin |
| supervision.read | Admin/Gerente |
| warehouse.move | Logística |
| lab.custody | Jefe Lab |
| lab.assign | Jefe Lab |
| lab.work | Técnico Lab |
| qa.work | QA |
| terrain.assign | Logística |
| terrain.work | Técnico Terreno |
| bridge.link | Logística |

### 5.3 Scope

El rol no basta. Los servicios revalidan técnico asignado, OS/activo, estación, propósito, ciclo, evidencia, stock origen y transición.

### 5.4 Trust boundaries

| Frontera | Política |
|---|---|
| UI → API | cliente no confiable |
| Firebase → API | identidad, no rol operacional |
| API → DB | única ruta de negocio |
| captura física → estado | evidencia antes de confirmación |
| Python → DB | lectura |
| logs | sin token/contraseña/identificadores sensibles |

## 6. Identidad de activos

~~~text
VALIDADOR 72… → CVB35 / Mikroelektronika
VALIDADOR 74… → CVB45 / Mikroelektronika
VALIDADOR 75… → CVB45 / Mikroelektronika
CONSOLA        → N9715 / Waysion
~~~

Prefijo de validador desconocido es inválido. Modelo/marca derivados no deben pedirse al usuario. Identidad lógica = `(tipo_equipo, serie)`. AMID es identificador alternativo de validador y luego se resuelve a serie.

## 7. Diseño Physical First

### 7.1 Patrón

~~~text
resolver contexto
→ capturar identificador
→ resolver activo
→ validar estación/propósito/ciclo
→ generar evidencia
→ confirmar operación
→ transición + evento
~~~

### 7.2 Motivación

Evita que leer una serie mueva stock, seleccionar técnico cree IN, una recepción antigua autorice salida o una pestaña vieja confirme el ciclo actual.

### 7.3 Evidencia

Puede incluir tipo/serie, AMID/código, estación, usuario/rol, OS, ubicación, resultado, motivo, fecha, metadata de propósito/ciclo y origen de captura. La contingencia manual debe quedar explícita/auditada.

## 8. Estados y custodia

PMP Suite separa:

1. estado persistido — `estado_id`;
2. custodia/evidencia — ubicación + eventos + escaneos;
3. estado presentado — proyección derivada.

Estados derivados incluyen PENDIENTE_RETIRO, ASIGNADO_TECNICO, EN_RUTA, En camino Lab, Recibido Lab, Espera repuesto, DISPONIBLE_INSTALACION, etapas QA y En operación.

## 9. Eventos

`pmp.flujo_eventos` es append-only y funciona como hilo temporal.

Eventos relevantes: ALTA_ACTIVO, RECEPCION_INICIAL, HABILITADO_INSTALACION, REQUERIMIENTO_INGRESADO, RETIRO_TERRENO_CONFIRMADO, SALIDA_BODEGA_LABORATORIO, RECEPCION_LABORATORIO_CONFIRMADA, eventos de trabajo Lab, LOGISTICA_ENTREGA_REPUESTO, SALIDA_LABORATORIO_BODEGA, SALIDA_BODEGA_QA, eventos QA, SALIDA_QA_BODEGA, SALIDA_BODEGA_TERRENO e INSTALACION_COMPLETADA.

## 10. Modelo de datos

El esquema `pmp` contiene 26 tablas clasificadas.

### Maestros/configuración

`estados`, `ubicaciones`, `usuarios`, `terminales`, `pst`, `terminal_pst`, `buses`, `config_estado_ubicacion`, `repuestos`.

### Operacionales/históricas

`bridge_mantenimiento`, `bridge_referencias`, `bridges`, `casos_operacionales`, `consolas`, `escaneos_equipos`, `flujo_eventos`, `guia_detalle`, `guias`, `instalaciones_equipos`, `ordenes_servicio`, `os_historial_activo`, `qa_inspecciones`, `registro_reparaciones`, `solicitud_items`, `solicitudes_repuestos`, `validadores`.

Diccionario: `MODELO_DATOS_DICCIONARIO_V2.0.md`.

## 11. Relaciones de dominio

~~~mermaid
erDiagram
 USUARIOS ||--o{ ORDENES_SERVICIO : asigna
 CASOS_OPERACIONALES ||--o{ ORDENES_SERVICIO : agrupa
 VALIDADORES ||--o{ ORDENES_SERVICIO : identifica
 CONSOLAS ||--o{ ORDENES_SERVICIO : identifica
 ORDENES_SERVICIO ||--o{ FLUJO_EVENTOS : genera
 ORDENES_SERVICIO ||--o{ ESCANEOS_EQUIPOS : evidencia
 ORDENES_SERVICIO ||--o{ OS_HISTORIAL_ACTIVO : audita
 ORDENES_SERVICIO ||--o{ REGISTRO_REPARACIONES : trabajo
 ORDENES_SERVICIO ||--o{ SOLICITUDES_REPUESTOS : solicita
 SOLICITUDES_REPUESTOS ||--o{ SOLICITUD_ITEMS : contiene
 REPUESTOS ||--o{ SOLICITUD_ITEMS : referencia
 ORDENES_SERVICIO ||--o{ BRIDGE_REFERENCIAS : correlaciona
~~~

## 12. Casos y OS

Caso = necesidad operacional; OS = intervención concreta.

- MV: mantenimiento Validador.
- MC: mantenimiento Consola.
- PDV/PDC: PoD.
- IN: instalación.

Código se genera Backend/BD. La identidad de activo y relaciones críticas de una OS son inmutables.

## 13. Stock

### 13.1 Inicial

~~~text
ALTA_ACTIVO → recepción inicial → HABILITADO_INSTALACION
origen = flujo_eventos.id
~~~

No existe OS previa.

### 13.2 Reparado

~~~text
OS mantenimiento → Lab → QA Operativo → recepción Bodega
origen = stock_origen_os
~~~

### 13.3 Consumo

Al confirmar despacho de instalación se valida origen, se bloquea/revalida, se crea IN, se registra SALIDA_BODEGA_TERRENO y el origen queda consumido. No se permite doble consumo.

## 14. Repuestos

Técnico Lab identifica/desarrolla necesidad técnica. Logística selecciona repuesto/cantidad, valida categoría/stock, confirma entrega, descuenta stock y audita. El cierre técnico no consume stock.

## 15. Laboratorio

Jefe Lab: recepción, incidencias, asignación, SLA/carga y salida.

Técnico Lab: diagnóstico, falla real, intervenciones, pruebas Manual/Test MK, avance, solicitud de necesidad y cierre.

SLA comienza en recepción física Lab del ciclo actual.

## 16. QA

~~~text
RECEPCION → AMBIENTE → PRUEBAS → DICTAMEN → SALIDA
~~~

QA toma su trabajo. Admin no asigna. Dictamen ≠ salida. Rechazo exige motivo y luego de salida/recepción Bodega inicia nuevo ciclo físico hacia Lab.

## 17. Bridge

Bridge V2.0 = correlación tipo + serie + OS PMP + sistema externo + referencia. No crea OS, no asigna, no repara y no mueve stock. Rutas operacionales antiguas responden 410.

## 18. Trazabilidad

Combina OS, historial de OS, eventos, escaneos, reparación, QA, casos, referencias e instalaciones. La proyección para Terreno/Jefe Lab restringe información según contexto.

## 19. Arquitectura Web

- AppLayout/Sidebar/TopBar;
- páginas por dominio;
- componentes compartidos;
- API clients;
- RBAC de presentación;
- ProtectedRoute;
- procesos en páginas/paneles inline;
- autocompletado de contexto;
- campos derivados readonly;
- temas y responsive.

## 20. Arquitectura Mobile

Login, Home/Mi jornada, Mis órdenes, nueva falla, retiro, instalación, historial técnico y settings/perfil/seguridad/apariencia. Consume misma API/token Firebase; no replica autoridad de negocio.

## 21. API

El catálogo `02_Arquitectura/CATALOGO_API_V2.0.md` documenta rutas activas, bloqueadas y retiradas, con permisos y propósito.

## 22. Integraciones

- Firebase: identidad/credenciales.
- PostgreSQL: persistencia y rol efectivo.
- Aranda: correlación asistida, no integración automática.
- Python: heurística de lectura.

## 23. Concurrencia e idempotencia

Según dominio se utilizan transacciones, `FOR UPDATE`, advisory locks, índices únicos, revisión/ciclo, fingerprints y eventos append-only.

Se distingue reintento idéntico, reintento incompatible, evidencia stale y doble consumo.

## 24. Errores

| HTTP | Uso |
|---:|---|
| 401 | autenticación |
| 403 | autorización/scope |
| 404 | recurso |
| 409 | conflicto estado/custodia/evidencia |
| 410 | flujo retirado |
| 422 | regla de negocio |
| 500 | fallo inesperado |

Un fallo no se convierte silenciosamente en KPI 0.

## 25. Despliegue de desarrollo

~~~text
Web :5173 ─┐
           ├─ API :4000 ─ PostgreSQL :5432
Mobile ────┘       │
                   ├─ Firebase
                   └─ Python
~~~

Ubuntu/Nginx/PM2 es alternativa de servidor, no producción certificada.

## 26. Decisiones arquitectónicas

| Decisión | Justificación |
|---|---|
| PostgreSQL autoridad de rol | evitar claims obsoletos |
| API autoridad de negocio | clientes no confiables |
| Physical First | alinear realidad física/digital |
| append-only | auditoría |
| Jefe Lab independiente | segregación |
| QA autónomo | responsabilidad real |
| Bridge correlación-only | evitar doble motor |
| stock inicial sin OS | no inventar mantenimiento |
| IN al despacho | representar hecho real |
| proyección por rol | mínimo privilegio |

## 27. Diagramas

C4, componentes, comunicación, ERD, casos de uso, clases, secuencia, BPMN AS-IS y BPMN TO-BE forman parte de la documentación V2.0.

## 28. Fuente de verdad

| Tipo | Fuente |
|---|---|
| requisito | ERS V2.0 |
| permiso | authorization.js + guards |
| estructura | PostgreSQL + migraciones |
| identidad | shared/assetIdentity.js + Backend |
| flujo | services + eventos + BPMN |
| API | routers + catálogo |
| validación | pruebas V2.0 |
