# 3. Arquitectura de Componentes del Frontend Web (v5.0 Gold Edition)

Este documento describe la estructura interna de la aplicación Frontend Web del Sistema PMP Suite, detallando los componentes principales y sus interacciones. Se utiliza la notación C4 Model (Vista de Contenedores, enfocada en los componentes lógicos del frontend).

## Descripción

La aplicación web es un Single Page Application (SPA) desarrollada con React, TypeScript y Vite. Su propósito es proporcionar una interfaz de usuario rica y reactiva para los usuarios del sistema PMP Suite, incluyendo la autenticación, la gestión de usuarios, Órdenes de Servicio, laboratorio, QA y bodega. 

**Novedad v5.0:** Se implementó una capa superior de **Diseño Sistémico Premium** con soporte para Glassmorphism y Dark/Light Mode adaptativo.

## Componentes Principales

*   **Aplicación React (SPA):** Componente principal que orquesta toda la interfaz de usuario. Contiene el enrutamiento (`react-router-dom`) y la lógica de inicialización.
*   **Módulo de Autenticación (Firebase Client SDK):** Encargado de la interacción directa con Firebase para el inicio de sesión, manejo de sesiones y obtención de Firebase ID Tokens.
*   **Módulo de Comunicación API (Axios):** Componente centralizado para realizar peticiones HTTP al Backend REST API. Incluye interceptores para inyectar JWT y manejar errores de autenticación (`401`).
*   **Contexto de Sesión/Usuario (React Context):** Gestiona el estado global de la autenticación y la información del usuario.
*   **Componentes de Protección de Rutas (`ProtectedRoute`):** Componentes de orden superior que aplican la lógica de autorización basada en roles.
*   **Subsistema de Analítica (Recharts):** Módulo encargado de la visualización dinámica de KPIs de bodega y laboratorios mediante gráficos de alto impacto visual.
*   **Módulo de Trazabilidad Universal:** Interfaz de búsqueda global que centraliza consultas de hardware, buses y tickets externos (Aranda Bridge).
*   **Módulo de Estilos Premium (CSS Moderno):** Implementa el sistema de diseño Indigo/Violet con variables dinámicas para el control de temas y efectos de transparencia.

## Diagrama de Contenedores del Frontend Web (C4 Model - Nivel 2)

Aquí tienes un prompt para generar un Diagrama de Contenedores del Frontend Web utilizando PlantUML. Este diagrama muestra los principales módulos lógicos dentro del sistema "Frontend Web PMP".

```plantuml
@startuml PMP_FrontendWeb_Containers

!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

TITLE Sistema PMP Suite - Arquitectura de Componentes del Frontend Web (Contenedores)

System_Boundary(pmp_frontend_web, "Frontend Web PMP") {

    Container(react_spa, "Aplicación React (SPA)", "React / TypeScript / Vite", "Ofrece la interfaz de usuario para los usuarios de PMP Suite")
    Container(auth_module_firebase, "Módulo de Autenticación", "Firebase Client SDK", "Gestiona la autenticación de usuarios con Firebase")
    Container(api_communication, "Módulo de Comunicación API", "Axios", "Centraliza las llamadas HTTP al Backend REST API")
    Container(session_context, "Contexto de Sesión/Usuario", "React Context", "Maneja el estado global de autenticación y datos de usuario (incluido el rol)")
    Container(route_protection, "Componentes de Protección de Rutas", "React Components", "Aplica lógica de autorización basada en roles para las rutas")
    Container(routing_module, "Módulo de Rutas/Páginas", "React Router DOM", "Define la navegación de la aplicación y carga las páginas")

    Rel(react_spa, auth_module_firebase, "Usa para inicio de sesión", "JavaScript API")
    Rel(react_spa, api_communication, "Realiza llamadas a", "HTTP/JSON")
    Rel(react_spa, session_context, "Accede al estado de", "React Context API")
    Rel(react_spa, route_protection, "Usa para proteger", "React Component Props")
    Rel(react_spa, routing_module, "Define navegación con", "React Router API")
    
    Rel_Right(api_communication, backend_api, "Consume", "HTTP/JSON")
    Rel_Left(auth_module_firebase, firebase_auth_ext, "Autentica usuarios vía", "Firebase Client SDK API")

}

System_Ext(backend_api, "Backend REST API", "Node.js / Express.js", "API principal para la gestión de PMP")
System_Ext(firebase_auth_ext, "Firebase Authentication", "Servicio de autenticación de usuarios")

@enduml
```

---
