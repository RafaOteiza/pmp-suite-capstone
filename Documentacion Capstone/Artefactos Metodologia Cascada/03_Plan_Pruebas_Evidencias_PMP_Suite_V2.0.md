# 03 — Plan de Pruebas y Evidencias PMP Suite V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026  
**Objetivo:** demostrar que los requisitos críticos funcionan, que los roles no exceden su dominio y que la evidencia técnica es reproducible.

## 1. Alcance

Se prueban:

- autenticación y revocación;
- RBAC;
- activos/identidad;
- casos/OS;
- Terreno;
- Bodega;
- Laboratorio;
- repuestos;
- QA;
- inventario/instalación;
- Bridge/trazabilidad;
- dashboards/KPI;
- Web;
- Mobile;
- IA;
- integridad/concurrencia.

No se considera “aprobada” una función solo porque exista código.

## 2. Estrategia de pruebas

| Nivel | Objetivo | Entorno |
|---|---|---|
| Unitarias/contrato | validar helpers, servicios, autorización | proceso Node aislado |
| HTTP/RBAC | permisos, códigos y contratos de rutas | API aislada/mocks |
| Integración DB | constraints/transacciones | PostgreSQL efímero |
| E2E | recorrido multiárea | app real + DB descartable |
| Frontend | rutas, RBAC, UI, contratos | Node/jsdom/browser |
| Visual | responsive/tema/overflow | navegador automatizado |
| Mobile | regresión, settings, UI | mocks/export/browser |
| Manual | experiencia real de usuario | entorno habitual controlado |
| Rendimiento | comportamiento bajo carga | entorno aislado |

## 3. Política de seguridad de pruebas

1. Las suites con escrituras destructivas no deben apuntar a `localhost:5432/pmp_suite` habitual.
2. Los E2E destructivos crean/restauran un PostgreSQL efímero.
3. Se compara fingerprint/estructura cuando la suite declara conservación.
4. No se guardan tokens/contraseñas en reportes.
5. Los datos fixture deben identificarse como tales.
6. Una contingencia manual no se documenta como captura de hardware real.

## 4. Datos y precondiciones

### Activos de fixture

Las suites pueden crear series, buses y usuarios ficticios dentro de DB efímera.

### Entorno manual

El recorrido manual actual utiliza datos controlados del entorno habitual; cuando se usa MANUAL_AUTORIZADO se valida software/flujo, no lector/cámara.

### Identidad

Las pruebas deben cubrir:

- 72 → CVB35;
- 74/75 → CVB45;
- Consola → N9715;
- prefijo desconocido;
- AMID válido/inválido;
- tipo/serie incompatibles.

## 5. Matriz de pruebas por dominio

### 5.1 Autenticación / sesión

| Caso | Esperado |
|---|---|
| token ausente | 401 |
| token inválido/revocado | 401 controlado |
| Firebase válido + usuario inexistente | acceso bloqueado |
| usuario inactivo | 403 |
| conflicto UID/correo | bloqueado |
| claim Admin + PostgreSQL no Admin | prevalece PostgreSQL |
| cambio de identidad | contexto previo no se reutiliza |

Evidencia principal: `auth.revocation.test.js`, `authorization.test.js`, `roles_e2e.mjs`.

### 5.2 Usuarios

| Caso | Esperado |
|---|---|
| Admin lista/crea usuario | 200/201 |
| no Admin crea usuario | 403 |
| rol no oficial | rechazo |
| desactivar último Admin | bloqueado |
| Admin cambia su propio rol | bloqueado |
| Admin se desactiva | bloqueado |
| actualizar correo | sincronización controlada Firebase/DB |
| password < 8 | rechazo |

### 5.3 Activos

| Caso | Esperado |
|---|---|
| alta validador 74 | CVB45/Mikroelektronika |
| alta validador 72 | CVB35/Mikroelektronika |
| alta consola | N9715/Waysion |
| prefijo desconocido | rechazo |
| alta duplicada | conflicto |
| alta | ALTA_ACTIVO, sin OS |
| recepción inicial sin validar | bloqueada |
| recepción inicial válida | HABILITADO_INSTALACION, sin OS |
| doble habilitación | bloqueada/idempotente según contrato |

### 5.4 Requerimientos/casos

- activo inexistente → rechazo;
- activo no operativo en bus → rechazo;
- terminal/PST incompatible → rechazo;
- referencia Aranda duplicada → rechazo;
- caso INTERNO → código interno;
- PoD → prefijo correcto;
- creación falla al final → rollback total;
- no se modifica maestro.

