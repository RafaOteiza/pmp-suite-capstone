# Recepción desde Terreno: captura física y badge

## Badge «Recepciones y despachos»

Fuente: GET /api/dashboard/badges, propiedad bodega.
Es el número de OS pendientes visibles, sin filtros de búsqueda, en las tres
pestañas de /bodega: **Recepcionar + Para laboratorio + Para control QA**.
Cada OS se cuenta una vez.

- Recepcionar: estados 2 u 11, excluyendo pendingTerrainSql() (retiro aún no confirmado).
- Para laboratorio: estado 3 y QA rechazado, o sin paso por laboratorio.
- Para control QA: estado 3, con reparación registrada y QA sin resultado.
- No incluye stock disponible, equipos instalados ni retiros pendientes en buses.

warehouseQueueSql() se comparte entre /api/bodega/queue y el contador.
La versión anterior contaba estados 2/11 sin excluir retiros pendientes, y no
incluía los despachos pendientes de estado 3. Esa diferencia explica que ambas
consultas pudieran discrepar; no se ajustan los totales mediante sumas/restas fijas.

El menú vuelve a consultar el contador al cargar/actualizar Bodega, después de
sus operaciones y cada 60 segundos. No se deduce el badge del estado anterior.

## Evidencia y custodia

POST /api/bodega/recepcion-terreno/validar crea evidencia propia de recepción.
El escaneo del retiro no sirve para recibir. La confirmación exige misma OS,
activo, usuario, contexto de recepción y vínculo al retiro existente.
Una discrepancia posterior invalida evidencia anterior.

El modal muestra los datos conocidos como texto de solo lectura. La lectura del
escáner tiene foco y captura una secuencia de teclado terminada en Enter.
Rechaza pegado, cambios ordinarios del input, eventos sintéticos y secuencias lentas.
La API exige y audita los intervalos de captura: 4–64 caracteres, máximo 80 ms
entre entradas y promedio máximo 35 ms, incluido Enter.

**Límite técnico:** el navegador recibe un keyboard-wedge como teclado. Estos
controles detectan patrones de entrada; no autentican un dispositivo físico ni
impiden que un cliente deliberadamente manipulado fabrique telemetría.
Un lector configurado con retardos incompatibles necesita ajustar su configuración
o utilizar la contingencia explícita; no se transforma digitación en SCANNER.

La contingencia MANUAL_AUTORIZADO exige admin/logística, serie exacta,
presencia física y motivo. Conserva usuario, fecha, motivo y origen en auditoría.
La consulta manual nunca habilita movimientos.

Validar no cambia estado ni ubicación de la OS. Cancelar no confirma recepción.
La transacción de confirmación mantiene el flujo existente: estado 3 y Bodega,
evento RECEPCION_TERRENO_BODEGA, sin crear OS ni IN. Laboratorio y QA
conservan sus reglas de recepción.

## Verificación

Las pruebas usan mocks frontend y PostgreSQL efímero con comparación de la base
original antes/después. No se confirma ni modifica MV-87126356.
Los escenarios cubren captura válida/incorrecta, motivo manual, evidencia ajena,
discrepancia posterior, cancelación, concurrencia, historial y badge frente a las
tres pestañas. El circuito E2E existente cubre laboratorio, QA e inventario.

## Guion manual con una OS de prueba

1. Abrir Bodega → Recepcionar; comprobar contexto y foco en Lectura del escáner.
2. Digitar lentamente o pegar: no debe habilitar confirmación.
3. Escanear otro equipo: ver esperado/encontrado y recepción bloqueada.
4. Escanear el correcto: ver Equipo validado; cancelar y comprobar que sigue en tránsito.
5. Reabrir y seleccionar Ingreso manual autorizado: exigir serie exacta, motivo y presencia.
6. Validar y confirmar: comprobar Bodega, evento y origen MANUAL_AUTORIZADO, sin OS nueva.
7. Comparar badge con la suma de las tres pestañas después de actualizar.

## Resultados de esta corrección

- Backend: 68 pruebas aprobadas.
- Frontend/Mobile: 112 pruebas aprobadas.
- E2E de requerimientos/recepción: 12 escenarios aprobados.
- E2E de escaneo físico: 9 escenarios aprobados.
- E2E de nomenclatura logística: 9 escenarios aprobados.
- Las tres ejecuciones E2E verificaron base original intacta y eliminaron su clúster temporal.
- TypeScript y build frontend aprobados.
- Renderizados con datos simulados: cuatro estados del modal, dos temas y seis
  anchos (320, 375, 390, 768, 1024 y 1440). Se verifican foco y ausencia de overflow.
- Evidencias locales: tmp/receipt-qa. No se probó una pistola física real.
