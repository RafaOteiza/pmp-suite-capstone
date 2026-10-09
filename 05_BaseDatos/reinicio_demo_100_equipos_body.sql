-- PMP Suite - cuerpo controlado para reinicio del dataset demostrativo.
-- NO ejecutar directamente. Usar exclusivamente uno de los wrappers:
--   reinicio_demo_100_equipos_preview_rollback.sql
--   reinicio_demo_100_equipos_commit.sql

\if :{?PMP_RESET_MODE}
\else
  \echo 'ERROR: este archivo no puede ejecutarse directamente.'
  \quit 3
\endif

LOCK TABLE
  pmp.bridge_mantenimiento,
  pmp.bridges,
  pmp.escaneos_equipos,
  pmp.flujo_eventos,
  pmp.guia_detalle,
  pmp.guias,
  pmp.instalaciones_equipos,
  pmp.ordenes_servicio,
  pmp.qa_inspecciones,
  pmp.registro_reparaciones,
  pmp.solicitud_items,
  pmp.solicitudes_repuestos,
  pmp.validadores,
  pmp.consolas
IN ACCESS EXCLUSIVE MODE;

CREATE TEMP TABLE _pre_reset_counts (
  tabla text PRIMARY KEY,
  cantidad bigint NOT NULL
) ON COMMIT DROP;

INSERT INTO _pre_reset_counts (tabla, cantidad) VALUES
  ('validadores', (SELECT COUNT(*) FROM pmp.validadores)),
  ('consolas', (SELECT COUNT(*) FROM pmp.consolas)),
  ('ordenes_servicio', (SELECT COUNT(*) FROM pmp.ordenes_servicio)),
  ('registro_reparaciones', (SELECT COUNT(*) FROM pmp.registro_reparaciones)),
  ('qa_inspecciones', (SELECT COUNT(*) FROM pmp.qa_inspecciones)),
  ('solicitudes_repuestos', (SELECT COUNT(*) FROM pmp.solicitudes_repuestos)),
  ('solicitud_items', (SELECT COUNT(*) FROM pmp.solicitud_items)),
  ('escaneos_equipos', (SELECT COUNT(*) FROM pmp.escaneos_equipos)),
  ('guia_detalle', (SELECT COUNT(*) FROM pmp.guia_detalle)),
  ('guias', (SELECT COUNT(*) FROM pmp.guias)),
  ('bridge_mantenimiento', (SELECT COUNT(*) FROM pmp.bridge_mantenimiento)),
  ('flujo_eventos', (SELECT COUNT(*) FROM pmp.flujo_eventos)),
  ('instalaciones_equipos', (SELECT COUNT(*) FROM pmp.instalaciones_equipos)),
  ('bridges', (SELECT COUNT(*) FROM pmp.bridges));

\echo '=== CONTEOS PREVIOS ==='
TABLE _pre_reset_counts;

DO $validation$
BEGIN
  IF (SELECT COUNT(*) FROM pmp.usuarios WHERE activo AND rol = 'admin') <> 1 THEN
    RAISE EXCEPTION 'Se requiere exactamente un admin activo';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.usuarios WHERE activo AND rol = 'tecnico_terreno') <> 1 THEN
    RAISE EXCEPTION 'Se requiere exactamente un técnico de terreno activo';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.usuarios WHERE activo AND rol = 'tecnico_laboratorio') <> 1 THEN
    RAISE EXCEPTION 'Se requiere exactamente un técnico de laboratorio activo';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.usuarios WHERE activo AND rol = 'qa') <> 1 THEN
    RAISE EXCEPTION 'Se requiere exactamente un usuario QA activo';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.ubicaciones WHERE tipo::text = 'BODEGA') <> 1
     OR (SELECT COUNT(*) FROM pmp.ubicaciones WHERE tipo::text = 'LABORATORIO') <> 1
     OR (SELECT COUNT(*) FROM pmp.ubicaciones WHERE tipo::text = 'QA') <> 1 THEN
    RAISE EXCEPTION 'Se requiere exactamente una ubicación BODEGA, LABORATORIO y QA';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.terminal_pst) < 10 THEN
    RAISE EXCEPTION 'Se requieren al menos 10 combinaciones válidas terminal/PST';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.buses WHERE ppu ~ '^[A-Z]{2}[0-9]{4}$') < 25 THEN
    RAISE EXCEPTION 'Se requieren al menos 25 buses operacionales';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pmp.estados WHERE id = 4 AND nombre = 'EN_DIAGNOSTICO')
     OR NOT EXISTS (SELECT 1 FROM pmp.estados WHERE id = 6 AND nombre = 'EN_QA')
     OR NOT EXISTS (SELECT 1 FROM pmp.estados WHERE id = 7 AND nombre = 'DISPONIBLE')
     OR NOT EXISTS (SELECT 1 FROM pmp.estados WHERE id = 12 AND nombre = 'INSTALADO') THEN
    RAISE EXCEPTION 'El catálogo de estados no coincide con el esperado';
  END IF;
