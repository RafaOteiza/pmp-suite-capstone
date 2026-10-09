# 3. Arquitectura Frontend Web

**Versión:** V2.0

## Stack

React 18 + TypeScript + Vite + React Router + Lucide + Recharts.

## Estructura lógica

- `src/app/`: sesión, RBAC y navegación.
- `src/api/`: contratos HTTP.
- `src/pages/`: vistas por proceso.
- `src/components/`: componentes compartidos.
- `src/styles/`: tokens y estilos por dominio.
- `src/utils/`: presentación y derivaciones.
- `test/`: regresión funcional y visual.

## Navegación por capacidades

`src/app/rbac.ts` define roles/permisos de presentación. `src/app/navigation.ts` construye el Sidebar. Esto mejora UX pero **no sustituye el backend**.

### Roles

- Admin: supervisión + usuarios/seguridad.
- Gerente: dashboard ejecutivo y consultas.
- Jefe Laboratorio: gestión del dominio Lab.
- Logística: operación Bodega.
- QA: operación QA.
- Técnico Laboratorio: Mi carga.
- Técnico Terreno: Mi jornada/Mis OS.

## Sistema visual

Componentes base:

- PageHeader
- StatCard
- StatusBadge
- FeedbackBanner
- EmptyState
- tablas/paneles de detalle
- inputs/botones compartidos

Semántica:

- verde: correcto/listo;
- ámbar: pendiente/atención;
- rojo: error/crítico;
- azul: informativo/en curso;
- gris: sin datos/inactivo.

## UX

- densidad compacta sin `zoom`;
- sidebar estable;
- claro/oscuro;
- estados de carga/vacío/error diferenciados;
- foco visible;
- responsive;
- acciones operacionales inline o en página, evitando modales innecesarios.

## Nota de gestión de usuarios

La edición actual se renderiza debajo de la tabla. Funciona, pero es un pendiente UX mejorar la visibilidad automática al abrir el editor.
