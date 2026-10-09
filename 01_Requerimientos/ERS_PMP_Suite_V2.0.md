# Especificación de Requisitos de Software — PMP Suite V2.0

**Versión:** V2.0  
**Estado:** vigente  
**Actualización:** 09-10-2026

## 1. Propósito

PMP Suite controla el ciclo físico y técnico de validadores y consolas: alta, instalación, falla, retiro, Bodega, Laboratorio, QA, retorno a stock y reinstalación. La solución integra Web, API REST, PostgreSQL, Firebase Authentication, Mobile Expo y una capa de analítica Python.

## 2. Actores y separación de responsabilidades

| Rol | Responsabilidad principal | Escrituras operacionales |
|---|---|---|
| `admin` | Usuarios, roles, seguridad y supervisión global | No recibe permisos físicos automáticos |
| `gerente` | Indicadores, reportes y trazabilidad ejecutiva | No |
| `jefe_laboratorio` | Recepción, asignación, supervisión y despacho de Laboratorio | Solo Laboratorio |
| `logistica` | Bodega, inventario, repuestos, requerimientos, retiros y despachos | Sí, dominio logístico |
| `qa` | Recepción QA, Ambiente, pruebas, dictamen y despacho | Sí, dominio QA |
| `tecnico_laboratorio` | Diagnóstico, intervención, pruebas y repuestos de su carga | Solo asignadas |
| `tecnico_terreno` | Instalaciones, retiros, fallas e intervenciones propias | Solo asignadas/propias |

Firebase autentica. PostgreSQL determina cuenta activa y rol efectivo.

## 3. Requisitos funcionales

### 3.1 Identidad y activos

- **RF-ACT-01:** La identidad del activo es `tipo + serie`.
- **RF-ACT-02:** Gestión de activos registra el maestro; no crea una OS ni cambia custodia.
- **RF-ACT-03:** Modelo y marca se derivan automáticamente:
  - Validador `72...` → CVB35 / Mikroelektronika.
  - Validador `74...` o `75...` → CVB45 / Mikroelektronika.
  - Consola → N9715 / Waysion.
- **RF-ACT-04:** Un prefijo de validador desconocido debe bloquear el alta.
- **RF-ACT-05:** La recepción inicial en Bodega requiere evidencia física propia y conformidad explícita; habilita stock sin inventar mantenimiento ni QA.

### 3.2 Casos y OS

- **RF-OS-01:** Un caso/requerimiento y una OS son conceptos distintos.
- **RF-OS-02:** Las OS de mantenimiento usan MV/MC; PoD usa PDV/PDC; instalación usa IN.
- **RF-OS-03:** La OS conserva el activo que originó la intervención.
- **RF-OS-04:** La IN utiliza correlativo PMP independiente y se crea únicamente al confirmar el despacho físico a Terreno.
- **RF-OS-05:** La referencia Aranda u otra referencia externa no reemplaza el código PMP.
- **RF-OS-06:** Bridge solo correlaciona referencias externas con activos/OS existentes.

### 3.3 Terreno

- **RF-TER-01:** Terreno consulta sus órdenes, instalaciones y retiros.
- **RF-TER-02:** Reportar falla debe seleccionar un activo realmente en operación; PPU, terminal y operador se muestran a partir de la instalación vigente.
- **RF-TER-03:** El retiro requiere validar identidad física mediante cámara/lector o contingencia autorizada.
- **RF-TER-04:** Un equipo retirado permanece asociado al caso/OS y pasa a tránsito; no se considera recibido por Bodega hasta la confirmación de destino.
- **RF-TER-05:** El historial para Terreno expone solo información técnica necesaria: falla, diagnóstico, trabajo, resultado y observaciones técnicas.

### 3.4 Bodega / Logística

- **RF-LOG-01:** Bodega dispone de colas de recepción y despacho según custodia real.
- **RF-LOG-02:** Recepción y salida requieren evidencia nueva del movimiento actual.
- **RF-LOG-03:** El dashboard logístico representa parque, ubicación y disponibilidad; las OS son secundarias salvo instalación/pendientes.
- **RF-LOG-04:** Inventario diferencia parque global, stock físico, disponibles y no disponibles.
- **RF-LOG-05:** La selección de instalación es physical-first: contexto + activo físico + confirmación.
- **RF-LOG-06:** El stock reparado queda elegible después de aprobación QA y recepción física en Bodega.
- **RF-LOG-07:** La entrega de repuestos descuenta stock una sola vez y en transacción.
- **RF-LOG-08:** Ajustes directos de stock permanecen bloqueados mientras no exista política de ajuste legítimo.

