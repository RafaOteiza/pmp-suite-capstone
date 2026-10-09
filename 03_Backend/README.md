# Backend PMP Suite

**Stack:** Node.js + Express + PostgreSQL + Firebase Admin  
**Estado:** vigente — 09-10-2026

## Función

La API implementa autenticación, autorización, servicios de dominio, custodia física, trazabilidad, administración de usuarios y orquestación de la capa analítica.

## Ejecución

```powershell
cd 03_Backend\pmp-api
npm install
npm run dev
```

API habitual:

```text
http://localhost:4000
GET /api/health
```

## Estructura

- `src/routes/`: contratos HTTP.
- `src/services/`: reglas de negocio.
- `src/security/`: autorización y protección administrativa.
- `src/middleware/`: Firebase, usuario PostgreSQL y guards.
- `src/constants/roles.js`: siete roles oficiales.
- `test/`: suites Node Test Runner.
- `verification/`: E2E y verificaciones aisladas.
- `tools/`: utilidades auxiliares.

## Seguridad

La política de acciones sensibles está en `src/security/authorization.js`.

No existe wildcard Admin. La autorización se revalida por acción y, cuando corresponde, por recurso/asignación.

## Roles

`admin`, `gerente`, `jefe_laboratorio`, `logistica`, `qa`, `tecnico_laboratorio`, `tecnico_terreno`.

## Pruebas

```powershell
npm test
```

La línea de consolidación RBAC del 09-10-2026 documenta **118/118 pruebas backend aprobadas**. Consultar `08_Pruebas/Separacion_Roles_RBAC_2026-10-09.md`.

## Reglas operacionales importantes

- validar evidencia no equivale a confirmar custodia;
- salida y recepción son movimientos distintos;
- la IN se crea al confirmar salida a Terreno;
- Admin no ejecuta movimientos físicos por defecto;
- técnicos solo modifican recursos asignados;
- Bridge correlaciona; no mueve stock;
- errores de dominio no deben exponerse como 500 genérico cuando existe código controlado.

## Variables sensibles

Usar `.env` local y credenciales Firebase fuera del repositorio.
