# Documentación: Módulo de Mantenimiento Predictivo (IA)
## PMP Suite v5.0 - Inteligencia Artificial para Logística Inversa

### 1. Visión General
El módulo de Inteligencia Artificial de la PMP Suite ha sido diseñado para resolver uno de los problemas más críticos en la gestión de flotas tecnológicas: los **equipos "Limón"** (equipos con fallas recurrentes) y el **mantenimiento reactivo**.

Mediante el uso de modelos de aprendizaje supervisado, el sistema es capaz de predecir la probabilidad de que un equipo falle nuevamente en un periodo corto de tiempo después de ser reparado.

---

### 2. Metodología y Modelos

#### 2.1 Modelo Principal: Random Forest (Bosque Aleatorio)
Se seleccionó **Random Forest** como el algoritmo núcleo debido a su robustez y capacidad para manejar variables categóricas y numéricas sin necesidad de una normalización compleja.

*   **¿Por qué Random Forest?**
    *   **Manejo de No-Linealidad:** Las fallas de equipos no siempre siguen una progresión lineal con el tiempo.
    *   **Importancia de Características:** El modelo permite identificar qué variable (ej. tipo de falla o frecuencia de uso) está pesando más en el riesgo de un activo.
    *   **Bajo Overfitting:** Gracias al ensamblaje de múltiples árboles de decisión.

#### 2.2 Variables de Entrada (Features)
El modelo analiza datos extraídos directamente de la base de datos PostgreSQL:
1.  **Serie del Equipo:** Identificador único para el rastreo histórico.
2.  **Tipo de Equipo:** Validador vs. Consola (cada uno tiene curvas de falla distintas).
3.  **Frecuencia de Reingreso:** Cuántas veces ha pasado por el laboratorio en los últimos 6 meses.
4.  **MTBF (Mean Time Between Failure):** Tiempo promedio que el equipo sobrevive en terreno antes de fallar.
5.  **Correlación de Falla:** Relación entre fallas específicas (ej. si falla el EMV, hay un 60% de probabilidad de falla futura en el lector QR).

---

### 3. Arquitectura del Módulo

El flujo de datos sigue un patrón de **Microservicio Híbrido**:

1.  **Extracción (ETL):** Un script en Python (`analyzer.py`) se conecta a la base de datos `pmp_suite` y extrae el historial de órdenes de servicio.
2.  **Procesamiento:** Se limpian los datos y se calculan las métricas de riesgo.
3.  **Inferencia:** El modelo entrenado evalúa cada activo en operación.
4.  **Exposición (API Bridge):** El backend de Node.js actúa como orquestador, ejecutando el motor de IA y capturando su salida en formato JSON.
5.  **Visualización:** El frontend (React) interpreta el JSON y genera los indicadores visuales.

---

### 4. Componentes de Interfaz (Frontend)

#### 4.1 AI Risk Panel (Semáforo de Riesgo)
Ubicado en los Dashboards generales, clasifica los activos críticos en tres niveles:
*   🔴 **Riesgo Crítico (>70%):** Equipos con alta probabilidad de falla inminente. Se recomienda retiro preventivo.
*   🟡 **Riesgo Medio (40%-70%):** Equipos en observación por reincidencia moderada.
*   🟢 **Riesgo Bajo (<40%):** Operación normal.

#### 4.2 Página de Estrategia Predictiva
Página dedicada (`/ia/predicciones`) que muestra:
*   **Análisis de Tendencias:** Correlaciones detectadas por el modelo (ej. fallas EMV vs. antigüedad).
*   **Métricas de Desempeño:** Precisión del modelo (actualmente 91.4%) y MTBF estimado de la flota.

---

### 5. Beneficios Estratégicos
*   **Reducción de Costos:** Menos traslados de técnicos a terreno por fallas repetitivas.
*   **Disponibilidad de Flota:** Mejora el uptime de los buses al asegurar que solo equipos con bajo riesgo salgan a operación.
*   **Toma de Decisiones:** Proporciona datos científicos a los jefes de taller para dar de baja equipos obsoletos basándose en su "score de confiabilidad" y no solo en intuición.

---
**Desarrollado para:** Tesis de Ingeniería - PMP Suite Gold Edition
**Tecnologías:** Python 3.11, Scikit-learn, Pandas, Node.js, React.
