# Casos de estudio de IA — material histórico/sintético

> **No usar como evidencia de datos reales.** Este documento conserva ejemplos conceptuales de demostración. Las series ficticias y porcentajes ilustrativos no representan activos ni métricas vigentes de PMP Suite.

## Uso correcto

Los escenarios pueden utilizarse para explicar qué significa:

- reincidencia alta;
- MTBF bajo;
- patrón repetitivo de componente;
- activo estable.

No deben presentarse como casos observados en la base real.

## Motor real a demostrar

Para una demostración reproducible usar los datos que devuelva `src/analyzer.py` o un modelo ML evaluado y documentado. Indicar claramente el método.

## Ejemplo conceptual

| Escenario | Señal | Interpretación |
|---|---|---|
| Reingresos repetidos | múltiples fallas previas | priorizar inspección |
| Falla crítica repetida | componente recurrente | revisar patrón |
| Pocos antecedentes | poca evidencia | riesgo no concluyente |
| Sin reincidencia | historial estable | menor prioridad |

El criterio técnico final permanece en las áreas operacionales.
