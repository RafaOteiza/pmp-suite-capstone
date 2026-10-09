# 04 — Manual Técnico y Despliegue PMP Suite V2.0

**Versión:** V2.0  
**Actualización:** 09-10-2026  
**Objetivo:** permitir preparar, ejecutar, verificar y diagnosticar PMP Suite sin depender de conocimiento informal.

## 1. Componentes

| Componente | Tecnología | Puerto habitual |
|---|---|---:|
| PostgreSQL | PostgreSQL 18.x local | 5432 |
| Backend | Node.js + Express | 4000 |
| Frontend Web | React/Vite | 5173 |
| Mobile | Expo SDK 57 / Metro | 8081 |
| Firebase | Authentication/Admin | remoto |
| IA | Python | invocada por Backend |

## 2. Estructura del repositorio

~~~text
01_Requerimientos/    ERS y requisitos
02_Arquitectura/      arquitectura, datos, API
03_Backend/pmp-api/   API y pruebas Backend
04_Frontend/          Web
05_BaseDatos/         migraciones
06_ModelosIA/         analizador Python
07_Mobile/            Expo
08_Pruebas/           pruebas/trazabilidad
09_BrandKit/          identidad
Documentacion Capstone/
shared/               reglas compartidas
~~~

## 3. Requisitos previos

- Windows de desarrollo habitual.
- Node.js compatible con lockfiles.
- npm.
- PostgreSQL instalado.
- Python 3.x.
- acceso al proyecto Firebase correspondiente.
- Expo Go para prueba Mobile sin Apple Developer.
- Git.

## 4. Clonado / actualización segura

Antes de actualizar una copia local:

~~~powershell
git status --short --branch
~~~

Si está limpio:

~~~powershell
git pull --ff-only origin main
~~~

No utilizar `--force` para resolver divergencias sin revisar.

## 5. Variables de entorno

### Backend

Archivo local: `03_Backend/pmp-api/.env`.

Debe contener al menos una conexión PostgreSQL y configuración Firebase Admin según el proyecto.

Ejemplo conceptual:

~~~dotenv
PORT=4000
DATABASE_URL=postgresql://USUARIO:CLAVE@localhost:5432/pmp_suite
FIREBASE_SERVICE_ACCOUNT_PATH=C:\ruta\privada\firebase-admin.json
~~~

La credencial real no se versiona.

### Frontend Web

Variables públicas Firebase según `04_Frontend/.env.example`/configuración del proyecto.

### Mobile

`07_Mobile/.env`:

~~~dotenv
EXPO_PUBLIC_API_URL=http://IP_LAN_DEL_PC:4000/api
~~~

El teléfono debe poder alcanzar esa IP.

## 6. PostgreSQL

### 6.1 Base habitual

Base de desarrollo habitual:

~~~text
localhost:5432 / pmp_suite
schema: pmp
~~~

### 6.2 Regla de seguridad

No ejecutar estrés, reset, limpieza masiva ni pruebas destructivas en la base habitual.

### 6.3 Respaldo antes de cambios estructurales

Antes de una migración:

1. verificar `DATABASE_URL`;
2. confirmar host/base;
3. respaldar;
4. verificar que el respaldo sea restaurable;
5. ejecutar dry-run si existe;
6. aplicar migración;
7. ejecutar validaciones.

## 7. Migraciones vigentes

### Bridge

1. `migraciones/bridge/001_bridge_mantenimiento_schema.sql`
2. `migraciones/bridge/002_bridge_correlacion.sql`

### Identificación física

3. `migraciones/escaneo/001_identificacion_fisica_schema.sql`

### Requerimientos / activos

4. `migraciones/requerimientos/003_casos_operacionales.sql`
5. `migraciones/requerimientos/004_os_independientes_alta_activos.sql`
6. `migraciones/requerimientos/005_gestion_activos.sql`
7. `migraciones/requerimientos/006_recepcion_inicial_sin_os.sql`

