# Despliegue de PMP Suite y proyección Ubuntu

Actualización documental: 23 de septiembre de 2026. Fuente normativa: [artefactos Capstone v2.0](../Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_VIGENCIA_v2.0.md), especialmente el Manual Técnico. Esta actualización no acredita una nueva instalación ni ejecución de pruebas.

## Entorno validado y alcance

El entorno comprobado utiliza PostgreSQL, API Node/Express, frontend Vite, Python para IA y Expo SDK 57. Consultar el manual v2.0 y [Arquitectura de ejecución local](Arquitectura_05_Despliegue.md).

Ubuntu con Nginx y PM2 es una **proyección de preproducción**, pendiente de validación específica. Docker, Dockerfile y docker-compose están fuera del alcance. Los contenedores lógicos C4 no representan infraestructura Docker.

## Datos y migraciones

1. Identificar entorno/base de destino, respaldar datos y comprobar su restauración.
2. Restaurar el esquema base y comprobar los prerrequisitos de Bridge/correlación y escaneo existentes.
3. Revisar y aplicar en orden las migraciones de `05_BaseDatos/migraciones/requerimientos/`:

| Migración | Efecto vigente |
|---|---|
| 003 — casos operacionales | Casos y relaciones entre intervenciones. Su numeración IN original fue sustituida por 004. |
| 004 — OS independientes y alta de activos | Correlativo PMP independiente para IN y modelo desconocido nullable, sin renumerar históricos. |
| 005 — gestión de activos | Procedencia, fecha, observación y autor del maestro. |
| 006 — recepción inicial sin OS | Eventos/escaneos por activo sin OS y origen de stock inicial relacionado con la primera IN. |

4. Usar primero el ensayo del verificador y revisar su salida. Desde `03_Backend/pmp-api`:

```powershell
node verification/apply_requirements.mjs
# Aplicación posterior en el entorno de destino revisado:
node verification/apply_requirements.mjs --apply
```

Son instrucciones reproducibles, **no ejecutadas en esta revisión documental**. Para una base con 003–005, `verification/apply_initial_reception.mjs` ensaya 006 y `--apply` la aplica. La [evidencia de recepción inicial](../08_Pruebas/RECEPCION_INICIAL_SIN_OS.md) registra las aplicaciones locales anteriores.

## Carga inicial

Una puesta en producción debe cargar parque instalado y stock con identidad **tipo + serie**, procedencia y relaciones verificadas. El importador masivo sigue documentado como extensión futura.

- Gestión de activos registra maestro y ALTA_ACTIVO, sin OS ni stock automático.
- La recepción nueva exige lectura física en la ubicación BODEGA y conformidad inicial explícita. No utiliza bus ficticio ni crea MV/MC/PDV/PDC/IN.
- El stock inicial se respalda en RECEPCION_INICIAL y HABILITADO_INSTALACION; el reparado exige reparación/QA y recepción física.
- Las relaciones con buses y las OS históricas deben provenir de evidencia real. No inventar mantenimientos para representar equipos preexistentes.
- No ejecutar scripts de limpieza, siembra o reinicio de demo como carga productiva. Se retira esa recomendación de esta guía.

## Ejecución local

Configurar variables conforme al manual v2.0, sin credenciales en el repositorio. Mobile usa `EXPO_PUBLIC_API_URL` alcanzable desde el dispositivo.

| Componente | Inicio desde su directorio |
|---|---|
| PostgreSQL | Iniciar servicio y comprobar la base configurada. |
| API, `03_Backend/pmp-api` | `npm ci`, `npm run dev`; comprobar `GET /api/health`. |
| Web, `04_Frontend` | `npm ci`, `npm run dev`. |
| IA, `06_ModelosIA` | Preparar entorno virtual y dependencias del manual; la API invoca el analizador. |
| Mobile, `07_Mobile` | `npm ci`, `npm start`, conservando Expo SDK 57. |

## Proyección Ubuntu

Validar versiones y dependencias del proyecto en Ubuntu antes de adoptarlo. Usar entorno virtual para Python y una cuenta PostgreSQL propia del servicio; no recrear el usuario administrativo ni publicar contraseñas de ejemplo.

Nginx serviría el build web y redirigiría `/api` a la API administrada con PM2. Documentar configuración, conectividad móvil, TLS, respaldo y reinicio del entorno final. Las pruebas locales no certifican este despliegue propuesto.

## Verificación posterior

Las suites actuales, build y exportaciones Android/iOS están documentadas en [Recepción inicial sin OS](../08_Pruebas/RECEPCION_INICIAL_SIN_OS.md). Los E2E deben conservar aislamiento y limpieza. Los scripts históricos `e2e_full_v2.js` y `stress_test.js` no son instrucciones para probar sobre la base principal.

El guion vigente comprueba alta sin OS/stock, rechazo de desconocidos en Requerimientos, recepción escaneada/conforme y despacho physical-first. Solo confirmar salida crea `IN-xxxxxx` independiente y SALIDA_BODEGA_TERRENO; elegir técnico no aumenta En ruta. Equipos en operación no es stock asignable. Bridge solo correlaciona. Exportar Expo no sustituye la prueba con lector y teléfono reales.
