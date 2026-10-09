# Módulo: Bodega / Logística

Este documento detalla los requisitos y especificaciones para el módulo de Bodega / Logística del sistema PMP Suite.

Se rige por la [línea base Capstone v2.0](../Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_VIGENCIA_v2.0.md).
Gestión de activos registra el maestro; Requerimientos crea casos y OS solo para
activos existentes. Bridge conserva referencias externas y no asigna, despacha
ni modifica inventario. La recepción y el despacho respetan permisos y escaneo
físico vigentes. Docker no forma parte del alcance; se mantiene Expo SDK 57.

## 1. Requisitos Funcionales (RF)

*   **RF.BOD.1:** Admin y logística consultan inventario y stock crítico; gerente consulta según sus permisos. No existe un rol adicional `bodega`.
*   **RF.BOD.2:** La política de ajustes legítimos sigue pendiente de definición. La edición directa de cantidades está bloqueada; editar catálogo no cambia existencias.
*   **RF.BOD.3:** La entrada de repuestos con documento de respaldo requiere especificar la política de movimientos; no se simula como edición de stock.
*   **RF.BOD.4:** Bodega descuenta el repuesto al confirmar su entrega física autorizada, en transacción y con auditoría. Guardar o cerrar una reparación no lo descuenta nuevamente.
*   **RF.BOD.5:** El sistema debe permitir a los roles autorizados gestionar las solicitudes de repuestos (aprobar, rechazar, despachar) provenientes del módulo de Laboratorio.
*   **RF.BOD.6:** El sistema debe generar alertas cuando el stock de un repuesto caiga por debajo de su nivel crítico.
*   **RF.BOD.7:** El despacho a terreno debe admitir stock inicial recibido y conforme, y stock reparado aprobado por QA, en Bodega y elegible. Solo la confirmación física crea la IN independiente y SALIDA_BODEGA_TERRENO.
*   **RF.BOD.8:** El sistema debe permitir gestionar las ubicaciones físicas de los repuestos y equipos dentro de la bodega.
*   **RF.BOD.9:** El sistema debe permitir a los roles autorizados generar reportes de inventario (ej. movimientos de stock, consumo de repuestos por OS, inventario valorado).
*   **RF.BOD.10:** Equipos en operación debe consultar validadores y consolas instalados y operativos en buses, sin presentarlos como stock ni permitir asignación directa desde esa vista.
*   **RF.BOD.11:** El sistema debe permitir registrar guías de despacho/recepción de equipos, asociándolas a números de guía y destinos/orígenes.
*   **RF.BOD.12:** Recepcionar activo nuevo exige escaneo físico en la ubicación BODEGA y conformidad inicial explícita. Registra eventos por tipo + serie sin OS ni bus ficticio; no recorre diagnóstico/reparación/QA.
*   **RF.BOD.13:** Dar de alta o escanear no habilita automáticamente stock. La recepción confirmada registra RECEPCION_INICIAL y HABILITADO_INSTALACION; ALTA_ACTIVO y ESCANEO_BODEGA conservan su propia evidencia.
*   **RF.BOD.14:** Disponible para instalación, Asignado a técnico, En ruta y En operación deben mostrarse separados. Seleccionar un técnico o escanear no aumenta En ruta; se requiere SALIDA_BODEGA_TERRENO confirmado.
*   **RF.BOD.15:** La recepción desde QA habilita stock reparado cuando cumple elegibilidad, sin crear IN anticipada. Cada nueva IN usa el correlativo PMP `IN-xxxxxx`, independiente de Aranda y del caso.

## 2. Requisitos No Funcionales (RNF)

*   **RNF.BOD.1 (Rendimiento):** La consulta del inventario y los movimientos de stock deben ser rápidos, cargando en menos de 1 segundo.
*   **RNF.BOD.2 (Usabilidad):** La interfaz para la gestión de inventario y solicitudes debe ser intuitiva para minimizar errores.
*   **RNF.BOD.3 (Seguridad):** La entrega corresponde a logística/admin. Los ajustes directos están bloqueados hasta definir su política. Laboratorio no opera catálogo ni stock.
*   **RNF.BOD.4 (Integridad):** Los movimientos de stock deben ser trazables y con registros inmutables.
*   **RNF.BOD.5 (Auditoría):** Todos los ajustes de stock y despachos de repuestos/equipos deben ser registrados con el usuario responsable, fecha y motivo.
*   **RNF.BOD.6 (Consistencia):** El stock de repuestos debe ser consistente con los consumos de OS y las recepciones.

## 3. Historias de Usuario (HU)

HU.BOD.2 y HU.BOD.4 son objetivos pendientes de especificación, no operaciones habilitadas. La edición directa de existencias no los implementa.

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
    *   **Actor:** Logística, Administrador; Gerente en consulta
    *   **Precondiciones:** Usuario autenticado con rol autorizado.
    *   **Flujo Normal:**
        1.  El usuario accede a la sección de inventario.
        2.  El sistema consulta la tabla `pmp.repuestos`.
        3.  El sistema muestra la lista de repuestos con `nombre`, `categoria`, `stock`, `stock_critico`.
        4.  El sistema resalta los repuestos con stock por debajo del crítico.
