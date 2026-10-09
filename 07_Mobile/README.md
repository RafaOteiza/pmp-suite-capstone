# Mobile PMP Suite

**Stack:** Expo SDK 57 + React Native  
**Objetivo:** operación de Terreno y autoservicio de cuenta.

## Ejecutar

```powershell
cd 07_Mobile
npm install
npx expo start
```

Configurar `.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://IP_LOCAL:4000/api
```

## Funciones vigentes

- login;
- inicio / jornada;
- Mis órdenes;
- instalación;
- reportar falla;
- retiro físico;
- cámara/QR;
- contingencia manual auditada;
- historial técnico;
- configuración;
- perfil;
- cambio de contraseña;
- apariencia Automático/Claro/Oscuro.

## Diseño

Comparte identidad PMP Suite y semántica de estados con Web. La preferencia de tema se guarda localmente.

## Historial

Terreno solo recibe antecedentes técnicos necesarios. No se exponen auditoría administrativa, costos, stock ni autorizadores.

## Cámara y evidencia

La cámara debe utilizarse cuando existe QR/etiqueta legible. La contingencia manual requiere motivo y confirmación; no se trata como escaneo físico.

## Verificación

Las pruebas con mocks y exportaciones no reemplazan validación nativa. Deben probarse:

- cámara;
- Safe Area;
- teclado;
- red;
- permisos;
- tema;
- cambio de contraseña;
- flujo completo en dispositivo.
