# Requisitos del módulo de inteligencia operacional

## Propósito

El módulo analiza datos históricos de mantenimiento y entrega un reporte de
riesgo para apoyar la revisión ejecutiva. No modifica órdenes, estados,
inventario ni usuarios.

## Requisitos funcionales

- **RF IA 01** El backend debe ejecutar `06_ModelosIA/src/analyzer.py` con el
  intérprete de `06_ModelosIA/.venv`.
- **RF IA 02** El analizador debe conectarse a PostgreSQL mediante la variable de
  entorno configurada para el proyecto.
- **RF IA 03** El endpoint debe entregar una respuesta JSON válida.
- **RF IA 04** Los roles `admin` y `gerente` deben consultar el reporte.
- **RF IA 05** Los roles operacionales no autorizados deben recibir HTTP 403.
- **RF IA 06** El analizador debe operar en modo de lectura y no cambiar datos
  operacionales.

## Requisitos no funcionales

- **RNF IA 01** Las dependencias deben declararse en `requirements.txt` e
  instalarse dentro de `.venv`.
- **RNF IA 02** Una caída de Python o PostgreSQL debe producir un error
  controlado sin exponer DSN, credenciales ni stack trace al cliente.
- **RNF IA 03** Los umbrales y características del modelo solo deben modificarse
  después de una evaluación documentada.
- **RNF IA 04** La evidencia académica debe identificar dataset, variables,
  preparación, algoritmo, métricas, limitaciones y fecha de evaluación.

## Criterios de aceptación

- `import psycopg2` funciona en el entorno real del módulo.
- Admin y gerente reciben una respuesta funcional distinta de HTTP 500.
- Un rol no autorizado recibe HTTP 403.
- El frontend no recibe secretos ni trazas internas cuando el servicio falla.
