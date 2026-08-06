# Módulo: Integración con IA (Predicción de Fallas)

Este documento detalla los requisitos y especificaciones para el módulo de Integración con Inteligencia Artificial (IA) para la Predicción de Fallas en el sistema PMP Suite.

## 1. Requisitos Funcionales (RF)

*   **RF.IA.1:** El sistema debe predecir la probabilidad de falla de un equipo (validador o consola) en un horizonte de tiempo futuro (ej. 30 días).
*   **RF.IA.2:** El sistema debe utilizar un modelo de Machine Learning entrenado con datos históricos de reparaciones de equipos.
*   **RF.IA.3:** El sistema debe permitir al backend solicitar predicciones al módulo de IA para equipos específicos, proporcionando las características requeridas.
*   **RF.IA.4:** El sistema debe permitir al backend recibir la predicción (probabilidad de falla) del módulo de IA y registrarla en el historial de la Orden de Servicio (OS) o en un lugar designado.
*   **RF.IA.5:** El sistema debe generar alertas o notificaciones a los roles autorizados (ej. 'jefe_taller', 'admin') cuando la probabilidad de falla de un equipo supera un umbral predefinido.
*   **RF.IA.6:** El sistema debe permitir visualizar la probabilidad de falla predicha en las interfaces de gestión de OS o dashboards relevantes.
*   **RF.IA.7:** El sistema debe tener la capacidad de reentrenar el modelo de IA periódicamente o bajo demanda, utilizando nuevos datos históricos.
*   **RF.IA.8:** El sistema debe ser capaz de procesar los datos históricos para generar las características (features) requeridas por el modelo de IA de forma consistente.

## 2. Requisitos No Funcionales (RNF)

*   **RNF.IA.1 (Rendimiento):** Las predicciones de IA deben ser realizadas en tiempo real o casi real (ej. menos de 500ms por predicción) para no impactar la experiencia del usuario.
*   **RNF.IA.2 (Consistencia):** La generación de características para el entrenamiento y la inferencia debe ser consistente para evitar sesgos y errores en el modelo.
*   **RNF.IA.3 (Integridad):** El modelo de IA debe ser versionado y el script de inferencia debe cargar la versión correcta del modelo.
*   **RNF.IA.4 (Mantenibilidad):** Los scripts de preprocesamiento, entrenamiento y predicción del modelo de IA deben ser modulares y fáciles de mantener.
*   **RNF.IA.5 (Escalabilidad):** El módulo de IA debe ser capaz de manejar un volumen creciente de solicitudes de predicción.
*   **RNF.IA.6 (Seguridad):** La interacción entre el backend y el módulo de IA debe ser segura (ej. comunicación interna o APIs protegidas).
*   **RNF.IA.7 (Calidad):** El modelo de IA debe mantener una precisión y recall aceptables para la predicción de fallas, monitoreado mediante métricas de rendimiento.

## 3. Historias de Usuario (HU)

*   **HU.IA.1 (Predicción de Falla):** Como jefe de taller, quiero ver la probabilidad de falla de un equipo en la ficha de la OS, para tomar decisiones proactivas de mantenimiento.
    *   **Criterios de Aceptación:**
        *   Dado que consulto una OS, cuando el modelo de IA ha generado una predicción, entonces veo un porcentaje de probabilidad de falla para los próximos 30 días.
*   **HU.IA.2 (Alerta de Falla):** Como administrador, quiero recibir una alerta si un equipo tiene una alta probabilidad de falla, para intervenir a tiempo.
    *   **Criterios de Aceptación:**
        *   Dado que un equipo supera el umbral de probabilidad de falla (ej. 70%), entonces se genera una notificación para los administradores o jefes de taller.
*   **HU.IA.3 (Reentrenamiento de Modelo):** Como científico de datos (o administrador), quiero poder reentrenar el modelo de IA periódicamente para mejorar su precisión con nuevos datos.
    *   **Criterios de Aceptación:**
        *   Dado que ejecuto el script de reentrenamiento, entonces el modelo se actualiza usando los datos históricos más recientes y se guarda una nueva versión.

