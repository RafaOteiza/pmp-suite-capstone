# PMP Suite

> **Estado:** cierre técnico y validación Capstone  
> **Última actualización:** 09-10-2026  
> **Repositorio de desarrollo:** código Web, Backend, Mobile, Base de Datos, IA, pruebas, arquitectura y documentación técnica.

PMP Suite es una plataforma de gestión operacional para controlar el ciclo físico y técnico de validadores y consolas de transporte: alta de activos, instalación, reporte de fallas, retiro, bodega, laboratorio, QA, reintegro a stock y nueva instalación.

El proyecto se desarrolla como Capstone de Ingeniería Informática en Duoc UC. El núcleo funcional está implementado y actualmente el foco está en **validación integral, evidencia reproducible, cierre documental y preparación de defensa**.

---

## 1. Estado actual

La versión vigente consolida:

- RBAC separado por responsabilidad, incluyendo el nuevo rol `jefe_laboratorio`.
- Custodia física **Physical First**: consultar, abrir o validar no mueve un equipo; la custodia cambia solo al confirmar el movimiento correspondiente.
- Recepción y despacho independientes entre Terreno, Bodega, Laboratorio y QA.
- Bandeja de recepción de Laboratorio con **En camino, Recibidos, Incidencias e Historial**.
- Dashboard ejecutivo con parque global, distribución por etapa, OS, fallas, PoD y supervisión operacional.
- Gestión de carga de Laboratorio, SLA desde recepción física vigente y carga por técnico.
- Trabajo técnico integral: diagnóstico, intervención, pruebas, repuestos, resultado y preparación para QA.
- QA autónomo con recepción, Instalación Ambiente, pruebas, dictamen y despacho independiente.
- Inventario y Bodega con separación entre parque global, stock físico, disponibilidad e instalaciones.
- Mobile para Terreno con órdenes, instalación, reporte de falla, retiro, historial técnico, perfil, cambio de contraseña y temas Claro/Oscuro/Automático.
- UX/UI transversal basada en el Brand Kit PMP Suite.
- Analítica de reincidencia/riesgo como apoyo operacional, no como sustituto del criterio técnico.

La documentación de seguridad e identidad más reciente se encuentra en:

- [Consolidación de seguridad, identidad y UX](08_Pruebas/Consolidacion_Seguridad_Identidad_UX_2026-10-08.md)
- [Separación RBAC](08_Pruebas/Separacion_Roles_RBAC_2026-10-09.md)
- [Custodia de Laboratorio](08_Pruebas/Laboratorio_Custodia_Physical_First.md)
- [Trabajo técnico de Laboratorio](08_Pruebas/Laboratorio_Trabajo_Tecnico_Integral.md)

---

## 2. Equipo

- **Rafael Oteiza:** gestión, arquitectura, integración, base de datos y backend.
- **Matías Garrido:** levantamiento de requerimientos y documentación.
- **Luis Arenas:** frontend Web y aplicación Mobile.

Las evidencias académicas se mantienen en `Documentacion Capstone/`.

---

## 3. Arquitectura

```text
Web React/Vite ───────┐
                      ├──> API REST Node.js/Express ───> PostgreSQL (schema pmp)
Mobile Expo/React Native ┘            │
                                     ├──> Firebase Admin / Authentication
                                     └──> Analizador Python
```

### Tecnologías principales

- **Frontend Web:** React 18, TypeScript, Vite, React Router, Recharts.
- **Backend:** Node.js, Express, PostgreSQL `pg`, Firebase Admin SDK.
- **Base de datos:** PostgreSQL, esquema `pmp`.
- **Mobile:** Expo SDK 57, React Native, Firebase SDK, Expo Camera.
- **IA / Analítica:** Python, pandas, scikit-learn, joblib y psycopg2.
- **Diseño:** Brand Kit PMP Suite, tokens compartidos, componentes reutilizables y temas claro/oscuro.

---

## 4. Modelo operacional

### Flujo principal de mantenimiento

```text
Activo en operación
→ Reporte de falla
→ Retiro físico por Terreno
→ Recepción en Bodega
→ Despacho a Laboratorio
→ Recepción física en Laboratorio
→ Asignación a técnico
→ Diagnóstico / reparación / pruebas
→ Salida hacia Bodega
→ Recepción en Bodega
→ Despacho a QA
→ Recepción QA
→ Instalación Ambiente / pruebas / dictamen
→ Salida QA
→ Recepción en Bodega
→ Disponible para instalación
→ Despacho físico a Terreno
→ Instalación
→ Activo en operación
```

Cada movimiento utiliza evidencia propia del ciclo actual. Una lectura previa no reemplaza la recepción o salida posterior.

