# Casos de Estudio: Inteligencia Artificial en PMP Suite v5.0
## Guía para Presentación de Tesis

Para demostrar el funcionamiento del modelo de Mantenimiento Predictivo, se han inyectado 4 perfiles de activos con comportamientos históricos específicos. A continuación se detallan los casos y qué esperar del modelo de IA:

---

### Caso 1: El Equipo "Limón" (Falla Sistemática)
*   **Activo:** Validador `VAL-LEMON-001`
*   **Comportamiento:** Ha ingresado 5 veces al laboratorio en los últimos 4 meses. 4 de esas veces han sido por fallas relacionadas con el lector de tarjetas EMV.
*   **Análisis IA:** El modelo detecta una recurrencia extrema. 
*   **Resultado esperado:** El sistema lo marcará en **ROJO (Riesgo Crítico > 90%)**. 
*   **Acción recomendada:** Retiro definitivo del activo y peritaje profundo a la placa madre.

---

### Caso 2: El Equipo con "Enfermedad Crónica" (Bajo MTBF)
*   **Activo:** Consola `CON-SLA-002`
*   **Comportamiento:** Falla sistemáticamente cada 15 días (promedio). Siempre presenta problemas de alimentación o pantalla.
*   **Análisis IA:** El MTBF (Tiempo medio entre fallas) es extremadamente corto comparado con el promedio de la flota (que suele ser de 3-6 meses).
*   **Resultado esperado:** El sistema lo marcará en **NARANJA/ROJO (Riesgo Alto ~80%)**.

---

### Caso 3: El Equipo Sospechoso (Falla de Lote)
*   **Activo:** Validador `VAL-QR-FAULTY`
*   **Comportamiento:** Solo ha fallado 2 veces, pero ambas han sido por "Lector QR". El modelo correlaciona este tipo de falla con un patrón que está apareciendo en activos del mismo modelo/marca.
*   **Análisis IA:** Detecta una tendencia de falla de componente.
*   **Resultado esperado:** El sistema lo marcará en **AMARILLO (Riesgo Medio ~50%)**.

---

### Caso 4: El Activo Saludable (Control de Calidad)
*   **Activo:** Consola `CON-STABLE-001`
*   **Comportamiento:** Registró una falla menor hace más de 6 meses y desde entonces opera sin novedades.
*   **Análisis IA:** Estabilidad operativa comprobada.
*   **Resultado esperado:** El sistema lo marcará en **VERDE (Riesgo Bajo < 10%)**.

---

### ¿Cómo visualizar estos casos?
1.  Ingresa al **Dashboard de Administración** o **Logística**.
2.  Busca el panel **"Análisis de Riesgo Predictivo (IA)"**.
3.  Verás estos números de serie encabezando la lista de criticidad.
4.  También puedes ver el análisis detallado en el menú **"Inteligencia Artificial" -> "Predicciones"**.

---
**Nota Técnica:** El modelo utiliza un algoritmo de **Bosque Aleatorio (Random Forest)** que pondera la cantidad de fallas previas (30%) y el tipo de falla crítica detectada (50%), ajustando el score dinámicamente según la antigüedad.
