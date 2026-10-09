> **SCRIPT DE DEMOSTRACIÓN DESTRUCTIVO — NO USAR EN LA BASE HABITUAL.** Se conserva para un entorno descartable/controlado. No representa el procedimiento normal de PMP Suite.

# Reinicio controlado del dataset demostrativo PMP Suite

Estado: **preparado, no ejecutado**.

## Alcance

El reinicio elimina los datos operacionales asociados a los equipos actuales y
crea un dataset nuevo con:

- 50 validadores CVB45 / Mikroelektronika;
- 50 consolas N9715 / Waysion;
- 100 órdenes de servicio, una por equipo;
- 25 equipos en terreno (`INSTALADO`);
- 25 equipos en bodega (`DISPONIBLE`);
- 25 equipos en laboratorio (`EN_DIAGNOSTICO`);
- 25 equipos en QA (`EN_QA`);
- 25 registros de reparación previos para que los equipos en QA puedan
  continuar correctamente el flujo.

Distribución por tipo:

| Tipo | Terreno | Bodega | Laboratorio | QA | Total |
|---|---:|---:|---:|---:|---:|
| Validador | 13 | 13 | 12 | 12 | 50 |
| Consola | 12 | 12 | 13 | 13 | 50 |
| Total | 25 | 25 | 25 | 25 | 100 |

La base no posee una ubicación física `TERRENO`. Por eso los equipos en terreno
se representan mediante `estado_id = 12 (INSTALADO)`, bus, terminal, PST y
técnico de terreno, dejando `ubicacion_id` en `NULL` porque no están dentro de
Bodega, Laboratorio ni QA.

## Datos dependientes incluidos en el reinicio

Para conservar integridad referencial también se limpian:

- reparaciones y QA;
- solicitudes e ítems de repuestos;
- escaneos físicos;
- guías y sus detalles;
- Bridge, mantenimiento Bridge, eventos e instalaciones asociadas.

No se modifican:

- usuarios, roles ni Firebase;
- buses;
- terminales, PST y asociaciones terminal/PST;
- estados y configuración estado/ubicación;
- ubicaciones;
- catálogo y stock de repuestos;
- código del backend o frontend;
- secuencias de códigos OS. Los códigos nuevos continuarán desde los valores
  actuales para evitar cambios no transaccionales en secuencias.

## Pares físicos conservados

El seed incorpora los pares serie/AMID comprobados durante el desarrollo,
incluidos `7405020 / 280000050209` y `7400010 / 280000000105`. Los AMID
generados también cumplen checksum UPC-A y la relación oficial serie/AMID.

## Archivos

- `reinicio_demo_100_equipos_body.sql`: implementación compartida y protegida;
  no puede ejecutarse directamente.
- `reinicio_demo_100_equipos_preview_rollback.sql`: ejecuta todo dentro de una
  transacción, termina con `ROLLBACK` y restaura el valor previo de las tres
  secuencias de códigos OS para no dejar saltos causados por el dry-run.
- `reinicio_demo_100_equipos_commit.sql`: ejecución definitiva protegida por la
  variable `PMP_RESET_CONFIRM=true`.
- `reinicio_demo_100_equipos_validacion.sql`: consultas posteriores de solo
  lectura.

## Procedimiento definitivo previsto

1. Detener backend y frontend para evitar escrituras concurrentes.
2. Crear un respaldo con PostgreSQL 18 `pg_dump` antes de modificar datos.
3. Registrar SHA-256 de respaldo y scripts.
4. Ejecutar primero la vista previa con `ROLLBACK`.
5. Confirmar que dentro de la transacción existen 50 validadores, 50 consolas,
   100 OS y distribución 25/25/25/25.
6. Confirmar que después del `ROLLBACK` persisten los conteos originales.
7. Ejecutar el script definitivo solo con autorización explícita.
8. Ejecutar la validación de solo lectura y reiniciar los servicios.

No ejecutar `stress_test.js` ni `e2e_full_v2.js` como parte de este proceso.
