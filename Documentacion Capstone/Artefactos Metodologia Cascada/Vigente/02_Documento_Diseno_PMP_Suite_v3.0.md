# 02 — Documento de Diseño PMP Suite v3.0

## Arquitectura

```text
Web React/Vite ─┐
                ├─ API Node/Express ─ PostgreSQL
Mobile Expo ────┘         │
                          ├─ Firebase
                          └─ Python IA
```

## Capas

- Presentación Web/Mobile.
- API/Routes.
- Middleware identidad/autorización.
- Servicios de dominio.
- Persistencia PostgreSQL.

## Modelo de identidad

Activo = `tipo_equipo + serie`.

Reglas:
- 72 → CVB35 / Mikroelektronika.
- 74/75 → CVB45 / Mikroelektronika.
- Consola → N9715 / Waysion.

## Componentes de dominio

- usuarios/RBAC;
- activos;
- casos/OS;
- Bridge;
- escaneos/evidencias;
- Terreno;
- Bodega;
- Laboratorio;
- QA;
- repuestos;
- dashboards;
- IA.

## Diseño de seguridad

```text
Firebase token
→ usuario PostgreSQL activo
→ autorización por acción
→ scope de recurso/asignación
→ servicio de dominio
```

Admin no tiene wildcard.

## Diseño Physical First

Cada movimiento utiliza dos pasos lógicos:

1. validar evidencia/identidad;
2. confirmar el movimiento.

La evidencia de un movimiento no sirve para otro.

## Datos

Entidades principales:

- usuarios;
- validadores/consolas;
- casos_operacionales;
- ordenes_servicio;
- flujo_eventos;
- escaneos_equipos;
- registro_reparaciones;
- bridge_referencias;
- repuestos/solicitudes;
- ubicaciones/estados/buses/terminales/PST.

## Diseño de despliegue

Entorno actual nativo: PostgreSQL + API Node + Vite + Expo + Python. Ubuntu/Nginx/PM2 se mantiene como proyección de despliegue servidor.

## Diagramas

Las fuentes actualizadas se mantienen en `Diagramas_PlantUML/`.