END
$validation$;

-- Se incluyen todas las tablas dependientes. No se usa CASCADE para evitar
-- alcanzar accidentalmente tablas maestras fuera del alcance aprobado.
TRUNCATE TABLE
  pmp.solicitud_items,
  pmp.solicitudes_repuestos,
  pmp.registro_reparaciones,
  pmp.qa_inspecciones,
  pmp.escaneos_equipos,
  pmp.flujo_eventos,
  pmp.bridge_mantenimiento,
  pmp.instalaciones_equipos,
  pmp.guia_detalle,
  pmp.guias,
  pmp.bridges,
  pmp.ordenes_servicio,
  pmp.validadores,
  pmp.consolas
RESTART IDENTITY;

CREATE TEMP TABLE _seed_validadores (
  posicion integer PRIMARY KEY CHECK (posicion BETWEEN 1 AND 50),
  serie varchar(50) UNIQUE NOT NULL,
  amid varchar(32) UNIQUE NOT NULL
) ON COMMIT DROP;

-- Pares reales conocidos. Se distribuyen entre las cuatro etapas para que
-- las etiquetas físicas puedan usarse durante la demostración.
INSERT INTO _seed_validadores (posicion, serie, amid) VALUES
  (1,  '7406238', '280000062387'),
  (2,  '7420856', '280000208563'),
  (3,  '7422368', '280000223689'),
  (14, '7400010', '280000000105'),
  (15, '7204593', '205000045932'),
  (16, '7402679', '280000026792'),
  (27, '7405020', '280000050209'),
  (28, '7406524', '280000065241'),
  (29, '7204624', '205000046243'),
  (39, '7404669', '280000046691'),
  (40, '7402992', '280000029922'),
  (41, '7407512', '280000075127');

DO $validators$
DECLARE
  v_position integer;
  v_payload text;
  v_base text;
  v_sum integer;
  v_digit integer;
  v_index integer;
  v_check integer;
BEGIN
  FOR v_position IN 1..50 LOOP
    IF EXISTS (SELECT 1 FROM _seed_validadores WHERE posicion = v_position) THEN
      CONTINUE;
    END IF;
    v_payload := lpad((90000 + v_position)::text, 5, '0');
    v_base := '280000' || v_payload;
    v_sum := 0;
    FOR v_index IN 1..11 LOOP
      v_digit := substr(v_base, v_index, 1)::integer;
      v_sum := v_sum + CASE WHEN v_index % 2 = 1 THEN v_digit * 3 ELSE v_digit END;
    END LOOP;
    v_check := (10 - (v_sum % 10)) % 10;
    INSERT INTO _seed_validadores (posicion, serie, amid)
    VALUES (v_position, '74' || v_payload, v_base || v_check::text);
  END LOOP;
END
$validators$;

DO $validator_checks$
BEGIN
  IF (SELECT COUNT(*) FROM _seed_validadores) <> 50 THEN
    RAISE EXCEPTION 'El catálogo preparado no contiene 50 validadores';
  END IF;
  IF EXISTS (
    SELECT 1
      FROM _seed_validadores v
     WHERE CASE substr(v.amid, 1, 6)
             WHEN '280000' THEN '74'
             WHEN '205000' THEN '72'
           END || substr(v.amid, 7, 5) <> v.serie
  ) THEN
    RAISE EXCEPTION 'Existe una relación serie/AMID inconsistente';
  END IF;
  IF EXISTS (
    SELECT 1
      FROM _seed_validadores v
     WHERE right(v.amid, 1)::integer <> (
       SELECT (10 - (SUM(
         CASE WHEN i % 2 = 1
           THEN substr(v.amid, i, 1)::integer * 3
           ELSE substr(v.amid, i, 1)::integer
         END
       ) % 10)) % 10
       FROM generate_series(1, 11) AS digit(i)
     )
  ) THEN
    RAISE EXCEPTION 'Existe un AMID con checksum UPC-A inválido';
  END IF;
