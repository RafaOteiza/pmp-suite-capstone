# 2. Arquitectura Backend

**Versión:** V2.0

## Stack

Node.js + Express + PostgreSQL `pg` + Firebase Admin SDK.

## Capas

```text
Routes
  ↓
Middleware de identidad / autorización
  ↓
Services de dominio
  ↓
PostgreSQL
```

### Middleware

Las rutas protegidas aplican autenticación Firebase y resolución del usuario PostgreSQL. Las acciones sensibles usan `src/security/authorization.js`, cuya política es explícita y de denegación por defecto.

No existe wildcard de Administrador.

### Servicios de dominio relevantes

- identidad y gestión de activos;
- requerimientos/casos;
- retiro Terreno;
- recepción y despacho Bodega;
- inventario logístico;
- custodia y trabajo Laboratorio;
- custodia y trabajo QA;
- Bridge/correlación;
- historial técnico;
- supervisión ejecutiva.

## Transacciones

Movimientos físicos, creación de IN, entrega de repuestos y administración sensible deben revalidar dentro de la transacción y aplicar bloqueos cuando corresponde.

## Custodia

```text
validar evidencia
≠
confirmar movimiento
```

La validación identifica el activo/contexto. Solo la confirmación autorizada cambia el estado/custodia y registra eventos.

## Errores

Los servicios usan errores de dominio para diferenciar:

- evidencia faltante/antigua;
- transición incompatible;
- recurso no asignado;
- falta de permisos;
- conflicto de identidad;
- repetición incompatible.

## Seguridad

- Firebase UID no sustituye el rol PostgreSQL.
- No registrar body sensible, token ni contraseña en logs de autorización.
- Técnicos se validan contra la asignación real de la OS.
- Admin no recibe permisos operacionales implícitos.
