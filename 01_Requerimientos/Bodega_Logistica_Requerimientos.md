# Módulo: Bodega / Logística

Este documento detalla los requisitos y especificaciones para el módulo de Bodega / Logística del sistema PMP Suite.

## 1. Requisitos Funcionales (RF)

*   **RF.BOD.1:** El sistema debe permitir a los roles autorizados (ej. 'logistica', 'bodega', 'admin') ver el inventario actual de repuestos, incluyendo el stock disponible y el stock crítico.
*   **RF.BOD.2:** El sistema debe permitir a los roles autorizados realizar ajustes manuales al stock de repuestos (sumar o restar cantidades).
*   **RF.BOD.3:** El sistema debe permitir registrar la recepción de nuevos repuestos en el inventario, asociados a una guía o documento de entrada.
*   **RF.BOD.4:** El sistema debe descontar automáticamente del inventario los repuestos utilizados en las reparaciones de Órdenes de Servicio (OS) que han sido registradas (integración con OS y Laboratorio).
*   **RF.BOD.5:** El sistema debe permitir a los roles autorizados gestionar las solicitudes de repuestos (aprobar, rechazar, despachar) provenientes del módulo de Laboratorio.
*   **RF.BOD.6:** El sistema debe generar alertas cuando el stock de un repuesto caiga por debajo de su nivel crítico.
*   **RF.BOD.7:** El sistema debe permitir registrar el despacho de equipos reparados y aprobados de QA, a su destino final o a otra ubicación de bodega.
*   **RF.BOD.8:** El sistema debe permitir gestionar las ubicaciones físicas de los repuestos y equipos dentro de la bodega.
*   **RF.BOD.9:** El sistema debe permitir a los roles autorizados generar reportes de inventario (ej. movimientos de stock, consumo de repuestos por OS, inventario valorado).
*   **RF.BOD.10:** El sistema debe permitir la gestión de equipos operativos (validadores, consolas), incluyendo su asignación a buses PPU y su estado.
*   **RF.BOD.11:** El sistema debe permitir registrar guías de despacho/recepción de equipos, asociándolas a números de guía y destinos/orígenes.

## 2. Requisitos No Funcionales (RNF)

*   **RNF.BOD.1 (Rendimiento):** La consulta del inventario y los movimientos de stock deben ser rápidos, cargando en menos de 1 segundo.
*   **RNF.BOD.2 (Usabilidad):** La interfaz para la gestión de inventario y solicitudes debe ser intuitiva para minimizar errores.
*   **RNF.BOD.3 (Seguridad):** El acceso a las funciones de ajuste de stock y gestión de solicitudes debe estar restringido a los roles de 'logistica', 'bodega' y 'admin'.
*   **RNF.BOD.4 (Integridad):** Los movimientos de stock deben ser trazables y con registros inmutables.
*   **RNF.BOD.5 (Auditoría):** Todos los ajustes de stock y despachos de repuestos/equipos deben ser registrados con el usuario responsable, fecha y motivo.
*   **RNF.BOD.6 (Consistencia):** El stock de repuestos debe ser consistente con los consumos de OS y las recepciones.

## 3. Historias de Usuario (HU)

*   **HU.BOD.1 (Consulta de Inventario):** Como encargado de bodega, quiero ver el stock actual de todos los repuestos para saber qué necesito reponer.
    *   **Criterios de Aceptación:**
        *   Dado que accedo al inventario, entonces veo una lista de repuestos con su cantidad actual y nivel crítico.
        *   Cuando un repuesto está por debajo del stock crítico, entonces veo una alerta visual.
*   **HU.BOD.2 (Recepción de Repuestos):** Como encargado de bodega, quiero registrar la entrada de nuevos repuestos al inventario para mantener el stock actualizado.
    *   **Criterios de Aceptación:**
        *   Dado que recibo un envío de repuestos, cuando registro la cantidad y la guía asociada, entonces el stock del repuesto se incrementa.
*   **HU.BOD.3 (Despacho de Repuestos):** Como encargado de bodega, quiero despachar los repuestos solicitados por laboratorio, para que puedan realizar las reparaciones.
    *   **Criterios de Aceptación:**
        *   Dado que tengo una solicitud de repuestos aprobada, cuando confirmo el despacho, entonces el stock de esos repuestos se decrementa y el estado de la solicitud cambia a "Despachada".
*   **HU.BOD.4 (Ajuste de Stock):** Como encargado de bodega, quiero poder ajustar el stock de un repuesto manualmente para corregir inventarios.
    *   **Criterios de Aceptación:**
        *   Dado que identifico una inconsistencia, cuando ajusto el stock, entonces la cantidad se actualiza y el cambio se registra con un motivo.
*   **HU.BOD.5 (Gestión de Guías):** Como encargado de logística, quiero registrar guías de despacho/recepción de equipos para tener trazabilidad.
    *   **Criterios de Aceptación:**
        *   Dado que un equipo se mueve, cuando registro la guía con origen, destino y creado por, entonces la guía se almacena en el sistema.
*   **HU.BOD.6 (Reportes de Bodega):** Como administrador, quiero generar reportes de inventario y movimientos para analizar la gestión de la bodega.
    *   **Criterios de Aceptación:**
        *   Dado que selecciono un rango de fechas y filtros, cuando genero el reporte, entonces veo datos sobre stock, consumos y movimientos.

