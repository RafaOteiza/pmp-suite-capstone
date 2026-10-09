# 4. Arquitectura Frontend Mobile

## Stack

Expo SDK 57 + React Native + Firebase SDK + Expo Camera + AsyncStorage.

## Objetivo

La aplicación Mobile está orientada a operación en Terreno y autoservicio de cuenta.

## Funciones

- autenticación;
- inicio / jornada;
- Mis órdenes;
- instalación;
- reporte de falla;
- retiro físico;
- cámara/QR y contingencia manual;
- historial técnico restringido;
- perfil;
- seguridad/cambio de contraseña;
- apariencia Automático/Claro/Oscuro.

## Tema

`AppearanceContext` mantiene la preferencia local y propaga tokens de color. La elección también aplica a la pantalla de acceso.

## Seguridad

El Mobile obtiene el token vigente desde Firebase y llama la misma API que Web. No concede permisos por navegación local.

## Historial Terreno

Se presenta una proyección técnica: falla, diagnóstico, trabajo, resultado y observaciones. No se exponen costos, stock, auditoría administrativa o autorizadores.

## Dispositivo físico

Los bundles/exportaciones no sustituyen pruebas nativas. Cámara, Safe Area, teclado y red LAN deben validarse en dispositivo real.
