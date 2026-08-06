-- PMP Suite - Fase 3B
-- Vista previa transaccional: corregir el firebase_uid de Jorge Castillo.
-- UID anterior (cuenta Firebase eliminada): 8DAh0bIjlMQTL5tVG4tqsMlvcBm2
-- UID actual (cuenta Firebase recreada): Mv16HimaOnPuwU4cPMpiZpvQoNy2
-- SEGURIDAD: termina siempre en ROLLBACK y no contiene COMMIT.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Estado previo esperado: Jorge continúa activo, como admin y con el UID anterior.
SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
  AND lower(correo) = 'jorge.castillo@pmp-suite.cl';

DO $$
DECLARE
  v_email_count integer;
  v_jorge_count integer;
  v_old_uid_count integer;
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
  INTO v_old_uid_count
  FROM pmp.usuarios
  WHERE firebase_uid = '8DAh0bIjlMQTL5tVG4tqsMlvcBm2'
    AND id <> 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

  IF v_old_uid_count <> 0 THEN
    RAISE EXCEPTION 'Correccion cancelada: el UID anterior esta asociado a % usuarios distintos de Jorge', v_old_uid_count;
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
    AND nombre = 'Jorge'
    AND apellido = 'Castillo'
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = '8DAh0bIjlMQTL5tVG4tqsMlvcBm2';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'Correccion cancelada: se esperaba 1 fila y se afectaron %', v_updated;
  END IF;
END $$;

-- Estado posterior esperado dentro de esta transaccion: Jorge conserva su rol
-- y aparece con el UID actual de Firebase.
SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

-- Obligatorio durante la etapa de revision.
ROLLBACK;
