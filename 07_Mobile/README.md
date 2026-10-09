# Mobile PMP Suite V2.0

**Versión documental:** V2.0  
**Stack:** Expo SDK 57 + React Native + Firebase

## 1. Objetivo

Cliente móvil orientado principalmente a Técnico Terreno y autoservicio de cuenta.

## 2. Ejecución

```powershell
cd 07_Mobile
npm install
npx expo start
```

`.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://IP_LOCAL:4000/api
```

## 3. Pantallas

- Login.
- Inicio/Mi jornada.
- Mis órdenes.
- Nueva falla.
- Retiro físico.
- Historial de activo.
- Perfil.
- Seguridad.
- Apariencia.

## 4. Funciones Terreno

- ver OS propias;
- reportar falla;
- retirar equipo;
- capturar QR/cámara;
- contingencia manual autorizada;
- registrar contexto PoD;
- completar instalación;
- consultar historial técnico.

## 5. Historial técnico

Solo expone:

- falla;
- diagnóstico;
- trabajo;
- resultado;
- observaciones técnicas.

No expone información administrativa o stock.

## 6. Seguridad

Firebase maneja sesión/contraseña. Backend autoriza.

Nunca guardar password.

## 7. Apariencia

- Automático;
- Claro;
- Oscuro.

Persistencia local.

## 8. Physical First

Un campo digitado/manual no debe presentarse como scanner. La evidencia debe indicar su origen.

## 9. API

Consume `EXPO_PUBLIC_API_URL`. No duplicar reglas críticas del Backend.

## 10. Pruebas

Mocks actuales: **210/210**.

Pendiente físico:

- cámara;
- permisos;
- QR;
- Safe Area;
- teclado;
- red;
- flujo completo.

## 11. Detalle arquitectónico

`02_Arquitectura/Arquitectura_04_Frontend_Mobile_V2.0.md`.
