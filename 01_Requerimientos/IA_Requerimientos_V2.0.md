# Inteligencia operacional / analítica

**Versión:** V2.0

**Estado:** vigente — 09-10-2026

## Propósito

La capa analítica prioriza activos para revisión usando históricos de PostgreSQL. Es una función de apoyo y **no toma decisiones operacionales ni modifica datos**.

## Requisitos funcionales

- **RF-IA-01:** El backend ejecuta el analizador Python configurado para el proyecto.
- **RF-IA-02:** El analizador consulta PostgreSQL en modo lectura.
- **RF-IA-03:** La salida debe ser JSON válido y no exponer secretos.
- **RF-IA-04:** Admin y Gerente pueden consultar el reporte vigente.
- **RF-IA-05:** Roles no autorizados reciben 403.
- **RF-IA-06:** Una fila representa un activo tipo + serie; no deben mostrarse duplicados por OS.
- **RF-IA-07:** El frontend debe indicar el método de análisis realmente utilizado.
- **RF-IA-08:** Un score es criterio de inspección/priorización, no diagnóstico ni orden automática.

## Estado técnico actual

La aplicación utiliza `06_ModelosIA/src/analyzer.py`, que calcula una **heurística de reincidencia** sobre históricos de PostgreSQL. Los experimentos y artefactos de entrenamiento que no forman parte del flujo vigente fueron retirados del repositorio para mantener una única implementación documentada.

## Requisitos no funcionales

- Entorno Python aislado.
- Dependencias declaradas.
- Error controlado ante caída de Python/PostgreSQL.
- Sin credenciales/rutas sensibles en la respuesta.
- Dataset, features, umbral y métricas deben quedar fechados cuando se evalúe un modelo ML.