## 4. Casos de Uso (CU)

*   **CU.BOD.1: Consultar Inventario de Repuestos**
    *   **Actor:** Encargado de Bodega, Logística, Administrador, Técnico de Laboratorio
    *   **Precondiciones:** Usuario autenticado con rol autorizado.
    *   **Flujo Normal:**
        1.  El usuario accede a la sección de inventario.
        2.  El sistema consulta la tabla `pmp.repuestos`.
        3.  El sistema muestra la lista de repuestos con `nombre`, `categoria`, `stock`, `stock_critico`.
        4.  El sistema resalta los repuestos con stock por debajo del crítico.
*   **CU.BOD.2: Registrar Recepción de Repuestos**
    *   **Actor:** Encargado de Bodega, Administrador
    *   **Precondiciones:** Usuario autenticado con rol autorizado. Repuestos físicos recibidos.
    *   **Flujo Normal:**
        1.  El usuario accede a la función de "Registrar Recepción".
        2.  El usuario introduce los detalles de los repuestos y cantidades recibidas, y una referencia a la guía de entrada.
        3.  El sistema actualiza el `stock` en `pmp.repuestos`.
        4.  El sistema registra un movimiento de stock en una tabla de historial (`pmp.movimientos_stock` con `motivo='RECEPCION_GUIA'`).
        5.  El sistema confirma la recepción.
*   **CU.BOD.3: Despachar Repuestos a Laboratorio**
    *   **Actor:** Encargado de Bodega, Administrador
    *   **Precondiciones:** Usuario autenticado con rol autorizado. Solicitud de repuestos aprobada por Laboratorio.
    *   **Flujo Normal:**
        1.  El usuario accede a la sección de solicitudes de repuestos pendientes de despacho.
        2.  El usuario selecciona una solicitud aprobada.
        3.  El usuario confirma el despacho.
        4.  El sistema decrementa el `stock` de los `pmp.repuestos` involucrados.
        5.  El sistema cambia el `estado` de `pmp.solicitudes_repuestos` a 'DESPACHADA'.
        6.  El sistema registra un movimiento de stock (`motivo='CONSUMO_OS'` o similar).
        7.  El sistema confirma el despacho.
*   **CU.BOD.4: Gestión de Equipos Operativos**
    *   **Actor:** Logística, Administrador
    *   **Precondiciones:** Usuario autenticado con rol autorizado. Equipos (validadores/consolas) disponibles.
    *   **Flujo Normal:**
        1.  El usuario accede a la sección de equipos operativos.
        2.  El usuario selecciona un equipo y lo asigna a un bus PPU o cambia su estado.
        3.  El sistema actualiza la información en las tablas `pmp.validadores` o `pmp.consolas` y registra movimientos.
        4.  El sistema confirma la operación.

## 5. Especificaciones Técnicas Clave

*   **Esquema de Base de Datos (Adicional/Detalle):**
    *   `pmp.repuestos`: `id`, `nombre`, `categoria` (ENUM), `stock`, `stock_critico`. `stock >= 0` CONSTRAINT.
    *   `pmp.solicitudes_repuestos`: `estado` (ENUM: 'PENDIENTE', 'APROBADA', 'RECHAZADA', 'DESPACHADA').
    *   `pmp.movimientos_stock`: Tabla para auditar movimientos. `id`, `repuesto_id`, `cantidad_cambio`, `motivo` (ENUM: 'CONSUMO_OS', 'AJUSTE', 'RECEPCION_GUIA', etc.), `fecha`, `usuario_id`.
    *   `pmp.guias`: `numero`, `fecha`, `origen_id` (FK a `pmp.ubicaciones`), `destino_id` (FK a `pmp.ubicaciones`), `creado_por` (FK a `pmp.usuarios`).
    *   `pmp.guia_detalle`: `guia_numero` (FK a `pmp.guias`), `tipo_equipo`, `validador_serie` (FK a `pmp.validadores`), `consola_serie` (FK a `pmp.consolas`), `bus_ppu` (FK a `pmp.buses`), `codigo_os` (FK a `pmp.ordenes_servicio`).
    *   `pmp.validadores`, `pmp.consolas`: Tablas para equipos con sus series, modelos, marcas.
    *   `pmp.ubicaciones`: `id`, `nombre`, `tipo` (ENUM: 'BODEGA', 'LABORATORIO', 'QA').
*   **Roles Clave:** 'logistica', 'bodega', 'admin'.
*   **API Endpoints Clave (Ejemplos):**
    *   `GET /api/bodega/inventario`: Listar inventario de repuestos.
    *   `POST /api/bodega/repuestos/recepcion`: Registrar recepción de repuestos.
    *   `PATCH /api/bodega/repuestos/:id/ajuste`: Ajustar stock de repuesto.
    *   `PATCH /api/bodega/solicitudes/:id/despachar`: Despachar repuestos de solicitud.
    *   `POST /api/bodega/guias`: Registrar nueva guía.
    *   `GET /api/bodega/reportes`: Generar reportes.
    *   `GET /api/equipos-operativos`: Gestionar equipos operativos.
*   **Integración:** Con módulos de Órdenes de Servicio, Laboratorio, QA y Usuarios.
