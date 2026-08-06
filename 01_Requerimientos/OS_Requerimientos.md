# Módulo: Órdenes de Servicio (OS)

Este documento detalla los requisitos y especificaciones para el módulo de Órdenes de Servicio del sistema PMP Suite.

## 1. Requisitos Funcionales (RF)

*   **RF.OS.1:** El sistema debe permitir la creación de nuevas Órdenes de Servicio (OS) para equipos (validadores, consolas) por parte del rol 'tecnico_terreno' o 'admin'.
*   **RF.OS.2:** Al crear una OS, el sistema debe generar automáticamente un `codigo_os` único basado en el tipo y características del equipo.
*   **RF.OS.3:** El sistema debe permitir registrar la falla detectada al momento de la creación de la OS.
*   **RF.OS.4:** El sistema debe permitir la asignación de una OS a un técnico de laboratorio por parte de roles autorizados (ej. 'jefe_taller', 'admin').
*   **RF.OS.5:** El sistema debe permitir a los usuarios con roles autorizados consultar el historial de eventos de una OS (cambios de estado, comentarios, alertas IA).
*   **RF.OS.6:** El sistema debe permitir a los usuarios con roles autorizados cambiar el estado de una OS siguiendo reglas predefinidas de transiciones y roles.
*   **RF.OS.7:** Para ciertas transiciones de estado, el sistema debe requerir un comentario obligatorio.
*   **RF.OS.8:** Para ciertas transiciones de estado, el sistema debe requerir la asociación con una guía de servicio (guia_id).
*   **RF.OS.9:** El sistema debe permitir a los roles autorizados registrar reparaciones asociadas a una OS, incluyendo fallas detectadas, acciones realizadas y repuestos usados.
*   **RF.OS.10:** El sistema debe validar que la ubicación de un equipo sea consistente con su estado actual al intentar cambiar su ubicación o estado.
*   **RF.OS.11:** El sistema debe validar que un operador PST esté autorizado en un terminal específico al registrar una OS.
*   **RF.OS.12:** El sistema debe permitir filtrar y buscar OS por diversos criterios (ej. código OS, estado, tipo de equipo, técnico asignado, etc.).
*   **RF.OS.13:** El sistema debe mostrar el estado actual y el historial de una OS a los usuarios autorizados.
*   **RF.OS.14:** El sistema debe gestionar el inventario de repuestos descontando los utilizados en reparaciones de OS (integración con Bodega).

## 2. Requisitos No Funcionales (RNF)

*   **RNF.OS.1 (Integridad):** Las transiciones de estado de las OS deben ser atómicas y consistentes, garantizando que el estado de la OS y los eventos asociados se registren correctamente (propiedades ACID).
*   **RNF.OS.2 (Integridad):** La generación de `codigo_os` debe ser única y seguir el formato especificado (`PREFIJO-000000`).
*   **RNF.OS.3 (Seguridad):** Las transiciones de estado deben estar estrictamente controladas por roles de usuario, definidos en la base de datos (`pmp.os_transiciones`).
*   **RNF.OS.4 (Auditoría):** Todos los cambios de estado y comentarios en una OS deben ser registrados en un historial (`pmp.os_eventos`).
*   **RNF.OS.5 (Rendimiento):** Las operaciones de creación, consulta y actualización de OS deben tener un tiempo de respuesta inferior a 1 segundo.
*   **RNF.OS.6 (Consistencia):** Los roles y estados de las OS deben utilizar tipos `ENUM` o tablas de referencia en la base de datos para asegurar la integridad de los datos.
*   **RNF.OS.7 (Usabilidad):** La interfaz para la creación y gestión de OS debe ser intuitiva y minimizar errores por parte del usuario.

## 3. Historias de Usuario (HU)

*   **HU.OS.1 (Creación de OS):** Como técnico de terreno, quiero crear una Orden de Servicio para un equipo con falla, para que el proceso de reparación pueda comenzar.
    *   **Criterios de Aceptación:**
        *   Dado que selecciono el tipo de equipo y la falla, cuando registro la OS, entonces se genera un `codigo_os` único y la OS queda en estado inicial.
        *   Dado que el operador PST no está autorizado en el terminal, cuando intento registrar la OS, entonces el sistema me lo impide.
