# Inteligencia Operacional / Analítica — PMP Suite V2.0

**Versión:** V2.0  
**Estado:** PoC funcional de apoyo

## 1. Objetivo

Priorizar activos con señales de reincidencia utilizando información histórica, sin automatizar decisiones de mantenimiento.

## 2. Arquitectura

```text
GET /api/ai/predictive-report
→ Backend autorizado
→ analyzer.py --json
→ SELECT PostgreSQL
→ DataFrame
→ score heurístico
→ JSON
→ Web
```

## 3. Datos de entrada

Por OS:

- serie;
- tipo;
- falla;
- fecha;
- cantidad de fallas previas de la misma serie.

## 4. Variables derivadas

### es_emv

1 cuando la falla contiene `EMV`.

### es_barcode

1 cuando contiene `BARCODE`, `QR` o `LECTOR`.

### fallas_previas

Conteo de OS anteriores de la misma serie.

## 5. Score vigente

```text
riesgo_score =
clip(
  fallas_previas * 0.3 +
  es_emv * 0.5,
  0,
  1
)
```

## 6. Interpretación correcta

El score:

- **sí** sirve para priorizar inspección;
- **sí** refleja señales definidas explícitamente;
- **no** es probabilidad calibrada;
- **no** es diagnóstico;
- **no** predice componente exacto;
- **no** ejecuta mantenimiento;
- **no** crea alertas operacionales automáticas;
- **no** modifica PostgreSQL.

## 7. Salida

Cuando se solicita JSON, stdout debe contener exclusivamente JSON.

Se presentan los equipos/filas de mayor score según la implementación.

## 8. Autorización

Solo `supervision.read`:

- Admin;
- Gerente.

Otros roles: 403.

## 9. Requisitos

- **RF-IA-001:** invocar analizador desde API.
- **RF-IA-002:** conexión por DATABASE_URL.
- **RF-IA-003:** lectura únicamente.
- **RF-IA-004:** JSON válido.
- **RF-IA-005:** error de Python/DB controlado.
- **RF-IA-006:** no exponer credenciales.
- **RF-IA-007:** describir método real en UI.
- **RF-IA-008:** no declarar métricas inventadas.
- **RF-IA-009:** restringir por RBAC.
- **RF-IA-010:** mantener el análisis separado de las mutaciones operacionales.

## 10. Limitaciones

- regla heurística manual;
- no existe calibración probabilística;
- términos de falla dependen de calidad del texto histórico;
- no se declara desempeño ML actual.

## 11. Evolución posible

Una futura versión podría incorporar un modelo ML siempre que exista:

- dataset versionado;
- definición de target;
- separación train/test;
- features;
- métricas;
- matriz de confusión;
- umbral;
- validación temporal;
- monitoreo de drift.

Esto es proyección y no estado implementado V2.0.

## 12. Fuente

`06_ModelosIA/src/analyzer.py`.
