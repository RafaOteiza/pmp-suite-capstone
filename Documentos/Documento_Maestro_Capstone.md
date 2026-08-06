# Informe Final Capstone: Sistema PMP Suite

![PMP Suite — Estado: Validación Final v5.0](https://img.shields.io/badge/Estado-100%25_Operativo_v5.0-10B981?style=for-the-badge)
![DuocUC](https://img.shields.io/badge/DuocUC-Ingeniería_Informática-002D62?style=for-the-badge)
![AI_Powered](https://img.shields.io/badge/AI_Powered-Random_Forest-8B5CF6?style=for-the-badge)

**Proyecto de Título (APT) — Abril 2026**
**Versión Final: 5.0 (Edición Gold & Predictive AI)**

---

## 1. Información General del Proyecto y Equipo

Para dar estricto cumplimiento a las normativas de la asignatura Capstone (Portafolio de Título), se certifica que el equipo está compuesto por un **máximo de 3 integrantes**. La distribución de roles refleja una estructura organizacional realista de alto rendimiento, garantizando el compromiso comprobable en las áreas de desarrollo, infraestructura de bases de datos y documentación técnica:

*   **Rafael Oteiza:** Project Manager (PMO) y Arquitectura de Sistemas. Responsable de la gestión del proyecto, diseño arquitectónico y modelado de datos.
*   **Matías Garrido:** Data Lead (DBA) y Desarrollo Backend. Responsable de la construcción de la API REST, seguridad, concurrencia y consultas complejas en PostgreSQL.
*   **Luis Arenas:** Tech Lead y Desarrollo Frontend. Responsable de la interfaz web premium (React), aplicación móvil y experiencia de usuario.

> **Evidencia de Desarrollo y Trabajo en Equipo:** Todo el ciclo de vida del proyecto está respaldado mediante un sistema de control de versiones centralizado (Git), donde se refleja la contribución técnica individual de cada integrante mediante *commits* en la evolución del código fuente (Backend, Frontend, Mobile, Modelos IA y Base de Datos), validando el trabajo colaborativo declarado en el Perfil de Egreso.

---

## 2. Resumen Ejecutivo y Propuesta de Valor

**PMP Suite** es una plataforma ecosistémica y logística de alto desempeño orientada a gestionar el ciclo de vida de mantenimiento, reparación y control de calidad de validadores y consolas de transporte público en terreno.

El sistema nace como solución arquitectónica a una problemática real del mandante principal (SONDA). Si bien la empresa utiliza *Aranda ITSM* para la gestión inicial de incidencias de TI, carecía de un sistema robusto para el control de la **logística inversa** una vez que los equipos defectuosos son retirados de los buses. PMP Suite actúa como el "eslabón perdido" (*The Missing Link*), asegurando una trazabilidad End-to-End (E2E), evitando la millonaria pérdida de activos y proporcionando visibilidad gerencial en tiempo real.

En su versión 5.0 definitiva, el sistema no solo digitaliza el flujo de Taller y Bodega, sino que incorpora **Inteligencia Artificial Predictiva (Machine Learning)** para estimar fallas antes de que los equipos salgan a ruta, transformando un modelo de mantenimiento reactivo en uno predictivo. Adicionalmente, cuenta con una interfaz catalogada como *Gold Edition* con los más altos estándares visuales (Glassmorphism, Dark Mode Nativo).

---

## 3. Demostración de Competencias de Especialidad

El desarrollo integral de PMP Suite certifica la adquisición de las competencias de la especialidad del perfil de egreso:

### 3.1. Gestión de Infraestructura, Ambientes y Datos
*   **Administrar la configuración de ambientes, servicios y BD:** Se implementó un entorno empresarial robusto. Uso de **PostgreSQL 16**, backend en **Node.js 20**, y un entorno web con **Vite**. El despliegue está diseñado bajo estándares de la industria, documentado mediante `DEPLOYMENT_UBUNTU.md`, asegurando la continuidad operativa del negocio.
*   **Construir modelos de datos escalables:** El proyecto sustenta sus operaciones en un Modelo Entidad-Relación (ERD) avanzado. Incorpora tablas de parametrización (operadores, terminales), bitácoras transaccionales para cada evento (trazabilidad) y un esquema de autenticación que soporta *Role-Based Access Control* (RBAC).
*   **Programar consultas o rutinas para manipular información:** Se construyó lógica nativa en BD mediante *Triggers* y *Stored Procedures* (ej. validación cruzada entre el estado físico de la OS y la ubicación permitida, autogeneración de códigos únicos `MC-XXXX` y `MV-XXXX`). Se gestiona el bloqueo por concurrencia mediante `SELECT ... FOR UPDATE`, previniendo colisiones de datos durante despachos simultáneos.

### 3.2. Desarrollo de Software y Arquitectura Sistémica
*   **Ofrecer propuestas de solución informática:** Tras analizar el hueco logístico dejado por Aranda, se propuso y modeló la "Matriz de Estados PMP" (Tránsito ➔ Bodega ➔ Diagnóstico ➔ QA ➔ Disponible), cubriendo el proceso operativo en su totalidad y de forma segura.
*   **Desarrollar una solución sistematizando el proceso:** Se establecieron metodologías estructuradas (Fases de entrega documentadas). Se separaron limpiamente las responsabilidades mediante una Arquitectura Cliente-Servidor: Frontend Web, Frontend Móvil y Backend API RESTful.
*   **Construir programas y rutinas complejas (Buenas Prácticas):** Uso extensivo de patrones de diseño. El backend se estructuró con inyección de dependencias, *middlewares* de seguridad multinivel y orquestadores de estado (`osStateMachine.js`). El frontend fue desarrollado usando *React 18* y *Recharts* para interfaces analíticas.
*   **Construir el modelo arquitectónico sistémico:** Se elaboraron vistas C4, diagramas de flujo de datos y diagramas de secuencia, soportando una arquitectura capaz de escalar ante la demanda de una flota nacional.

### 3.3. Calidad, Seguridad y Automatización de Procesos
*   **Implementar soluciones integrales (Optimización):** Se automatizaron despachos masivos, permitiendo procesar lotes de equipos en un solo clic de forma transaccional (`BEGIN/COMMIT`). Adicionalmente, el consumo de stock de repuestos se gatilla dinámicamente según la bitácora técnica.
*   **Realizar pruebas de calidad (Buenas prácticas de industria):** El sistema fue sometido a una estricta validación, logrando el hito de superar **46 Pruebas End-to-End (E2E)** cubriendo todo el flujo logístico, y superando con éxito **14 Pruebas de Estrés** simulando cargas competitivas destructivas.
*   **Resolver vulnerabilidades para asegurar la información:** Integración nativa con **Firebase Authentication** inyectando *Custom Claims* en los JWT. Se protegen las rutas mediante *URL Spoofing Prevention* en React, y doble verificación en los endpoints de Express (`requireAnyRole()`), rechazando de raíz peticiones maliciosas (401/403).
*   **Gestionar proyectos informáticos:** Liderazgo directo del ciclo de vida del desarrollo. Creación de presupuestos, cartas Gantt, matrices de requerimientos (ERS) y manuales globales del sistema, apoyando la toma de decisiones empresariales.

---

## 4. Demostración de Competencias Genéricas

El éxito de la plataforma dependió de las habilidades transversales del equipo, liderado por la dirección general del proyecto:

*   **Operatoria Matemática y Estadística Descriptiva (Innovación IA):** Esta competencia brilló especialmente en el desarrollo del motor de **Inteligencia Artificial Predictiva**. Se procesaron *datasets* históricos de fallas limpiando *outliers* y anomalías con estadística descriptiva. Se utilizaron algoritmos matemáticos avanzados (Bosques Aleatorios / *Random Forest* de Scikit-Learn) calculando probabilidades de falla (ej. umbral > 70%), MTBF (Mean Time Between Failures) y generando un Score de Riesgo. Esto resolvió una problemática de alta complejidad técnica y la integró gráficamente mediante *AIRiskPanels*.
*   **Comunicación Oral y Escrita:** Todo el flujo técnico del equipo se documentó a través de entregables profesionales: Informes de avances, ERS, matrices de pruebas, *Walkthroughs* explicativos, y este Informe Final. La UI/UX de la plataforma se diseñó para comunicar visualmente los estados de los equipos a través de alertas, insignias y semáforos, sin necesidad de entrenamiento extensivo al operador logístico.
*   **Capacidad de Innovación y Riesgo Calculado:** El equipo se arriesgó a salir del modelo de "CRUD universitario" convencional, integrando tecnologías emergentes (Machine Learning predictivo), diseños visuales *Premium* (Glassmorphism) y pruebas de penetración/estrés, asumiendo un nivel de exigencia propio de un entorno de mercado corporativo competitivo.
*   **Emprendimiento y Valor Agregado:** PMP Suite es escalable como un SaaS (Software as a Service). El proyecto identifica una oportunidad clara en la industria logística del transporte público y agrega un inmenso valor al entorno productivo al reducir drásticamente las "pérdidas hormiga" de activos tecnológicos y maximizar la operatividad de los buses de la capital.

---

## 5. Diseño Arquitectónico y Flujos Operativos

La solución técnica está respaldada por flujos defensivos de datos y una matriz de estados irrompible.

### 5.1. Stack Tecnológico General
| Módulo / Capa | Tecnologías Clave | Responsabilidad |
| :--- | :--- | :--- |
| **Mobile (Terreno)** | React Native (Expo SDK) | Toma de incidencias in-situ, validación de PPUs y captura fotográfica (PODs). |
| **Web (Logística/Admin)** | React 18, Vite 5, Recharts | Panel Gerencial de control, dashboard de métricas e interfaz de Bodega/Taller. |
| **Backend API** | Node.js 20, Express 4 | Core lógico (State Machine), validación RBAC y orquestación de base de datos. |
| **Base de Datos** | PostgreSQL 16 | Almacenamiento seguro, Triggers de consistencia, Control de concurrencia. |
| **Motor Predictivo (IA)** | Python 3.11, Scikit-Learn | Análisis de datos históricos, entrenamiento de modelo `RandomForestClassifier`. |
| **Autenticación** | Firebase Auth | Gestión de identidades, Bearer Tokens (JWT). |

### 5.2. Flujo Logístico Central y Control de Calidad (QA)
1. **Terreno ➔ Tránsito:** El Técnico de Terreno extrae el equipo del bus mediante la App Móvil, generando el evento inicial ("EN_TRANSITO"). Obligatoriedad de fotografía (POD) en casos seleccionados.
2. **Recepción Logística:** El área de Bodega, funcionando como el gran HUB de PMP Suite, recepciona los equipos digitalmente. Ningún equipo salta pasos; todo triangula a través de Bodega.
3. **Diagnóstico y Reparación:** Los Técnicos de Laboratorio asumen las OS de la cola. Efectúan bitácoras de trabajo, declaran fallas y consumen automáticamente *stock* de repuestos.
4. **Despacho QA Masivo:** La Jefatura de Taller posee facultades para despachar equipos ya reparados hacia el módulo de Certificación en lotes (Bulk Dispatch).
5. **Auditoría QA (Loop Defensivo):** El personal de QA inspecciona la calidad.
   - **Aprueba:** El equipo transita a estado "DISPONIBLE" para ser reinstalado.
   - **Rechaza:** Se rompe el flujo ideal, el equipo es devuelto obligatoriamente al estado "EN_DIAGNOSTICO" (Laboratorio) exigiendo reparación profunda.

---

## 6. Conclusiones Finales

El proyecto **PMP Suite (Versión 5.0 Gold & Predictive AI)** consolida el proceso académico de los tres integrantes, demostrando dominio absoluto de las tecnologías requeridas, la gestión de la arquitectura, y las prácticas de vanguardia del mercado tecnológico actual.

Liderado desde una perspectiva organizacional estratégica (PMO), apoyado por un enfoque de arquitectura escalable (Tech Lead) y sustentado por una base de datos segura y de alto rendimiento (Data Lead), PMP Suite no solo cumple con las competencias del perfil de egreso exigidas por la asignatura Capstone de Ingeniería Informática, sino que se proyecta como una solución empresarial real, viable, innovadora y de clase mundial.
