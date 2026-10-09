-- PMP Suite - Fase 3D
-- Migracion definitiva y controlada de Jorge Castillo: admin -> gerente.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Impide escrituras concurrentes en usuarios durante las validaciones.
LOCK TABLE pmp.usuarios IN SHARE ROW EXCLUSIVE MODE;

-- Bloqueo explicito de la fila autorizada.
SELECT id, nombre, apellido, correo, rol, activo, firebase_uid
FROM pmp.usuarios
WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
FOR UPDATE;

DO $$
DECLARE
  v_jorge_before_count integer;
  v_rafael_before_count integer;
  v_user_count_before integer;
  v_user_count_after integer;
  v_other_users_hash_before text;
  v_other_users_hash_after text;
  v_jorge_non_role_hash_before text;
  v_jorge_non_role_hash_after text;
  v_jorge_after_count integer;
  v_rafael_after_count integer;
  v_updated integer;
BEGIN
  SELECT COUNT(*)::int
  INTO v_jorge_before_count
  FROM pmp.usuarios
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND nombre = 'Jorge'
    AND apellido = 'Castillo'
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  IF v_jorge_before_count <> 1 THEN
    RAISE EXCEPTION 'Migracion cancelada: Jorge no coincide con el admin activo y UID vigente esperados';
  END IF;

  SELECT COUNT(*)::int
  INTO v_rafael_before_count
  FROM pmp.usuarios
  WHERE id = 'f2637d04-9fc7-49b1-9f34-2e4050e24390'::uuid
    AND nombre = 'Rafael'
    AND apellido = 'Oteiza'
    AND lower(correo) = 'rafael.oteiza@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = '2jkaNUoEXjQMzB0uhTd86uQtuiE2';

  IF v_rafael_before_count <> 1 THEN
    RAISE EXCEPTION 'Migracion cancelada: Rafael no coincide con el admin activo esperado';
  END IF;

  SELECT COUNT(*)::int
  INTO v_user_count_before
  FROM pmp.usuarios;

  SELECT md5(COALESCE(string_agg(to_jsonb(u)::text, '|' ORDER BY u.id::text), ''))
  INTO v_other_users_hash_before
  FROM pmp.usuarios u
  WHERE u.id <> 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

  SELECT md5((to_jsonb(u) - 'rol')::text)
  INTO v_jorge_non_role_hash_before
  FROM pmp.usuarios u
  WHERE u.id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

  UPDATE pmp.usuarios
  SET rol = 'gerente'
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND rol = 'admin'
    AND activo IS TRUE
    AND firebase_uid = 'Mv16HimaOnPuwU4cPMpiZpvQoNy2';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'Migracion cancelada: se esperaba 1 fila y se afectaron %', v_updated;
  END IF;

  SELECT COUNT(*)::int
  INTO v_jorge_after_count
  FROM pmp.usuarios
  WHERE id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid
    AND nombre = 'Jorge'
    AND apellido = 'Castillo'
    AND lower(correo) = 'jorge.castillo@pmp-suite.cl'
    AND rol = 'gerente'
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
    AND activo IS TRUE
    AND firebase_uid = '2jkaNUoEXjQMzB0uhTd86uQtuiE2';

  SELECT COUNT(*)::int
  INTO v_user_count_after
  FROM pmp.usuarios;

  SELECT md5(COALESCE(string_agg(to_jsonb(u)::text, '|' ORDER BY u.id::text), ''))
  INTO v_other_users_hash_after
  FROM pmp.usuarios u
  WHERE u.id <> 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

  SELECT md5((to_jsonb(u) - 'rol')::text)
  INTO v_jorge_non_role_hash_after
  FROM pmp.usuarios u
  WHERE u.id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

  IF v_jorge_after_count <> 1
     OR v_rafael_after_count <> 1
     OR v_user_count_after <> v_user_count_before
     OR v_other_users_hash_after IS DISTINCT FROM v_other_users_hash_before
     OR v_jorge_non_role_hash_after IS DISTINCT FROM v_jorge_non_role_hash_before THEN
    RAISE EXCEPTION
      'Validacion posterior fallida: Jorge=%, Rafael=%, usuarios antes=%, usuarios despues=%',
      v_jorge_after_count,
      v_rafael_after_count,
      v_user_count_before,
      v_user_count_after;
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
  (SELECT COUNT(*)::int FROM pmp.usuarios) AS usuarios_totales,
  (SELECT rol FROM pmp.usuarios WHERE id = 'f2637d04-9fc7-49b1-9f34-2e4050e24390'::uuid) AS rol_rafael
FROM pmp.usuarios u
WHERE u.id = 'a13b2073-3b08-4c65-beba-556788995828'::uuid;

COMMIT;