END
$validator_checks$;

INSERT INTO pmp.validadores (serie, modelo, marca, amid)
SELECT serie, 'CVB45', 'Mikroelektronika', amid
FROM _seed_validadores
ORDER BY posicion;

CREATE TEMP TABLE _seed_consolas (
  posicion integer PRIMARY KEY CHECK (posicion BETWEEN 1 AND 50),
  serie varchar(50) UNIQUE NOT NULL
) ON COMMIT DROP;

INSERT INTO _seed_consolas (posicion, serie)
SELECT posicion, '9715A' || lpad(posicion::text, 4, '0')
FROM generate_series(1, 50) AS generated(posicion);

INSERT INTO pmp.consolas (serie, modelo, marca)
SELECT serie, 'N9715', 'Waysion'
FROM _seed_consolas
ORDER BY posicion;

CREATE TEMP TABLE _seed_assets ON COMMIT DROP AS
SELECT
  'VALIDADOR'::varchar(20) AS tipo_equipo,
  serie,
  posicion,
  posicion AS orden_global,
  CASE
    WHEN posicion <= 13 THEN 'TERRENO'
    WHEN posicion <= 26 THEN 'BODEGA'
    WHEN posicion <= 38 THEN 'LABORATORIO'
    ELSE 'QA'
  END::text AS etapa
FROM _seed_validadores
UNION ALL
SELECT
  'CONSOLA'::varchar(20),
  serie,
  posicion,
  posicion + 50,
  CASE
    WHEN posicion <= 12 THEN 'TERRENO'
    WHEN posicion <= 24 THEN 'BODEGA'
    WHEN posicion <= 37 THEN 'LABORATORIO'
    ELSE 'QA'
  END::text
FROM _seed_consolas;

ALTER TABLE _seed_assets ADD PRIMARY KEY (tipo_equipo, serie);

CREATE TEMP TABLE _seed_buses ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY ppu)::integer AS posicion, ppu
FROM (
  SELECT ppu
  FROM pmp.buses
  WHERE ppu ~ '^[A-Z]{2}[0-9]{4}$'
  ORDER BY ppu
  LIMIT 25
) selected;

CREATE TEMP TABLE _seed_terminal_pst ON COMMIT DROP AS
SELECT row_number() OVER (ORDER BY terminal_id, pst_codigo)::integer AS posicion,
       terminal_id,
       pst_codigo
FROM (
  SELECT terminal_id, pst_codigo
  FROM pmp.terminal_pst
  ORDER BY terminal_id, pst_codigo
  LIMIT 10
) selected;

DO $orders$
DECLARE
  v_admin uuid;
  v_terrain uuid;
  v_lab uuid;
  v_qa uuid;
  v_bodega_location integer;
  v_lab_location integer;
  v_qa_location integer;
  v_bus varchar(20);
  v_terminal integer;
  v_pst varchar(50);
  v_order_code varchar(50);
  v_state integer;
  v_location integer;
  v_failure text;
  v_asset record;
