# Módulo 06 — Inteligencia operacional

**Estado:** PoC / apoyo analítico  
**Actualización:** 09-10-2026

## Qué usa actualmente la aplicación

`src/analyzer.py` consulta `pmp.ordenes_servicio` y construye un score heurístico de reincidencia:

- fallas previas;
- coincidencia EMV;
- identificación de fallas de lector/QR como dato descriptivo.

El score actual se calcula con una regla explícita basada en reincidencia y EMV. La interfaz debe presentarlo como **heurística de reincidencia**, no como probabilidad calibrada de falla.

## Qué más contiene el módulo

- `maintenance_model.py`: Random Forest sobre datos sintéticos de demostración.
- `entrenar_modelo_pmp.py`: entrenamiento experimental sobre `equipos_historial.csv`.
- `construir_dataset_ia.py`: preparación de dataset.
- `predecir_falla_pmp.py`: inferencia experimental.
- `modelos/`: artefactos de modelos cuando se generan.
- `datasets/`: datasets de trabajo.

## Importante

No se debe afirmar una precisión, recall o porcentaje de eficacia como vigente si no existe una evaluación reproducible fechada para el modelo y dataset correspondiente.

El resultado analítico:

- no crea OS;
- no mueve stock;
- no decide bajas;
- no sustituye diagnóstico técnico;
- sirve para priorizar inspección.

## Entorno

```powershell
cd 06_ModelosIA
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

La API ejecuta el analizador y consume JSON.
