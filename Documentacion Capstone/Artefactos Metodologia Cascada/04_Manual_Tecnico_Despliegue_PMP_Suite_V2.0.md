# 04 — Manual Técnico y Despliegue PMP Suite V2.0

## 1. Componentes

- PostgreSQL.
- Backend Node/Express.
- Frontend React/Vite.
- Mobile Expo SDK 57.
- Firebase.
- Python IA.

## 2. Variables

Backend requiere `DATABASE_URL` y credencial Firebase Admin configurada fuera de Git.

Mobile utiliza `EXPO_PUBLIC_API_URL`.

Frontend utiliza variables públicas Firebase según su `.env.example`.

## 3. Backend

```powershell
cd 03_Backend\pmp-api
npm install
npm run dev
```

Health:

```text
GET http://localhost:4000/api/health
```

Swagger:

```text
http://localhost:4000/docs
```

## 4. Frontend

```powershell
cd 04_Frontend
npm install
npm run dev
```

URL habitual: `http://localhost:5173`.

## 5. Mobile

```powershell
cd 07_Mobile
npm install
npx expo start
```

El dispositivo debe alcanzar la API por red local.

## 6. IA

```powershell
cd 06_ModelosIA
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 7. Base de datos

No ejecutar migraciones sin respaldo.

Orden de migraciones versionadas:

1. Bridge schema.
2. identificación física.
3. correlación Bridge.
4. casos operacionales.
5. OS independientes.
6. gestión de activos.
7. recepción inicial sin OS.

Aplicar primero dry-run cuando esté disponible.

## 8. Seguridad

- no versionar secretos;
- no registrar tokens/contraseñas;
- no usar claims como autorización;
- no probar destrucción sobre base habitual.

## 9. Pruebas

Backend:

```powershell
npm test
```

Web:

```powershell
npm test
npm run build
```

Las suites con escritura deben usar entorno aislado.

## 10. Diagnóstico

### 401
Revisar token/sesión.

### 403
Revisar rol efectivo PostgreSQL y scope.

### 409
Revisar estado, custodia, evidencia o reintento.

### 422
Revisar datos/reglas de negocio.

### 500
Revisar logs Backend sin exponer secretos.

## 11. Topología de desarrollo

```text
Web 5173 ─┐
          ├─ API 4000 ─ PostgreSQL 5432
Mobile ───┘      │
                 ├─ Firebase
                 └─ Python
```

## 12. Proyección servidor

Ubuntu + Nginx + PM2 permanece como alternativa de despliegue. No se presenta como producción ya certificada.

## 13. Documentos de apoyo

- Arquitectura integral.
- Catálogo API.
- Diccionario DB.
- ERS V2.0.
- Informe de pruebas V2.0.
