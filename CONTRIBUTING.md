# Guía de contribución

Este repositorio debe conservar evidencia verificable de la participación individual de cada integrante del equipo Capstone.

## Responsabilidades acordadas

- [Matías Garrido](https://github.com/matiasgarridopinto): documentación y requerimientos.
- [Rafael Oteiza](https://github.com/RafaOteiza): gestión, arquitectura, base de datos y backend.
- [Luis Arenas](https://github.com/luis26001): frontend web y aplicación móvil.

La distribución orienta la responsabilidad principal, pero no impide la colaboración o revisión cruzada.

## Flujo de trabajo

1. Cada integrante debe aceptar la invitación al repositorio e iniciar sesión con su propia cuenta.
2. Cada integrante configura en Git su nombre y un correo verificado en GitHub.
3. El trabajo se realiza en ramas propias, por ejemplo `docs/matias-requerimientos`, `backend/rafa-api` o `frontend/luis-dashboard`.
4. Los commits deben ser pequeños y describir el cambio realizado.
5. Cada rama se integra mediante un pull request revisable; no se deben crear commits atribuidos artificialmente a otra persona.

## Preparación local

Los archivos `.env` y las claves de servicio son locales y no se versionan. El backend puede configurarse copiando `03_Backend/pmp-api/.env.example` a `.env` y reemplazando únicamente los valores del entorno local.

## Evidencia para Capstone

Como evidencia individual se conservarán los commits, pull requests, revisiones, incidencias y documentos vinculados a cada entrega. Los nombres declarados en el README o en `CODEOWNERS` describen la organización del equipo, pero no sustituyen esa evidencia.
