# Arquitectura 03 — Frontend Web V2.0

**Versión:** V2.0  
**Stack:** React 18 + TypeScript + Vite + React Router + Recharts + Lucide

## 1. Responsabilidad

La Web presenta procesos y supervisión según el rol autenticado, consume la API y aplica validaciones UX. No implementa la autoridad final de negocio.

## 2. Estructura

| Carpeta | Función |
|---|---|
| `src/app` | sesión, RBAC, navegación, tema |
| `src/api` | cliente/contratos |
| `src/pages` | procesos/pantallas |
| `src/components` | UI reutilizable |
| `src/styles` | tokens/estilos |
| `src/utils` | presentación/formatos |
| `test` | pruebas/regresiones |

## 3. Rutas

### General

- `/`
- `/mi-jornada`
- `/settings`

### Administración/supervisión

- `/admin/users`
- `/operacion/os`
- `/equipos-operativos`
- `/trazabilidad`
- `/ia/predicciones`

### Operación

- `/operacion/requerimientos`
- `/operacion/retiros`
- `/operacion/activos`
- `/operacion/escaneo`
- `/bridge`

### Laboratorio

- `/lab/dashboard`
- `/lab/recepcion`
- `/lab/asignacion`
- `/lab/validadores`
- `/lab/consolas`
- `/lab/reportes`
- `/lab/custodia/:osId/:step`
- `/mi-carga/:osId`

### Bodega

- `/bodega/dashboard`
- `/bodega`
- `/bodega/modulos`
- `/bodega/despacho`
- `/bodega/repuestos`
- páginas de recepción/envío por OS.

### QA

- `/qa`
- `/qa/:osId/:step`

## 4. RBAC de presentación

`src/app/rbac.ts` define permisos UI. `ProtectedRoute` bloquea navegación no autorizada.

La Web no pasa un rol “confiable” para elevar permisos; la API vuelve a resolverlo.

## 5. Navegación

`navigation.ts` agrupa secciones por capacidad.

Objetivo:

- evitar opciones que el usuario no puede ejecutar;
- separar supervisión de operación;
- mantener “Mi jornada” para roles ejecutores;
- enviar Jefe Lab directamente al resumen Lab;
- enviar Logística a Dashboard Bodega.

## 6. Patrón UX operacional

**Proceso = página.**

En flujos largos se prefieren:

- panel de contexto;
- formulario;
- feedback inline;
- confirmación explícita;
- resumen final.

No usar modal para procesos completos.

## 7. Autocompletado

Datos conocidos se completan de forma bidireccional cuando existe relación inequívoca:

- serie;
- PPU;
- terminal;
- operador;
- modelo;
- marca;
- OS.

Campos derivados se presentan readonly.

## 8. Componentes base

- PageHeader;
- StatCard;
- StatusBadge;
- FeedbackBanner;
- EmptyState;
- tablas;
- paneles;
- inputs/buttons.

## 9. Estados de datos

Cada pantalla debe distinguir:

- initial/loading;
- loaded con datos;
- loaded vacío;
- error;
- forbidden.

No representar error como `0` o `[]`.

## 10. Tema

- Claro;
- Oscuro.

Tokens Brand Kit:

- Navy #0D1B2A;
- Blue #1565C0;
- Teal #00B4B0.

Semántica:

- verde éxito;
- ámbar pendiente;
- rojo error;
- azul información;
- gris neutral.

## 11. Responsive

Objetivos:

- sin overflow horizontal accidental;
- tablas adaptables;
- sidebar estable desktop;
- densidad compacta;
- foco visible;
- targets adecuados.

## 12. Dashboards

Los KPI se reciben/derivan desde fuentes coherentes y se presentan con semáforo. No se recalculan conceptos de negocio diferentes a Backend.

## 13. Gestión de usuarios

Tabla de usuarios + editor inline. La edición actualmente se muestra bajo la tabla; funciona, pero queda pendiente mejorar scroll/foco.

## 14. QA

“Mi trabajo QA” prioriza progresive disclosure:

- contexto esencial;
- etapa;
- acción;
- detalles expandibles.

## 15. Trabajo Lab

Página dedicada por OS, no modal. Mantiene revisión de borrador y evita pérdida accidental de cambios.

## 16. Calidad

Pruebas:

- componentes;
- roles;
- render responsive;
- temas;
- navegación;
- contratos API.

Último resultado: 176/177; un fixture useAuth conocido permanece pendiente.
