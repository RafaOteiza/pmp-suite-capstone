# 02 — Documento de Diseño PMP Suite V2.0

## 1. Arquitectura

```text
Web React/Vite ─┐
                ├── API Node/Express ── PostgreSQL (pmp)
Mobile Expo ────┘          │
                           ├── Firebase
                           └── Python IA
```

La especificación completa está en:

- `02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md`
- `02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md`
- `02_Arquitectura/CATALOGO_API_V2.0.md`

## 2. Capas

1. Presentación Web/Mobile.
2. Navegación/RBAC de presentación.
3. API REST.
4. Middleware de identidad.
5. Autorización por acción.
6. Servicios de dominio.
7. Persistencia/eventos/evidencia.
8. Analítica de lectura.

## 3. Componentes

- Auth/usuarios.
- Activos.
- Requerimientos.
- OS/Terreno.
- Bodega.
- Laboratorio.
- QA.
- Repuestos.
- Escaneo/evidencia.
- Bridge.
- Trazabilidad.
- Dashboards.
- IA.

## 4. Modelo de seguridad

```text
Firebase ID Token
→ validar identidad
→ usuario PostgreSQL activo
→ rol efectivo
→ authorize(action)
→ scope del recurso
→ transacción
```

## 5. Diseño Physical First

Una captura válida genera evidencia. La transición ocurre en una segunda operación explícita.

Las evidencias se atan a:

- estación;
- usuario;
- activo;
- OS/evento;
- propósito;
- ciclo;
- contexto;
- fecha.

## 6. Modelo de datos

26 tablas clasificadas por la herramienta de verificación. Núcleo:

- usuarios;
- validadores/consolas;
- casos_operacionales;
- ordenes_servicio;
- flujo_eventos;
- escaneos_equipos;
- registro_reparaciones;
- solicitudes/repuestos;
- bridge_referencias;
- os_historial_activo;
- guías/maestros.

## 7. Modelo de estados

Los IDs históricos se complementan con estados derivados desde eventos para representar tránsito, asignación, disponibilidad y etapas QA.

## 8. Concurrencia

- transacciones;
- FOR UPDATE;
- advisory locks;
- índices únicos;
- firmas de payload;
- reintentos idempotentes.

## 9. Web

Rutas protegidas por capacidades; Sidebar adaptado por rol; procesos en páginas/paneles inline.

## 10. Mobile

Terreno consume misma API: login, jornada, OS, falla, retiro, instalación, historial y cuenta.

## 11. Diagramas

- C4/contexto.
- Componentes.
- Comunicación.
- ERD.
- casos de uso;
- secuencia;
- BPMN AS-IS;
- BPMN TO-BE.

## 12. Decisiones

| Decisión | Razón |
|---|---|
| PostgreSQL como rol efectivo | evitar permisos por claims desactualizados |
| eventos append-only | trazabilidad |
| Jefe Lab independiente | segregación |
| QA autónomo | reflejar responsabilidad real |
| Bridge solo correlación | eliminar motor paralelo |
| IN al despacho | representar hecho físico |
| stock inicial sin OS | evitar OS ficticia |
