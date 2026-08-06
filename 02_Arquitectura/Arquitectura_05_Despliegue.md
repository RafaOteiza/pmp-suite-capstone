# 5. Diagrama de Despliegue

Este documento describe cómo los componentes del Sistema PMP Suite se despliegan en diferentes entornos de ejecución (ej. desarrollo, producción). Se utiliza la notación C4 Model (Vista de Despliegue).

## Descripción

El sistema PMP Suite se compone de un backend REST API, un frontend web y una aplicación móvil. Para la producción, se espera que el backend se despliegue en un servidor cloud (ej. VPS, AWS EC2, Google Cloud Run) y la base de datos PostgreSQL como un servicio gestionado (ej. AWS RDS, Google Cloud SQL). El frontend web puede ser servido estáticamente (ej. Nginx, S3/CloudFront) y la aplicación móvil distribuida a través de tiendas de aplicaciones (App Store, Google Play).

## Componentes de Despliegue

*   **Servidor Backend (Cloud Instance):** Una instancia de servidor (virtual o contenedor) donde se ejecuta la aplicación Node.js/Express del backend. Interactúa con la base de datos y el módulo de IA.
*   **Base de Datos PostgreSQL (Managed Service):** Una instancia de base de datos PostgreSQL gestionada, por su escalabilidad y fiabilidad.
*   **Servidor de Archivos Estáticos (Web Hosting):** Un servicio para servir los archivos compilados del frontend web (HTML, CSS, JavaScript).
*   **Módulo de IA (Python Environment):** Un entorno de ejecución para los scripts Python del modelo de IA. Podría ser el mismo servidor del backend, un proceso separado o un microservicio dedicado.
*   **Dispositivos Móviles (Smartphones/Tablets):** Donde se ejecuta la aplicación React Native, descargada desde tiendas de aplicaciones.
*   **Navegador Web (Desktop/Mobile):** Donde se ejecuta la aplicación React Web.
*   **Firebase Authentication (External Service):** Servicio de autenticación externo.
*   **Sistema de Correo Electrónico (External Service):** Servicio de envío de correos externo.

## Diagrama de Despliegue (C4 Model - Nivel 3)

Aquí tienes un prompt para generar un Diagrama de Despliegue utilizando PlantUML. Este diagrama muestra los nodos de infraestructura y cómo los contenedores se despliegan en ellos.

```plantuml
@startuml PMP_Deployment_Diagram

!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Deployment.puml

TITLE Sistema PMP Suite - Diagrama de Despliegue (Nivel 3)

Deployment_Node("Usuario Final", "Dispositivo del Usuario", "Desktop/Laptop o Smartphone") {
    Container("Navegador Web", "Google Chrome / Firefox / Safari", "Web Browser", "Ejecuta el Frontend Web PMP")
    Container("App Móvil PMP", "React Native Application", "Smartphone / Tablet", "Aplicación instalada en el dispositivo")
}

Deployment_Node("Servidor Cloud", "Instancia de Servidor (ej. VPS / Contenedor)", "Linux OS / Docker") {
    Container("Backend REST API", "Node.js / Express.js", "Proceso de Servidor", "Expone la API del sistema")
    Deployment_Node("Entorno Python IA", "Servidor/Contenedor Python", "Linux OS / Python Runtime") {
        Container("Módulo de IA", "Scripts Python", "Proceso de Inferencia", "Realiza predicciones de falla")
    }
}

Deployment_Node("Base de Datos Cloud", "Servicio de Base de Datos Gestionado", "PostgreSQL") {
    Container("Base de Datos PMP", "Esquema PMP", "Almacena todos los datos transaccionales")
}

Rel("Navegador Web", "Backend REST API", "Accede a", "HTTPS/JSON")
Rel("App Móvil PMP", "Backend REST API", "Accede a", "HTTPS/JSON")
Rel("Backend REST API", "Base de Datos PMP", "Lee/Escribe", "SQL/TCP")
Rel("Backend REST API", "Módulo de IA", "Solicita Predicciones", "IPC / HTTP")

System_Ext(firebase_auth, "Firebase Authentication", "Servicio de Autenticación Externo")
System_Ext(email_service, "Servicio de Correo Electrónico", "Servicio de Notificaciones Externo")

Rel("Backend REST API", firebase_auth, "Autentica usuarios vía", "Firebase Admin SDK API")
Rel("Backend REST API", email_service, "Envía correos vía", "SMTP / API")

@enduml
```

---