*   **HU.OS.2 (Consulta de OS):** Como técnico de laboratorio, quiero consultar todas las Órdenes de Servicio pendientes para saber en qué debo trabajar.
    *   **Criterios de Aceptación:**
        *   Dado que accedo al listado de OS, cuando aplico filtros por estado "Pendiente", entonces veo solo las OS que requieren mi atención.
*   **HU.OS.3 (Cambio de Estado OS):** Como técnico de laboratorio, quiero cambiar el estado de una OS de "Ingresado" a "En Revisión", para indicar que he comenzado a trabajar en ella.
    *   **Criterios de Aceptación:**
        *   Dado que tengo el rol adecuado, cuando selecciono la transición de estado, entonces el estado de la OS se actualiza y se registra un evento.
        *   Dado que la transición requiere un comentario, cuando intento cambiar el estado sin proporcionarlo, entonces el sistema me lo solicita.
        *   Dado que no tengo el rol adecuado para una transición, cuando intento cambiar el estado, entonces el sistema me deniega el permiso.
*   **HU.OS.4 (Registro de Reparación):** Como técnico de laboratorio, quiero registrar las acciones de reparación y los repuestos usados en una OS, para documentar el trabajo realizado y actualizar el inventario.
    *   **Criterios de Aceptación:**
        *   Dado que he realizado una reparación, cuando registro los detalles y los repuestos, entonces la información se guarda y el inventario de repuestos se actualiza.

## 4. Casos de Uso (CU)

*   **CU.OS.1: Crear Orden de Servicio**
    *   **Actor:** Técnico de Terreno, Administrador
    *   **Precondiciones:** Usuario autenticado con rol 'tecnico_terreno' o 'admin'. Equipo con falla identificada.
    *   **Flujo Normal:**
        1.  El usuario accede a la pantalla de creación de OS.
        2.  El usuario introduce los detalles del equipo (serie, tipo, etc.), la falla, bus PPU, terminal y código PST.
        3.  El sistema valida la autorización del PST en el terminal (`pmp.validar_pst_terminal_os`).
        4.  El sistema genera un `codigo_os` único (`pmp.generar_id_os`).
        5.  El sistema guarda la nueva OS en `pmp.ordenes_servicio` con estado inicial.
        6.  El sistema confirma la creación de la OS.
    *   **Flujos Alternativos:**
        *   **FA.1.1: PST no autorizado:** El sistema deniega la creación de la OS y muestra un mensaje de error.
        *   **FA.1.2: Tipo de equipo no soportado:** El sistema deniega la creación y muestra un mensaje de error.
*   **CU.OS.2: Cambiar Estado de OS**
    *   **Actor:** Roles autorizados (ej. Técnico Laboratorio, Jefe de Taller, Administrador)
    *   **Precondiciones:** Usuario autenticado con rol autorizado para la transición. OS existente.
    *   **Flujo Normal:**
        1.  El usuario selecciona una OS y elige una transición de estado.
        2.  El sistema valida si la transición es permitida para el rol actual (`pmp.os_transiciones`).
        3.  El sistema verifica si se requiere comentario o `guia_id` para la transición.
        4.  El sistema actualiza el `estado_actual` de la OS en `pmp.os`.
        5.  El sistema inserta un registro en `pmp.os_eventos`.
        6.  El sistema confirma el cambio de estado.
    *   **Flujos Alternativos:**
        *   **FA.2.1: Transición no permitida:** El sistema deniega la operación y muestra un mensaje de error.
        *   **FA.2.2: Comentario requerido no proporcionado:** El sistema solicita el comentario y deniega la operación hasta que se proporciona.
        *   **FA.2.3: Ubicación inválida para el estado:** El sistema deniega el cambio de estado (`pmp.validar_ubicacion_estado`).
