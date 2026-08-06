import "dotenv/config";

const JORGE = Object.freeze({
  id: "a13b2073-3b08-4c65-beba-556788995828",
  uid: "Mv16HimaOnPuwU4cPMpiZpvQoNy2",
  email: "jorge.castillo@pmp-suite.cl",
});

const roleArgument = process.argv.find((value) => value.startsWith("--expected-role="));
const expectedRole = roleArgument?.split("=", 2)[1] ?? "gerente";
const allowedRoles = new Set(["admin", "gerente"]);

if (!allowedRoles.has(expectedRole)) {
  console.error("El rol esperado debe ser admin o gerente");
  process.exit(2);
}

const idToken = process.env.JORGE_FIREBASE_ID_TOKEN;
if (!idToken) {
  console.error("Falta JORGE_FIREBASE_ID_TOKEN con un token nuevo de Jorge");
  process.exit(2);
}

const apiBaseUrl = process.env.PMP_API_BASE_URL ?? "http://127.0.0.1:4000";
const { default: admin } = await import("../src/firebase.js");
const { pool } = await import("../src/db.js");

try {
  const [pgResult, firebaseUser, meResponse] = await Promise.all([
    pool.query(
      `
        SELECT id, correo, rol, activo, firebase_uid
        FROM pmp.usuarios
        WHERE id = $1::uuid
      `,
      [JORGE.id],
    ),
    admin.auth().getUser(JORGE.uid),
    fetch(`${apiBaseUrl}/api/auth/me`, {
      headers: { authorization: `Bearer ${idToken}` },
    }),
  ]);

  const meBody = await meResponse.json();
  const me = meBody?.user ?? meBody;
  const pg = pgResult.rows[0];
  const customClaims = firebaseUser.customClaims ?? {};

  const checks = {
    postgresqlRow: pgResult.rowCount === 1,
    postgresqlIdentity:
      pg?.id === JORGE.id &&
      pg?.correo?.toLowerCase() === JORGE.email &&
      pg?.firebase_uid === JORGE.uid,
    postgresqlRole: pg?.rol === expectedRole,
    postgresqlActive: pg?.activo === true,
    firebaseIdentity:
      firebaseUser.uid === JORGE.uid &&
      firebaseUser.email?.toLowerCase() === JORGE.email,
    firebaseEnabled: firebaseUser.disabled === false,
    firebaseRoleClaim: customClaims.rol === expectedRole,
    authMeHttp: meResponse.status === 200,
    authMeIdentity:
      me?.id === JORGE.id &&
      (me?.correo ?? me?.email)?.toLowerCase() === JORGE.email,
    authMeRole: me?.rol === expectedRole,
    authMeActive: me?.activo === true,
  };

  const consistent = Object.values(checks).every(Boolean);
  console.log(
    JSON.stringify(
      {
        expectedRole,
        postgresql: pg
          ? { id: pg.id, email: pg.correo, role: pg.rol, active: pg.activo, uid: pg.firebase_uid }
          : null,
        firebase: {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? null,
          disabled: firebaseUser.disabled,
          customClaimNames: Object.keys(customClaims).sort(),
          roleClaim: customClaims.rol ?? null,
        },
        authMe: {
          status: meResponse.status,
          id: me?.id ?? null,
          email: me?.correo ?? me?.email ?? null,
          role: me?.rol ?? null,
          active: me?.activo ?? null,
        },
        checks,
        consistent,
        tokenExposed: false,
      },
      null,
      2,
    ),
  );

  if (!consistent) process.exitCode = 1;
} catch (error) {
  console.error(
    JSON.stringify(
      { error: error?.message ?? String(error), tokenExposed: false, secretExposed: false },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
