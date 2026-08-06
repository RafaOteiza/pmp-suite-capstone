-- PMP Suite - Fase 3
-- Vista previa transaccional: Jorge Castillo admin -> gerente.
-- SEGURIDAD: termina siempre en ROLLBACK y no contiene COMMIT.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Estado previo esperado. Estas consultas deben devolver una fila cada una.
SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id = 'f2637d04-9fc7-49b1-9f34-2e4050e24390'::uuid
  AND lower(correo) = 'rafael.oteiza@pmp-suite.cl';

SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
  AND lower(correo) = 'jorge.castillo@pmp-suite.cl';

DO $$
DECLARE
  v_rafael_count integer;
  v_jorge_count integer;
  v_duplicate_email_count integer;
  v_updated integer;
BEGIN
  SELECT COUNT(*)::int
  INTO v_rafael_count
  FROM pmp.usuarios
  WHERE id = 'f2637d04-9fc7-49b1-9f34-2e4050e24390'::uuid
    AND lower(correo) = 'rafael.oteiza@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = '2jkaNUoEXjQMzB0uhTd86uQtuiE2';

  IF v_rafael_count <> 1 THEN
    RAISE EXCEPTION 'Precondicion incumplida: Rafael no coincide exactamente con el admin esperado';
  END IF;

  SELECT COUNT(*)::int
  INTO v_duplicate_email_count
  FROM pmp.usuarios
  WHERE lower(correo) = 'jorge.castillo@pmp-suite.cl';

  IF v_duplicate_email_count <> 1 THEN
    RAISE EXCEPTION 'Precondicion incumplida: existen % filas para el correo de Jorge', v_duplicate_email_count;
  END IF;

  SELECT COUNT(*)::int
  INTO v_jorge_count
  FROM pmp.usuarios
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND nombre = 'Jorge'
    AND apellido = 'Castillo'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  IF v_jorge_count <> 1 THEN
    RAISE EXCEPTION 'Precondicion incumplida: Jorge no coincide exactamente con el admin activo esperado';
  END IF;

  UPDATE pmp.usuarios
  SET rol = 'gerente'
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'Migracion cancelada: se esperaban 1 fila y se afectaron %', v_updated;
  END IF;
END $$;

-- Estado posterior esperado dentro de esta transaccion: Jorge aparece como gerente.
SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

-- Obligatorio durante la etapa de revision.
ROLLBACK;