### Nueva instalación

La OS `IN-xxxxxx` se crea **solo al confirmar el despacho físico desde Bodega a Terreno**. Seleccionar técnico, bus o serie no crea la IN ni confirma salida.

### Alta de activo

`Gestión de activos` registra el maestro y `ALTA_ACTIVO`. La recepción inicial en Bodega habilita el stock sin crear una OS de mantenimiento.

---

## 5. Identidad de equipos

La identidad física se define por **tipo + serie** y se valida también en backend.

### Validadores

| Prefijo de serie | Modelo | Marca |
|---|---|---|
| `72...` | `CVB35` | Mikroelektronika |
| `74...` | `CVB45` | Mikroelektronika |
| `75...` | `CVB45` | Mikroelektronika |

Un prefijo desconocido bloquea el alta como validador.

### Consolas

| Tipo | Modelo | Marca |
|---|---|---|
| Consola | `N9715` | Waysion |

Modelo y marca se derivan automáticamente y no deben depender de digitación libre.

Los validadores pueden resolverse además mediante AMID; las consolas utilizan su serie en QR/código de barras.

---

## 6. Roles y autorización

Firebase autentica la identidad. PostgreSQL determina el usuario activo y el rol efectivo. Los claims o parámetros enviados por el cliente **no conceden permisos**.

| Rol | Responsabilidad |
|---|---|
| `admin` | Administración de usuarios, roles, seguridad y supervisión global. No obtiene permisos operacionales automáticos. |
| `gerente` | Supervisión ejecutiva, indicadores, reportes y trazabilidad de solo lectura. |
| `jefe_laboratorio` | Recepción, asignación, supervisión, SLA y despacho de Laboratorio. |
| `logistica` | Bodega, inventario, repuestos, recepciones, despachos y operaciones logísticas. |
| `qa` | Recepción QA, Instalación Ambiente, pruebas, dictamen y despacho. |
| `tecnico_laboratorio` | Diagnóstico, reparación y pruebas exclusivamente de su carga asignada. |
| `tecnico_terreno` | Instalaciones, retiros, reporte de fallas y órdenes propias. |

La autorización sensible se centraliza con **denegación por defecto** y validación adicional por recurso, asignación, estación, ciclo y evidencia.

Protecciones relevantes:

- un administrador no puede cambiar su propio rol ni desactivar su propia cuenta desde la gestión administrativa;
- no se permite eliminar el último administrador activo;
- los técnicos no pueden operar OS ajenas;
- Gerencia no realiza escrituras operacionales;
- Admin supervisa operaciones, pero no ejecuta recepción, despacho, reparación, QA ni movimientos de stock por defecto.

---

## 7. Web por dominio

### Centro de control

- Supervisión global / Dashboard ejecutivo.
- Órdenes de servicio.
- Equipos en operación.
- Trazabilidad.
- Reportes.
- Predicción de fallas / reincidencia.

### Gestión de Laboratorio

- Resumen de Laboratorio.
- Recepción de equipos.
- Gestión de carga.
- Validadores.
- Consolas.
- Despacho a Bodega.
- Antecedentes técnicos.

### Logística

- Dashboard / Resumen Bodega.
- Recepciones y despachos.
- Inventario.
- Repuestos y stock.
- Retiros de Terreno.
- Gestión de activos y requerimientos según permisos.

### QA

QA conserva un flujo autónomo y no depende de que Admin asigne o confirme sus operaciones.

---

## 8. Aplicación Mobile

La aplicación Mobile está orientada principalmente a Terreno.

Funciones vigentes:

- inicio de sesión Firebase;
- Mi jornada / Mis órdenes;
- instalación de equipos;
- reporte de fallas;
- retiro físico con cámara o contingencia manual autorizada;
- historial técnico restringido;
- perfil de usuario;
- cambio de contraseña;
- apariencia Automático / Claro / Oscuro con persistencia local.

El historial de Terreno muestra información técnica útil para operación y evita exponer auditoría, costos, stock, autorizadores u otros datos administrativos.

---

## 9. UX/UI y Brand Kit

PMP Suite mantiene una identidad visual propia:

- Navy `#0D1B2A`
- Azul `#1565C0`
- Turquesa `#00B4B0`
- Estados semánticos verde / ámbar / rojo / azul / gris
- Tipografía Inter con fallback estándar

Principios aplicados:

- densidad compacta sin `zoom` artificial;
- sidebar estable;
- KPI con significado operacional;
- tablas y formularios alineados;
- estados vacío/error/carga diferenciados;
- temas claro y oscuro;
- foco visible y navegación por teclado;
- responsive sin overflow horizontal;
- acciones operacionales en páginas/paneles, evitando modales innecesarios.

