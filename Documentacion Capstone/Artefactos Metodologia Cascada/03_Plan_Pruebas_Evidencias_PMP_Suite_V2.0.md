# 03 — Plan de Pruebas y Evidencias PMP Suite V2.0

## 1. Objetivo

Comprobar requisitos funcionales, RBAC, integridad, custodia, concurrencia, UX e integración.

## 2. Niveles de prueba

### Unitarias / contratos
Validaciones, helpers, autorización y reglas de dominio.

### HTTP / RBAC
Respuestas de rutas según actor y acción.

### Integración DB
Esquema real sobre PostgreSQL efímero.

### E2E
Recorridos completos con aplicación real y dependencias controladas.

### Visual
Responsive, temas, overflow y estados.

### Mobile
Mocks/export + validación física pendiente.

### Manual
Recorrido de usuario sobre entorno habitual controlado.

## 3. Matriz

| Área | Casos |
|---|---|
| Auth | token, cuenta, rol, conflictos |
| Usuarios | alta/edición/último Admin |
| Activos | alta/identidad/recepción |
| Casos | Aranda/Interno/duplicados |
| Terreno | falla/retiro/instalación |
| Bodega | recepción/despachos/stock |
| Lab | recepción/asignación/SLA/trabajo |
| Repuestos | solicitud/entrega/idempotencia |
| QA | etapas/dictamen/salida |
| Bridge | correlación sin operaciones |
| Trazabilidad | serie/OS/referencia |
| Dashboards | conteos únicos |
| IA | JSON/lectura/semántica |
| UX | responsive/tema/feedback |

## 4. Controles negativos

- rol inválido;
- OS ajena;
- evidencia faltante;
- evidencia vieja;
- estación incorrecta;
- activo incompatible;
- transición fuera de estado;
- duplicado;
- reintento con distinto contexto;
- cierre sin prueba;
- repuesto sin PoD;
- stock insuficiente;
- QA legacy;
- autoedición Admin.

## 5. Resultado vigente

- Backend 118/118.
- Web 176/177.
- Mobile 210/210 mocks.
- Build Web aprobado.
- RBAC 99 requests.
- E2E Lab aprobado.
- E2E operacional aprobado.
- Responsive/RBAC 150 renders.

## 6. Pendientes

- fixture Web useAuth;
- cámara/QR dispositivo;
- Safe Area/teclado;
- recorrido QA→Bodega→reinstalación;
- rendimiento/seguridad de cierre.

## 7. Evidencia

Cada caso debe registrar:

- ID;
- versión/commit;
- fecha;
- precondiciones;
- datos;
- actor;
- pasos;
- esperado;
- obtenido;
- estado;
- evidencia.

## 8. Trazabilidad

Consultar `08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md`.
