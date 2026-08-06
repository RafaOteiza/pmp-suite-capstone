# Módulo 06 — Inteligencia Artificial (Mantenimiento Predictivo)

Este módulo implementa las capacidades de **IA y Análisis Avanzado** de la PMP Suite. Su objetivo es transformar los datos históricos de fallas en conocimiento accionable para prevenir reincidencias y optimizar el stock.

## 🧠 Modelos Implementados

### 1. Modelo de Predicción de Reincidencia (Random Forest)
*   **Archivo:** `src/maintenance_model.py`
*   **Propósito:** Clasificar equipos como "Alto Riesgo de Falla" basado en su historial.
*   **Variables (Features):**
    *   `MTBF`: Mean Time Between Failure (Promedio de días entre fallas).
    *   `FailureCount`: Cantidad total de ingresos al laboratorio.
    *   `CommonIssue`: Tipo de falla más frecuente (EMV, Barcode, Power).
    *   `Age`: Antigüedad del registro del equipo.

### 2. Analizador de Anomalías de Flota
*   **Archivo:** `src/analyzer.py`
*   **Propósito:** Detectar patrones atípicos, como buses específicos que dañan lectores QR de forma recurrente debido a problemas de vibración o voltaje.

## 🛠️ Requisitos
*   Python 3.10+
*   Pandas & Scikit-learn
*   Psycopg2 (Conexión a PostgreSQL)

## 🚀 Cómo ejecutar el análisis
```bash
cd 06_ModelosIA/src
python analyzer.py
```

---
> Esta capa de IA permite a la gerencia de mantenimiento pasar de una estrategia **Reactiva** (reparar lo que se rompe) a una **Proactiva** (reemplazar equipos antes de que fallen en el bus).
