# Módulo 06 — Inteligencia Operacional

**Versión documental:** V2.0  
**Estado:** apoyo analítico vigente  
**Actualización:** 09-10-2026

## Implementación vigente

La aplicación utiliza únicamente `src/analyzer.py`. El analizador consulta PostgreSQL en modo lectura y calcula una heurística de reincidencia basada en fallas previas y coincidencias de categorías de falla.

El valor `riesgo_score` es una **heurística de priorización**, no una probabilidad calibrada de falla.

Los modelos experimentales, datasets sintéticos, seeds y artefactos de entrenamiento que no participan en el flujo actual fueron retirados del árbol V2.0.

## Ejecución

```powershell
cd 06_ModelosIA
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe src\analyzer.py --json
```

## Contrato

- lectura solamente;
- salida JSON para la API;
- sin creación de OS;
- sin movimientos de stock;
- sin decisiones automáticas;
- sin métricas ML no reproducibles.

Detalle: [DOCUMENTACION_IA_V2.0.md](DOCUMENTACION_IA_V2.0.md).
