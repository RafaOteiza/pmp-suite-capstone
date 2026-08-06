# Módulo: Laboratorio

Este documento detalla los requisitos y especificaciones para el módulo de Laboratorio del sistema PMP Suite.

## 1. Requisitos Funcionales (RF)

*   **RF.LAB.1:** El sistema debe permitir a los técnicos de laboratorio y jefes de taller acceder a un dashboard con un resumen de las Órdenes de Servicio (OS) pendientes, en curso y completadas en el laboratorio.
*   **RF.LAB.2:** El sistema debe permitir a los jefes de taller asignar Órdenes de Servicio a técnicos de laboratorio específicos.
*   **RF.LAB.3:** El sistema debe permitir a los técnicos de laboratorio ver las OS que tienen asignadas.
*   **RF.LAB.4:** El sistema debe permitir a los técnicos de laboratorio y jefes de taller registrar el avance y los resultados de la revisión de OS.
*   **RF.LAB.5:** El sistema debe permitir a los técnicos de laboratorio y jefes de taller solicitar repuestos para una OS específica del inventario de bodega.
*   **RF.LAB.6:** El sistema debe permitir a los técnicos de laboratorio y jefes de taller documentar las fallas detectadas y las acciones de reparación realizadas en una OS.
*   **RF.LAB.7:** El sistema debe permitir a los jefes de taller aprobar o rechazar las solicitudes de repuestos realizadas por los técnicos.
*   **RF.LAB.8:** El sistema debe permitir a los técnicos de laboratorio registrar el tiempo dedicado a cada OS.
*   **RF.LAB.9:** El sistema debe permitir a los jefes de taller generar reportes sobre la productividad del laboratorio (ej. OS por técnico, tiempos de reparación, uso de repuestos).
*   **RF.LAB.10:** El sistema debe permitir a los jefes de taller gestionar las consolas de laboratorio (validadores, estaciones de prueba).
*   **RF.LAB.11:** El sistema debe permitir a los jefes de taller y administradores validar los equipos de laboratorio.
*   **RF.LAB.12:** El sistema debe permitir la gestión de la cola de despacho a QA desde laboratorio (integración con QA y Despacho).

## 2. Requisitos No Funcionales (RNF)

*   **RNF.LAB.1 (Rendimiento):** Los dashboards y listados de OS deben cargar en menos de 1 segundo.
*   **RNF.LAB.2 (Usabilidad):** La interfaz para la gestión de OS en el laboratorio debe ser eficiente y clara para minimizar el tiempo de operación.
*   **RNF.LAB.3 (Seguridad):** El acceso a las funciones de asignación y aprobación debe estar restringido estrictamente a los roles de 'jefe_taller' y 'admin'.
*   **RNF.LAB.4 (Integridad):** Las actualizaciones de estado y registro de reparaciones deben mantener la integridad de los datos en la base de datos.
*   **RNF.LAB.5 (Auditoría):** Todas las asignaciones y cambios de estado de OS deben ser registrados con el técnico responsable.

## 3. Historias de Usuario (HU)

*   **HU.LAB.1 (Dashboard):** Como técnico de laboratorio, quiero ver un resumen de mis OS asignadas para priorizar mi trabajo.
    *   **Criterios de Aceptación:**
        *   Dado que accedo al dashboard de laboratorio, entonces veo una lista de las OS asignadas a mí, con su estado y prioridad.
*   **HU.LAB.2 (Asignación de OS):** Como jefe de taller, quiero asignar una OS a un técnico de laboratorio para distribuir la carga de trabajo.
    *   **Criterios de Aceptación:**
        *   Dado que tengo el rol de 'jefe_taller', cuando selecciono una OS pendiente y un técnico disponible, entonces la OS se asigna a ese técnico y este la ve en su dashboard.
*   **HU.LAB.3 (Registro de Trabajo):** Como técnico de laboratorio, quiero registrar las pruebas y reparaciones que realizo en una OS para documentar el progreso y los hallazgos.
    *   **Criterios de Aceptación:**
        *   Dado que estoy trabajando en una OS, cuando registro los detalles de la falla, las acciones y los repuestos usados, entonces la información se guarda correctamente y los repuestos se descuentan del inventario.
*   **HU.LAB.4 (Solicitud de Repuestos):** Como técnico de laboratorio, quiero solicitar repuestos específicos para una OS, para poder completar la reparación.
    *   **Criterios de Aceptación:**
        *   Dado que estoy en una OS y necesito un repuesto, cuando lo solicito con la cantidad deseada, entonces se crea una solicitud que el jefe de taller puede aprobar.
*   **HU.LAB.5 (Aprobación de Repuestos):** Como jefe de taller, quiero aprobar o rechazar solicitudes de repuestos para controlar el flujo de inventario.
    *   **Criterios de Aceptación:**
        *   Dado que reviso una solicitud de repuestos, cuando la apruebo, entonces los repuestos se marcan para despacho de bodega.
*   **HU.LAB.6 (Reportes de Laboratorio):** Como jefe de taller, quiero generar reportes sobre el rendimiento del laboratorio para identificar tendencias y áreas de mejora.
    *   **Criterios de Aceptación:**
        *   Dado que selecciono un rango de fechas y criterios, cuando genero el reporte, entonces veo métricas sobre OS, técnicos y repuestos.

