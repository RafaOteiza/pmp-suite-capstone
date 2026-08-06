-- PMP Suite - limpieza propuesta para la ejecucion accidental de stress_test.js
-- Fecha del incidente: 2026-08-06 15:33:14Z a 15:33:17Z
--
-- SEGURIDAD:
--   1. Este archivo termina siempre en ROLLBACK.
--   2. No reemplazar ROLLBACK por COMMIT sin revisar los conteos y respaldar la BD.
--   3. Los buses STBUS*, PFULL* y RACEPPU no poseen fecha de creacion; su origen
--      no puede demostrarse solo con la tabla pmp.buses. La eliminacion propuesta
--      exige que no queden referencias, pero aun requiere aprobacion humana.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

CREATE TEMP TABLE phase15_cleanup_orders ON COMMIT DROP AS
SELECT
  codigo_os,
  tipo_equipo,
  validador_serie,
  consola_serie,
  bus_ppu,
  es_instalacion
FROM pmp.ordenes_servicio
WHERE fecha >= TIMESTAMPTZ '2026-08-06 15:33:00+00'
  AND fecha < TIMESTAMPTZ '2026-08-06 15:34:00+00'
  AND COALESCE(validador_serie, consola_serie) SIMILAR TO '(STRESS|RACE|FULL)-%';

CREATE TEMP TABLE phase15_cleanup_series ON COMMIT DROP AS
SELECT DISTINCT
  tipo_equipo,
  COALESCE(validador_serie, consola_serie) AS serie
FROM phase15_cleanup_orders
WHERE COALESCE(validador_serie, consola_serie) IS NOT NULL;

CREATE TEMP TABLE phase15_cleanup_buses ON COMMIT DROP AS
SELECT DISTINCT bus_ppu AS ppu
FROM phase15_cleanup_orders
WHERE bus_ppu IS NOT NULL
  AND bus_ppu <> 'STOCK';

-- Conteos previos esperados: 31 OS, 16 validadores, 10 consolas,
-- 26 buses, 5 reparaciones, 0 solicitudes/items/guias.
SELECT 'ordenes_servicio' AS entidad, COUNT(*)::int AS total
FROM phase15_cleanup_orders
UNION ALL
SELECT 'instalaciones', COUNT(*)::int
FROM phase15_cleanup_orders WHERE es_instalacion
UNION ALL
SELECT 'validadores', COUNT(*)::int
FROM pmp.validadores v
JOIN phase15_cleanup_series s ON s.tipo_equipo = 'VALIDADOR' AND s.serie = v.serie
UNION ALL
SELECT 'consolas', COUNT(*)::int
FROM pmp.consolas c
JOIN phase15_cleanup_series s ON s.tipo_equipo = 'CONSOLA' AND s.serie = c.serie
UNION ALL
SELECT 'buses', COUNT(*)::int
FROM pmp.buses b JOIN phase15_cleanup_buses x ON x.ppu = b.ppu
UNION ALL
SELECT 'reparaciones', COUNT(*)::int
FROM pmp.registro_reparaciones r
JOIN phase15_cleanup_orders o ON o.codigo_os = r.codigo_os
UNION ALL
SELECT 'solicitudes_repuestos', COUNT(*)::int
FROM pmp.solicitudes_repuestos s
JOIN phase15_cleanup_orders o ON o.codigo_os = s.codigo_os
UNION ALL
SELECT 'solicitud_items', COUNT(*)::int
FROM pmp.solicitud_items i
JOIN pmp.solicitudes_repuestos s ON s.id = i.solicitud_id
JOIN phase15_cleanup_orders o ON o.codigo_os = s.codigo_os
UNION ALL
SELECT 'guia_detalle', COUNT(*)::int
FROM pmp.guia_detalle g
WHERE g.codigo_os IN (SELECT codigo_os FROM phase15_cleanup_orders)
   OR g.validador_serie IN (SELECT serie FROM phase15_cleanup_series)
   OR g.consola_serie IN (SELECT serie FROM phase15_cleanup_series)
   OR g.bus_ppu IN (SELECT ppu FROM phase15_cleanup_buses)
ORDER BY entidad;

-- Abortamos ante cualquier desviacion del inventario auditado.
DO $$
DECLARE
  v_orders integer;
  v_validators integer;
  v_consoles integer;
  v_buses integer;
  v_repairs integer;
  v_requests integer;
  v_request_items integer;
  v_guide_details integer;