### 5.5 Terreno

- solo técnico asignado ve/ejecuta;
- identidad correcta;
- discrepancia registrada;
- retiro sin evidencia → bloqueado;
- retiro confirmado → tránsito;
- Logística aún debe recepcionar;
- instalación propia → operación;
- historial técnico excluye datos administrativos.

### 5.6 Bodega

- cola y badge comparten definición;
- retiro pendiente no cuenta como recepción;
- validar recepción no cambia custodia;
- confirmar recepción sí;
- salida Lab exige evidencia vigente;
- salida QA exige evidencia vigente;
- tránsito se excluye de origen/destino;
- inventario no duplica activos.

### 5.7 Laboratorio — custodia

| Caso | Esperado |
|---|---|
| equipo despachado desde Bodega | En camino |
| asignar En camino | 409 |
| validar recepción | no cambia custodia |
| confirmar recepción | estado/ubicación Lab |
| recepción inicia SLA | sí |
| relectura mismo ciclo | no reinicia SLA |
| evidencia salida anterior | no sirve para recepción |
| Admin/Gerente confirma custodia | 403 |
| Jefe Lab confirma | permitido |

### 5.8 Laboratorio — trabajo técnico

- técnico no asignado → 403;
- trabajo sin recepción vigente → bloqueado;
- iniciar Diagnóstico→Reparación;
- guardar avance mantiene estado físico;
- revisión concurrente obsoleta → conflicto;
- diagnóstico permitido;
- prueba solo Manual/Test MK;
- prueba rechazada impide cierre;
- solicitud pendiente impide cierre;
- resultado PoD requiere consistencia;
- cierre registra reparación/eventos;
- cierre no despacha físicamente.

### 5.9 Repuestos

- técnico describe necesidad;
- técnico no puede enviar consumo de stock;
- Logística entrega;
- categoría incompatible → rechazo;
- stock insuficiente → rechazo;
- entrega descuenta una vez;
- reintento idéntico → idempotente;
- reintento pieza/cantidad distinta → conflicto;
- ajuste directo de stock → 409 sin política.

### 5.10 QA

| Caso | Esperado |
|---|---|
| recibir antes de despacho Bodega | bloqueado |
| QA confirma recepción | ciclo habilitado |
| Admin asigna QA | flujo retirado |
| iniciar trabajo QA | actor QA |
| Ambiente | hito registrado |
| pruebas | avance versionado |
| dictamen sin etapa previa | bloqueado |
| rechazo sin motivo | bloqueado |
| dictamen Operativo | custodia sigue QA |
| salida sin evidencia | bloqueada |
| salida confirmada | tránsito Bodega |
| recepción Bodega posterior | custodia Bodega |
| rechazo | nuevo ciclo hacia Lab |

### 5.11 Inventario / instalación

- stock inicial elegible;
- reparado sin QA/recepción Bodega no elegible;
- intervención activa no elegible;
- seleccionar técnico/destino no crea IN;
- validar activo no crea IN;
- confirmar despacho crea IN + evento;
- origen stock consumido una vez;
- IN independiente;
- instalación final deja activo en operación.

### 5.12 Bridge / trazabilidad

- buscar serie/OS/referencia;
- correlación por Logística;
- tipo/serie incompatible → rechazo;
- duplicado → conflicto;
- correlación inmutable;
- operación Bridge antigua → 410;
- historial por serie conserva todas sus OS;
- historial Terreno/Jefe Lab usa proyección técnica.

### 5.13 Dashboards

- parque cuenta activos únicos;
- OS no incrementa parque;
- tránsito no aparece en dos ubicaciones;
- Lab En camino fuera de carga;
- Bodega disponible usa origen/custodia;
- QA dictamen no equivale a salida;
- badges iguales a colas;
- error API no se convierte en cero.

### 5.14 UX / Web

- navegación por rol;
- acceso directo protegido;
- sidebar una sola ruta activa;
- claro/oscuro;
- responsive 320–1440;
- sin overflow accidental;
- estados loading/empty/error/forbidden;
- feedback inline;
- autocompletado relaciones conocidas.

### 5.15 Mobile

- login;
- jornada/OS propias;
- reportar falla;
- retiro;
- instalación;
- historial técnico;
- perfil;
- cambio contraseña;
- temas;
- persistencia de apariencia;
- cámara/QR en dispositivo físico pendiente de cierre.

