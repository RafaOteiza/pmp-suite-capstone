# RBAC, Identidad y Seguridad — V2.0

## Roles oficiales

| Rol | Alcance |
|---|---|
| `admin` | usuarios, roles, seguridad y supervisión |
| `gerente` | consulta ejecutiva |
| `jefe_laboratorio` | custodia, asignación y supervisión Lab |
| `logistica` | Bodega, inventario, repuestos y despachos |
| `qa` | operación QA |
| `tecnico_laboratorio` | trabajo técnico asignado |
| `tecnico_terreno` | instalaciones, retiros y fallas propias |

## Cadena de autorización

```text
Firebase
→ usuario PostgreSQL
→ estado activo / rol efectivo
→ authorize(action)
→ validación de recurso/asignación/ciclo
→ handler
```

PostgreSQL es la autoridad del rol. Claims, body o query no conceden permisos.

## Controles

- denegación por defecto;
- Admin sin wildcard operacional;
- Gerente sin escrituras;
- Jefe Laboratorio sin operaciones Bodega/QA/Terreno;
- técnicos limitados por asignación;
- protección del último Admin activo;
- bloqueo de autoedición de rol/estado;
- conflictos UID/correo bloquean acceso;
- logs de autorización sin tokens ni contraseñas.

## Verificación

La suite Backend V2.0 registró 118/118 pruebas. El E2E RBAC aislado registró 99 solicitudes aprobadas, incluyendo denegaciones por dominio, identidad falsificada, protección del último Admin y transferencia de rol.
