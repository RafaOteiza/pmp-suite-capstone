# Autenticación, usuarios y RBAC

**Estado:** vigente — 09-10-2026

## Contrato de identidad

1. Firebase Authentication valida credenciales e identidad.
2. El backend verifica que la cuenta esté vinculada a un usuario activo en `pmp.usuarios`.
3. PostgreSQL define el rol efectivo.
4. La política backend autoriza una acción concreta.
5. Los servicios aplican restricciones adicionales por recurso/asignación/ciclo.

No se corrigen vínculos UID/correo durante el login. Una inconsistencia debe bloquear el acceso y resolverse administrativamente.

## Roles oficiales

`admin`, `gerente`, `jefe_laboratorio`, `logistica`, `qa`, `tecnico_laboratorio`, `tecnico_terreno`.

## Requisitos funcionales

- **RF-AU-01:** iniciar sesión con Firebase.
- **RF-AU-02:** rechazar cuenta inexistente/inactiva/conflictiva en PostgreSQL.
- **RF-AU-03:** Admin puede listar, crear y editar usuarios autorizados.
- **RF-AU-04:** Crear usuario exige correo, nombre, apellido y rol oficial; contraseña inicial es opcional.
- **RF-AU-05:** Si Admin entrega contraseña al crear, debe tener al menos 8 caracteres.
- **RF-AU-06:** Contraseñas nunca se guardan en PostgreSQL.
- **RF-AU-07:** Admin puede generar recuperación o establecer una contraseña mediante Firebase según las rutas autorizadas.
- **RF-AU-08:** El usuario autenticado puede cambiar su propia contraseña en Seguridad personal.
- **RF-AU-09:** La navegación Web se deriva de capacidades, pero backend es la autoridad final.
- **RF-AU-10:** No se permite autoedición de rol/estado desde la gestión administrativa.
- **RF-AU-11:** No se puede retirar/desactivar el último Admin activo.
- **RF-AU-12:** Gerente es de solo lectura operacional.
- **RF-AU-13:** Admin no posee wildcard de operaciones físicas.
- **RF-AU-14:** Técnicos solo pueden operar recursos propios/asignados.

## Alta de usuario

El flujo normal desde **Usuarios y accesos** crea una nueva identidad en Firebase y registra su `firebase_uid` en PostgreSQL dentro del proceso autorizado. Si el correo ya está registrado en PMP o la identidad Firebase ya existe sin vínculo explícito, el alta no debe fusionarla silenciosamente.

Campos del registro PMP:

- `id`: UUID de PostgreSQL.
- `nombre`, `apellido`, `correo`.
- `rol`.
- `activo`.
- `firebase_uid`.

## Edición

Admin puede editar nombre, apellido, correo, rol y estado de otra cuenta. Los cambios que corresponden a Firebase se sincronizan mediante Admin SDK; la autorización y protección del último administrador se revalidan dentro de la transacción.

## Seguridad personal

La pantalla de `/settings` corresponde a **seguridad personal**, no a una configuración global del sistema. El usuario puede actualizar su propia contraseña conforme a la política vigente.

## Requisitos no funcionales

- Tokens y contraseñas no se registran en logs.
- Las decisiones sensibles se auditan sin body ni credenciales.
- El token vigente se obtiene del SDK; solo lecturas son candidatas a repetición automática tras refresh.
- 401, 403, red y error servidor se presentan como estados distintos.
- Al cambiar de identidad se descarta el contexto autorizado de la sesión anterior.

## Política backend vigente

La autorización sensible se centraliza en `src/security/authorization.js`, sin wildcard Admin y con denegación por defecto.
