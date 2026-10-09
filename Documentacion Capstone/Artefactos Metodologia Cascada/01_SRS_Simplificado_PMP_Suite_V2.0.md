# 01 — SRS Simplificado PMP Suite V2.0

## 1. Propósito

Este documento resume la ERS completa de PMP Suite para el artefacto Cascada. El catálogo exhaustivo se encuentra en:

`01_Requerimientos/ERS_PMP_Suite_V2.0.md`.

## 2. Sistema

PMP Suite integra gestión de activos, casos, órdenes, movimientos físicos, Laboratorio, QA, stock, trazabilidad, Mobile y analítica.

## 3. Actores

- Admin.
- Gerente.
- Jefe Laboratorio.
- Logística.
- QA.
- Técnico Laboratorio.
- Técnico Terreno.

## 4. Grupos de requisitos

| Grupo | Alcance |
|---|---|
| RF-AUT | autenticación/sesión |
| RF-USR | usuarios/roles |
| RF-MST | maestros |
| RF-ACT | activos/recepción inicial |
| RF-REQ | casos/requerimientos |
| RF-OS | nomenclatura/relaciones |
| RF-TER | Terreno |
| RF-BOD | Bodega |
| RF-LAB | custodia Lab |
| RF-LTW | trabajo técnico |
| RF-REP | repuestos |
| RF-QA | QA |
| RF-INV | inventario/instalación |
| RF-BRG | referencias externas |
| RF-TRZ | trazabilidad |
| RF-DASH | reportes/KPI |
| RF-IA | analítica |
| RF-UX/MOB | Web/Mobile |

## 5. Requisitos críticos

1. Identidad = tipo + serie.
2. Physical First.
3. Evidencia independiente por movimiento.
4. Admin sin wildcard.
5. Gerente read-only.
6. Jefe Lab controla custodia/asignación Lab.
7. Técnico Lab solo su carga.
8. QA autónomo.
9. Bridge solo correlación.
10. IN al despacho.
11. Stock inicial sin OS.
12. Repuesto consumido solo por entrega Bodega.
13. Historial append-only.
14. Error no equivale a cero.

## 6. RNF

### Seguridad
Firebase + PostgreSQL + autorización por acción/recurso.

### Integridad
Transacciones, locks, FKs, checks, idempotencia.

### Rendimiento
Paginación, índices y pruebas aisladas.

### UX
Responsive, claro/oscuro, semántica consistente y feedback inline.

### Mantenibilidad
Servicios de dominio, reglas compartidas y documentación V2.0.

## 7. Trazabilidad

La matriz requisito→código→prueba se encuentra en:

`08_Pruebas/MATRIZ_TRAZABILIDAD_V2.0.md`.

## 8. Criterios de aceptación

- identidad incorrecta bloqueada;
- evidencia vieja bloqueada;
- rol incorrecto 403;
- flujo legacy 410;
- stock doble consumido bloqueado;
- cierre técnico sin pruebas aprobado bloqueado;
- QA rechazado vuelve con contexto;
- dashboards sin doble conteo;
- historial por serie consistente.