BEGIN
  SELECT COUNT(*) INTO v_orders FROM phase15_cleanup_orders;
  SELECT COUNT(*) INTO v_validators
  FROM pmp.validadores v
  JOIN phase15_cleanup_series s ON s.tipo_equipo = 'VALIDADOR' AND s.serie = v.serie;
  SELECT COUNT(*) INTO v_consoles
  FROM pmp.consolas c
  JOIN phase15_cleanup_series s ON s.tipo_equipo = 'CONSOLA' AND s.serie = c.serie;
  SELECT COUNT(*) INTO v_buses
  FROM pmp.buses b JOIN phase15_cleanup_buses x ON x.ppu = b.ppu;
  SELECT COUNT(*) INTO v_repairs
  FROM pmp.registro_reparaciones r
  JOIN phase15_cleanup_orders o ON o.codigo_os = r.codigo_os;
  SELECT COUNT(*) INTO v_requests
  FROM pmp.solicitudes_repuestos s
  JOIN phase15_cleanup_orders o ON o.codigo_os = s.codigo_os;
  SELECT COUNT(*) INTO v_request_items
  FROM pmp.solicitud_items i
  JOIN pmp.solicitudes_repuestos s ON s.id = i.solicitud_id
  JOIN phase15_cleanup_orders o ON o.codigo_os = s.codigo_os;
  SELECT COUNT(*) INTO v_guide_details
  FROM pmp.guia_detalle g
  WHERE g.codigo_os IN (SELECT codigo_os FROM phase15_cleanup_orders)
     OR g.validador_serie IN (SELECT serie FROM phase15_cleanup_series)
     OR g.consola_serie IN (SELECT serie FROM phase15_cleanup_series)
     OR g.bus_ppu IN (SELECT ppu FROM phase15_cleanup_buses);

  IF v_orders <> 31
     OR v_validators <> 16
     OR v_consoles <> 10
     OR v_buses <> 26
     OR v_repairs <> 5
     OR v_requests <> 0
     OR v_request_items <> 0
     OR v_guide_details <> 0 THEN
    RAISE EXCEPTION
      'Inventario distinto al auditado: OS %, validadores %, consolas %, buses %, reparaciones %, solicitudes %, items %, guia_detalle %',
      v_orders, v_validators, v_consoles, v_buses, v_repairs,
      v_requests, v_request_items, v_guide_details;
  END IF;
END $$;

-- Hijos directos de ordenes_servicio.
DELETE FROM pmp.solicitud_items item
USING pmp.solicitudes_repuestos request, phase15_cleanup_orders target
WHERE item.solicitud_id = request.id
  AND request.codigo_os = target.codigo_os;

DELETE FROM pmp.solicitudes_repuestos request
USING phase15_cleanup_orders target
WHERE request.codigo_os = target.codigo_os;

DELETE FROM pmp.registro_reparaciones repair
USING phase15_cleanup_orders target
WHERE repair.codigo_os = target.codigo_os;

-- La auditoria espera cero detalles de guia. Se incluye por orden seguro de FK.
DELETE FROM pmp.guia_detalle detail
WHERE detail.codigo_os IN (SELECT codigo_os FROM phase15_cleanup_orders)
   OR detail.validador_serie IN (SELECT serie FROM phase15_cleanup_series)
   OR detail.consola_serie IN (SELECT serie FROM phase15_cleanup_series)
   OR detail.bus_ppu IN (SELECT ppu FROM phase15_cleanup_buses);

-- Entidad principal y las cinco OS de instalacion derivadas.
DELETE FROM pmp.ordenes_servicio service_order
USING phase15_cleanup_orders target
WHERE service_order.codigo_os = target.codigo_os;

-- Equipos creados con series unicas de esta ejecucion.
DELETE FROM pmp.validadores validator
USING phase15_cleanup_series target
WHERE target.tipo_equipo = 'VALIDADOR'
  AND validator.serie = target.serie
  AND NOT EXISTS (
    SELECT 1 FROM pmp.ordenes_servicio service_order
    WHERE service_order.validador_serie = validator.serie
  )
  AND NOT EXISTS (
    SELECT 1 FROM pmp.guia_detalle detail
    WHERE detail.validador_serie = validator.serie
  );

DELETE FROM pmp.consolas console_row
USING phase15_cleanup_series target
WHERE target.tipo_equipo = 'CONSOLA'
  AND console_row.serie = target.serie
  AND NOT EXISTS (
    SELECT 1 FROM pmp.ordenes_servicio service_order
    WHERE service_order.consola_serie = console_row.serie
  )
  AND NOT EXISTS (
    SELECT 1 FROM pmp.guia_detalle detail
    WHERE detail.consola_serie = console_row.serie
  );

-- Solo buses sin ninguna referencia restante. Requiere revision humana adicional.
DELETE FROM pmp.buses bus
USING phase15_cleanup_buses target
WHERE bus.ppu = target.ppu
  AND NOT EXISTS (
    SELECT 1 FROM pmp.ordenes_servicio service_order
    WHERE service_order.bus_ppu = bus.ppu
  )
  AND NOT EXISTS (
    SELECT 1 FROM pmp.guia_detalle detail
    WHERE detail.bus_ppu = bus.ppu
  );

-- Conteos posteriores esperados dentro de la transaccion: todos cero.
SELECT 'ordenes_restantes' AS entidad, COUNT(*)::int AS total
FROM pmp.ordenes_servicio o
JOIN phase15_cleanup_orders target ON target.codigo_os = o.codigo_os
UNION ALL
SELECT 'validadores_restantes', COUNT(*)::int
FROM pmp.validadores v
JOIN phase15_cleanup_series target ON target.tipo_equipo = 'VALIDADOR' AND target.serie = v.serie
UNION ALL
SELECT 'consolas_restantes', COUNT(*)::int
FROM pmp.consolas c
JOIN phase15_cleanup_series target ON target.tipo_equipo = 'CONSOLA' AND target.serie = c.serie
UNION ALL
SELECT 'buses_restantes', COUNT(*)::int
FROM pmp.buses b JOIN phase15_cleanup_buses target ON target.ppu = b.ppu
UNION ALL
SELECT 'reparaciones_restantes', COUNT(*)::int
FROM pmp.registro_reparaciones r
JOIN phase15_cleanup_orders target ON target.codigo_os = r.codigo_os
ORDER BY entidad;

-- ROLLBACK obligatorio para revision. No hay COMMIT en este archivo.
ROLLBACK;
