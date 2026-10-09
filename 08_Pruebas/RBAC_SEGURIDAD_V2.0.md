# RBAC, Identidad y Seguridad — PMP Suite V2.0

**Versión:** V2.0

## 1. Objetivo

Demostrar que identidad, roles, permisos y recursos permanecen segregados en Backend, independientemente de lo que intente enviar el cliente.

## 2. Cadena de confianza

```text
Firebase verifica identidad
→ PostgreSQL resuelve usuario activo
→ PostgreSQL entrega rol efectivo
→ authorize(action)
→ permits(resource)
→ servicio
```

El cliente no puede otorgarse permisos mediante:

- query;
- body;
- custom claim obsoleto;
- menú/ruta visible.

## 3. Matriz de responsabilidades

| Dominio | Admin | Gerente | Jefe Lab | Logística | QA | Téc Lab | Téc Terreno |
|---|---:|---:|---:|---:|---:|---:|---:|
| Supervisión global | R | R | — | — | — | — | — |
| Usuarios | RW | — | — | — | — | — | — |
| Bodega consulta | R | R | — | RW | — | — | — |
| Bodega movimiento | — | — | — | W | — | — | — |
| Laboratorio consulta | R | R | RW jefatura | — | — | propia | — |
| Custodia Lab | — | — | W | — | — | — | — |
| Trabajo técnico Lab | — | — | — | — | — | W propia | — |
| QA consulta | R | R | — | — | RW | — | — |
| QA ejecución | — | — | — | — | W | — | — |
| Terreno asignación | — | — | — | W | — | — | — |
| Terreno trabajo | — | — | — | — | — | — | W propia |
| Bridge lectura | R | R | — | R/W correlación | R | R | — |
| IA | R | R | — | — | — | — | — |

R = lectura; W = escritura permitida del dominio.

## 4. Admin

No es superusuario operacional.

Pruebas negativas deben demostrar 403 en:

- `lab.custody`;
- `lab.assign`;
- `lab.work`;
- `warehouse.move`;
- `warehouse.stock`;
- `qa.work`;
- `terrain.assign`;
- `terrain.work`.

## 5. Gerente

Solo lectura ejecutiva/supervisión.

Cualquier mutación operacional o administración de cuentas debe fallar.

## 6. Jefe Laboratorio

Permisos:

- lab.read;
- lab.supervise;
- lab.custody;
- lab.assign.

No hereda `lab.work`.

No opera Bodega/QA/Terreno/usuarios.

## 7. Técnicos

### Lab

`permits(lab.work)` compara usuario con `tecnico_laboratorio_id`.

### Terreno

`permits(terrain.work)` compara usuario con `tecnico_terreno_id`.

No basta tener el rol si la OS no está asignada.

## 8. QA

`qa.work` solo QA.

Admin no asigna QA; la estación es autónoma.

## 9. Logística

Único rol operacional con:

- warehouse.move;
- warehouse.stock;
- requirements.create;
- terrain.assign;
- assets.register;
- bridge.link.

## 10. Gestión del último Admin

Controles:

- no auto-cambiar rol;
- no auto-desactivar;
- no retirar último Admin;
- revalidación dentro de transacción.

## 11. Conflicto Firebase/PostgreSQL

Si UID/correo no coincide con la cuenta PMP esperada, el acceso se bloquea.

El login no “repara” automáticamente el vínculo.

## 12. Revocación / estado

Se prueban escenarios de token inválido/revocado y cuenta deshabilitada.

## 13. Logs

El audit debe registrar:

- acción;
- método;
- ruta;
- resultado;
- status;
- duración.

Sin registrar:

- password;
- token;
- email;
- UID Firebase en el audit de autorización.

## 14. HTTP esperado

- 401: identidad no autenticada;
- 403: identidad válida sin permiso;
- 409: conflicto de estado;
- 422: validación de datos.

## 15. E2E aislado

`roles_e2e.mjs`:

- base efímera;
- Firebase simulado;
- app real;
- 99 requests registrados en la última ejecución documentada.

## 16. Casos relevantes

1. claim Admin + PostgreSQL Gerente → Gerente.
2. body `rol: admin` no eleva.
3. Jefe Lab llama Bodega → 403.
4. Logística intenta estación Lab → 403.
5. Técnico Lab intenta OS ajena → 403.
6. Admin independiente administra usuarios pero no Lab físico.
7. Admin cambia rol de otra cuenta; rol nuevo toma efecto por PostgreSQL.

## 17. Fuente

- `src/security/authorization.js`
- middleware Firebase/ensureUser;
- routes;
- `roles_e2e.mjs`;
- tests de authorization/roles/RBAC.
