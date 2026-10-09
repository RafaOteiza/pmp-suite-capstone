# 5. Arquitectura de despliegue

**Versión:** V2.0

## Entorno habitual de desarrollo

```text
Web Vite :5173 ─┐
                ├─ API Node :4000 ─ PostgreSQL :5432 / pmp_suite
Expo/Metro ─────┘          │
                           ├─ Firebase
                           └─ Python IA
```

## Componentes

- PostgreSQL local: persistencia principal.
- Backend Node/Express: API y autorización.
- Vite: frontend Web.
- Expo/Metro: desarrollo Mobile.
- Firebase: Authentication/Admin.
- Python: analítica invocada por backend.

## Configuración

Credenciales y `.env` permanecen fuera de Git. Mobile debe usar una URL API alcanzable desde el dispositivo.

## Producción

Ubuntu + Nginx + PM2 se mantiene como proyección de despliegue, no como entorno productivo certificado.

## Pruebas

Pruebas destructivas o de carga deben usar PostgreSQL efímero/desechable, nunca la base habitual.
