-- PMP Suite - Fase 3
-- Rollback controlado: Jorge Castillo gerente -> admin.
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
  v_duplicate_email_count integer;
  v_updated integer;
BEGIN
  SELECT COUNT(*)::int
  INTO v_duplicate_email_count
  FROM pmp.usuarios
  WHERE lower(correo) = 'jorge.castillo@pmp-suite.cl';

  IF v_duplicate_email_count <> 1 THEN
    RAISE EXCEPTION 'Rollback cancelado: existen % filas para el correo de Jorge', v_duplicate_email_count;
  END IF;

  UPDATE pmp.usuarios
  SET rol = 'admin'
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND nombre = 'Jorge'
    AND apellido = 'Castillo'
    AND rol = 'gerente'
    AND activo IS TRUE
    AND firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'Rollback cancelado: se esperaba 1 fila y se afectaron %', v_updated;
  END IF;
END $$;

-- Estado posterior esperado dentro de esta transaccion: Jorge aparece como admin.
SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

-- Obligatorio durante la etapa de revision.
ROLLBACK;
