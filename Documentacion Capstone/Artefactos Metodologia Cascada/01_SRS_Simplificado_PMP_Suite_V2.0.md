# 01 — SRS Simplificado PMP Suite V2.0

## 1. Alcance

Sistema Web/Mobile para gestionar el ciclo de mantenimiento de validadores y consolas, con API, PostgreSQL, Firebase y analítica de apoyo.

## 2. Actores

`admin`, `gerente`, `jefe_laboratorio`, `logistica`, `qa`, `tecnico_laboratorio`, `tecnico_terreno`.

## 3. Requisitos funcionales principales

### Activos
- Identidad por tipo + serie.
- Alta de maestro separada de OS.
- Regla modelo/marca compartida.
- Recepción inicial Physical First.

### Casos y OS
- Caso, OS, activo y referencia externa son conceptos distintos.
- MV/MC para mantenimiento; PDV/PDC para PoD; IN para instalación.
- IN creada solo al confirmar salida a Terreno.
- Bridge solo correlaciona.

### Terreno
- Mis órdenes y carga propia.
- Reporte de falla sobre activo en operación.
- Retiro con evidencia física o contingencia autorizada.
- Historial técnico restringido.

### Bodega
- Recepciones y despachos por custodia real.
- Inventario de activos y disponibilidad.
- Repuestos y alertas.
- PPU/terminal/operador coherentes.

### Laboratorio
- Bandeja En camino/Recibidos/Incidencias/Historial.
- SLA desde recepción física vigente.
- Jefe asigna; técnico ejecuta su carga.
- Diagnóstico, intervención, pruebas y resultado.
- Salida física separada.

### QA
- Recepción, Ambiente, Pruebas, Dictamen y Despacho.
- QA toma su trabajo.
- Dictamen no mueve custodia.
- Rechazo conserva antecedentes.

### Administración
- Firebase autentica.
- PostgreSQL define rol.
- Admin gestiona usuarios.
- Gerencia es read-only.
- No existe wildcard Admin.

### Analítica
- Lectura PostgreSQL.
- Heurística/modelo debe identificarse correctamente.
- No ejecuta acciones.

## 4. Requisitos no funcionales

- seguridad y denegación por defecto;
- transacciones para movimientos críticos;
- idempotencia controlada;
- errores diferenciados;
- responsive y claro/oscuro;
- trazabilidad por evento;
- secretos fuera de Git;
- pruebas destructivas aisladas.

## 5. Criterios de aceptación

El detalle verificable se mantiene en `01_Requerimientos/ERS_PMP_Suite_v5_0.md` y en `08_Pruebas/`.
