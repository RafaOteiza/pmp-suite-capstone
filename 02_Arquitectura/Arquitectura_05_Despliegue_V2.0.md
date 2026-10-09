# Arquitectura 05 — Despliegue y Entornos V2.0

**Versión:** V2.0  
**Estado:** desarrollo/local validado; servidor Ubuntu proyectado.

## 1. Entorno habitual

```text
Navegador ──> Vite :5173 ─┐
                           ├──> API Node :4000 ───> PostgreSQL :5432 / pmp_suite
Teléfono Expo ── LAN ─────┘             │
                                        ├──> Firebase
                                        └──> Python analyzer
```

## 2. Backend

Ubicación: `03_Backend/pmp-api`.

Dependencias Node gestionadas con `package.json/package-lock.json`.

Configuración local:

- `PORT` cuando corresponde;
- `DATABASE_URL`;
- credencial Firebase Admin fuera de Git;
- CORS/variables de entorno necesarias.

## 3. PostgreSQL

- base habitual: `pmp_suite`;
- schema: `pmp`;
- puerto habitual: 5432.

Las migraciones deben aplicarse de forma controlada. Pruebas destructivas usan clúster/base efímera.

## 4. Frontend Web

Ubicación: `04_Frontend`.

- desarrollo: Vite;
- URL habitual: `http://localhost:5173`;
- build: `npm run build`.

El frontend consume la API y Firebase según variables públicas locales.

## 5. Mobile

Ubicación: `07_Mobile`.

- Expo SDK 57;
- Metro habitual 8081;
- `EXPO_PUBLIC_API_URL` debe apuntar a una IP/hostname alcanzable desde el dispositivo.

No fijar IP en código.

## 6. Firebase

Usos:

- login;
- token;
- Admin SDK;
- gestión de usuario;
- recuperación/cambio de contraseña.

Las service accounts no se versionan.

## 7. Python

Ubicación: `06_ModelosIA`.

Entorno virtual local `.venv`, ignorado por Git.

El Backend invoca `src/analyzer.py --json`.

## 8. Arranque recomendado

1. PostgreSQL disponible.
2. API Backend.
3. Frontend Web.
4. Expo si se prueba Mobile.
5. Verificar `/api/health`.
6. Login con cuenta autorizada.

## 9. Puertos habituales

| Servicio | Puerto |
|---|---:|
| PostgreSQL | 5432 |
| API | 4000 |
| Vite | 5173 |
| Expo/Metro | 8081 |

Son valores de desarrollo habitual, no un contrato productivo.

## 10. Proyección servidor

Arquitectura prevista:

```text
Internet
→ TLS/Nginx
→ Frontend estático / reverse proxy
→ Node/PM2
→ PostgreSQL
→ Firebase / Python
```

Debe validarse en un entorno real antes de llamarlo producción certificada.

## 11. Backups y migración

Antes de un cambio estructural:

1. respaldo;
2. validar restauración;
3. revisar migración;
4. dry-run cuando exista;
5. aplicar;
6. ejecutar pruebas/smoke;
7. verificar integridad.

## 12. Seguridad de entorno

No versionar:

- `.env`;
- service account;
- PEM/keys;
- dumps;
- backups;
- tokens;
- contraseñas.

## 13. Pruebas por entorno

### Habitual

Pruebas manuales controladas y lecturas.

### Efímero

E2E con escrituras, reset y carga.

La suite debe comprobar que la base habitual no cambió cuando el objetivo es aislamiento.

## 14. Health checks

- Backend: `GET /api/health`;
- autenticación;
- consulta `auth/me`;
- lectura de dashboard;
- conectividad DB/Firebase;
- Mobile por LAN.

## 15. Fallos comunes

| Síntoma | Revisión |
|---|---|
| Web no conecta | API/CORS/VITE URL |
| Mobile no conecta | IP LAN/firewall/API |
| 401 | token/Firebase |
| 403 | rol PostgreSQL |
| DB error | DATABASE_URL/PostgreSQL |
| IA falla | Python/.venv/DATABASE_URL |
