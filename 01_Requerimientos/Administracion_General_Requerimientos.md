# Módulo: Administración General

Este documento detalla los requisitos y especificaciones para el módulo de Administración General del sistema PMP Suite. Este módulo abarca funcionalidades transversales y de alto nivel que suelen ser gestionadas por roles administrativos.

## 1. Requisitos Funcionales (RF)

*   **RF.ADM.1:** El sistema debe permitir a los administradores acceder a un dashboard general con métricas clave del sistema (ej. número de OS activas, repuestos críticos, usuarios registrados, etc.).
*   **RF.ADM.2:** El sistema debe permitir a los administradores gestionar roles y permisos (ej. definir nuevos roles, asignar permisos a roles existentes, aunque la implementación actual usa roles fijos).
*   **RF.ADM.3:** El sistema debe permitir a los administradores consultar logs de auditoría de acciones críticas (ej. creación/edición de usuarios, cambios de estado de OS sensibles, ajustes de inventario).
*   **RF.ADM.4:** El sistema debe permitir a los administradores gestionar la configuración global del sistema (ej. umbrales de stock crítico, parámetros de IA, etc.).
*   **RF.ADM.5:** El sistema debe permitir a los administradores gestionar ubicaciones físicas (bodegas, laboratorios, QA, terreno) y sus tipos.
*   **RF.ADM.6:** El sistema debe permitir a los administradores gestionar terminales y asociarlos con códigos PST.
*   **RF.ADM.7:** El sistema debe permitir a los administradores gestionar el catálogo de estados de OS y las transiciones permitidas entre ellos, por rol.
*   **RF.ADM.8:** El sistema debe permitir a los administradores gestionar el catálogo de buses PPU.
*   **RF.ADM.9:** El sistema debe permitir a los administradores gestionar el catálogo de modelos y marcas de validadores y consolas.
*   **RF.ADM.10:** El sistema debe permitir a los administradores gestionar el catálogo de repuestos, incluyendo categorías y stocks críticos.
*   **RF.ADM.11:** El sistema debe permitir a los administradores generar reportes consolidados de los diferentes módulos del sistema (OS, Laboratorio, Bodega, QA).

## 2. Requisitos No Funcionales (RNF)

*   **RNF.ADM.1 (Seguridad):** El acceso a todas las funciones administrativas debe estar estrictamente restringido al rol 'admin'.
*   **RNF.ADM.2 (Auditoría):** Todas las acciones administrativas deben ser registradas en un log de auditoría con detalles del usuario, acción, fecha y cambios realizados.
*   **RNF.ADM.3 (Integridad):** La gestión de la configuración y los datos maestros debe mantener la integridad referencial y la consistencia en toda la base de datos.
*   **RNF.ADM.4 (Usabilidad):** Las interfaces de administración deben ser claras, consistentes y fáciles de usar para los administradores.
*   **RNF.ADM.5 (Rendimiento):** Las operaciones de consulta y gestión de datos maestros deben ser eficientes.

## 3. Historias de Usuario (HU)

*   **HU.ADM.1 (Dashboard Admin):** Como administrador, quiero ver un dashboard general con un resumen del estado del sistema para monitorear las operaciones clave.
    *   **Criterios de Aceptación:**
        *   Dado que accedo al dashboard de administrador, entonces veo métricas como número de OS en cada estado, stock de repuestos críticos y usuarios activos.
*   **HU.ADM.2 (Gestión de Roles/Permisos):** Como administrador, quiero poder ajustar los roles y permisos de los usuarios para controlar el acceso a las funcionalidades del sistema (a futuro, si el sistema evoluciona a RBAC dinámico).
    *   **Criterios de Aceptación:**
        *   Dado que accedo a la gestión de roles, puedo ver los permisos asociados a cada rol y modificarlos.
*   **HU.ADM.3 (Auditoría de Acciones):** Como administrador, quiero consultar un log de auditoría para rastrear las acciones críticas realizadas por los usuarios en el sistema.
    *   **Criterios de Aceptación:**
        *   Dado que accedo al log de auditoría, puedo filtrar por usuario, fecha y tipo de acción y ver el detalle de los eventos.
*   **HU.ADM.4 (Gestión de Catálogos):** Como administrador, quiero gestionar los catálogos de datos maestros (estados, transiciones, ubicaciones, terminales, repuestos, equipos) para mantener la información del sistema actualizada.
    *   **Criterios de Aceptación:**
        *   Dado que accedo a la gestión de un catálogo, puedo crear, editar y eliminar entradas de forma segura.
        *   Cuando edito un estado de OS, entonces puedo definir qué roles pueden hacer transiciones a/desde ese estado.

