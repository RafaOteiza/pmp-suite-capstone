\set ON_ERROR_STOP on

\if :{?PMP_RESET_CONFIRM}
\else
  \echo 'ERROR: falta -v PMP_RESET_CONFIRM=true. No se ejecutó ningún cambio.'
  \quit 3
\endif

\if :PMP_RESET_CONFIRM
\else
  \echo 'ERROR: PMP_RESET_CONFIRM debe ser true. No se ejecutó ningún cambio.'
  \quit 3
\endif

\set PMP_RESET_MODE commit
\echo 'PMP Suite - REINICIO DEFINITIVO DEL DATASET DEMOSTRATIVO'

BEGIN;
\ir reinicio_demo_100_equipos_body.sql
COMMIT;

\echo '=== ESTADO PERSISTENTE DESPUÉS DEL COMMIT ==='
\ir reinicio_demo_100_equipos_validacion.sql
