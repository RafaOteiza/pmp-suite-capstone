# Tareas de Desarrollo: Módulo Integral de Bodega

## 1. Tránsito QA -> Bodega
- [x] Modificar `qa.routes.js` para enviar siempre a estado 11 con flag `es_aprobado_qa`.
- [x] Modificar `bodega.routes.js` (`/receive` y `/queue`) para integrar lógica de QA.
- [x] Reflejar veredicto QA en `BodegaPage.tsx` al recibir.

## 2. Gestión de Repuestos
- [x] Crear backend endpoints para actualizar stock de repuestos y procesar solicitudes.
- [x] Crear frontend `BodegaRepuestosPage.tsx` con listado de stock y panel de alertas/solicitudes.

## 3. Dashboards Especializados por Rol
- [x] Crear/adaptar vistas específicas (Widgets) según el `rol` del usuario.
- [x] Mostrar gráficos de forma condicional en `DashboardPage.tsx`.

## 4. Ciclo de Vida: Órdenes de Instalación (IN-)
- [x] Aplicar cambios en DB (columna `es_instalacion`, secuencia `seq_in`, trigger `generar_id_os`).
- [x] Modificar lógica de recepción en `bodega.routes.js` para cerrar OS antigua y abrir nueva `IN-`.
- [x] Modificar lógica de asignación en `bodega.routes.js` para actualizar a `IN-`.
- [x] Filtrar estados 8, 12, 13 en Dashboards para evitar duplicidad.
- [x] Verificar flujo completo con una prueba en vivo.
