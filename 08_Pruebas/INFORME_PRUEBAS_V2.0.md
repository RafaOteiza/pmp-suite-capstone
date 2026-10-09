# PMP Suite — Informe de Pruebas V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026  
**Estado:** evidencia técnica consolidada.

## 1. Objetivo

Verificar que PMP Suite implemente correctamente:

- reglas de negocio;
- RBAC;
- identidad de activos;
- custodia Physical First;
- concurrencia/idempotencia;
- flujos Terreno/Bodega/Lab/QA;
- trazabilidad;
- UX Web/Mobile;
- integración con PostgreSQL/Firebase;
- analítica de lectura.

## 2. Resultado vigente

| Verificación | Resultado |
|---|---:|
| Backend `npm test` | **118/118 aprobadas** |
| Web `npm test` | **176/177 aprobadas** |
| Mobile con mocks | **210/210 aprobadas** |
| TypeScript + build Web | **Aprobados** |
| RBAC HTTP aislado | **99 solicitudes aprobadas** |
| E2E Laboratorio | **Aprobado** |
| E2E operacional integral | **Aprobado** |
| Responsive/RBAC | **150 renderizados 320–1440 px** |

Estos resultados corresponden a la última línea documentada. No se reinterpretan como certificación de hardware físico.

## 3. Suite Backend

Archivos actuales en `03_Backend/pmp-api/test/`:

- `admin-lab.test.js`
- `app.phase1.smoke.test.js`
- `auth.revocation.test.js`
- `authorization.test.js`
- `bridge.flow.test.js`
- `consolidation.test.js`
- `database-tools.test.js`
- `equipment.scan.test.js`
- `lab.work.test.js`
- `qa.work.test.js`
- `rbac.phase1.test.js`
- `requirements.test.js`
- `roles.phase1.test.js`
- `technical-history.test.js`

### Cobertura funcional

- autorización;
- roles;
- sesión/revocación;
- Bridge correlación;
- evidencia física;
- requisitos/casos;
- Laboratorio;
- QA;
- historial técnico;
- herramientas de DB efímera.

## 4. Verificaciones E2E Backend

Scripts actuales en `verification/` incluyen:

- `admin_lab_e2e.mjs`
- `asset_management_scenarios.mjs`
- `bridge_correlation_e2e.mjs`
- `equipment_scan_flow_e2e.mjs`
- `initial_installation_empty_e2e.mjs`
- `lab_work_scenarios.mjs`
- `logistics_inventory_e2e.mjs`
- `logistics_nomenclature_e2e.mjs`
- `manual_initial_reception_scenarios.mjs`
- `navigation_kpi_e2e.mjs`
- `performance_isolated.mjs`
- `qa_custody_scenarios.mjs`
- `requirement_search_scenarios.mjs`
- `requirements_flow_e2e.mjs`
- `roles_e2e.mjs`
- `single_equipment_empty_e2e.mjs`
- `terrain_warehouse_scenarios.mjs`
- `withdrawal_camera_scenarios.mjs`

Los scripts de escritura se diseñan para utilizar PostgreSQL efímero o fixtures aislados cuando corresponda.

## 5. Suite Web

Archivos relevantes en `04_Frontend/test/`:

- administración/Lab;
- invalidación de auth;
- Bridge;
- consolidación;
- despacho;
- escaneo;
- instalación inicial;
- navegación/KPI;
- páginas operacionales;
- RBAC;
- requerimientos;
- experiencia por rol;
- rutas;
- sesión;
- sistema UI;
- UX browser;
- despacho Bodega.

### Objetivos Web

- rutas disponibles según rol;
- componentes correctos;
- feedback inline;
- estados vacío/error;
- layouts responsive;
- temas;
- navegación;
- protección de páginas.

## 6. Mobile

La suite con mocks valida lógica/presentación sin afirmar hardware.

Cobertura:

- AuthContext;
- API;
- Login;
- Home;
- Mis órdenes;
- falla;
- retiro;
- historial;
- settings;
- apariencia;
- seguridad personal.

Resultado consolidado: **210/210**.

## 7. RBAC HTTP aislado

El escenario `roles_e2e.mjs` trabaja con PostgreSQL desechable y Firebase simulado para verificar la misma aplicación Backend.

Resultado documentado: **99 solicitudes aprobadas**.

Comprueba entre otros:

- Gerente/Admin no ejecutan mutaciones operacionales indebidas;
- roles no Admin no acceden a administración de usuarios;
- Jefe Lab se limita a Lab;
- claims/body/query falsificados no elevan permisos;
- identidad ausente/inactiva se deniega;
- último Admin se protege;
- cambio real de rol PostgreSQL altera acceso;
- Admin independiente sigue administrando.

## 8. Physical First

Escenarios de prueba verifican:

- sin evidencia no hay recepción/despacho;
- validar no modifica la OS;
- confirmar sí registra transición;
- evidencia de origen no sustituye destino;
- evidencia del ciclo anterior no es válida;
- lectura incorrecta produce discrepancia;
- doble confirmación compatible se trata idempotentemente cuando aplica.

## 9. Laboratorio

Se verifica:

- En camino no entra a carga;
- recepción inicia ciclo/SLA;
- asignación antes de recepción falla;
- Jefe Lab custodia;
- Técnico solo carga propia;
- borrador con revisión;
- diagnósticos;
- pruebas;
- solicitud de repuesto;
- cierre;
- salida independiente.

## 10. QA

Se verifica:

- recepción separada de despacho Bodega;
- QA autónomo;
- etapas Ambiente/Pruebas/Dictamen;
- rutas legacy retiradas;
- rechazo con contexto;
- dictamen sin movimiento;
- salida con evidencia propia;
- ciclo nuevo sin herencia.

## 11. Inventario / instalación

Se verifica:

- stock inicial sin OS;
- stock reparado;
- activos únicos;
- elegibilidad;
- origen de stock;
- IN solo al confirmar despacho;
- rollback transaccional;
- doble consumo bloqueado;
- estado En ruta separado de Asignado.

## 12. Trazabilidad

Se valida que la historia técnica y operacional se reconstruya por tipo+serie.

La proyección Mobile excluye información administrativa.

## 13. Responsive / temas

Resultado consolidado: **150 renderizados** entre anchos 320–1440 px.

Se revisa:

- overflow;
- navegación;
- páginas por rol;
- Claro/Oscuro;
- componentes críticos.

## 14. Fallo conocido Web

Una prueba Web permanece fallida por un fixture/mock que no exporta `useAuth` para `AssetHistoryScreen`.

Se documenta como pendiente; no se oculta dentro del total.

## 15. Validación manual controlada

Recorrido realizado hasta:

```text
activo/instalación
→ falla
→ retiro
→ Bodega
→ salida Lab
→ recepción Lab
→ asignación
→ diagnóstico
→ reparación
→ Test MK
→ cierre técnico
→ salida Lab→Bodega
```

Esta ejecución fue una **simulación funcional**, no una certificación de presencia física/hardware.

## 16. Pendientes

- corregir fixture Web;
- validar cámara/QR real;
- Safe Area y teclado real;
- completar QA→Bodega→reinstalación manual;
- repetir performance/seguridad final en entorno aislado.

## 17. Criterio de aprobación

Una función puede estar:

- implementada;
- automatizadamente verificada;
- manualmente validada;
- físicamente validada.

El informe no fusiona estas categorías.

## 18. Trazabilidad

Consultar `MATRIZ_TRAZABILIDAD_V2.0.md`.
