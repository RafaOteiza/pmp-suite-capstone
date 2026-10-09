# Frontend Web PMP Suite

**Stack:** React 18 + TypeScript + Vite  
**Estado:** vigente — 09-10-2026

## Ejecución

```powershell
cd 04_Frontend
npm install
npm run dev
```

URL habitual: `http://localhost:5173`.

## Organización

- `src/app/rbac.ts`: capacidades por rol.
- `src/app/navigation.ts`: navegación derivada.
- `src/api/`: cliente y contratos HTTP.
- `src/pages/`: vistas.
- `src/components/`: UI compartida.
- `src/styles/`: tokens y estilos de dominio.
- `test/`: regresiones funcionales/visuales.

## Roles y experiencia

La interfaz adapta navegación a cada rol, pero el backend sigue siendo la autoridad.

- Admin: Supervisión global + Usuarios.
- Gerente: Dashboard ejecutivo y consultas.
- Jefe Laboratorio: Gestión de Laboratorio.
- Logística: Bodega y operaciones logísticas.
- QA: Mi trabajo QA.
- Técnico Lab: Mi carga.
- Técnico Terreno: Mi jornada/Mis OS.

## Diseño

PMP Suite conserva Navy, Azul y Turquesa del Brand Kit, con semántica verde/ámbar/rojo/azul/gris.

Objetivos:

- compacto sin `zoom`;
- claro/oscuro;
- responsive;
- sin overflow horizontal;
- foco visible;
- vacíos/errores/carga diferenciados;
- componentes compartidos.

## Pruebas

```powershell
npm test
npm run build
```

La consolidación RBAC del 09-10-2026 registró **176/177 pruebas Web** y build aprobado. El único fallo documentado es un fixture de mock pendiente; no debe ocultarse en la documentación.

## Pendiente UX conocido

En Usuarios y accesos, el editor se renderiza actualmente debajo de la tabla. Funciona, pero su visibilidad debe mejorarse con scroll/foco o patrón equivalente.