Las migraciones son aditivas y preservan registros históricos. No aplicar archivos rollback salvo una reversión conscientemente planificada.

## 8. Backend

### Instalar

~~~powershell
cd "C:\Users\raote\Documents\Duoc\Tesis\03_Backend\pmp-api"
npm install
~~~

### Ejecutar

~~~powershell
npm run dev
~~~

### Verificar

~~~text
GET http://localhost:4000/api/health
Swagger: http://localhost:4000/docs
~~~

Respuesta health esperada: HTTP 200.

## 9. Frontend Web

~~~powershell
cd "C:\Users\raote\Documents\Duoc\Tesis\04_Frontend"
npm install
npm run dev
~~~

URL habitual:

~~~text
http://localhost:5173
~~~

### Build

~~~powershell
npm run build
~~~

## 10. Mobile

~~~powershell
cd "C:\Users\raote\Documents\Duoc\Tesis\07_Mobile"
npm install
npx expo start
~~~

### Red

1. obtener IP LAN del PC;
2. usarla en `EXPO_PUBLIC_API_URL`;
3. comprobar que firewall/red permite puerto 4000;
4. PC y teléfono deben tener conectividad mutua.

### Validación

Expo Go permite validar el flujo funcional. Cámara, teclado, Safe Area y permisos deben probarse físicamente antes de declararlos cerrados.

## 11. IA

### Crear entorno

~~~powershell
cd "C:\Users\raote\Documents\Duoc\Tesis\06_ModelosIA"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
~~~

### Ejecutar contrato JSON

~~~powershell
.\.venv\Scripts\python.exe src\analyzer.py --json
~~~

La salida estándar debe ser JSON cuando usa `--json`. El analizador es de lectura.

## 12. Firebase

### Responsabilidades

Firebase gestiona:

- autenticación;
- contraseña;
- identidad UID;
- Admin SDK.

PostgreSQL gestiona:

- cuenta activa;
- rol efectivo;
- atributos operacionales.

### Inconsistencia UID/correo

No corregir silenciosamente una inconsistencia durante login. Debe bloquearse/resolverse administrativamente.

## 13. Usuarios y roles

Roles oficiales:

- admin;
- gerente;
- jefe_laboratorio;
- logistica;
- qa;
- tecnico_laboratorio;
- tecnico_terreno.

No editar roles directamente por SQL como procedimiento normal si la UI/API administrativa puede realizar la operación con validaciones.

## 14. Inicio recomendado del entorno

Orden sugerido:

1. PostgreSQL.
2. Backend.
3. Frontend Web.
4. Expo/Metro cuando se prueba Mobile.
5. Python se ejecuta bajo demanda desde Backend.

## 15. Pruebas Backend

~~~powershell
cd 03_Backend\pmp-api
npm test
~~~

Resultado documentado vigente: 118/118.

### E2E

Las verificaciones que escriben datos deben usar herramientas de PostgreSQL efímero incluidas en `tools/` / `verification/`.

Nunca reemplazar este aislamiento apuntando una suite destructiva a `pmp_suite`.

## 16. Pruebas Web

~~~powershell
cd 04_Frontend
npm test
npm run build
~~~

Estado documentado: 176/177 tests y build aprobado.

## 17. Pruebas Mobile

Las pruebas están en `07_Mobile/test/` e incluyen:

- regresión operacional;
- settings;
- UI;
- visual.

El éxito de mocks/export no reemplaza dispositivo físico.

## 18. Smoke test funcional

Después de levantar el entorno comprobar:

1. login;
2. `/api/auth/me`;
3. Dashboard correspondiente al rol;
4. una consulta no mutante de activos/OS;
5. RBAC de una ruta prohibida;
6. Bodega/Lab/QA según cuenta disponible;
7. búsqueda de trazabilidad;
8. endpoint IA si corresponde.

## 19. Logs y diagnóstico

### Backend

Revisar terminal Node. Logs de autorización muestran actor ID/rol/acción/resultado sin body sensible.

