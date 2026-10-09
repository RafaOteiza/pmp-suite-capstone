# Arquitectura 04 — Mobile V2.0

**Versión:** V2.0  
**Stack:** Expo SDK 57 + React Native + Firebase + Expo Camera + AsyncStorage

## 1. Objetivo

Proporcionar al Técnico Terreno una experiencia enfocada en su jornada y permitir autoservicio de cuenta al resto de usuarios cuando acceden al cliente Mobile.

## 2. Estructura actual

- `App.js`
- `src/context/AuthContext.js`
- `src/context/AppearanceContext.js`
- `src/services/api.js`
- `src/services/firebase.js`
- `src/screens/*`
- `src/components/PmpUi.js`
- `src/components/TerrainWithdrawalForm.js`

## 3. Pantallas

### LoginScreen

Firebase login y estados de error.

### HomeScreen

Resumen de usuario/jornada.

### MyOrdersScreen

OS propias.

### NewOrderScreen

Reporte de falla/contexto.

### TerrainWithdrawalScreen

Retiro Physical First y evidencia.

### AssetHistoryScreen

Historial técnico restringido.

### SettingsScreens

Perfil, seguridad y apariencia.

## 4. Autenticación

Mobile obtiene token desde Firebase y lo adjunta a la API.

No mantiene una matriz de permisos independiente como autoridad de seguridad; Backend valida.

## 5. Reporte de falla

Debe seleccionar contexto operacional válido. Los datos conocidos de instalación se derivan, no se vuelven a pedir.

## 6. Retiro

### Captura

- cámara/QR cuando existe etiqueta;
- contingencia manual autorizada cuando corresponde.

### Evidencia

La contingencia manual se declara como tal y no se presenta como escaneo.

### PoD

Puede adjuntar evidencia según reglas del retiro.

## 7. Instalación

La OS IN ya fue creada por Bodega al despacho. El técnico ejecuta/completa la instalación asignada.

Mobile no crea IN de forma anticipada.

## 8. Historial técnico

Backend entrega allowlist:

- falla;
- diagnóstico;
- trabajo;
- resultado;
- observaciones.

Oculta:

- stock;
- costos;
- autorizadores;
- auditoría interna;
- IDs sin valor técnico;
- metadata sensible.

## 9. Apariencia

Preferencia:

- Automático;
- Claro;
- Oscuro.

Se persiste con AsyncStorage y aplica también al Login.

## 10. Seguridad personal

Cambio de contraseña mediante Firebase con reautenticación. Nunca se guarda contraseña en storage/PMP.

## 11. Cámara

La validación en mocks/export no equivale a hardware real.

Pendiente de cierre:

- permisos;
- lectura;
- foco;
- Safe Area;
- teclado;
- conectividad;
- retorno desde cámara;
- evidencia fotográfica.

## 12. Red

`EXPO_PUBLIC_API_URL` define API alcanzable desde dispositivo.

Durante desarrollo, computador/teléfono deben compartir conectividad válida.

## 13. Accesibilidad

- targets 44–48 pt;
- contraste;
- texto de estado;
- botones claros;
- evitar interacción crítica solo por color.

## 14. Pruebas

Última línea con mocks: 210/210.

La certificación física permanece separada.
