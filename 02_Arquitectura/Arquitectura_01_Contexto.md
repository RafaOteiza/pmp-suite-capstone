# 1. Visión General del Sistema (Contexto C4)

Este documento proporciona una vista de alto nivel del sistema PMP Suite, mostrando cómo interactúa con los usuarios y otros sistemas externos. Se utiliza la notación C4 Model (Vista de Contexto).

## Descripción

El Sistema PMP Suite es una aplicación integral diseñada para gestionar el ciclo de vida de los equipos (validadores y consolas) en un proceso que abarca desde el ingreso de órdenes de servicio hasta la reparación, control de calidad, gestión de repuestos y despacho. Interactúa con diferentes tipos de usuarios y tiene una integración clave con Firebase Authentication.

## Actores y Sistemas Externos

*   **Usuario PMP (Persona):** Representa a todos los usuarios del sistema (Administrador, Jefe de Taller, Técnico de Laboratorio, Técnico de Terreno, QA, Logística/Bodega).
*   **Firebase Authentication (Sistema):** Servicio externo utilizado para la autenticación de usuarios.
*   **Sistema de Correo Electrónico (Sistema):** Utilizado para enviar enlaces de reseteo de contraseña y posibles notificaciones.

## Diagrama de Contexto (C4 Model - Nivel 1)

Aquí tienes un prompt para generar un Diagrama de Contexto utilizando PlantUML. Puedes copiar este código en una herramienta que soporte PlantUML para visualizar el diagrama.

```plantuml
@startuml PMP_Context_Diagram

!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

TITLE Sistema PMP Suite - Diagrama de Contexto (Nivel 1)

Person(user, "Usuario PMP", "Administrador, Jefe de Taller, Técnico de Laboratorio, Técnico de Terreno, QA, Logística/Bodega")

System(pmp_suite, "Sistema PMP Suite", "Gestiona el ciclo de vida de equipos y órdenes de servicio")

System_Ext(firebase_auth, "Firebase Authentication", "Servicio de autenticación de usuarios")
System_Ext(email_system, "Sistema de Correo Electrónico", "Envío de notificaciones y enlaces de reseteo")

Rel(user, pmp_suite, "Usa")
Rel(pmp_suite, firebase_auth, "Autentica usuarios vía")
Rel(pmp_suite, email_system, "Envía correos electrónicos vía")

@enduml
```

---
