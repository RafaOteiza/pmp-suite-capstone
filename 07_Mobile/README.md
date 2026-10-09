# Mobile PMP Suite

**Versión documental:** V2.0  
**Stack:** Expo SDK 57 + React Native

## Ejecución
```powershell
cd 07_Mobile
npm install
npx expo start
```

Configurar `EXPO_PUBLIC_API_URL=http://IP_LOCAL:4000/api` en el `.env` local.

## Funciones vigentes
Autenticación, Mi jornada, Mis órdenes, instalación, reporte de falla, retiro físico, cámara/QR, contingencia manual auditada, historial técnico, perfil, cambio de contraseña y tema Automático/Claro/Oscuro.

## Seguridad
Mobile usa el mismo backend/RBAC que Web. La interfaz no concede permisos.

## Pendiente
Validar cámara, Safe Area, teclado, red y flujo completo en dispositivo físico.