BEGIN
  SELECT id INTO STRICT v_admin FROM pmp.usuarios WHERE activo AND rol = 'admin';
  SELECT id INTO STRICT v_terrain FROM pmp.usuarios WHERE activo AND rol = 'tecnico_terreno';
  SELECT id INTO STRICT v_lab FROM pmp.usuarios WHERE activo AND rol = 'tecnico_laboratorio';
  SELECT id INTO STRICT v_qa FROM pmp.usuarios WHERE activo AND rol = 'qa';
  SELECT id INTO STRICT v_bodega_location FROM pmp.ubicaciones WHERE tipo::text = 'BODEGA';
  SELECT id INTO STRICT v_lab_location FROM pmp.ubicaciones WHERE tipo::text = 'LABORATORIO';
  SELECT id INTO STRICT v_qa_location FROM pmp.ubicaciones WHERE tipo::text = 'QA';

  FOR v_asset IN SELECT * FROM _seed_assets ORDER BY orden_global LOOP
    SELECT ppu INTO STRICT v_bus
    FROM _seed_buses
    WHERE posicion = ((v_asset.orden_global - 1) % 25) + 1;

    SELECT terminal_id, pst_codigo INTO STRICT v_terminal, v_pst
    FROM _seed_terminal_pst
    WHERE posicion = ((v_asset.orden_global - 1) % 10) + 1;

    v_state := CASE v_asset.etapa
      WHEN 'TERRENO' THEN 12
      WHEN 'BODEGA' THEN 7
      WHEN 'LABORATORIO' THEN 4
      WHEN 'QA' THEN 6
    END;
    v_location := CASE v_asset.etapa
      WHEN 'BODEGA' THEN v_bodega_location
      WHEN 'LABORATORIO' THEN v_lab_location
      WHEN 'QA' THEN v_qa_location
      ELSE NULL
    END;
    v_failure := CASE v_asset.etapa
      WHEN 'TERRENO' THEN 'Equipo operativo instalado en terreno'
      WHEN 'BODEGA' THEN 'Equipo disponible en stock de bodega'
      WHEN 'LABORATORIO' THEN 'Falla de comunicación reportada en terreno'
      WHEN 'QA' THEN 'Reparación completada, pendiente de certificación QA'
    END;

    INSERT INTO pmp.ordenes_servicio (
      fecha,
      tipo_equipo,
      es_pod,
      validador_serie,
      consola_serie,
      falla,
      estado_id,
      bus_ppu,
      terminal_id,
      pst_codigo,
      ubicacion_id,
      tecnico_terreno_id,
      tecnico_laboratorio_id,
      actualizado_en,
      es_aprobado_qa,
      es_instalacion,
      ticket_aranda,
      qa_usuario_id,
      qa_asignado_por,
      qa_asignado_en
    ) VALUES (
      now() - ((101 - v_asset.orden_global) * interval '2 hours'),
      v_asset.tipo_equipo,
      FALSE,
      CASE WHEN v_asset.tipo_equipo = 'VALIDADOR' THEN v_asset.serie ELSE NULL END,
      CASE WHEN v_asset.tipo_equipo = 'CONSOLA' THEN v_asset.serie ELSE NULL END,
      v_failure,
      v_state,
      v_bus,
      v_terminal,
      v_pst,
      v_location,
      CASE WHEN v_asset.etapa = 'TERRENO' THEN v_terrain ELSE NULL END,
      CASE WHEN v_asset.etapa IN ('LABORATORIO', 'QA') THEN v_lab ELSE NULL END,
      now() - ((100 - v_asset.orden_global) * interval '2 hours'),
      NULL,
      v_asset.etapa = 'TERRENO',
      NULL,
      CASE WHEN v_asset.etapa = 'QA' THEN v_qa ELSE NULL END,
      CASE WHEN v_asset.etapa = 'QA' THEN v_admin ELSE NULL END,
      CASE WHEN v_asset.etapa = 'QA' THEN now() - interval '1 hour' ELSE NULL END
    ) RETURNING codigo_os INTO v_order_code;

    IF v_asset.etapa = 'QA' THEN
      INSERT INTO pmp.registro_reparaciones (
        codigo_os,
        tecnico_id,
        falla_detectada,
        accion_realizada,
        repuestos_usados,
        comentario,
        fecha_registro,
        prueba_realizada,
        resultado_prueba
      ) VALUES (
        v_order_code,
        v_lab,
        'Falla de comunicación confirmada',
        'Diagnóstico, ajuste de conexiones y prueba funcional',
        NULL,
        'Registro demostrativo previo a certificación QA',
        now() - interval '2 hours',
        'Prueba funcional de comunicación y encendido',
        'APROBADO EN LABORATORIO'
      );
    END IF;
  END LOOP;
END
$orders$;