### 3.5 Laboratorio

- **RF-LAB-01:** La bandeja de recepción separa En camino, Recibidos, Incidencias e Historial.
- **RF-LAB-02:** Solo una recepción física confirmada inicia el SLA y habilita asignación.
- **RF-LAB-03:** Jefe Laboratorio puede asignar/reasignar carga a técnicos activos.
- **RF-LAB-04:** Técnico Laboratorio solo modifica su carga.
- **RF-LAB-05:** El trabajo técnico registra diagnóstico, falla real, intervenciones, pruebas, resultado y observaciones para QA.
- **RF-LAB-06:** Finalizar trabajo deja el equipo listo para salida; no confirma el movimiento físico.
- **RF-LAB-07:** La salida hacia Bodega requiere nueva evidencia física independiente.
- **RF-LAB-08:** Reingresos conservan ciclos y antecedentes sin heredar aprobaciones de un ciclo anterior.

### 3.6 QA

- **RF-QA-01:** QA recibe físicamente equipos enviados desde Bodega.
- **RF-QA-02:** QA toma/inicia su trabajo sin asignación administrativa externa.
- **RF-QA-03:** Instalación Ambiente, pruebas y dictamen forman parte del flujo QA.
- **RF-QA-04:** Dictamen Operativo/Rechazado no confirma despacho.
- **RF-QA-05:** La salida hacia Bodega requiere evidencia propia y confirmación separada.
- **RF-QA-06:** Un rechazo debe conservar motivo y contexto para el reingreso a Laboratorio.

### 3.7 Usuarios y RBAC

- **RF-AUT-01:** Firebase autentica el usuario; PostgreSQL valida vínculo, estado activo y rol.
- **RF-AUT-02:** Claims, query, body o parámetros del cliente no conceden permisos.
- **RF-AUT-03:** Admin gestiona usuarios y roles, sin wildcard operacional.
- **RF-AUT-04:** No se permite retirar el último Admin activo.
- **RF-AUT-05:** Un Admin no puede desactivar su propia cuenta ni cambiarse el rol desde la gestión administrativa.
- **RF-AUT-06:** Las contraseñas se gestionan en Firebase; PMP exige mínimo de 8 caracteres cuando Admin define una nueva.
- **RF-AUT-07:** Cada usuario puede gestionar su seguridad personal conforme al flujo autorizado.

### 3.8 Trazabilidad y supervisión

- **RF-TRA-01:** La trazabilidad debe conservar historial por tipo + serie.
- **RF-TRA-02:** Admin/Gerencia consultan supervisión global; Jefe Laboratorio usa una proyección limitada al dominio Lab.
- **RF-TRA-03:** Un error de consulta debe mostrarse como error, no como cero.
- **RF-TRA-04:** Los dashboards no deben contar dos veces el mismo activo en la distribución del parque.

### 3.9 Analítica

- **RF-IA-01:** El análisis usa datos PostgreSQL en modo lectura.
- **RF-IA-02:** El resultado es apoyo de priorización; no crea OS, movimientos ni decisiones automáticas.
- **RF-IA-03:** El frontend debe identificar el método real utilizado y evitar métricas no sustentadas.

## 4. Requisitos no funcionales

### Seguridad

- Rutas protegidas: Firebase → usuario PostgreSQL → autorización de acción → validación de recurso.
- Denegación por defecto para acciones sensibles.
- Sin contraseñas, tokens ni credenciales en logs o repositorio.
- Escrituras críticas transaccionales e idempotencia controlada.

### Integridad

- Salida y recepción son eventos distintos.
- Evidencia de un movimiento no se reutiliza para otro.
- Las transiciones incompatibles se rechazan.
- La vida de activos diferentes nunca se fusiona.

### UX/UI

- Identidad visual PMP Suite y tokens compartidos.
- Claro/oscuro, responsive y sin overflow horizontal accidental.
- Estados con texto + icono + color.
- Semántica consistente: verde correcto, ámbar pendiente, rojo error, azul informativo, gris sin datos.

### Portabilidad

- Entorno habitual: Windows + PostgreSQL + Node + Vite + Expo.
- Ubuntu/Nginx/PM2 es proyección de despliegue; no está certificada como entorno productivo.

## 5. Fuentes de verificación

- `08_Pruebas/RBAC_SEGURIDAD_V2.0.md`
- `08_Pruebas/FLUJOS_OPERACIONALES_V2.0.md`
- `08_Pruebas/UX_EXPERIENCIA_V2.0.md`
- `08_Pruebas/INFORME_PRUEBAS_V2.0.md`