*   **CU.OS.3: Registrar Reparación**
    *   **Actor:** Técnico de Laboratorio, Administrador
    *   **Precondiciones:** Usuario autenticado con rol autorizado. OS existente en estado de reparación.
    *   **Flujo Normal:**
        1.  El usuario selecciona una OS en estado de reparación.
        2.  El usuario introduce los detalles de la reparación (falla detectada, acción realizada, repuestos usados, comentarios).
        3.  El sistema guarda los detalles en `pmp.registro_reparaciones`.
        4.  El sistema actualiza el stock de los repuestos utilizados (integración con Bodega).
        5.  El sistema confirma el registro de la reparación.

## 5. Especificaciones Técnicas Clave

*   **Esquema de Base de Datos:**
    *   `pmp.ordenes_servicio`: Tabla principal de OS. `codigo_os` (PRIMARY KEY, `VARCHAR(50)`), `fecha`, `tipo_equipo`, `es_pod`, `validador_serie` (FK a `pmp.validadores`), `consola_serie` (FK a `pmp.consolas`), `falla`, `estado_id` (FK a `pmp.estados`), `bus_ppu` (FK a `pmp.buses`), `terminal_id` (FK a `pmp.terminales`), `pst_codigo` (FK a `pmp.pst`), `ubicacion_id` (FK a `pmp.ubicaciones`), `tecnico_terreno_id` (FK a `pmp.usuarios`), `tecnico_laboratorio_id` (FK a `pmp.usuarios`).
    *   `pmp.os_transiciones`: Tabla de reglas para transiciones de estado. `desde_estado`, `hacia_estado`, `rol_requerido`, `requiere_guia`, `requiere_comentario`, `activo`.
    *   `pmp.os_eventos`: Historial de eventos de OS. `os_id` (FK a `pmp.ordenes_servicio`), `evento_tipo`, `desde_estado`, `hacia_estado`, `usuario_id` (FK a `pmp.usuarios`), `rol`, `comentario`, `meta (jsonb)`.
    *   `pmp.registro_reparaciones`: Registro de reparaciones. `id (uuid)`, `codigo_os` (FK a `pmp.ordenes_servicio`), `tecnico_id` (FK a `pmp.usuarios`), `falla_detectada`, `accion_realizada`, `repuestos_usados`, `comentario`, `fecha_registro`.
    *   `pmp.estados`: Tabla de estados posibles para una OS.
    *   `pmp.config_estado_ubicacion`: Reglas de validación entre estado de OS y tipo de ubicación.
*   **Lógica de Negocio (Backend):** Implementación de una máquina de estados para OS en `osStateMachine.js`, con funciones `canTransition` y `changeState`.
*   **Triggers PostgreSQL:**
    *   `trg_bloquear_update_codigo_os`: `BEFORE UPDATE` en `pmp.ordenes_servicio` para hacer `codigo_os` inmutable.
    *   `trg_generar_id_os`: `BEFORE INSERT` en `pmp.ordenes_servicio` para generar `codigo_os` automáticamente.
    *   `trg_validar_pst_terminal_os`: `BEFORE INSERT OR UPDATE` en `pmp.ordenes_servicio` para validar autorización de PST en terminal.
    *   `trg_validar_ubicacion_estado`: `BEFORE INSERT OR UPDATE` en `pmp.ordenes_servicio` para validar consistencia ubicación-estado.
*   **API Endpoints Clave (Ejemplos):**
    *   `POST /api/os`: Crear nueva OS.
    *   `GET /api/os`: Listar OS con filtros.
    *   `GET /api/os/:codigo_os`: Obtener detalles de una OS.
    *   `PATCH /api/os/:codigo_os/estado`: Cambiar estado de una OS.
    *   `POST /api/os/:codigo_os/reparacion`: Registrar reparación.
*   **Frontend/Mobile:** Interfaces para la creación de OS, listado, visualización de detalles, cambio de estado y registro de reparaciones, con control de acceso por rol en la UI (requiere implementación para móvil).