## 4. Casos de Uso (CU)

*   **CU.LAB.1: Ver Dashboard de Laboratorio**
    *   **Actor:** Técnico de Laboratorio, Jefe de Taller, Administrador
    *   **Precondiciones:** Usuario autenticado con rol 'tecnico_laboratorio', 'jefe_taller' o 'admin'.
    *   **Flujo Normal:**
        1.  El usuario inicia sesión.
        2.  El sistema redirige al usuario al dashboard de laboratorio (si su rol lo permite) o accede directamente.
        3.  El sistema consulta la base de datos para obtener el resumen de OS relevantes.
        4.  El sistema muestra las métricas clave y las listas de OS.
*   **CU.LAB.2: Asignar Orden de Servicio**
    *   **Actor:** Jefe de Taller, Administrador
    *   **Precondiciones:** Usuario autenticado con rol 'jefe_taller' o 'admin'. OS pendiente de asignación.
    *   **Flujo Normal:**
        1.  El usuario accede a la sección de asignación de OS.
        2.  El usuario selecciona una OS y un técnico de laboratorio de una lista.
        3.  El sistema actualiza el campo `tecnico_laboratorio_id` en `pmp.ordenes_servicio`.
        4.  El sistema registra un evento de asignación en `pmp.os_eventos`.
        5.  El sistema confirma la asignación.
*   **CU.LAB.3: Solicitar Repuestos para OS**
    *   **Actor:** Técnico de Laboratorio, Jefe de Taller, Administrador
    *   **Precondiciones:** Usuario autenticado con rol autorizado. OS en curso de reparación.
    *   **Flujo Normal:**
        1.  El usuario selecciona una OS en reparación.
        2.  El usuario accede a la interfaz de solicitud de repuestos.
        3.  El usuario selecciona los repuestos y las cantidades necesarias.
        4.  El sistema crea una `pmp.solicitudes_repuestos` y sus `pmp.solicitud_items` asociados con estado 'PENDIENTE'.
        5.  El sistema confirma la solicitud.
*   **CU.LAB.4: Aprobar/Rechazar Solicitud de Repuestos**
    *   **Actor:** Jefe de Taller, Administrador
    *   **Precondiciones:** Usuario autenticado con rol 'jefe_taller' o 'admin'. Solicitud de repuestos en estado 'PENDIENTE'.
    *   **Flujo Normal:**
        1.  El usuario accede a la lista de solicitudes de repuestos.
        2.  El usuario selecciona una solicitud pendiente.
        3.  El usuario revisa los detalles y elige "Aprobar" o "Rechazar".
        4.  Si aprueba, el estado de `pmp.solicitudes_repuestos` cambia a 'APROBADA'. Si rechaza, cambia a 'RECHAZADA'.
        5.  Si es aprobada, el sistema genera una notificación a Bodega para el despacho.
        6.  El sistema registra un evento en el historial de la solicitud.

## 5. Especificaciones Técnicas Clave

*   **Esquema de Base de Datos (Adicional/Detalle):**
    *   `pmp.ordenes_servicio`: `tecnico_laboratorio_id` (FK a `pmp.usuarios`).
    *   `pmp.solicitudes_repuestos`: `id`, `codigo_os` (FK a `pmp.ordenes_servicio`), `solicitado_por` (FK a `pmp.usuarios`), `estado` (ENUM: 'PENDIENTE', 'APROBADA', 'RECHAZADA', 'DESPACHADA'), `fecha_solicitud`, `fecha_despacho`.
    *   `pmp.solicitud_items`: `id`, `solicitud_id` (FK a `pmp.solicitudes_repuestos`), `repuesto_id` (FK a `pmp.repuestos`), `cantidad`.
    *   `pmp.registro_reparaciones`: `tecnico_id` (FK a `pmp.usuarios`), `repuestos_usados` (texto, idealmente una relación Many-to-Many con `pmp.repuestos`).
*   **Roles Clave:** 'tecnico_laboratorio', 'jefe_taller', 'admin'.
*   **API Endpoints Clave (Ejemplos):**
    *   `GET /api/lab/dashboard`: Resumen de OS para laboratorio.
    *   `POST /api/lab/os/:codigo_os/asignar`: Asignar OS a técnico.
    *   `GET /api/lab/os/my`: Listar OS asignadas al técnico actual.
    *   `POST /api/lab/solicitudes`: Crear solicitud de repuestos.
    *   `PATCH /api/lab/solicitudes/:id/aprobar`: Aprobar solicitud de repuestos.
    *   `PATCH /api/lab/solicitudes/:id/rechazar`: Rechazar solicitud de repuestos.
    *   `GET /api/lab/reportes`: Generar reportes.
    *   `GET /api/lab/validadores`: Gestionar validadores.
    *   `GET /api/lab/consolas`: Gestionar consolas.
*   **Integración:** Con módulos de Órdenes de Servicio, Usuarios, Bodega y QA.
*   **Frontend/Mobile:** Interfaces para dashboards específicos de laboratorio, formularios de asignación, solicitud de repuestos, registro de reparaciones y visualización de reportes, con controles de acceso por rol.