DO $postconditions$
BEGIN
  IF (SELECT COUNT(*) FROM pmp.validadores) <> 50 THEN
    RAISE EXCEPTION 'Conteo final de validadores distinto de 50';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.consolas) <> 50 THEN
    RAISE EXCEPTION 'Conteo final de consolas distinto de 50';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.ordenes_servicio) <> 100 THEN
    RAISE EXCEPTION 'Conteo final de OS distinto de 100';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.registro_reparaciones) <> 25 THEN
    RAISE EXCEPTION 'Se esperaban 25 reparaciones demostrativas para QA';
  END IF;
  IF EXISTS (
    SELECT tipo_equipo, COALESCE(validador_serie, consola_serie)
    FROM pmp.ordenes_servicio
    GROUP BY tipo_equipo, COALESCE(validador_serie, consola_serie)
    HAVING COUNT(*) <> 1
  ) THEN
    RAISE EXCEPTION 'Cada equipo debe poseer exactamente una OS';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM pmp.ordenes_servicio o
    LEFT JOIN pmp.ubicaciones u ON u.id = o.ubicacion_id
    WHERE (o.estado_id = 12 AND o.ubicacion_id IS NOT NULL)
       OR (o.estado_id = 7 AND u.tipo::text <> 'BODEGA')
       OR (o.estado_id = 4 AND u.tipo::text <> 'LABORATORIO')
       OR (o.estado_id = 6 AND u.tipo::text <> 'QA')
  ) THEN
    RAISE EXCEPTION 'Existe una OS con estado y ubicación incompatibles';
  END IF;
  IF (SELECT COUNT(*) FROM pmp.ordenes_servicio WHERE estado_id = 12) <> 25
     OR (SELECT COUNT(*) FROM pmp.ordenes_servicio WHERE estado_id = 7) <> 25
     OR (SELECT COUNT(*) FROM pmp.ordenes_servicio WHERE estado_id = 4) <> 25
     OR (SELECT COUNT(*) FROM pmp.ordenes_servicio WHERE estado_id = 6) <> 25 THEN
    RAISE EXCEPTION 'La distribución global no es 25/25/25/25';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pmp.ordenes_servicio o
    LEFT JOIN pmp.validadores v ON v.serie = o.validador_serie
    LEFT JOIN pmp.consolas c ON c.serie = o.consola_serie
    WHERE (o.tipo_equipo = 'VALIDADOR' AND v.serie IS NULL)
       OR (o.tipo_equipo = 'CONSOLA' AND c.serie IS NULL)
  ) THEN
    RAISE EXCEPTION 'Existe una OS sin equipo maestro válido';
  END IF;
END
$postconditions$;

\echo '=== CONTEOS PREPARADOS DENTRO DE LA TRANSACCIÓN ==='
SELECT 'validadores' AS entidad, COUNT(*)::int AS cantidad FROM pmp.validadores
UNION ALL SELECT 'consolas', COUNT(*)::int FROM pmp.consolas
UNION ALL SELECT 'ordenes_servicio', COUNT(*)::int FROM pmp.ordenes_servicio
UNION ALL SELECT 'reparaciones_qa', COUNT(*)::int FROM pmp.registro_reparaciones
ORDER BY entidad;

\echo '=== DISTRIBUCIÓN POR TIPO Y ETAPA ==='
SELECT
  tipo_equipo,
  CASE estado_id
    WHEN 12 THEN 'TERRENO'
    WHEN 7 THEN 'BODEGA'
    WHEN 4 THEN 'LABORATORIO'
    WHEN 6 THEN 'QA'
  END AS etapa,
  COUNT(*)::int AS cantidad
FROM pmp.ordenes_servicio
GROUP BY tipo_equipo, estado_id
ORDER BY tipo_equipo, etapa;

\echo '=== DISTRIBUCIÓN GLOBAL ==='
SELECT
  CASE estado_id
    WHEN 12 THEN 'TERRENO'
    WHEN 7 THEN 'BODEGA'
    WHEN 4 THEN 'LABORATORIO'
    WHEN 6 THEN 'QA'
  END AS etapa,
  COUNT(*)::int AS cantidad
FROM pmp.ordenes_servicio
GROUP BY estado_id
ORDER BY etapa;

\echo '=== PARES REALES CONSERVADOS ==='
SELECT v.serie, v.amid,
       CASE o.estado_id
         WHEN 12 THEN 'TERRENO'
         WHEN 7 THEN 'BODEGA'
         WHEN 4 THEN 'LABORATORIO'
         WHEN 6 THEN 'QA'
       END AS etapa,
       o.codigo_os
FROM pmp.validadores v
JOIN pmp.ordenes_servicio o ON o.validador_serie = v.serie
WHERE v.serie IN (
  '7406238','7420856','7422368','7400010','7204593','7402679',
  '7405020','7406524','7204624','7404669','7402992','7407512'
)
ORDER BY etapa, v.serie;
