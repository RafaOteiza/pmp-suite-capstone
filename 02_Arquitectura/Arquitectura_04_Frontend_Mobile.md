# 4. Arquitectura de Componentes del Frontend Móvil

Este documento describe la estructura interna de la aplicación Frontend Móvil del Sistema PMP Suite, detallando los componentes principales y sus interacciones. Se utiliza la notación C4 Model (Vista de Contenedores, enfocada en los componentes lógicos del frontend móvil).

## Descripción

La aplicación móvil está desarrollada con React Native y Expo. Su objetivo es proporcionar una interfaz de usuario optimizada para dispositivos móviles, enfocada en los roles de campo (ej. técnicos de terreno) y laboratorio. Se comunica con el Backend REST API y utiliza el SDK de Firebase Client para la autenticación. Es fundamental asegurar un manejo seguro de las credenciales debido a la naturaleza del entorno móvil.

## Componentes Principales

*   **Aplicación React Native (Expo):** Componente principal que orquesta toda la interfaz de usuario móvil. Contiene la configuración de navegación (`react-navigation`) y la lógica de inicialización.
*   **Módulo de Autenticación (Firebase Client SDK):** Encargado de la interacción directa con Firebase para el inicio de sesión, manejo de sesiones y obtención de Firebase ID Tokens.
*   **Módulo de Comunicación API (Axios):** Componente centralizado para realizar peticiones HTTP al Backend REST API. Se recomienda incluir interceptores para inyectar JWT y manejar errores de autenticación (`401`).
*   **Contexto de Autenticación (`AuthContext`):** Gestiona el estado global de la autenticación y la información del usuario (incluyendo el rol, que **debe ser obtenido del backend**), haciéndolo disponible para toda la aplicación móvil.
*   **Módulo de Navegación (`react-navigation`):** Define la pila de navegación de la aplicación y asocia pantallas con componentes específicos (ej. `LoginScreen`, `HomeScreen`, `NewOrderScreen`). **Requiere lógica de autorización por roles.**
*   **Almacenamiento Seguro de Credenciales (Keychains/Keystore):** Componente crucial para almacenar de forma segura los tokens JWT y otras credenciales sensibles, mitigando riesgos en dispositivos móviles.
*   **Componentes de Pantallas (UI):** Colección de componentes de UI específicos para cada vista de la aplicación móvil.

## Diagrama de Contenedores del Frontend Móvil (C4 Model - Nivel 2)

Aquí tienes un prompt para generar un Diagrama de Contenedores del Frontend Móvil utilizando PlantUML. Este diagrama muestra los principales módulos lógicos dentro del sistema "Frontend Móvil PMP".

```plantuml
@startuml PMP_FrontendMobile_Containers

!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

TITLE Sistema PMP Suite - Arquitectura de Componentes del Frontend Móvil (Contenedores)

System_Boundary(pmp_frontend_mobile, "Frontend Móvil PMP") {

    Container(react_native_app, "Aplicación React Native", "React Native / Expo", "Ofrece la interfaz de usuario optimizada para dispositivos móviles")
    Container(auth_module_firebase_mobile, "Módulo de Autenticación", "Firebase Client SDK", "Gestiona la autenticación de usuarios con Firebase")
    Container(api_communication_mobile, "Módulo de Comunicación API", "Axios", "Centraliza las llamadas HTTP al Backend REST API")
    Container(auth_context_mobile, "Contexto de Autenticación", "React Context", "Maneja el estado global de autenticación y datos de usuario (incluido el rol)")
    Container(navigation_module, "Módulo de Navegación", "React Navigation", "Define la pila de navegación de la aplicación y carga las pantallas")
    Container(secure_storage, "Almacenamiento Seguro", "Keychains (iOS) / Keystore (Android)", "Almacena de forma segura credenciales sensibles (ej. tokens JWT)")

    Rel(react_native_app, auth_module_firebase_mobile, "Usa para inicio de sesión", "JavaScript API")
    Rel(react_native_app, api_communication_mobile, "Realiza llamadas a", "HTTP/JSON")
    Rel(react_native_app, auth_context_mobile, "Accede al estado de", "React Context API")
    Rel(react_native_app, navigation_module, "Define navegación con", "React Navigation API")
    Rel(react_native_app, secure_storage, "Guarda/Recupera credenciales", "SDKs nativos")
    
    Rel_Right(api_communication_mobile, backend_api, "Consume", "HTTP/JSON")
    Rel_Left(auth_module_firebase_mobile, firebase_auth_ext, "Autentica usuarios vía", "Firebase Client SDK API")

}

System_Ext(backend_api, "Backend REST API", "Node.js / Express.js", "API principal para la gestión de PMP")
System_Ext(firebase_auth_ext, "Firebase Authentication", "Servicio de autenticación de usuarios")

@enduml
```

---
