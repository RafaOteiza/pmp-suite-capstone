\set ON_ERROR_STOP on

\echo '=== VALIDACIÓN DE CONTEOS ==='
SELECT 'validadores' AS entidad, COUNT(*)::int AS cantidad FROM pmp.validadores
UNION ALL SELECT 'consolas', COUNT(*)::int FROM pmp.consolas
UNION ALL SELECT 'ordenes_servicio', COUNT(*)::int FROM pmp.ordenes_servicio
UNION ALL SELECT 'reparaciones_qa', COUNT(*)::int FROM pmp.registro_reparaciones
ORDER BY entidad;

\echo '=== VALIDACIÓN DE DISTRIBUCIÓN ==='
SELECT
  tipo_equipo,
  estado_id,
  MAX(e.nombre) AS estado,
  CASE estado_id
    WHEN 12 THEN 'TERRENO'
    WHEN 7 THEN 'BODEGA'
    WHEN 4 THEN 'LABORATORIO'
    WHEN 6 THEN 'QA'
    ELSE 'OTRO'
  END AS etapa,
  COUNT(*)::int AS cantidad
FROM pmp.ordenes_servicio o
JOIN pmp.estados e ON e.id = o.estado_id
GROUP BY tipo_equipo, estado_id
ORDER BY tipo_equipo, etapa, estado_id;

\echo '=== VALIDACIÓN DE INTEGRIDAD ==='
SELECT
  COUNT(*) FILTER (WHERE tipo_equipo = 'VALIDADOR' AND validador_serie IS NOT NULL AND consola_serie IS NULL)::int AS os_validadores_validas,
  COUNT(*) FILTER (WHERE tipo_equipo = 'CONSOLA' AND consola_serie IS NOT NULL AND validador_serie IS NULL)::int AS os_consolas_validas,
  COUNT(*) FILTER (WHERE estado_id = 12 AND ubicacion_id IS NULL)::int AS terreno_sin_ubicacion_interna,
  COUNT(*) FILTER (WHERE estado_id = 7 AND ubicacion_id = (SELECT id FROM pmp.ubicaciones WHERE tipo::text = 'BODEGA'))::int AS bodega_validas,
  COUNT(*) FILTER (WHERE estado_id = 4 AND ubicacion_id = (SELECT id FROM pmp.ubicaciones WHERE tipo::text = 'LABORATORIO'))::int AS laboratorio_validas,
  COUNT(*) FILTER (WHERE estado_id = 6 AND ubicacion_id = (SELECT id FROM pmp.ubicaciones WHERE tipo::text = 'QA'))::int AS qa_validas
FROM pmp.ordenes_servicio;

\echo '=== VALIDACIÓN DE HUÉRFANOS ==='
SELECT
  COUNT(*) FILTER (WHERE o.tipo_equipo = 'VALIDADOR' AND v.serie IS NULL)::int AS validadores_huerfanos,
  COUNT(*) FILTER (WHERE o.tipo_equipo = 'CONSOLA' AND c.serie IS NULL)::int AS consolas_huerfanas
FROM pmp.ordenes_servicio o
LEFT JOIN pmp.validadores v ON v.serie = o.validador_serie
LEFT JOIN pmp.consolas c ON c.serie = o.consola_serie;

\echo '=== VALIDACIÓN DE AMID ==='
SELECT COUNT(amid)::int AS validadores_con_amid,
       COUNT(DISTINCT amid)::int AS amid_unicos,
       COUNT(*) FILTER (
         WHERE amid IS NOT NULL
           AND CASE substr(amid, 1, 6)
                 WHEN '280000' THEN '74'
                 WHEN '205000' THEN '72'
               END || substr(amid, 7, 5) = serie
       )::int AS relaciones_serie_amid_validas,
       COUNT(*) FILTER (
         WHERE amid IS NOT NULL
           AND (
             CASE substr(amid, 1, 6)
               WHEN '280000' THEN '74'
               WHEN '205000' THEN '72'
             END || substr(amid, 7, 5)
           ) IS DISTINCT FROM serie
       )::int AS relaciones_serie_amid_invalidas
FROM pmp.validadores;
