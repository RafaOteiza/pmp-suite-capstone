# Módulo: QA (Quality Assurance)

Este documento detalla los requisitos y especificaciones para el módulo de QA (Quality Assurance) del sistema PMP Suite.

## 1. Requisitos Funcionales (RF)

*   **RF.QA.1:** El sistema debe permitir a los usuarios con rol 'qa' o 'admin' acceder a un dashboard con un resumen de las Órdenes de Servicio (OS) en cola para QA.
*   **RF.QA.2:** El sistema debe permitir a los técnicos de QA recibir Órdenes de Servicio (OS) que vienen del laboratorio o de despacho.
*   **RF.QA.3:** El sistema debe permitir a los técnicos de QA registrar los resultados de las pruebas de calidad realizadas a un equipo (OS).
*   **RF.QA.4:** El sistema debe permitir a los técnicos de QA aprobar o rechazar un equipo después de las pruebas de calidad.
*   **RF.QA.5:** Si un equipo es rechazado en QA, el sistema debe permitir reabrir la OS y devolver el equipo al laboratorio para corrección.
*   **RF.QA.6:** Si un equipo es aprobado en QA, el sistema debe permitir enviarlo a bodega para almacenamiento o despacho.
*   **RF.QA.7:** El sistema debe permitir a los técnicos de QA asociar resultados de pruebas con la OS correspondiente.
*   **RF.QA.8:** El sistema debe permitir generar reportes de calidad (ej. tasa de rechazo, tipos de fallas comunes en QA).

## 2. Requisitos No Funcionales (RNF)

*   **RNF.QA.1 (Rendimiento):** El dashboard de QA y los listados de OS deben cargar en menos de 1 segundo.
*   **RNF.QA.2 (Usabilidad):** La interfaz para el registro de pruebas y la decisión de aprobación/rechazo debe ser eficiente y clara.
*   **RNF.QA.3 (Seguridad):** El acceso a las funciones de QA debe estar restringido a los roles de 'qa', 'jefe_taller' y 'admin'.
*   **RNF.QA.4 (Integridad):** Los registros de pruebas y decisiones de QA deben ser inmutables una vez guardados.
*   **RNF.QA.5 (Trazabilidad):** Cada decisión de aprobación/rechazo de un equipo en QA debe registrarse con el técnico responsable y la fecha.

## 3. Historias de Usuario (HU)

*   **HU.QA.1 (Dashboard QA):** Como técnico de QA, quiero ver las OS pendientes de revisión para priorizar mi trabajo.
    *   **Criterios de Aceptación:**
        *   Dado que accedo al dashboard de QA, entonces veo un listado de OS en estado "Pendiente QA" o "En QA".
*   **HU.QA.2 (Revisión de Equipo):** Como técnico de QA, quiero registrar los resultados de las pruebas a un equipo para determinar su calidad.
    *   **Criterios de Aceptación:**
        *   Dado que tengo una OS en estado "En QA", cuando registro los resultados de las pruebas, entonces puedo indicar si el equipo "Pasa" o "No Pasa" la calidad.
*   **HU.QA.3 (Aprobación/Rechazo):** Como técnico de QA, quiero aprobar un equipo si pasa las pruebas o rechazarlo si no las pasa, para definir su siguiente destino.
    *   **Criterios de Aceptación:**
        *   Dado que un equipo pasa las pruebas, cuando lo apruebo, entonces el estado de la OS cambia a "Aprobado QA" y se marca para envío a bodega.
        *   Dado que un equipo no pasa las pruebas, cuando lo rechazo, entonces el estado de la OS cambia a "Rechazado QA" y se marca para volver a laboratorio.
*   **HU.QA.4 (Reportes de Calidad):** Como jefe de taller, quiero generar reportes de calidad para analizar el rendimiento de los equipos y del proceso de reparación.
    *   **Criterios de Aceptación:**
        *   Dado que selecciono un rango de fechas, cuando genero el reporte de calidad, entonces veo métricas como la tasa de aprobación/rechazo de equipos en QA.

## 4. Casos de Uso (CU)

*   **CU.QA.1: Realizar Inspección de Calidad**
    *   **Actor:** Técnico de QA, Administrador
    *   **Precondiciones:** Usuario autenticado con rol 'qa' o 'admin'. OS en estado "Pendiente QA" o "En QA".
    *   **Flujo Normal:**
        1.  El usuario selecciona una OS para inspección de calidad.
        2.  El usuario realiza las pruebas y registra los resultados.
        3.  El usuario indica si el equipo "Pasa" o "No Pasa" la inspección.
        4.  El sistema registra los resultados de la inspección en la base de datos (ej. en `pmp.os_eventos` con `evento_tipo='QA_RESULTADO'` o una tabla específica).
        5.  El sistema actualiza el estado de la OS a "Aprobado QA" o "Rechazado QA" según la decisión.
    *   **Flujos Alternativos:**
        *   **FA.1.1: Equipo rechazado:** El sistema puede notificar al laboratorio y reabrir la OS con un estado que indique necesidad de revisión adicional.
*   **CU.QA.2: Generar Reporte de Calidad**
    *   **Actor:** Jefe de Taller, Administrador
    *   **Precondiciones:** Usuario autenticado con rol 'jefe_taller' o 'admin'. Datos de QA disponibles.
    *   **Flujo Normal:**
        1.  El usuario accede a la sección de reportes de calidad.
        2.  El usuario selecciona los criterios de filtrado (ej. rango de fechas, tipo de equipo).
        3.  El sistema consulta la base de datos para obtener los datos de QA.
        4.  El sistema genera y muestra el reporte de calidad con métricas relevantes.

## 5. Especificaciones Técnicas Clave

*   **Esquema de Base de Datos (Adicional/Detalle):**
    *   `pmp.ordenes_servicio`: La columna `estado_id` (FK a `pmp.estados`) manejará los estados específicos de QA (ej. "Pendiente QA", "En QA", "Aprobado QA", "Rechazado QA").
    *   `pmp.os_eventos`: Se utilizará para registrar los resultados de las inspecciones de QA (`evento_tipo='QA_RESULTADO'`, `comentario`, `meta`).
    *   `pmp.os_transiciones`: Definirá qué roles pueden mover una OS a/desde estados de QA.
    *   Podría considerarse una tabla `pmp.qa_inspecciones` si los resultados de las pruebas de QA son complejos y requieren estructura adicional más allá de `os_eventos`.
*   **Roles Clave:** 'qa', 'jefe_taller', 'admin'.
*   **API Endpoints Clave (Ejemplos):**
    *   `GET /api/qa/dashboard`: Resumen de OS para QA.
    *   `PATCH /api/qa/os/:codigo_os/recibir`: Recibir OS en QA.
    *   `PATCH /api/qa/os/:codigo_os/aprobar`: Aprobar equipo en QA.
    *   `PATCH /api/qa/os/:codigo_os/rechazar`: Rechazar equipo en QA.
    *   `GET /api/qa/reportes`: Generar reportes de calidad.
*   **Integración:** Con módulos de Órdenes de Servicio y Laboratorio.
*   **Frontend/Mobile:** Interfaces para el dashboard de QA, formularios de registro de pruebas, botones de aprobación/rechazo y visualización de reportes, con controles de acceso por rol.
