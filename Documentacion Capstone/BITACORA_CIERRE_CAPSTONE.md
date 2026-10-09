# Bitácora de cierre Capstone PMP Suite

## Propósito

Esta bitácora registra las validaciones, resultados y documentos utilizados
para cerrar PMP Suite. Cada resultado debe indicar fecha, entorno, datos de
prueba y evidencia asociada. Una función solo se considera demostrada cuando el
resultado puede reproducirse.

## Línea base del 12 de septiembre de 2026

| Área | Verificación | Resultado |
|---|---|---|
| Backend | `npm test` | 52 de 52 pruebas aprobadas |
| Frontend | `npm test` | 42 de 42 pruebas aprobadas |
| Frontend | `npm run build` | Aprobado, 2526 módulos transformados |
| Frontend | Bundle principal | 274,16 kB, gzip 72,47 kB |
| Firebase Admin | Health check de Rafael y Jorge | Consistente |
| IA | Importación de `psycopg2` en `.venv` | Aprobada, versión 2.9.11 |
| Backend activo | `GET /api/health` | HTTP 200 |
| Frontend activo | Página principal | HTTP 200 |

## Estado del dataset demostrativo

| Entidad o etapa | Cantidad |
|---|---:|
| Validadores | 50 |
| Consolas | 50 |
| Órdenes de servicio | 100 |
| Equipos en terreno | 25 |
| Equipos en bodega | 25 |
| Equipos en laboratorio | 25 |
| Equipos en QA | 25 |
| Escaneos posteriores al reinicio | 0 |
| Eventos posteriores al reinicio | 0 |

El dataset está listo para ejecutar un recorrido nuevo y obtener evidencia sin
mezclarla con pruebas anteriores.

## Decisiones vigentes

- Se utiliza metodología tradicional o Cascada.
- PostgreSQL define el rol efectivo y el estado activo del usuario.
- Firebase autentica la identidad y sus atributos son secundarios.
- Los roles oficiales son `admin`, `gerente`, `logistica`, `qa`,
  `tecnico_laboratorio` y `tecnico_terreno`.
- El gerente posee lectura global y no puede realizar escrituras operacionales.
- El administrador controla asignaciones y movimientos físicos del laboratorio.
- El técnico de laboratorio diagnostica y repara su carga asignada.
- La identificación física acepta serie o AMID en validadores y serie en
  consolas.
- Los campos reservados para una integración externa se conservan en el modelo,
  pero no se presentan como una integración implementada.
- No se incorporarán módulos grandes durante el cierre.

## Plan de cierre

| Orden | Actividad | Estado | Evidencia esperada |
|---:|---|---|---|
| 1 | Actualizar README y documentación crítica | Completado | README y cinco artefactos Cascada actualizados |
| 2 | Retirar referencias de despliegue y funciones obsoletas | Completado | Sin referencias visibles no vigentes; campos estructurales preservados |
| 3 | Ejecutar el flujo operacional completo | Completado | E2E aislado de 9 etapas aprobado |
| 4 | Organizar evidencias | En curso | Índice creado y evidencias técnicas normalizadas |
| 5 | Validar la aplicación móvil | En curso | Bundle Android aprobado; matriz en dispositivo real pendiente |
| 6 | Ejecutar rendimiento y manejo de errores | Pendiente | Reporte de entorno aislado |
| 7 | Completar documentación académica de IA | Pendiente | Dataset, variables, métricas y limitaciones |
| 8 | Revisar diagramas | Pendiente | Fuentes y exportaciones finales consistentes |
| 9 | Consolidar Git | A cargo del equipo | Historial y participación por integrante |
| 10 | Preparar demostración y presentación | Pendiente | Guion, presentación y ensayo |

## Registro de cambios

### 12 de septiembre de 2026

- Se verificaron las suites automatizadas del backend y frontend.
- Se verificó el build de producción del frontend.
- Se comprobó el entorno Python utilizado por el servicio de IA.
- Se comprobó la identidad de Rafael Oteiza y Jorge Castillo mediante Firebase
  Admin sin modificar usuarios ni atributos.
- Se comprobó el estado actual del dataset demostrativo mediante consultas de
  solo lectura.
- Se inició la actualización del README y de los artefactos de metodología
  Cascada.

### 14 de septiembre de 2026

- Se completó la actualización del README, requisitos, arquitectura, manuales y
  cinco artefactos Word de metodología Cascada.
- Se reemplazó el diagrama de contenedores por la arquitectura de ejecución
  local realmente utilizada y se verificaron visualmente todas las páginas.
- Se confirmó que las referencias restantes a integración externa corresponden
  a campos estructurales reservados; no se presentan como una integración
  implementada.
- Se ejecutó el flujo físico E2E en un clúster PostgreSQL efímero: 9 de 9 etapas
  aprobadas, 6 escaneos validados y 4 bloqueos de negocio correctos.
- El E2E confirmó que admin recibe y despacha físicamente en laboratorio,
  mientras el técnico de laboratorio diagnostica y repara.
- Se verificó que la base principal permaneció sin cambios y que el entorno
  temporal fue eliminado.
- Se repitieron las suites después del ajuste del guion: backend 52/52 y
  frontend 42/42.
- Se eliminó la IP fija del código móvil y se incorporó configuración mediante
  `EXPO_PUBLIC_API_URL`, con ejemplo para dispositivo físico y emulador.
- Se reparó la instalación local incompleta de Expo mediante `npm ci`, sin
  agregar dependencias ni alterar el lockfile.
- Se generó correctamente el bundle Android: 918 módulos, bundle Hermes de 3 MB
  y 40 archivos exportados. La prueba funcional en teléfono físico permanece
  pendiente y cuenta con una matriz de siete casos.
- Se creó el índice de evidencias y el registro `EV-MOB-001`.

## Criterio de evidencia

Cada prueba final debe guardar:

1. identificador del caso;
2. fecha y responsable;
3. precondiciones y datos utilizados;
4. pasos ejecutados;
5. resultado esperado y resultado obtenido;
6. evidencia visual o técnica;
7. estado aprobado, rechazado o bloqueado;
8. observaciones y acciones correctivas.
