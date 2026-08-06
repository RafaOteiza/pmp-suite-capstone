# 2. Arquitectura de Componentes del Backend (v5.0 Gold Edition)

Este documento describe la estructura interna del Backend del Sistema PMP Suite, detallando los componentes principales y sus interacciones. Se utiliza la notación C4 Model (Vista de Contenedores, enfocada en los componentes lógicos del backend).

## Descripción

El backend es una API RESTful de alto desempeño desarrollada con Node.js y Express.js. Su función principal es servir datos a los frontends (web y móvil), gestionar la lógica de negocio central, asegurar la integridad relacional mediante bloqueos transaccionales y sincronizarse con Firebase Authentication.

**Novedad v5.0:** Inclusión del **Aranda Bridge Connector** para sincronización con sistemas ITSM externos.

## Componentes Principales

*   **Servidor API (Node.js/Express):** Componente principal que expone las API REST. Incluye el orquestador de rutas y el middleware de manejo de errores global.
*   **Módulo de Autenticación (Firebase Admin SDK):** Encargado de verificar los tokens JWT de Firebase y gestionar los Custom Claims para RBAC.
*   **Módulo de Autorización (Middlewares de Roles):** Colección de middlewares de grano fino (`ensureUser`, `requireAnyRole`) que protegen cada endpoint.
*   **Módulo de Base de Datos (PostgreSQL Pool):** Gestiona la conexión persistente. Implementa integridad referencial y lógica defensiva mediante sub-selects y triggers automáticos.
*   **Conector Aranda Bridge:** Subsistema que facilita la asociación de tickets externos con órdenes de servicio internas mediante lógica de búsqueda difusa y debouncing.
*   **Módulo de Lógica de Negocio (Controladores):** Contiene las reglas del flujo logístico (Transito ➔ Bodega ➔ Lab ➔ QA).
*   **Módulo de IA Predictiva (Hybrid Bridge):** Subsistema híbrido que orquesta la ejecución de modelos de Machine Learning (Python/Scikit-learn) para la detección de activos de alto riesgo ("Limones").
*   **Módulo de Configuración Segura:** Gestiona la carga de secretos y variables de entorno (`dotenv`).

## Diagrama de Contenedores del Backend (C4 Model - Nivel 2)

Aquí tienes un prompt para generar un Diagrama de Contenedores del Backend utilizando PlantUML. Este diagrama muestra los principales módulos lógicos dentro del sistema "PMP Suite" (el "Contenedor" en este nivel).

```plantuml
@startuml PMP_Backend_Containers

!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

TITLE Sistema PMP Suite - Arquitectura de Componentes del Backend (Contenedores)

System_Boundary(pmp_suite, "Sistema PMP Suite") {
    Container(backend_api, "Backend REST API", "Node.js / Express.js", "API principal para la gestión de PMP")
}

System_Ext(postgresql_db, "Base de Datos PostgreSQL", "Base de Datos Relacional", "Almacena todos los datos del sistema PMP")
System_Ext(firebase_auth_ext, "Firebase Authentication", "Servicio de Autenticación", "Gestiona la autenticación de usuarios")
System_Ext(frontend_web, "Frontend Web PMP", "Aplicación Web React", "Interfaz de usuario para roles administrativos y de gestión")
System_Ext(frontend_mobile, "Frontend Móvil PMP", "Aplicación Móvil React Native", "Interfaz de usuario para técnicos de terreno y laboratorio")
System_Ext(ia_module, "Módulo de IA", "Scripts Python", "Realiza predicciones de falla de equipos")

Rel(frontend_web, backend_api, "Consume", "HTTP/JSON")
Rel(frontend_mobile, backend_api, "Consume", "HTTP/JSON")
Rel(backend_api, postgresql_db, "Lee y Escribe", "SQL/TCP")
Rel(backend_api, firebase_auth_ext, "Verifica y Administra Usuarios", "Firebase Admin SDK")
Rel(backend_api, ia_module, "Orquesta análisis", "Child Process / JSON")
Rel(ia_module, postgresql_db, "Consulta histórica", "Psycopg2")

@enduml
```

---
