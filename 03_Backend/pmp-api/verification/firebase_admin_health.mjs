import "dotenv/config";

const { default: admin } = await import("../src/firebase.js");

const expectedUsers = [
  {
    label: "Rafael Oteiza",
    uid: "2jkaNUoEXjQMzB0uhTd86uQtuiE2",
    email: "rafael.oteiza@pmp-suite.cl",
    disabled: false,
  },
  {
    label: "Jorge Castillo",
    uid: "Mv16HimaOnPuwU4cPMpiZpvQoNy2",
    email: "jorge.castillo@pmp-suite.cl",
    disabled: false,
  },
];

const report = [];
let inconsistent = false;

for (const expected of expectedUsers) {
  try {
    const user = await admin.auth().getUser(expected.uid);
    const checks = {
      uid: user.uid === expected.uid,
      email:
        typeof user.email === "string" &&
        user.email.toLowerCase() === expected.email,
      disabled: user.disabled === expected.disabled,
    };

    if (!Object.values(checks).every(Boolean)) inconsistent = true;

    const customClaims = user.customClaims ?? {};

    report.push({
      user: expected.label,
      uid: user.uid,
      email: user.email ?? null,
      disabled: user.disabled,
      customClaimNames: Object.keys(customClaims).sort(),
      roleClaim: customClaims.rol ?? null,
      checks,
    });
  } catch (error) {
    inconsistent = true;
    report.push({
      user: expected.label,
      uid: expected.uid,
      error: {
        code: error?.code ?? "UNKNOWN_ERROR",
        message: error?.message ?? String(error),
      },
    });
  }
}

console.log(
  JSON.stringify(
    {
      check: "firebase-admin-read-only",
      users: report,
      consistent: !inconsistent,
    },
    null,
    2,
  ),
);

if (inconsistent) process.exitCode = 1;