*   **CU.BOD.2: Registrar Recepción de Repuestos — pendiente de política**
    *   **Actor:** Encargado de Bodega, Administrador
    *   **Precondiciones:** Usuario autenticado con rol autorizado. Repuestos físicos recibidos.
    *   **Flujo Normal:**
        1.  El usuario accede a la función de "Registrar Recepción".
        2.  El usuario introduce los detalles de los repuestos y cantidades recibidas, y una referencia a la guía de entrada.
        3.  El sistema actualiza el `stock` en `pmp.repuestos`.
        4.  Debe definirse el respaldo de la entrada; no existe una tabla adicional habilitada por esta revisión.
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
        6.  El sistema registra `LOGISTICA_ENTREGA_REPUESTO` en `flujo_eventos`, con solicitud, repuesto, cantidad, stock anterior/final y usuario. El reintento equivalente no duplica consumo.
        7.  El sistema confirma el despacho.
*   **CU.BOD.4: Gestión de Equipos Operativos**
    *   **Actor:** Logística, Administrador
    *   **Precondiciones:** Usuario autenticado con rol autorizado. Activos instalados y operativos.
    *   **Flujo Normal:**
        1.  El usuario accede a **Equipos en operación**.
        2.  Consulta tipo, serie, bus y condición operacional, sin acciones de asignación.
        3.  Abre el historial del activo por tipo + serie, con sus eventos y OS.
        4.  Para una nueva instalación utiliza **Listos para instalación → Despacho por escaneo**, sobre otro activo elegible cuando corresponda.

*   **CU.BOD.5: Recepción inicial de activo nuevo**
    1. Registrar previamente el maestro en Gestión de activos, sin OS ni stock.
    2. Seleccionar Recepcionar activo nuevo, leer físicamente el equipo en BODEGA y validar su identidad.
    3. Confirmar integridad y conformidad inicial. La consulta manual no habilita la recepción.
    4. Registrar recepción y habilitación de stock sin OS. Su historial incluye los eventos iniciales aunque aún no tenga intervenciones.
*   **CU.BOD.6: Despacho physical-first**
    1. Definir caso/contexto, tipo requerido, bus real, terminal y técnico.
    2. Tomar un equipo elegible y escanearlo; validar disponibilidad inicial o reparación aprobada y evidencia contextual.
    3. Confirmar la salida física: crear IN independiente, relacionar caso y origen de stock, asignar técnico y registrar SALIDA_BODEGA_TERRENO en una transacción.
    4. Retirar disponibilidad y mostrar En ruta. La instalación posterior en terreno establece En operación.

## 5. Especificaciones Técnicas Clave

*   **Esquema de Base de Datos (Adicional/Detalle):**
    *   `pmp.repuestos`: `id`, `nombre`, `categoria` (ENUM), `stock`, `stock_critico`. `stock >= 0` CONSTRAINT.
    *   `pmp.solicitudes_repuestos`: `estado` (ENUM: 'PENDIENTE', 'APROBADA', 'RECHAZADA', 'DESPACHADA').
    *   `pmp.flujo_eventos`: auditoría existente de entrega física, sin arquitectura paralela de movimientos.
    *   `pmp.guias`: `numero`, `fecha`, `origen_id` (FK a `pmp.ubicaciones`), `destino_id` (FK a `pmp.ubicaciones`), `creado_por` (FK a `pmp.usuarios`).
    *   `pmp.guia_detalle`: `guia_numero` (FK a `pmp.guias`), `tipo_equipo`, `validador_serie` (FK a `pmp.validadores`), `consola_serie` (FK a `pmp.consolas`), `bus_ppu` (FK a `pmp.buses`), `codigo_os` (FK a `pmp.ordenes_servicio`).
    *   `pmp.validadores`, `pmp.consolas`: Tablas para equipos con sus series, modelos, marcas.
    *   `pmp.ubicaciones`: `id`, `nombre`, `tipo` (ENUM: 'BODEGA', 'LABORATORIO', 'QA').
*   **Roles Clave:** `logistica`, `admin`; `gerente` en consulta.
*   **API vigente:**
    * `GET /api/bodega/repuestos`: catálogo y solicitudes autorizadas.
    * `PUT /api/bodega/solicitudes/:id/entregar`: entrega física transaccional.
    * `PUT /api/bodega/repuestos/:id/stock`: bloqueado (409); política pendiente.
    * `GET /api/bodega/stock`: maestros e identidades disponibles para instalación.
    * `POST /api/bodega/despacho/validar` y `/confirmar`: evidencia propia y confirmación de IN.
    * `PUT /api/bodega/asignar`: retirado (410); no permite omitir despacho físico.
    * `GET /api/dashboard/equipos-operativos`: activos instalados en operación.
*   **Integración:** Con Gestión de activos, Requerimientos, Órdenes de Servicio, Laboratorio, QA y Usuarios. Bridge participa únicamente como correlación con una OS existente.
*   **Modelo vigente:** migraciones aditivas 003–006; `flujo_eventos` y `escaneos_equipos` admiten evidencia inicial sin OS. La IN referencia `stock_origen_evento` para stock inicial o `stock_origen_os` para reparado. BODEGA es una ubicación, no un bus.