Brand Kit: [09_BrandKit](09_BrandKit/)

---

## 10. Estructura del repositorio

```text
01_Requerimientos/       Requisitos funcionales y no funcionales
02_Arquitectura/         Arquitectura, datos, flujos y decisiones técnicas
03_Backend/pmp-api/      API REST, seguridad, servicios, tests y verificaciones
04_Frontend/             Aplicación Web React/Vite
05_BaseDatos/            Scripts y migraciones PostgreSQL
06_ModelosIA/            Analizador Python
07_Mobile/               Aplicación Expo / React Native
08_Pruebas/              Informes, evidencias y regresiones
09_BrandKit/             Identidad visual y tokens PMP Suite
Documentacion Capstone/  Entregables académicos
shared/                  Reglas compartidas entre Web, Backend y Mobile
```

---

## 11. Configuración local

### Backend

Crear `03_Backend/pmp-api/.env` desde su ejemplo y configurar como mínimo:

```dotenv
PORT=4000
DATABASE_URL=postgresql://usuario:contrasena@localhost:5432/pmp_suite
FIREBASE_SERVICE_ACCOUNT_PATH=C:\ruta\segura\firebase-admin.json
```

La credencial Firebase debe permanecer fuera del repositorio.

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\03_Backend\pmp-api
npm install
npm run dev
```

Health:

```text
GET http://localhost:4000/api/health
```

### Frontend Web

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\04_Frontend
npm install
npm run dev
```

URL habitual:

```text
http://localhost:5173
```

### Mobile

Configurar `07_Mobile/.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://IP_LOCAL:4000/api
```

Luego:

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\07_Mobile
npm install
npx expo start
```

El dispositivo y el equipo que ejecuta la API deben poder comunicarse por red local.

### Analítica Python

```powershell
cd C:\Users\raote\Documents\Duoc\Tesis\06_ModelosIA
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

---

## 12. Verificación actual

Resultados documentados de la consolidación RBAC del 09-10-2026:

| Verificación | Resultado |
|---|---:|
| Backend `npm test` | **118/118 aprobadas** |
| Web `npm test` | **176/177 aprobadas** |
| Mobile con mocks | **210/210 aprobadas** |
| TypeScript + build Web | **Aprobados** |
| RBAC HTTP aislado | **99 solicitudes aprobadas** |
| E2E de Laboratorio | **Aprobado** |
| E2E operacional integral aislado | **Aprobado** |
| Responsive / temas | **150 renderizados, 320–1440 px, sin overflow** |

El único fallo Web documentado corresponde a un fixture previo cuyo mock de `AssetHistoryScreen` no exporta `useAuth`; no se considera corregido todavía.

Las pruebas con escrituras utilizan PostgreSQL efímero. La base habitual no debe utilizarse para estrés, reset o automatizaciones destructivas.

---

## 13. Validación manual actual

Se está ejecutando un recorrido manual controlado de un solo equipo para comprobar que las transiciones reales coincidan con la UX y las reglas de custodia.

El recorrido validado manualmente ha cubierto, entre otras etapas:

- instalación;
- reporte de falla;
- retiro físico desde Terreno;
- recepción en Bodega;
- envío y recepción en Laboratorio;
- asignación a técnico;
- diagnóstico, intervención y prueba;
- finalización técnica;
- salida de Laboratorio hacia Bodega.

Las etapas posteriores continúan validándose manualmente. Las pruebas manuales no sustituyen los E2E aislados ni certifican hardware real cuando se usa contingencia manual.

---

## 14. Documentación Capstone

La carpeta `Documentacion Capstone/` conserva los entregables académicos y sus versiones históricas.

La línea base normativa vigente sigue identificada por:

[README de vigencia v2.0](Documentacion%20Capstone/Artefactos%20Metodologia%20Cascada/README_VIGENCIA_v2.0.md)

Los documentos históricos no deben reinterpretarse como representación exacta del código actual cuando describen flujos retirados.

---

## 15. Pendientes de cierre

- completar el recorrido manual hasta QA, retorno a Bodega y nueva instalación;
- validar cámara, escáner, teclado, Safe Area y flujo Mobile en dispositivo físico;
- resolver el fixture Web pendiente;
- completar reportes legacy que aún no poseen endpoint vigente;
- repetir pruebas de rendimiento en entorno aislado;
- mantener requisitos, arquitectura y evidencias alineados con el código final;
- completar documentación y presentación de defensa.

PMP Suite no requiere incorporar nuevos módulos grandes para cerrar el Capstone. El foco actual está en **consistencia, seguridad, evidencia, documentación y validación completa del flujo físico**.
