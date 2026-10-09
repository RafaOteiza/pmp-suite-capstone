# Administración y supervisión general

**Versión:** V2.0

**Estado:** vigente — 09-10-2026

## Propósito

Administración del sistema y supervisión operacional son responsabilidades distintas. El rol `admin` gestiona identidades, roles y funciones administrativas; el rol `gerente` consume información ejecutiva; `jefe_laboratorio` administra el dominio de Laboratorio.

## Requisitos funcionales

- **RF-ADM-01:** Admin debe consultar Supervisión global, OS, parque, trazabilidad y reportes autorizados.
- **RF-ADM-02:** Admin debe gestionar usuarios y roles oficiales.
- **RF-ADM-03:** Admin no debe heredar automáticamente custodia de Bodega, QA, Terreno o Laboratorio.
- **RF-ADM-04:** Gerente debe consultar Dashboard ejecutivo y vistas de supervisión sin escrituras operacionales.
- **RF-ADM-05:** Jefe Laboratorio debe disponer de resumen, recepción, asignación, equipos y despacho de Laboratorio.
- **RF-ADM-06:** Las rutas directas deben aplicar el mismo RBAC que la navegación.
- **RF-ADM-07:** Supervisión debe contar activos únicos por tipo + serie y separar OS/casos del parque.
- **RF-ADM-08:** Los KPI deben diferenciar cero real, sin medición y error.
- **RF-ADM-09:** La predicción/reincidencia es de consulta y no ejecuta acciones automáticas.
- **RF-ADM-10:** Las operaciones administrativas de cuentas deben proteger el último Admin y la autoedición de privilegios.

## No implementado como configuración global

No se declara implementado un CRUD dinámico de roles, transiciones, ubicaciones o catálogos generales ni un panel de configuración global. La pantalla llamada anteriormente «Configuración autorizada» corresponde a seguridad personal. Los roles son explícitos en código.

## Requisitos no funcionales

- Denegación por defecto en backend.
- Logs de autorización sin credenciales.
- Dashboards y navegación derivados de capacidades.
- Componentes UI compartidos, temas claro/oscuro y estados semánticos.
- Consultas de supervisión no deben modificar custodia ni stock.

## Roles de supervisión

| Dominio | Admin | Gerente | Jefe Laboratorio |
|---|---|---|---|
| Supervisión global | Sí | Sí | No |
| Usuarios y roles | Sí | No | No |
| Laboratorio — consulta | Sí | Sí | Sí |
| Laboratorio — custodia/asignación | No | No | Sí |
| Bodega — consulta | Sí | Sí | No |
| Bodega — movimientos | No | No | No |
| QA — consulta | Sí | Sí | No |
| QA — ejecución | No | No | No |
