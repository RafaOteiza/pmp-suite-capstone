# Frontend Web PMP Suite

**Versión documental:** V2.0  
**Stack:** React 18 + TypeScript + Vite  
**Actualización:** 09-10-2026

## Ejecución
```powershell
cd 04_Frontend
npm install
npm run dev
```
URL habitual: `http://localhost:5173`.

## Organización
`src/app/rbac.ts` define capacidades; `src/app/navigation.ts` arma la navegación; `src/api/`, `src/pages/`, `src/components/` y `src/styles/` contienen la experiencia Web.

## Diseño
Identidad PMP Suite, claro/oscuro, responsive, densidad compacta sin `zoom`, foco visible y feedback inline.

## Pruebas
```powershell
npm test
npm run build
```
Última línea V2.0: **176/177** y build aprobado. El fallo restante es un fixture de mock conocido.

## Pendiente UX
En Usuarios y accesos, el editor aparece debajo de la tabla. Es funcional, pero debe mejorar su visibilidad automática.
