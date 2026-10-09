# PMP Suite — Informe de Pruebas V2.0

**Actualización:** 09-10-2026

## Resultado vigente

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

## Fallo conocido

La suite Web mantiene un fallo de fixture: un mock asociado a `AssetHistoryScreen` no exporta `useAuth`. No se considera corregido.

## Validación manual

El recorrido manual controlado llegó hasta:

```text
instalación
→ reporte de falla
→ retiro Terreno
→ recepción Bodega
→ envío/recepción Laboratorio
→ asignación
→ diagnóstico/reparación/prueba
→ finalización técnica
→ salida de Laboratorio hacia Bodega
```

Las etapas QA, retorno final a Bodega y nueva instalación continúan como validación manual pendiente.

## Estrategia

- Node Test Runner;
- HTTP/RBAC;
- PostgreSQL efímero;
- E2E;
- visual responsive;
- Mobile con mocks;
- manual Web/Mobile;
- rendimiento en entorno aislado.

## Pendientes

- fixture Web;
- cámara/lector/Safe Area en dispositivo;
- recorrido QA → Bodega → reinstalación;
- repetición de rendimiento/seguridad en entorno descartable.
