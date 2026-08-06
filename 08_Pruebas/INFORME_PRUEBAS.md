# PMP Suite — Informe de Pruebas de Software
**Versión:** 2.0  
**Fecha:** Abril 2026  
**Autor:** Rafael Oteiza  
**Entorno:** Node.js 20 · PostgreSQL 16 · Firebase Auth · React (Vite 5)

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Entorno de Pruebas](#2-entorno-de-pruebas)
3. [Suite E2E — Pruebas Funcionales](#3-suite-e2e--pruebas-funcionales)
4. [Suite de Estrés — Pruebas de Rendimiento](#4-suite-de-estr%C3%A9s--pruebas-de-rendimiento)
5. [Bugs Encontrados y Correcciones](#5-bugs-encontrados-y-correcciones)
6. [Cobertura del Sistema](#6-cobertura-del-sistema)
7. [Cómo Ejecutar las Pruebas](#7-c%C3%B3mo-ejecutar-las-pruebas)

---

## 1. Resumen Ejecutivo

| Métrica | E2E | Estrés |
|---|---|---|
| Total de tests | **46** | **14** |
| Tests pasados | **46 ✅** | **14 ✅** |
| Tests fallados | **0** | **0** |
| Tasa de éxito | **100%** | **100%** |
| Tiempo de ejecución | ~90 s | ~15 s |
| Script | `e2e_full_v2.js` | `stress_test.js` |

> **Resultado final:** El sistema PMP Suite aprueba el **100% de todos los tests** (funcionales y de estrés). Se detectó y corrigió 1 race condition crítico en el endpoint de recepción de bodega durante las pruebas de estrés.

---

## 2. Entorno de Pruebas

### 2.1 Infraestructura

| Componente | Detalle |
|---|---|
| Sistema Operativo | Windows 11 |
| Backend API | Node.js 20 · Express 4 · Puerto 4000 |
| Base de Datos | PostgreSQL 16 (`pmp_suite`) · Puerto 5432 |
| Autenticación | Firebase Authentication con claims personalizados |
| Frontend | React 18 + Vite 5 · Puerto 5173 |
| Schema BD | `pmp.*` (ordenes_servicio, estados, ubicaciones, usuarios) |

### 2.2 Usuarios de Prueba

| Rol | Correo | Permisos |
|---|---|---|
| `admin` | rafael.oteiza@pmp-suite.cl | Todas las rutas |
| `tecnico_terreno` | rodrigo.escobar@pmp-suite.cl | `/api/os` |
| `tecnico_laboratorio` | jose.villarroel@pmp-suite.cl | `/api/lab` |
| `qa` | cristian.alvarez@pmp-suite.cl | `/api/qa` |
| `logistica` | bodega@pmp-suite.cl | `/api/bodega` |

### 2.3 Estados del Sistema (referencia)

| ID | Nombre | Significado |
|---|---|---|
| 2 | EN_TRANSITO | Equipo viajando desde Terreno a Bodega |
| 3 | EN_BODEGA | Equipo en stock de Bodega |
| 4 | EN_DIAGNOSTICO | Equipo en Laboratorio |
| 6 | EN_QA | Equipo en revisión de Calidad |
| 7 | DISPONIBLE | Equipo IN- listo para instalación |
| 10 | FINALIZADO_TALLER | Reparación completada, esperando despacho |
| 11 | EN_TRAYECTO_BODEGA | Equipo saliendo de Lab/QA hacia Bodega |
| 13 | CERRADA | OS de reparación cerrada (ciclo completo) |

---

## 3. Suite E2E — Pruebas Funcionales

**Archivo:** `03_Backend/pmp-api/e2e_full_v2.js`

El script autentica 5 usuarios (uno por rol), ejecuta llamadas a la API HTTP real en `localhost:4000` y verifica el estado directamente en PostgreSQL.

### Bloque 1 — Autenticación (5 tests)

| ID | Descripción | Resultado Esperado |
|---|---|---|
| A1-A5 | Login de cada rol vía Firebase | Token JWT válido por cada rol |

### Bloque 2 — RBAC: Control de Acceso (12 tests)

| ID | Descripción | Actor | Esperado |
|---|---|---|---|
| R1 | Lab intenta crear OS | tecnico_laboratorio | Permitido (RBAC en frontend) |
| R2 | QA no puede crear usuarios | qa | 401 / 403 |
| R3 | QA no puede recepcionar en Bodega | qa | 401 / 403 |
| R4 | Terreno no puede finalizar en Lab | tecnico_terreno | 401 / 403 |
| R5 | Bodega no puede procesar QA | logistica | 401 / 403 |
| R6 | Bodega accede a su cola | logistica | 200 |
| R7 | Lab accede a su cola | tecnico_laboratorio | 200 |
| R8 | QA accede a su cola | qa | 200 |
| R9 | Admin accede a dashboard badges | admin | 200 |
| R10 | Sin token → rechazado | — | 401 |
| R11 | Bodega accede a repuestos | logistica | 200 |
| R12 | Terreno no accede a bodega | tecnico_terreno | 401 / 403 |

### Bloque 3 — Datos Maestros (5 tests)

| ID | Descripción | Validación |
|---|---|---|
| D1 | Bodega lee repuestos | `res.repuestos` es array |
| D2-D3 | Badges accesibles y con claves | `lab`, `bodega`, `qa` |
| D4 | Bodega lee stock de módulos | HTTP 200 |

### Bloque 4 — Flujo E2E Completo (16 tests)

Flujo validado:

```
Terreno crea OS
    ↓ estado 2 (EN_TRANSITO)
Bodega recepciona
    ↓ estado 3 (EN_BODEGA)
Bodega despacha a Lab
    ↓ estado 4 (EN_DIAGNOSTICO)
Lab finaliza reparación
    ↓ estado 10 (FINALIZADO_TALLER)
Admin despacha lote
    ↓ estado 11 (EN_TRAYECTO_BODEGA)
Bodega recepciona desde Lab
    ↓ estado 3 (EN_BODEGA)
Bodega despacha a QA
    ↓ estado 6 (EN_QA)
QA aprueba
    ↓ estado 11 + es_aprobado_qa = TRUE
Bodega recepciona aprobado
    ↓ OS original → estado 13 (CERRADA)
    ↓ OS instalación IN- → estado 7 (DISPONIBLE)
```

Cada paso se verifica en **DB PostgreSQL** después de la llamada HTTP.

### Bloque 5 — Flujo de Rechazo QA (8 tests)

```
... → QA rechaza (es_aprobado_qa = FALSE)
    ↓ estado 11 (EN_TRAYECTO_BODEGA)
Bodega recepciona rechazado
    ↓ estado 3 (EN_BODEGA, sin cerrarse)
Bodega despacha de vuelta a Lab
    ↓ estado 4 (EN_DIAGNOSTICO), ubicacion 2
```

### Resultados E2E

```
╔════════════════════════════════════════════════════╗
║   RESULTADOS: 46/46 tests pasados                  ║
╚════════════════════════════════════════════════════╝
```

| Bloque | Tests | Passed |
|---|---|---|
| Autenticación | 5 | 5 ✅ |
| RBAC | 12 | 12 ✅ |
| Datos Maestros | 5 | 5 ✅ |
| Flujo E2E Completo | 16 | 16 ✅ |
| Rechazo QA | 8 | 8 ✅ |
| **TOTAL** | **46** | **46 ✅** |

---

## 4. Suite de Estrés — Pruebas de Rendimiento

**Archivo:** `03_Backend/pmp-api/stress_test.js`

### Escenario 1 — Creación Concurrente de OS (20 paralelas)

**Objetivo:** Los triggers de secuencia deben generar códigos únicos bajo concurrencia.

- 20 `POST /api/os/crear` simultáneos
- Validado: codigos únicos (Set tamaño 20), 20 registros en DB

### Escenario 2 — Lecturas Paralelas (50 por endpoint)

| Endpoint | Solicitudes | Resultado | Avg | Max |
|---|---|---|---|---|
| `bodega/queue` | 50 | ✅ 50/50 | 2 ms | 94 ms |
| `lab/queue/VALIDADOR` | 50 | ✅ 50/50 | 2 ms | 73 ms |
| `qa/queue` | 50 | ✅ 50/50 | 1 ms | 48 ms |
| `dashboard/badges` | 50 | ✅ 50/50 | 1 ms | 62 ms |
| `bodega/repuestos` | 50 | ✅ 50/50 | 11 ms | 564 ms |

### Escenario 3 — Race Condition en Trigger PG

**Objetivo:** 10 recepciones simultáneas sobre la MISMA OS → solo 1 debe tener éxito.

- **Antes del fix:** 10/10 exitosas ❌ (race condition confirmado)
- **Después del fix:** 1/10 exitosa ✅ (9 bloqueadas con 409)

### Escenario 4 — Badge Endpoint bajo alta carga (100 llamadas)

- 100/100 OK ✅
- p99 = 127 ms
- Estructura de respuesta consistente en las 100 llamadas

### Escenario 5 — Flujos Completos Paralelos (5 ciclos completos)

- 5 OS creadas y completadas en paralelo (8 pasos cada una)
- 5/5 cerradas con `estado_id = 13` ✅
- 5 OS de instalación `IN-` generadas ✅
- Tiempo total: **153 ms** para 5 flujos paralelos completos

### Métricas Globales de Latencia

```
Latencia HTTP (410 requests totales):
  avg  = 113 ms
  p50  = 68  ms
  p95  = 471 ms
  p99  = 530 ms
  max  = 551 ms
```

### Resultados de Estrés

```
╔══════════════════════════════════════════════════════════╗
║   RESULTADOS: 14/14 tests pasados                        ║
║   Tiempo total: 14.8s                                    ║
╚══════════════════════════════════════════════════════════╝
```

---

## 5. Bugs Encontrados y Correcciones

### BUG-001 — Race Condition en `/api/bodega/receive`

**Severidad:** 🔴 Crítica  
**Detectado:** Stress Test, Escenario 3

**Causa raíz:** El `SELECT` inicial no bloqueaba la fila en PG. Múltiples transacciones concurrentes leían el mismo estado y las 10 procedían.

```sql
-- ❌ ANTES
SELECT es_aprobado_qa, tipo_equipo, ...
FROM pmp.ordenes_servicio WHERE codigo_os = $1

-- ✅ DESPUÉS
SELECT estado_id, es_aprobado_qa, tipo_equipo, ...
FROM pmp.ordenes_servicio WHERE codigo_os = $1
FOR UPDATE  -- Serializa el acceso concurrente
```

**Guardia adicional de idempotencia:**

```javascript
// Retorna 409 si el equipo ya fue recepcionado
if (o.estado_id !== 2 && o.estado_id !== 11) {
  return res.status(409).json({ error: "OS ya fue recepcionada." });
}
```

---

### BUG-002 — RBAC incompleto en rutas operativas

**Severidad:** 🟡 Media  
**Detectado:** Análisis de código durante E2E

**Causa raíz:** Rutas de Lab, QA y Bodega solo usaban `firebaseAuth` sin `requireAnyRole`.

**Corrección:**

```javascript
// bodega.routes.js
router.use(firebaseAuth, ensureUser, requireAnyRole(ROLES.LOGISTICA, ROLES.ADMIN));

// lab.routes.js
router.use(firebaseAuth, ensureUser, requireAnyRole(ROLES.TECNICO_LAB, ROLES.ADMIN));

// qa.routes.js
router.use(firebaseAuth, ensureUser, requireAnyRole(ROLES.QA, ROLES.ADMIN));
```

---

## 6. Cobertura del Sistema

| Módulo | E2E | Estrés |
|---|---|---|
| Creación de OS | ✅ | ✅ |
| Recepción en Bodega | ✅ | ✅ |
| Despacho Bodega → Lab | ✅ | ✅ |
| Finalización Lab | ✅ | ✅ |
| Despacho Lab → Bodega | ✅ | ✅ |
| Despacho Bodega → QA | ✅ | ✅ |
| Aprobación QA + cierre OS | ✅ | ✅ |
| Rechazo QA + reingreso Lab | ✅ | — |
| Generación automática IN- | ✅ | ✅ |
| RBAC por endpoint | ✅ | — |
| Concurrencia / Race conditions | — | ✅ |
| Notificaciones / Badges | ✅ | ✅ |
| Inventario y Repuestos | ✅ | ✅ |

---

## 7. Cómo Ejecutar las Pruebas

### Prerrequisitos

```bash
# Backend corriendo en localhost:4000
cd 03_Backend/pmp-api
node server.js
```

### Suite E2E

```bash
cd 03_Backend/pmp-api
node e2e_full_v2.js
# Output esperado: 46/46 tests pasados (~90s)
```

### Suite de Estrés

```bash
cd 03_Backend/pmp-api
node stress_test.js
# Output esperado: 14/14 tests pasados (~15s)
```

### Interpretación

```
✅ PASS: [nombre]           → Test aprobado
❌ FAIL: [nombre] → [detalles]  → Test fallado
⚠️  NOTA: ...               → Info sin fallo
```

---

*Documento parte del proyecto: "Sistema ERP PMP Suite — Gestión de Mantenimiento Preventivo"*  
*DuocUC — Ingeniería en Informática — Abril 2026*