## 4. Casos de Uso (CU)

*   **CU.IA.1: Solicitar Predicción de Falla**
    *   **Actor:** Backend del Sistema PMP Suite
    *   **Precondiciones:** El módulo de IA está operativo y el modelo entrenado está cargado.
    *   **Flujo Normal:**
        1.  El backend (ej. una ruta de la API) recibe una solicitud para predecir la falla de un equipo.
        2.  El backend recopila las características requeridas del equipo (ej. historial de reparaciones, edad).
        3.  El backend envía estas características al módulo de IA (ej. vía una llamada a un script Python, un microservicio).
        4.  El módulo de IA preprocesa las características y las pasa al modelo cargado.
        5.  El modelo de IA devuelve la probabilidad de falla.
        6.  El módulo de IA devuelve la predicción al backend.
        7.  El backend registra la predicción (ej. en `pmp.os_eventos` o en la tabla `pmp.ordenes_servicio`).
    *   **Flujos Alternativos:**
        *   **FA.1.1: Datos de entrada incompletos/inválidos:** El módulo de IA o el backend rechazan la solicitud y devuelven un error.
        *   **FA.1.2: Modelo no cargado/disponible:** El módulo de IA informa un error.
*   **CU.IA.2: Reentrenar Modelo de Predicción**
    *   **Actor:** Científico de Datos (o proceso automatizado)
    *   **Precondiciones:** Nuevos datos históricos de reparaciones están disponibles en `datasets/`.
    *   **Flujo Normal:**
        1.  El actor ejecuta el script `entrenar_modelo_pmp.py`.
        2.  El script carga los datos históricos actualizados.
        3.  El script genera las características y el label (`construir_dataset_ia.py` o su lógica).
        4.  El script entrena el `RandomForestClassifier`.
        5.  El script evalúa el modelo y guarda la nueva versión del modelo (`modelo_falla_pmp.joblib`) y sus características (`columnas_modelo.joblib`).
        6.  El sistema confirma el reentrenamiento y el guardado del nuevo modelo.

## 5. Especificaciones Técnicas Clave

*   **Modelo de Machine Learning:** `RandomForestClassifier` (Scikit-learn).
*   **Features:** `num_reparaciones_6m`, `num_reparaciones_12m`, `edad_dias`, `dias_desde_ultima_reparacion`.
*   **Label:** `fallo_30d` (indicador binario de falla en los próximos 30 días).
*   **Tecnologías:** Python (pandas, scikit-learn, joblib).
*   **Archivos Clave:**
    *   `src/construir_dataset_ia.py`: Preprocesamiento y generación de dataset de IA.
    *   `src/entrenar_modelo_pmp.py`: Entrenamiento y evaluación del modelo.
    *   `src/predecir_falla_pmp.py`: Carga del modelo y predicción (inferencia).
    *   `datasets/equipos_historial.csv`: Dataset final para entrenamiento.
    *   `datasets/reparaciones_limpio_para_ia.csv`: Datos de entrada para `construir_dataset_ia.py`.
    *   `modelos/modelo_falla_pmp.joblib`: Modelo entrenado persistido.
    *   `modelos/columnas_modelo.joblib`: Lista de features usadas por el modelo.
*   **Integración con Backend:** El backend (Node.js) interactuará con el módulo de IA. Esto podría ser a través de:
    *   Ejecución de scripts Python como procesos hijos (`child_process`).
    *   Una API REST separada para el módulo de IA (microservicio).
    *   Una librería de inferencia en Node.js (si el modelo lo permite).
*   **Almacenamiento de Predicciones:** En `pmp.os_eventos` (`evento_tipo='ALERTA_IA'`) o una columna específica en `pmp.ordenes_servicio`.
*   **Variables de Entorno:** Posibles variables para umbrales de alerta, rutas de modelos, etc.
