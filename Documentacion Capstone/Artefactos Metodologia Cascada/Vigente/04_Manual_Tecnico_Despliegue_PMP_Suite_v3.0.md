# 04 — Manual Técnico / Despliegue PMP Suite v3.0

## Requisitos

- Node.js compatible con el proyecto.
- PostgreSQL.
- Python 3.x y entorno virtual para IA.
- Cuenta/proyecto Firebase.
- Expo Go para validación Mobile.

## Base de datos

Base habitual: `pmp_suite`, esquema `pmp`.

Aplicar migraciones únicamente después de respaldo y dry-run. No utilizar scripts demo/reset en producción.

## Backend

```powershell
cd 03_Backend\pmp-api
npm install
npm run dev
```

API habitual: `http://localhost:4000`.

## Web

```powershell
cd 04_Frontend
npm install
npm run dev
```

URL habitual: `http://localhost:5173`.

## Mobile

```powershell
cd 07_Mobile
npm install
npx expo start
```

`.env` local:

```dotenv
EXPO_PUBLIC_API_URL=http://IP_LAN:4000/api
```

## IA

```powershell
cd 06_ModelosIA
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Seguridad

- no versionar `.env`;
- no versionar service accounts;
- no guardar contraseñas/tokens en documentación;
- Firebase autentica y PostgreSQL autoriza.

## Pruebas

```powershell
cd 03_Backend\pmp-api
npm test

cd ..\..\..\04_Frontend
npm test
npm run build
```

Mobile dispone de su suite propia según `07_Mobile/package.json`.

## Proyección Ubuntu

Nginx + PM2 puede utilizarse como despliegue servidor después de validación. Actualmente es una proyección, no una certificación productiva.
