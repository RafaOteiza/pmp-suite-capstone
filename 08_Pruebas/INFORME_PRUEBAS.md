# PMP Suite — Informe de pruebas de software

> **EVIDENCIA HISTÓRICA, línea base del 12–14 de septiembre de 2026.** Sus conteos y escenarios Bridge operacionales no son resultados de la evolución actual. El flujo Bridge operativo fue retirado. Consultar [Bridge de correlación](BRIDGE_CORRELACION_Y_HISTORIAL.md) y la [adenda vigente de casos y despacho](../02_Arquitectura/CASOS_REQUERIMIENTOS_DESPACHO.md); los resultados nuevos se registran cuando se ejecutan.

**Versión:** 3.0

**Fecha de actualización:** 14 de septiembre de 2026

**Entorno:** Windows 11, Node.js, PostgreSQL, Firebase Authentication, React/Vite y Python

## 1. Resumen ejecutivo

La línea base automatizada y el flujo operacional crítico se encuentran
aprobados. Las pruebas destructivas o de carga no se ejecutan sobre la base
principal; deben utilizar una base desechable y conservar evidencia del entorno.

| Verificación | Resultado vigente |
|---|---|
| Backend `npm test` | 52/52 aprobadas |
| Frontend `npm test` | 42/42 aprobadas |
| Frontend `npm run build` | Aprobado en la línea base del 12-09-2026 |
| Flujo físico E2E aislado | 9/9 etapas aprobadas el 14-09-2026 |
| Base principal después del E2E | Sin cambios |
| Rendimiento final aislado | Pendiente de repetición controlada |
| Aplicación móvil | Bundle Android aprobado; prueba física pendiente |

## 2. Estrategia

- Pruebas unitarias y estáticas con Node Test Runner.
- Pruebas HTTP de autenticación, RBAC, rutas y errores controlados.
- Pruebas de integración con clúster PostgreSQL efímero.
- Validación de flujo mediante actores simulados con roles oficiales.
- Pruebas visuales y manuales para web y móvil.
- Rendimiento únicamente en una base desechable.

## 3. Roles cubiertos

| Rol | Alcance comprobado |
|---|---|
| `admin` | Supervisión, asignación, recepción y despacho de laboratorio |
| `gerente` | Lectura global y bloqueo uniforme de escritura |
| `logistica` | Bridge, bodega, escaneo, despachos y asignación de instalación |
| `qa` | Escaneo y certificación de carga asignada |
| `tecnico_laboratorio` | Diagnóstico y reparación de carga asignada |
| `tecnico_terreno` | Trabajo asignado y creación del ingreso desde terreno |

PostgreSQL es la autoridad del rol efectivo. Firebase autentica la identidad,
pero un Custom Claim no concede permisos por sí mismo.

## 4. Suite backend

Comando:

```powershell
cd 03_Backend\pmp-api
npm test
```

Resultado vigente: **52 aprobadas, 0 fallidas**.

Cobertura principal:

- autenticación, expiración y revocación;
- existencia y estado activo en PostgreSQL;
- seis roles canónicos;
- gerente de solo lectura;
- middleware en orden seguro;
- Bridge y máquina de estados;
- asignaciones de laboratorio y QA;
- identificación física por serie y AMID;
- historial append-only;
- acceso al módulo IA.

## 5. Suite frontend

Comando:

```powershell
cd 04_Frontend
npm test
npm run build
```

Resultado vigente: **42 aprobadas, 0 fallidas**. El build se encontraba
aprobado en la línea base anterior y debe repetirse después de los cambios de
cierre.

Cobertura principal:

- sesión e invalidación segura;
- catálogo de roles y capacidades;
- rutas protegidas;
- navegación por rol;
- experiencia Bridge;
- estación de escaneo;
- acciones operacionales sin cambio de pantalla;
- mensajes de error y rol gerente.

## 6. Flujo E2E físico aislado

Comando:

```powershell
cd 03_Backend\pmp-api
node verification\equipment_scan_flow_e2e.mjs
```

Resultado del 14-09-2026: **APROBADO**.

```text
Terreno crea OS
→ Logística escanea y recibe en bodega
→ Admin asigna laboratorio
→ Logística despacha a laboratorio
→ Admin escanea y recibe físicamente
→ Técnico de laboratorio diagnostica y repara
→ Admin despacha a bodega
→ Logística recibe, asigna QA y despacha
→ QA escanea, prueba y aprueba
→ Logística recibe el equipo aprobado
→ Se genera IN- y logística asigna técnico de instalación
```

Auditoría: 6 escaneos validados, 1 rechazo esperado, 3 estaciones físicas, 1
reparación, 0 hallazgos y base principal sin cambios.

Evidencia detallada:
`Documentacion Capstone/Evidencias/2026-09-14/EV-OP-001_Flujo_Operacional_Escaneo.md`.

## 7. Controles negativos del flujo

| Caso | Respuesta validada |
|---|---|
| Recepción sin escaneo | 409 `PHYSICAL_SCAN_REQUIRED` |
| Reparación sin escaneo de recepción | 409 `PHYSICAL_SCAN_REQUIRED` |
| Escaneo en estación inesperada | 409 `UNEXPECTED_SCAN_STATION` |
| Despacho QA sin asignación | 422 `QA_ASSIGNEE_REQUIRED` |

## 8. Rendimiento

Existe evidencia histórica de carga y de una corrección de concurrencia en
bodega, pero no se considera resultado final de cierre hasta repetirla en una
base desechable con:

- conteos previos y posteriores;
- versión exacta del código;
- latencias p50, p95 y p99;
- errores 4xx/5xx;
- consumo de recursos;
- eliminación comprobada del entorno temporal.

`stress_test.js` y `e2e_full_v2.js` no deben ejecutarse sobre la base principal.

## 9. Defectos y decisiones relevantes

| ID | Hallazgo | Estado |
|---|---|---|
| DEF-001 | Dependencia `psycopg2` ausente en el entorno IA | Corregido |
| DEF-002 | Autoridad de rol y gerente read-only incompletos | Corregido |
| DEF-003 | Flujo Bridge y asignaciones | Corregido |
| DEF-004 | Guion E2E usaba técnico para recepción física de laboratorio | Corregido: actor admin |
| DEF-005 | URL móvil fija a una IP local | Corregido con `EXPO_PUBLIC_API_URL` |
| DEF-006 | Instalación local de iconos Expo incompleta | Corregido con `npm ci`; bundle Android aprobado |
| DEF-007 | Evidencia final de rendimiento | Pendiente en entorno aislado |

## 10. Criterio de cierre

La línea base funcional está aprobada. El cierre técnico requiere todavía:

1. repetir el build web después de los últimos cambios;
2. ejecutar los siete casos manuales de la aplicación móvil en un teléfono;
3. ejecutar rendimiento y fallos sobre una base aislada;
4. incorporar capturas manuales por rol;
5. vincular cada evidencia con el SRS y los diagramas finales.
