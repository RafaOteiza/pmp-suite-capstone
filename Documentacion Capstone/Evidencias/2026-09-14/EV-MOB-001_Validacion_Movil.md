# EV-MOB-001 — Validación técnica de la aplicación móvil

**Fecha:** 14 de septiembre de 2026  
**Componente:** `07_Mobile`  
**Plataforma objetivo validada:** Android  
**Estado:** Parcial: bundle aprobado; recorrido en teléfono físico pendiente

## Objetivo

Comprobar que la aplicación Expo puede resolver sus dependencias, consumir el
backend mediante una dirección configurable y generar un bundle Android sin
modificar el backend, los roles ni los contratos HTTP.

## Configuración verificada

- Expo `54.0.32`.
- React Native `0.81.5`.
- La URL se obtiene desde `EXPO_PUBLIC_API_URL`.
- El valor alternativo para desarrollo local es
  `http://127.0.0.1:4000/api`.
- El archivo versionable `.env.example` explica la configuración para teléfono
  físico y emulador Android.
- El archivo `.env` local está excluido del repositorio y no contiene secretos.
- El backend respondió HTTP 200 desde la red local antes de la exportación.

## Incidencia encontrada y corrección

La primera exportación falló al 97,2 % porque la instalación local de
`@expo/vector-icons` no contenía `Fontisto.ttf`. La dependencia ya formaba parte
de Expo y estaba registrada en `package-lock.json`; no correspondía agregar otro
paquete. Se reconstruyó exclusivamente `node_modules` con `npm ci`, respetando
el lockfile, y el archivo faltante quedó restaurado.

`npm ci` informó 45 alertas en el árbol de dependencias transitivas (1 baja, 17
moderadas, 23 altas y 4 críticas). No se aplicó `npm audit fix --force`, porque
podría introducir actualizaciones incompatibles con Expo 54. Estas alertas
deben revisarse como actividad de mantenimiento separada y con pruebas de
regresión.

## Comandos ejecutados

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\07_Mobile
npm ci
npx expo export --platform android --output-dir dist --max-workers 1 --clear
```

## Resultado técnico

| Verificación | Resultado |
|---|---|
| Resolución de dependencias | Aprobada |
| Bundle Android | Aprobado |
| Módulos procesados | 918 |
| Bundle Hermes | 3 MB |
| Activos exportados | 38 |
| Archivos totales de exportación | 40 |
| Tamaño total de `dist` | 6,85 MiB |
| Dependencias nuevas agregadas | Ninguna |

## Lista exacta para validación en teléfono físico

Precondiciones:

1. teléfono y computador conectados a la misma red local;
2. backend activo en el puerto 4000 y accesible desde la IP LAN configurada;
3. `EXPO_PUBLIC_API_URL` terminado en `/api`;
4. cuenta real de `tecnico_terreno` activa;
5. equipo demostrativo y etiqueta de serie disponibles.

Casos manuales:

| ID | Acción | Resultado esperado | Estado |
|---|---|---|---|
| MOB-01 | Abrir la aplicación | Pantalla de inicio sin error de bundle | Pendiente manual |
| MOB-02 | Iniciar sesión como técnico de terreno | Identidad y rol correctos | Pendiente manual |
| MOB-03 | Consultar la carga asignada | Solo órdenes permitidas para el usuario | Pendiente manual |
| MOB-04 | Crear el ingreso desde terreno | OS creada una sola vez y confirmación visible | Pendiente manual |
| MOB-05 | Adjuntar evidencia disponible | Archivo o imagen asociado sin exponer datos sensibles | Pendiente manual |
| MOB-06 | Repetir envío o provocar pérdida de red | Mensaje controlado, sin duplicación silenciosa | Pendiente manual |
| MOB-07 | Cerrar sesión | Token local eliminado y retorno a login | Pendiente manual |

## Conclusión

La aplicación móvil es técnicamente empaquetable para Android y ya no depende
de una IP escrita en el código. No se declara aprobada la experiencia completa
en dispositivo físico hasta ejecutar MOB-01 a MOB-07 y adjuntar capturas con el
mismo identificador.
