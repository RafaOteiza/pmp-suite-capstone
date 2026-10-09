# Autenticación, Usuarios y RBAC — PMP Suite V2.0

**Versión:** V2.0  
**Estado:** vigente  
**Actualización:** 09-10-2026

## 1. Propósito

Definir cómo PMP Suite autentica identidades, resuelve el rol efectivo, administra cuentas y aplica segregación de funciones.

## 2. Modelo de identidad

```text
Credencial
→ Firebase Authentication
→ ID token
→ Backend verifica token
→ resuelve pmp.usuarios
→ valida activo + UID/correo
→ obtiene rol PostgreSQL
→ autoriza acción
→ revalida recurso
```

Firebase es autoridad de credenciales. PostgreSQL es autoridad de cuenta activa y rol.

## 3. Roles oficiales

| Rol | Descripción |
|---|---|
| admin | administración de sistema y supervisión |
| gerente | consulta ejecutiva |
| jefe_laboratorio | jefatura operacional de Laboratorio |
| logistica | Bodega/stock/movimientos |
| qa | control de calidad |
| tecnico_laboratorio | trabajo técnico Lab |
| tecnico_terreno | trabajo en buses/terreno |

No existe un rol `jefe_taller` en V2.0.

## 4. Requisitos de autenticación

- **RF-AUT-001:** Login usa Firebase.
- **RF-AUT-002:** Backend debe exigir Bearer token en rutas protegidas.
- **RF-AUT-003:** Token válido no basta: debe existir usuario PMP activo.
- **RF-AUT-004:** `firebase_uid` debe corresponder a la identidad esperada.
- **RF-AUT-005:** conflicto identidad debe bloquear, no autocorregir silenciosamente.
- **RF-AUT-006:** rol del token/cliente no reemplaza `usuarios.rol`.
- **RF-AUT-007:** roles desconocidos se deniegan.
- **RF-AUT-008:** cuenta inactiva se deniega.
- **RF-AUT-009:** `GET /api/auth/me` retorna identidad efectiva.
- **RF-AUT-010:** sesión caducada/revocada se presenta como autenticación fallida.
- **RF-AUT-011:** cambio de usuario descarta datos/caché autorizado de la identidad anterior.

## 5. Administración de cuentas

### Alta

Campos:

- correo;
- nombre;
- apellido;
- rol;
- contraseña inicial opcional.

Reglas:

1. rol debe pertenecer al catálogo oficial;
2. correo no se fusiona silenciosamente con otra identidad;
3. contraseña, si se define, mínimo 8 caracteres;
4. contraseña solo vive en Firebase;
5. se guarda `firebase_uid` en PMP;
6. alta debe dejar una identidad coherente entre ambas capas.

### Edición

Admin puede modificar datos autorizados de **otra cuenta**.

Controles:

- no cambiar su propio rol desde administración;
- no desactivarse desde administración;
- no dejar el sistema sin Admin activo;
- revalidar protección dentro de la transacción;
- sincronizar cambios de identidad que correspondan con Firebase.

## 6. Seguridad personal

`/settings` corresponde a preferencias/seguridad personal, no a un panel global dinámico.

Funciones:

- perfil;
- apariencia;
- recuperación/cambio de contraseña propia;
- reautenticación cuando Firebase la requiere.

## 7. Política backend por acción

| Acción | Roles |
|---|---|
| supervision.read | admin, gerente |
| users.manage | admin |
| lab.custody | jefe_laboratorio |
| lab.assign | jefe_laboratorio |
| lab.work | tecnico_laboratorio |
| warehouse.move/stock | logistica |
| requirements.create | logistica |
| terrain.assign | logistica |
| terrain.work | tecnico_terreno |
| qa.work | qa |
| bridge.link | logistica |

La política completa está en `src/security/authorization.js`.

## 8. Scope por recurso

Aunque un rol posea una acción, puede existir una segunda condición:

- técnico Lab: OS asignada al mismo `user.id`;
- técnico Terreno: OS asignada al mismo `user.id`;
- estación: rol habilitado en Bodega/Lab/QA;
- ciclo: evidencia pertenece al ciclo vigente;
- último Admin: operación no puede romper disponibilidad administrativa.

## 9. Endpoints

### Identidad

- `GET /api/auth/me`
- `POST /api/auth/reset-password-link`
- `POST /api/auth/my/reset-password-link`
- `POST /api/auth/password`

### Usuarios

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `POST /api/users/:id/password`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- activar/desactivar/reset/set-password.

## 10. Casos negativos

| Caso | Resultado |
|---|---|
| token faltante | 401 |
| token inválido/caducado | 401 |
| cuenta inactiva | 403 |
| rol sin acción | 403 |
| técnico sobre OS ajena | 403 |
| Admin intenta mutación física solo por ser Admin | 403 |
| Gerente intenta escritura | 403 |
| último Admin se desactiva | rechazo |
| Admin intenta cambiarse a Jefe Lab | rechazo |
| body envía `rol: admin` para elevar permisos | ignorado/403 |

## 11. Criterios de aceptación

- PostgreSQL debe prevalecer ante claims antiguos.
- El cambio de rol de una cuenta debe reflejarse en la siguiente autorización.
- Frontend oculto no se considera control de seguridad.
- No debe existir contraseña en DB, logs o documentación.
- Logs de autorización no deben contener email/token/password/UID Firebase.

## 12. Pruebas

Trazabilidad: `08_Pruebas/RBAC_SEGURIDAD_V2.0.md` y `MATRIZ_TRAZABILIDAD_V2.0.md`.
