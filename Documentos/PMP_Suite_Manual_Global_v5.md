# PMP Suite v5.0 — Manual Global de Funcionamiento
## "Gold & Predictive AI Edition"

### 1. Visión General del Sistema
PMP Suite es un ecosistema integral para la gestión del ciclo de vida de activos tecnológicos (Validadores y Consolas) en el transporte público. El sistema orquesta la logística inversa, la reparación técnica, el control de calidad y la analítica predictiva mediante IA, asegurando que cada activo esté plenamente trazable desde su falla en terreno hasta su re-instalación.

---

### 2. Ecosistema de Roles (RBAC)
El acceso al sistema está segmentado por roles para garantizar la integridad del flujo:

*   **Técnico de Terreno:** Genera las Órdenes de Servicio (OS) iniciales y retira el hardware del bus.
*   **Bodega (Logística):** El "Hub" central. Recibe equipos de la calle, los envía a laboratorio, recibe de QA y gestiona el stock de repuestos.
*   **Técnico de Laboratorio:** Especialista que diagnostica y repara el hardware, consumiendo repuestos del inventario.
*   **Control QA (Calidad):** Auditor que certifica que la reparación fue exitosa. Tiene el poder de aprobar (cerrar ciclo) o rechazar (volver a laboratario).
*   **Administrador / Jefe de Taller:** Visibilidad total, gestión de usuarios, tableros estratégicos y acceso al Módulo de IA.

---

### 3. El Ciclo de Vida del Hardware (Paso a Paso)

#### Paso 1: Generación y Retiro (Terreno)
El técnico detecta una falla, vincula un Ticket de Aranda (ITSM Externo) y crea la OS. El equipo entra en estado **"EN_TRANSITO"**.

#### Paso 2: Recepción en Centro Logístico (Bodega)
El equipo físico llega a Bodega. Se registra su entrada y cambia a **"EN_BODEGA"**. Aquí, el personal de logística decide cuándo enviarlo al laboratorio según la carga de trabajo.

#### Paso 3: Intervención Técnica (Laboratorio)
El equipo cambia a **"EN_DIAGNOSTICO"**. El técnico registra la falla real, las acciones tomadas y los repuestos usados. Al terminar, el equipo viaja a la zona de certificación.

#### Paso 4: Aseguramiento de Calidad (QA)
El auditor de QA prueba el equipo.
*   **Si APRUEBA:** El sistema genera automáticamente una OS de Instalación (`IN-XXXX`). El equipo queda **"DISPONIBLE"** para volver al bus.
*   **Si RECHAZA:** El equipo vuelve a Bodega para ser ingresado nuevamente al Laboratorio.

---

### 4. Integraciones Estrella (v5.0)

#### 4.1 Aranda Bridge Connector
Permite la trazabilidad lógica-física. El sistema sugiere tickets de Aranda abiertos para evitar errores de digitación y asegura que la reparación en PMP esté vinculada a la incidencia reportada por el mandante.

#### 4.2 Módulo de Inteligencia Artificial
Ubicado en la sección de "Mantenimiento Predictivo", este motor analiza miles de registros históricos para:
*   Identificar equipos **"Limón"** (que fallan recurrentemente).
*   Calcular el **Riesgo de Falla** antes de que el equipo salga a ruta.
*   Sugerir retiros preventivos basados en el **score de criticidad** (Semáforo Rojo/Ámbar/Verde).

---

### 5. Gestión de Stock e Inventario
PMP Suite mantiene un inventario saneado de 201 equipos reales.
*   **Stock de Repuestos:** Solo modificable por Logística. El sistema descuenta automáticamente unidades cuando Laboratorio finaliza una reparación.
*   **Trazabilidad por Serie:** Cada validador y consola es único. El sistema impide que una serie aparezca en dos lugares al mismo tiempo.

---

### 6. Validación y Auditoría (Pruebas)
Para certificar que todo funciona, el sistema incluye dos suites de pruebas automáticas (en la carpeta del backend):
1.  **`e2e_full_v2.js`:** Simula el ciclo de vida completo de 46 casos de prueba (desde terreno hasta instalado).
2.  **`stress_test.js`:** Golpea el servidor con 14 escenarios de alta concurrencia para asegurar que no existan colisiones de datos.

---

> Propiedad Intelectual de Tesis Universitaria — APT Abril 2026.
