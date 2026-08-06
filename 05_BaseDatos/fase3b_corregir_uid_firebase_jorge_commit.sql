-- PMP Suite - Fase 3B
-- Correccion definitiva del firebase_uid de Jorge Castillo.
-- UID anterior (cuenta Firebase eliminada): 8DAh0bIjlMQTL5tVG4tqsMlvcBm2
-- UID actual (cuenta Firebase recreada): Mv16HimaOnPuwU4cPMpiZpvQoNy2

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Estado previo esperado.
SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id IN (
  'a13b2073-3b08-4c65-beba-556788995828'::uuid,
  'f2637d04-9fc7-49b1-9f34-2e4050e24390'::uuid
)
ORDER BY correo;

DO $$
DECLARE
  v_email_count integer;
  v_jorge_count integer;
  v_rafael_count integer;
  v_old_uid_other_count integer;
  v_new_uid_count integer;
  v_updated integer;
BEGIN
  SELECT COUNT(*)::int
  INTO v_email_count
  FROM pmp.usuarios
  WHERE lower(correo) = 'jorge.castillo@pmp-suite.cl';

  IF v_email_count <> 1 THEN
    RAISE EXCEPTION 'Correccion cancelada: existen % filas para el correo de Jorge', v_email_count;
  END IF;

  SELECT COUNT(*)::int
  INTO v_jorge_count
  FROM pmp.usuarios
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND nombre = 'Jorge'
    AND apellido = 'Castillo'
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = '8DAh0bIjlMQTL5tVG4tqsMlvcBm2';

  IF v_jorge_count <> 1 THEN
    RAISE EXCEPTION 'Correccion cancelada: Jorge no coincide exactamente con el admin activo y UID anterior esperados';
  END IF;

  SELECT COUNT(*)::int
  INTO v_rafael_count
  FROM pmp.usuarios
  WHERE id = 'f2637d04-9fc7-49b1-9f34-2e4050e24390'::uuid
    AND nombre = 'Rafael'
    AND apellido = 'Oteiza'
    AND lower(correo) = 'rafael.oteiza@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE;

  IF v_rafael_count <> 1 THEN
    RAISE EXCEPTION 'Correccion cancelada: Rafael no coincide exactamente con el admin activo esperado';
  END IF;

  SELECT COUNT(*)::int
  INTO v_old_uid_other_count
  FROM pmp.usuarios
  WHERE firebase_uid = '8DAh0bIjlMQTL5tVG4tqsMlvcBm2'
    AND id <> 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

  IF v_old_uid_other_count <> 0 THEN
    RAISE EXCEPTION 'Correccion cancelada: el UID anterior esta asociado a % usuarios distintos de Jorge', v_old_uid_other_count;
  END IF;

  SELECT COUNT(*)::int
  INTO v_new_uid_count
  FROM pmp.usuarios
  WHERE firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  IF v_new_uid_count <> 0 THEN
    RAISE EXCEPTION 'Correccion cancelada: el UID nuevo ya esta asignado a % usuarios', v_new_uid_count;
  END IF;

  UPDATE pmp.usuarios
  SET firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2'
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = '8DAh0bIjlMQTL5tVG4tqsMlvcBm2';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'Correccion cancelada: se esperaba 1 fila y se afectaron %', v_updated;
  END IF;
END $$;

-- Comprobacion posterior obligatoria dentro de la misma transaccion.
DO $$
DECLARE
  v_jorge_after_count integer;
  v_rafael_after_count integer;
  v_old_uid_after_count integer;
  v_new_uid_after_count integer;
BEGIN
  SELECT COUNT(*)::int
  INTO v_jorge_after_count
  FROM pmp.usuarios
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND nombre = 'Jorge'
    AND apellido = 'Castillo'
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  SELECT COUNT(*)::int
  INTO v_rafael_after_count
  FROM pmp.usuarios
  WHERE id = 'f2637d04-9fc7-49b1-9f34-2e4050e24390'::uuid
    AND nombre = 'Rafael'
    AND apellido = 'Oteiza'
    AND lower(correo) = 'rafael.oteiza@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE;

  SELECT COUNT(*)::int
  INTO v_old_uid_after_count
  FROM pmp.usuarios
  WHERE firebase_uid = '8DAh0bIjlMQTL5tVG4tqsMlvcBm2';

  SELECT COUNT(*)::int
  INTO v_new_uid_after_count
  FROM pmp.usuarios
  WHERE firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  IF v_jorge_after_count <> 1
     OR v_rafael_after_count <> 1
     OR v_old_uid_after_count <> 0
     OR v_new_uid_after_count <> 1 THEN
    RAISE EXCEPTION
      'Validacion posterior fallida: Jorge=%, Rafael=%, UID anterior=%, UID nuevo=%',
      v_jorge_after_count,
      v_rafael_after_count,
      v_old_uid_after_count,
      v_new_uid_after_count;
  END IF;
END $$;

SELECT
  u.id,
  u.nombre,
  u.apellido,
  u.correo,
  u.rol,
  u.activo,
  u.firebase_uid,
  (SELECT COUNT(*)::int FROM pmp.usuarios WHERE firebase_uid = '8DAh0bIjlMQTL5tVG4tqsMlvcBm2') AS uid_antiguo_total,
  (SELECT COUNT(*)::int FROM pmp.usuarios WHERE firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2') AS uid_nuevo_total,
  (SELECT COUNT(*)::int FROM pmp.usuarios) AS usuarios_totales
FROM pmp.usuarios u
WHERE u.id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

COMMIT;