### Web

Revisar consola navegador + Network.

### Mobile

Revisar terminal Expo/Metro + logs de dispositivo.

### PostgreSQL

Usar consultas READ ONLY para diagnóstico cuando no sea necesario escribir.

## 20. Códigos HTTP

| Código | Diagnóstico inicial |
|---:|---|
| 400 | payload/dato básico inválido |
| 401 | sesión/token |
| 403 | rol/scope |
| 404 | recurso |
| 409 | conflicto de estado/evidencia/custodia/stock |
| 410 | flujo retirado |
| 422 | regla de negocio |
| 500 | error inesperado |

## 21. Problemas frecuentes

### Backend no inicia

Verificar:

- puerto 4000 libre;
- `DATABASE_URL`;
- PostgreSQL activo;
- credencial Firebase;
- dependencias instaladas.

### Web no conecta

Verificar Vite, URL API/configuración y CORS.

### Mobile no conecta

Verificar IP LAN, puerto 4000 y red/firewall. `localhost` en teléfono no representa el PC.

### 403 inesperado

Verificar:

- usuario PostgreSQL;
- `activo`;
- `rol`;
- asignación del recurso;
- acción solicitada.

### 409 Physical First

Verificar:

- estación;
- propósito;
- ciclo;
- validación_id;
- si la evidencia es más reciente que la última transición;
- identidad del activo.

### Activo no disponible

Revisar:

- custodia Bodega;
- origen stock;
- QA si es reparado;
- intervención incompatible;
- consumo previo del origen.

### Lab no permite asignar

Confirmar recepción física del ciclo actual.

### QA no permite dictamen

Verificar recepción/etapas/revisión/ciclo.

## 22. Política de cambios de BD

Antes de modificar esquema:

- documentar motivo;
- crear migración;
- no editar históricos manualmente;
- mantener compatibilidad si el dato existe;
- agregar constraint/index solo después de analizar datos;
- probar en instancia descartable;
- actualizar diccionario/ERD.

## 23. Política de secretos

No versionar:

- `.env`;
- service accounts;
- tokens;
- claves privadas;
- dumps privados;
- contraseñas.

`.gitignore` protege estos patrones, pero la revisión humana sigue siendo obligatoria.

## 24. Backups y recuperación

Los respaldos son artefactos locales/privados, no documentación funcional.

Una restauración debe comprobar:

- esquema;
- tablas;
- constraints;
- secuencias;
- vistas;
- triggers;
- integridad de datos.

## 25. Arquitectura de despliegue

~~~text
Browser ──> Vite/Web
              │
              v
           API Node ──> PostgreSQL
              │
              ├──────> Firebase
              └──────> Python

Mobile ───────> API Node por LAN/entorno
~~~

## 26. Proyección servidor

Ubuntu + Nginx + PM2 puede ser una alternativa de despliegue futuro. No se declara como producción ya certificada.

## 27. Documentación relacionada

- ERS: `01_Requerimientos/ERS_PMP_Suite_V2.0.md`.
- Arquitectura: `02_Arquitectura/Arquitectura_Integral_PMP_Suite_V2.0.md`.
- DB: `02_Arquitectura/MODELO_DATOS_DICCIONARIO_V2.0.md`.
- API: `02_Arquitectura/CATALOGO_API_V2.0.md`.
- Tests: `08_Pruebas/INFORME_PRUEBAS_V2.0.md`.
- BPMN: `Documentacion Capstone/BPMN/`.

## 28. Checklist antes de demostrar

- [ ] Backend health 200.
- [ ] Web abre sin errores críticos.
- [ ] Login por roles clave.
- [ ] DB conocida y respaldada.
- [ ] No hay suite destructiva apuntando a base habitual.
- [ ] Caso de demo identificado.
- [ ] Flujo/custodia actual conocido.
- [ ] Cámara/contingencia explicada correctamente.
- [ ] Pendientes declarados.
- [ ] Sin credenciales visibles en pantalla/capturas.
