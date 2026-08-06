-- PMP Suite - Fase 3B
-- Rollback controlado del firebase_uid de Jorge Castillo.
-- UID actual -> UID anterior de la cuenta Firebase eliminada.
-- ADVERTENCIA: el UID anterior pertenece a una cuenta eliminada de Firebase.
-- No ejecutar este rollback en operacion normal; requiere revision y autorizacion explicita.
-- SEGURIDAD: termina siempre en ROLLBACK y no contiene COMMIT.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Estado previo esperado para un rollback futuro.
SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
  AND lower(correo) = 'jorge.castillo@pmp-suite.cl';

DO $$
DECLARE
  v_email_count integer;
  v_jorge_count integer;
  v_new_uid_other_count integer;
  v_old_uid_count integer;
  v_updated integer;
BEGIN
  SELECT COUNT(*)::int
  INTO v_email_count
  FROM pmp.usuarios
  WHERE lower(correo) = 'jorge.castillo@pmp-suite.cl';

  IF v_email_count <> 1 THEN
    RAISE EXCEPTION 'Rollback cancelado: existen % filas para el correo de Jorge', v_email_count;
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
    AND firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  IF v_jorge_count <> 1 THEN
    RAISE EXCEPTION 'Rollback cancelado: Jorge no coincide exactamente con el admin activo y UID nuevo esperados';
  END IF;

  SELECT COUNT(*)::int
  INTO v_new_uid_other_count
  FROM pmp.usuarios
  WHERE firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2'
    AND id <> 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

  IF v_new_uid_other_count <> 0 THEN
    RAISE EXCEPTION 'Rollback cancelado: el UID nuevo esta asociado a % usuarios distintos de Jorge', v_new_uid_other_count;
  END IF;

  SELECT COUNT(*)::int
  INTO v_old_uid_count
  FROM pmp.usuarios
  WHERE firebase_uid = '8DAh0bIjlMQTL5tVG4tqsMlvcBm2';

  IF v_old_uid_count <> 0 THEN
    RAISE EXCEPTION 'Rollback cancelado: el UID anterior ya esta asignado a % usuarios', v_old_uid_count;
  END IF;

  UPDATE pmp.usuarios
  SET firebase_uid = '8DAh0bIjlMQTL5tVG4tqsMlvcBm2'
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND nombre = 'Jorge'
    AND apellido = 'Castillo'
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'Rollback cancelado: se esperaba 1 fila y se afectaron %', v_updated;
  END IF;
END $$;

-- Estado posterior esperado dentro de esta transaccion: Jorge conserva su rol
-- y aparece con el UID anterior.
SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

-- Obligatorio durante la etapa de revision.
ROLLBACK;