## 4. Casos de Uso (CU)

*   **CU.ADM.1: Ver Dashboard General**
    *   **Actor:** Administrador
    *   **Precondiciones:** El administrador ha iniciado sesión.
    *   **Flujo Normal:**
        1.  El administrador accede al dashboard principal.
        2.  El sistema consulta datos agregados de todos los módulos.
        3.  El sistema presenta un resumen visual con métricas y alertas clave.
*   **CU.ADM.2: Gestionar Catálogo de Estados de OS**
    *   **Actor:** Administrador
    *   **Precondiciones:** El administrador ha iniciado sesión.
    *   **Flujo Normal:**
        1.  El administrador accede a la sección de gestión de estados de OS.
        2.  El administrador ve la lista de estados existentes.
        3.  El administrador puede crear un nuevo estado, editar uno existente o eliminarlo (si no tiene dependencias).
        4.  Al editar un estado, el administrador puede configurar las transiciones permitidas a/desde ese estado y los roles requeridos (`pmp.os_transiciones`).
        5.  El sistema valida la integridad de las transiciones y guarda los cambios.
*   **CU.ADM.3: Consultar Log de Auditoría**
    *   **Actor:** Administrador
    *   **Precondiciones:** El administrador ha iniciado sesión. Los eventos de auditoría se han registrado.
    *   **Flujo Normal:**
        1.  El administrador accede a la sección de log de auditoría.
        2.  El administrador aplica filtros (fecha, usuario, tipo de evento).
        3.  El sistema muestra los registros de auditoría que coinciden con los filtros.

## 5. Especificaciones Técnicas Clave

*   **Esquema de Base de Datos (Adicional/Detalle):**
    *   `pmp.config_estado_ubicacion`: `estado_id` (FK), `tipo_ubicacion` (ENUM).
    *   `pmp.estados`: `id`, `nombre` (UNIQUE).
    *   `pmp.os_transiciones`: `desde_estado` (FK), `hacia_estado` (FK), `rol_requerido`, `requiere_guia`, `requiere_comentario`, `activo`.
    *   `pmp.ubicaciones`: `id`, `nombre`, `tipo` (ENUM).
    *   `pmp.terminales`: `id`, `nombre`.
    *   `pmp.pst`: `codigo`, `nombre`.
    *   `pmp.terminal_pst`: `terminal_id` (FK), `pst_codigo` (FK).
    *   `pmp.buses`: `ppu`.
    *   `pmp.validadores`, `pmp.consolas`: `serie`, `modelo`, `marca`.
    *   `pmp.repuestos`: `id`, `nombre`, `categoria` (ENUM), `stock`, `stock_critico`.
    *   Podría considerarse una tabla `pmp.auditoria_logs` para acciones críticas si `pmp.os_eventos` no es suficiente para la granularidad requerida a nivel de sistema.
*   **Roles Clave:** 'admin'.
*   **API Endpoints Clave (Ejemplos):**
    *   `GET /api/admin/dashboard`: Resumen de métricas generales.
    *   `GET /api/admin/logs`: Consulta de logs de auditoría.
    *   `GET /api/admin/estados`, `POST /api/admin/estados`, `PUT /api/admin/estados/:id`: CRUD para estados de OS.
    *   `GET /api/admin/transiciones`, `POST /api/admin/transiciones`, `PUT /api/admin/transiciones/:id`: CRUD para transiciones de estado.
    *   `GET /api/admin/ubicaciones`, `POST /api/admin/ubicaciones`, `PUT /api/admin/ubicaciones/:id`: CRUD para ubicaciones.
    *   `GET /api/admin/repuestos`, `POST /api/admin/repuestos`, `PUT /api/admin/repuestos/:id`: CRUD para repuestos.
    *   `GET /api/admin/buses`, `POST /api/admin/buses`, `PUT /api/admin/buses/:id`: CRUD para buses.
*   **Integración:** Con todos los módulos del sistema (OS, Laboratorio, Bodega, QA, Usuarios) para la consolidación de datos y la gestión de catálogos maestros.
*   **Frontend/Mobile:** Interfaces de administración específicas para la gestión de catálogos, visualización de logs y configuración del sistema, accesibles solo por el rol 'admin'.
