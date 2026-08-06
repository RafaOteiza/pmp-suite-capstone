import { ROLES } from "../constants/roles.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const MANAGER_SELF_SERVICE_WRITES = new Set([
  "POST /api/auth/password",
  "POST /api/auth/reset-password-link",
  "POST /api/auth/my/reset-password-link"
]);

function requestPath(req) {
  const path = `${req.baseUrl || ""}${req.path || ""}`.replace(/\/+$/, "");
  return path || "/";
}

export function isManagerSelfServiceWrite(req) {
  return MANAGER_SELF_SERVICE_WRITES.has(`${req.method} ${requestPath(req)}`);
}

export function enforceReadOnlyRole(req, res, next) {
  if (req.user?.rol !== ROLES.GERENTE) return next();
  if (SAFE_METHODS.has(req.method)) return next();
  if (isManagerSelfServiceWrite(req)) return next();

  console.warn("[RBAC] Escritura rechazada para rol de solo lectura", {
    role: ROLES.GERENTE,
    method: req.method,
    routeGroup: req.baseUrl || "/",
    timestamp: new Date().toISOString()
  });

  return res.status(403).json({
    error: "READ_ONLY_ROLE",
    message: "El rol gerente posee acceso de solo lectura"
  });
}

