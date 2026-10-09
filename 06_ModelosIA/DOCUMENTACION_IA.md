# Documentación de Inteligencia Operacional

## 1. Alcance actual

PMP Suite incluye una capa de apoyo para identificar reincidencia y priorizar revisión de activos. En el estado vigente de la aplicación, el motor expuesto al dashboard se basa en la lógica de `src/analyzer.py`.

## 2. Motor vigente

El analizador consulta órdenes de servicio y calcula:

- número de fallas previas por serie;
- presencia de términos EMV;
- presencia de términos Barcode/QR/Lector;
- score heurístico.

Fórmula implementada:

```text
riesgo_score = clip(fallas_previas * 0.3 + es_emv * 0.5, 0, 1)
```

Por lo tanto, el valor mostrado **no debe describirse como probabilidad estadística calibrada**.

## 3. Random Forest experimental

El repositorio también contiene dos líneas de experimentación:

1. `maintenance_model.py`: dataset sintético para demostración técnica.
2. `entrenar_modelo_pmp.py`: RandomForestClassifier sobre features de histórico preparado.

Estas líneas son PoC y requieren evaluación reproducible antes de considerarse motor productivo.

## 4. Buenas prácticas documentales

Para declarar resultados de ML deben registrarse:

- dataset y versión;
- tamaño/muestra;
- features;
- target;
- train/test split;
- umbral;
- métricas;
- matriz de confusión;
- fecha y commit;
- limitaciones.

## 5. Arquitectura

```text
PostgreSQL
→ analyzer.py
→ JSON
→ API Node
→ panel Web
```

La consulta es de solo lectura.

## 6. Interpretación

El score ayuda a priorizar activos para inspección. No es un dictamen de reparación, QA ni baja de activo.

## 7. Pendientes

- decidir si el cierre Capstone presenta la heurística vigente o un modelo ML evaluado;
- conservar evidencia de entrenamiento si se utiliza Random Forest;
- evitar métricas decorativas o no reproducibles.
