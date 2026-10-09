# Despliegue PMP Suite — proyección Ubuntu

**Estado:** propuesta técnica; no constituye certificación de producción.

## Entorno validado

El desarrollo habitual utiliza PostgreSQL, Node/Express, Vite, Python y Expo SDK 57. Ubuntu + Nginx + PM2 es la alternativa prevista para un entorno servidor.

## Preparación

1. Respaldar PostgreSQL y verificar restauración.
2. Instalar versión compatible de Node y PostgreSQL.
3. Crear usuario/base de servicio.
4. Aplicar migraciones vigentes en orden.
5. Configurar credenciales fuera del repositorio.
6. Crear entorno virtual Python.
7. Construir frontend Web.
8. Ejecutar API con gestor de procesos.
9. Configurar Nginx/TLS.
10. Ejecutar suites y smoke tests.

## Variables

- `DATABASE_URL`
- credencial Firebase Admin mediante ruta/variable segura
- configuración CORS/API
- variables públicas del frontend
- `EXPO_PUBLIC_API_URL` para Mobile en cada entorno

## Restricciones

- No usar los scripts de reinicio demo como migración productiva.
- No ejecutar estrés sobre la base real.
- No publicar service accounts, `.env`, dumps o respaldos.
- Docker no forma parte del alcance actual.

## Verificación posterior

- `GET /api/health`
- autenticación de un usuario de prueba autorizado;
- denegaciones RBAC;
- lectura de dashboards;
- flujo E2E aislado;
- logs sin secretos;
- conectividad Mobile.

La topología final debe documentarse cuando exista un despliegue real reproducible.