### 5.16 IA

- endpoint autorizado solo a Admin/Gerente;
- Python retorna JSON;
- conexión lectura;
- sin escritura DB;
- score presentado como heurística;
- sin precisión/recall inventada;
- error Python controlado.

## 6. Casos negativos transversales

| Condición | Resultado |
|---|---|
| rol fuera de dominio | 403 |
| identidad no encontrada | 404/422 según contrato |
| tipo/serie incompatible | 409/422 |
| estación incorrecta | 409/422 |
| evidencia stale | 409 |
| transición inválida | 409 |
| payload incompleto | 400/422 |
| flujo retirado | 410 |
| stock insuficiente/consumido | 409 |
| edición concurrente | 409 |
| reintento incompatible | 409 |

## 7. Suites vigentes

### Backend

- admin-lab;
- auth.revocation;
- authorization;
- bridge.flow;
- consolidation;
- database-tools;
- equipment.scan;
- lab.work;
- qa.work;
- requirements;
- technical-history;
- suites RBAC/regresión.

### Verificación/E2E

- admin_lab_e2e;
- asset management;
- bridge correlation;
- equipment scan flow;
- initial installation empty;
- lab work;
- logistics inventory;
- navigation KPI;
- QA custody;
- requirements flow;
- roles E2E;
- Terrain/Warehouse;
- camera scenarios;
- performance isolated.

### Web

- RBAC;
- rutas;
- sesiones;
- requirements;
- warehouse dispatch;
- admin Lab;
- navigation KPI;
- role experience;
- UI system;
- UX browser;
- all-pages/operational pages.

### Mobile

- operational regression;
- settings;
- UI;
- visual.

## 8. Resultado documentado

| Suite/verificación | Resultado |
|---|---:|
| Backend | 118/118 |
| Web | 176/177 |
| Mobile mocks | 210/210 |
| Web build | aprobado |
| RBAC HTTP aislado | 99 requests |
| E2E Lab | aprobado |
| E2E operacional | aprobado |
| responsive/RBAC | 150 renders |

## 9. Defecto abierto conocido

La suite Web conserva un fixture que no exporta `useAuth` para `AssetHistoryScreen`. Debe corregirse/repetirse antes de declarar 100 % de la suite.

## 10. Validación manual vigente

Recorrido alcanzado:

~~~text
instalación
→ falla
→ retiro
→ recepción Bodega
→ envío/recepción Lab
→ asignación
→ diagnóstico/reparación/Test MK
→ cierre técnico
→ salida Lab a Bodega
~~~

Pendiente manual: recepción Bodega, QA completo, retorno Bodega y reinstalación.

## 11. Evidencia por caso

Cada evidencia debe registrar:

| Campo | Contenido |
|---|---|
| ID | identificador único |
| versión/commit | código probado |
| fecha | ejecución |
| entorno | habitual/efímero/browser/device |
| actor | rol/cuenta fixture |
| precondición | estado inicial |
| datos | series/OS fixture |
| pasos | secuencia |
| esperado | criterio |
| obtenido | resultado |
| estado | PASS/FAIL/BLOCKED |
| soporte | log/captura/JSON |

## 12. Criterios de entrada

- código compilable;
- migraciones conocidas;
- variables de entorno configuradas;
- DB aislada para prueba destructiva;
- fixtures identificados;
- Firebase mock/real según suite.

## 13. Criterios de salida

Para cierre técnico:

1. Backend sin regresiones.
2. Build Web aprobado.
3. RBAC crítico aprobado.
4. E2E flujo físico aprobado en entorno aislado.
5. Defectos abiertos declarados.
6. Evidencia física pendiente claramente separada.
7. documentación alineada con resultado.

## 14. Trazabilidad

La matriz detallada `08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md` relaciona los **268 RN/RF/RNF** con implementación y evidencia.

## 15. Pendientes de cierre

- corregir fixture Web;
- dispositivo físico cámara/QR/Safe Area;
- completar flujo manual;
- repetir rendimiento/seguridad;
- adjuntar evidencia final a la entrega.

## 16. Regla de reporte

Nunca:

- transformar FAIL en “parcial aprobado”;
- llamar hardware validado a una contingencia manual;
- publicar credenciales;
- utilizar resultados históricos como si fueran una nueva ejecución;
- ocultar un pendiente detrás de un porcentaje global.
