import "dotenv/config";

const JORGE = Object.freeze({
  id: "a13b2073-3b08-4c65-beba-556788995828",
  uid: "Mv16HimaOnPuwU4cPMpiZpvQoNy2",
  email: "jorge.castillo@pmp-suite.cl",
});

const dryRun = process.argv.includes("--dry-run");
const apply = process.argv.includes("--apply");

if (dryRun === apply) {
  console.error("Debe indicar exactamente uno de estos modos: --dry-run o --apply");
  process.exit(2);
}

const { default: admin } = await import("../src/firebase.js");

function validateIdentity(user) {
  const checks = {
    uid: user.uid === JORGE.uid,
    email:
      typeof user.email === "string" &&
      user.email.toLowerCase() === JORGE.email,
    enabled: user.disabled === false,
  };

  if (!Object.values(checks).every(Boolean)) {
    throw new Error(`La identidad Firebase de Jorge no coincide: ${JSON.stringify(checks)}`);
  }

  return checks;
}

let pool;

try {
  const before = await admin.auth().getUser(JORGE.uid);
  const identityChecks = validateIdentity(before);
  const existingClaims = before.customClaims ?? {};
  const resultingClaims = { ...existingClaims, rol: "admin" };

  const report = {
    mode: dryRun ? "dry-run" : "apply",
    uid: before.uid,
    email: before.email,
    disabled: before.disabled,
    identityChecks,
    existingClaimNames: Object.keys(existingClaims).sort(),
    existingRoleClaim: existingClaims.rol ?? null,
    resultingClaimNames: Object.keys(resultingClaims).sort(),
    resultingRoleClaim: resultingClaims.rol,
    claimsPreserved: Object.keys(existingClaims).every(
      (name) => name === "rol" || resultingClaims[name] === existingClaims[name],
    ),
    sourceRoleIsGerente: existingClaims.rol === "gerente",
    writeExecuted: false,
  };

  if (apply) {
    if (existingClaims.rol !== "gerente") {
      throw new Error("Rollback cancelado: el claim actual no es gerente");
    }

    const database = await import("../src/db.js");
    pool = database.pool;
    const pg = await pool.query(
      `
        SELECT id, correo, rol, activo, firebase_uid
        FROM pmp.usuarios
        WHERE id = $1::uuid
          AND lower(correo) = $2
          AND rol = 'admin'
          AND activo IS TRUE
          AND firebase_uid = $3
      `,
      [JORGE.id, JORGE.email, JORGE.uid],
    );

    if (pg.rowCount !== 1) {
      throw new Error("Rollback cancelado: PostgreSQL no confirma a Jorge como admin activo");
    }

    await admin.auth().setCustomUserClaims(JORGE.uid, resultingClaims);
    report.writeExecuted = true;

    const after = await admin.auth().getUser(JORGE.uid);
    validateIdentity(after);
    const appliedClaims = after.customClaims ?? {};
    const preserved = Object.keys(resultingClaims).every(
      (name) => appliedClaims[name] === resultingClaims[name],
    );

    if (appliedClaims.rol !== "admin" || !preserved) {
      throw new Error("La verificacion posterior del claim admin fallo");
    }

    report.appliedClaimNames = Object.keys(appliedClaims).sort();
    report.appliedRoleClaim = appliedClaims.rol;
  }

  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        mode: dryRun ? "dry-run" : "apply",
        error: error?.message ?? String(error),
        tokenExposed: false,
        secretExposed: false,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} finally {
  if (pool) await pool.end();
}
