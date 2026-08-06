# PMP Suite — Sistema ERP de Gestión de Mantenimiento Preventivo

![PMP Suite — Estado: En preparación](https://img.shields.io/badge/Estado-En_preparaci%C3%B3n-F59E0B?style=for-the-badge)
![DuocUC](https://img.shields.io/badge/DuocUC-Ingeniería_Informática-002D62?style=for-the-badge)

**Proyecto de Título (Capstone) — Duoc UC**<br>
**Versión en desarrollo: 5.0 (Edición Gold & Predictive AI)**

**Equipo de Proyecto (PMO / Desarrollo):**
* **[Matías Garrido](https://github.com/matiasgarridopinto):** documentación y levantamiento de requerimientos.
* **[Rafael Oteiza](https://github.com/RafaOteiza):** gestión, arquitectura, base de datos y backend.
* **[Luis Arenas](https://github.com/luis26001):** frontend web y aplicación móvil.

> La participación individual se respaldará mediante commits y pull requests realizados desde la cuenta de cada integrante. La asignación anterior representa la distribución acordada del trabajo y no reemplaza la evidencia individual exigida durante el Capstone.

Consulta la [guía de contribución](./CONTRIBUTING.md) para el flujo de ramas, commits y pull requests del equipo.

---

## 📖 Índice

1. [Visión General (Resumen Ejecutivo)](#1-visión-general-resumen-ejecutivo)
2. [Especificación de Requerimientos (ERS)](#2-especificación-de-requerimientos-ers)
3. [Arquitectura y Tecnologías](#3-arquitectura-y-tecnologías)
4. [Flujo Operativo (Estado y RBAC)](#4-flujo-operativo-estado-y-rbac)
5. [Estado de implementación y validación](#5-estado-de-implementación-y-validación)
6. [Diagrama de Gantt del Proyecto](#6-diagrama-de-gantt-del-proyecto)
7. [Módulo de Predicción IA (Nuevo v5.0)](#7-módulo-de-predicción-ia-nuevo-v50)
8. [Instrucciones de Ejecución (Paso a Paso)](#8-instrucciones-de-ejecución-paso-a-paso)

---

## 1. Visión General (Resumen Ejecutivo)

**PMP Suite** es una plataforma logística de alto desempeño orientada a gestionar el ciclo de vida de mantenimiento, reparación y control de calidad de computadores y validadores en terreno. Centraliza la información entre los técnicos de ruta, el personal de bodega (logística), los especialistas técnicos del laboratorio y los auditores de certificación (Control QA).

El sistema garantiza **trazabilidad total**, bloqueos transaccionales bajo un diseño *Role-Based Access Control* (RBAC) y control concurrente anti *race-conditions* certificado mediante pruebas de estrés.

### 1.1 El Dolor del Negocio y la solución Aranda Bridge
Actualmente, el mandante principal operando la flota (SONDA) utiliza **Aranda ITSM** para la gestión inicial de incidencias. PMP Suite actúa como el puente operativo ("The Missing Link") que recolecta los activos físicos una vez que el ticket de Aranda se cierra en terreno, asegurando que ningún equipo se pierda en la logística inversa.

**Novedad v5.0:** Se implementó una **Interfaz Premium de Trazabilidad** y un **Motor de Inteligencia Artificial** que predice el riesgo de falla de los equipos antes de que salgan a ruta, permitiendo un mantenimiento proactivo basado en datos.

---

## 2. Especificación de Requerimientos (ERS)

### 2.1 Requerimientos Funcionales (Principales)
1. **Gestión de Roles (RBAC):** Autenticación mediante Firebase e implementación de Claims (Token), limitando vistas y endpoints (Solo Lectura vs. Escritura/Intervención).
2. **Ciclo Logístico:** Recepción de equipos malos desde terreno ➔ Tránsito por Bodega ➔ Diagnóstico y Reparación en Lab ➔ Certificación QA ➔ Reincorporación en Bodega para instalar y cierre del ciclo.
3. **Gestión de Stock:** Consumo automático de repuestos para validadores y consolas al finalizar reparaciones en el Laboratorio. Modificación solo permitida a personal logístico.
4. **Dashboards Gerenciales:** Vista panorámica, gráfica y analítica de KPIS, métricas de laboratorios, eficiencias semanales y alertas en tiempo real. Exportación unificada de métricas a Excel / CSV.
5. **Flujos Defensivos:** Si Control QA rechaza una operación, el equipo debe retornar al Laboratorio pasando por Bodega para registrar re-ingreso pero sin cerrar la Orden de Servicio.

### 2.2 Requerimientos No Funcionales
1. **Rendimiento:** Tiempos de respuesta para el P95 menores a los `500 ms` de latencia.
2. **Escalabilidad:** Estabilidad probada con +20 transacciones por segundo al intentar golpear endpoints competitivos simultáneos (Protegido por `SELECT ... FOR UPDATE` a nivel de motor DB).
3. **Seguridad híbrida:** Validaciones robustas cruzadas entre vista de React y control por Endpoint de Express (`requireAnyRole()`).

*(Ver el [Documento ERS_PMP_Suite_v5_0.md](./01_Requerimientos/ERS_PMP_Suite_v5_0.md) completo en `01_Requerimientos`)*

---

## 3. Arquitectura y Tecnologías

El proyecto se despliega localmente abarcando capas claras de backend, frontend y bases de datos.

- **Frontend (Cliente Web):** React 18, Vite 5, Recharts (gráficos), Lucide React (Íconos), React Router.
- **Backend (API REST):** Node.js 20, Express 4. Seguridad mediante validaciones nativas. Auth Middleware nativo para Firebase.
- **Base de Datos:** PostgreSQL 16 local (`pmp_suite`).
- **Autenticación (IAM):** Firebase Authentication.
- **Inteligencia Artificial:** Python 3.11, Scikit-learn (Random Forest), Pandas.
- **Infraestructura e Integración:** Scripts End-To-End autoejecutables para simular y validar las transacciones de las fases con tests de *Stress*.

---

## 4. Flujo Operativo (Estado y RBAC)

### Nivel de Actores

* **`tecnico_terreno`:** Saca el equipo fallido, crea el ticket inicial (OS), que entra viaje ("EN_TRANSITO").
* **`bodega / logistica`:** Actúa de *Hub*. Ningún equipo pasa a otros módulos directamente, todo triangula en Bodega ("EN_BODEGA"). Opera el stock y envía a Lab o QA.
* **`tecnico_laboratorio`:** Recibe del Hub, consume stock si lo necesita, realiza el diagnóstico ("EN_DIAGNOSTICO") y despacha todo.
* **`qa`:** Toma equipos que pasaron por Lab para chequear calidad ("EN_QA"). Si aprueban, desencadenan la OS `IN-` final y cierran el ciclo principal. Si rechazan, fuerzan el reintento de reparación.
* **`admin` / `jefe_taller`:** Tienen visibilidad de toda la plataforma en "Modo de Solo-Lectura", interviniendo únicamente perfiles/despachos finales o tableros gerenciales.

---

## 5. Estado de implementación y validación

El repositorio contiene una implementación avanzada de la API, la interfaz web, la aplicación móvil, la base de datos, los scripts de prueba y el módulo de análisis predictivo. También incluye dashboards con Recharts, control de acceso por roles y una interfaz con modos claro y oscuro.

Antes de presentar resultados como evidencia final del Capstone se deben completar y registrar las siguientes validaciones reproducibles:

* Ejecutar las pruebas End-to-End sobre una base de datos aislada y conservar el reporte de resultados.
* Ejecutar las pruebas de estrés en un entorno controlado y documentar latencia, concurrencia y datos de prueba.
* Mantener evidencia de la compilación de producción del frontend —verificada el 21/07/2026— y corregir la exportación de la aplicación móvil.
* Volver a entrenar y evaluar el modelo de IA, adjuntando dataset, metodología, matriz de confusión y métricas obtenidas.

Las cifras históricas incluidas en scripts o documentos de trabajo no se consideran resultados confirmados hasta que puedan reproducirse y anexarse como evidencia.

---

## 6. Diagrama de Gantt del Proyecto

A continuación, un esquema del desarrollo de ciclo de vida del *Sistema PMP Suite*:

```mermaid
gantt
    title Roadmap de Desarrollo PMP Suite
    dateFormat  YYYY-MM-DD
    section Fase 1: Levantamiento 
    Entendimiento ERS y Roles       :done,    des1, 2026-03-01, 2026-03-07
    Diagramado de Base de Datos     :done,    des2, 2026-03-05, 2026-03-10
    Levantamiento de Mockups UI     :done,    des3, 2026-03-08, 2026-03-14

    section Fase 2: Backend Core
    Configuración Express + Postgres:done,    be1,  2026-03-12, 2026-03-18
    Firebase Auth & Custom Claims   :done,    be2,  2026-03-15, 2026-03-22
    CRUD Básico y Subrutas Roles    :done,    be3,  2026-03-18, 2026-03-25

    section Fase 3: Frontend y Vistas
    Dashboard Config. Visual        :done,    fe1,  2026-03-20, 2026-03-28
    Páginas Logísticas (Tab Switch) :done,    fe2,  2026-03-25, 2026-04-02
    Implementación Gráficos Recharts:done,    fe3,  2026-03-29, 2026-04-06

    section Fase 4: Integración Compleja
    Concurrencia (Backend Race Fix) :done,    in1,  2026-04-04, 2026-04-09
    Implementación de RBAC Frontend :done,    in2,  2026-04-06, 2026-04-11
    Correción de UX: Light/Dark Mode:done,    in3,  2026-04-10, 2026-04-13

    section Fase 5: Pruebas y Cierre
    Suite E2E Scripting             :done,    test1, 2026-04-11, 2026-04-13
    Pruebas Stress Scripting        :done,    test2, 2026-04-12, 2026-04-14
    Cierre Informe Documental (APT) :active,  test3, 2026-04-14, 2026-04-18
```

---

## 7. Módulo de Predicción IA (Nuevo v5.0)

La PMP Suite incorpora un motor de **Machine Learning** alojado en la carpeta `06_ModelosIA`. Este componente analiza el historial de fallas y tiempos de reparación para generar alertas tempranas.

*   **Algoritmo:** Random Forest Classifier.
*   **KPIs IA:** MTBF Flota, Score de Riesgo individual, Probabilidad de Reincidencia.
*   **Visualización:** AIRiskPanel integrado en Dashboards y Sección Dedicada de Predicciones.

*(Ver la [Documentación Técnica de IA](./06_ModelosIA/DOCUMENTACION_IA.md) para más detalles)*

---

## 8. Instrucciones de Ejecución (Paso a Paso)

### 8.1. Requisitos Previos
- Contar con **PostgreSQL 16 o superior** y una base de datos local para PMP Suite. Las credenciales deben configurarse mediante variables de entorno; no se almacenan en el repositorio.
- **Node JS `20.x`** alojado local o de entorno nvm para levantamiento.

### 8.2. Levantar API (Backend)
```bash
# 1. Acceder a la carpeta del backend
cd 03_Backend/pmp-api/

# 2. Crear la configuración local y completar sus valores
cp .env.example .env

# 3. Instalar dependencias si no se ha hecho
npm install

# 4. Encender el backend con entorno de variables
node server.js
```
*(El backend debe indicar por consola la conexión exitosa a PosgreSQL levantando en `http://localhost:4000`)*

### 8.3. Levantar Interfaz Gráfica (Frontend)
Abrir una segunda terminal independiente en la raíz `Tesis`.
```bash
# 1. Mover a la ruta de Frontend 
cd 04_Frontend/

# 2. Actualizar / Instalar base librerías
npm install

# 3. Desplegar compilador Vite (Hot-Reload)
npm run dev
```
*(El frontend quedará enganchado en `http://localhost:5173` listo para login)*

### 8.4. Comprobar Pruebas de Sistema
Los scripts de prueba modifican datos. Deben ejecutarse únicamente sobre una base aislada preparada para validación.
```bash
# Dentro de 03_Backend/pmp-api/

# Correr flujo de vida de un logístico completo 
node e2e_full_v2.js 

# Correr escenarios masivos y carga destructiva
node stress_test.js 
```
Los resultados deben guardarse en `Evidencias` junto con la fecha, versión probada, configuración utilizada y observaciones.

---

> Documento de orientación del proyecto Capstone — Actualización: 21/07/2026
