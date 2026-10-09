# Backend PMP Suite

**Versión documental:** V2.0  
**Stack:** Node.js + Express + PostgreSQL + Firebase Admin  
**Actualización:** 09-10-2026

## Función
La API implementa autenticación, autorización, servicios de dominio, custodia física, trazabilidad, administración de usuarios y orquestación de analítica.

## Ejecución
```powershell
cd 03_Backend\pmp-api
npm install
npm run dev
```
API habitual: `http://localhost:4000`. Health: `GET /api/health`.

## Estructura
- `src/routes/`: contratos HTTP.
- `src/services/`: reglas de negocio.
- `src/security/`: autorización.
- `src/middleware/`: identidad y guards.
- `test/`: suite automatizada.
- `verification/`: E2E vigentes.
- `tools/`: utilidades para entornos aislados.

## Seguridad
No existe wildcard Admin. Los servicios revalidan recurso, asignación, estación, ciclo y evidencia cuando corresponde.

## Pruebas
`npm test`. Última línea V2.0: **118/118 aprobadas**. Ver `08_Pruebas/INFORME_PRUEBAS_V2.0.md`.
