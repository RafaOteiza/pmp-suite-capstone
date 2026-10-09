\set ON_ERROR_STOP on
\set PMP_RESET_MODE preview

\echo 'PMP Suite - VISTA PREVIA TRANSACCIONAL'
\echo 'Los datos terminarán mediante ROLLBACK y las secuencias OS se restaurarán.'

CREATE TEMP TABLE _preview_sequence_state (
  sequence_name regclass PRIMARY KEY,
  last_value bigint NOT NULL,
  is_called boolean NOT NULL
) ON COMMIT PRESERVE ROWS;

INSERT INTO _preview_sequence_state (sequence_name, last_value, is_called)
SELECT 'pmp.seq_in'::regclass, last_value, is_called FROM pmp.seq_in
UNION ALL
SELECT 'pmp.seq_mc'::regclass, last_value, is_called FROM pmp.seq_mc
UNION ALL
SELECT 'pmp.seq_mv'::regclass, last_value, is_called FROM pmp.seq_mv;

BEGIN;
\ir reinicio_demo_100_equipos_body.sql
ROLLBACK;

SELECT setval(sequence_name, last_value, is_called)
FROM _preview_sequence_state
ORDER BY sequence_name::text;

DROP TABLE _preview_sequence_state;

\echo '=== ESTADO PERSISTENTE DESPUÉS DEL ROLLBACK ==='
SELECT 'validadores' AS entidad, COUNT(*)::int AS cantidad FROM pmp.validadores
UNION ALL SELECT 'consolas', COUNT(*)::int FROM pmp.consolas
UNION ALL SELECT 'ordenes_servicio', COUNT(*)::int FROM pmp.ordenes_servicio
ORDER BY entidad;
