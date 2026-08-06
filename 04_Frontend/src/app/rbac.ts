export const ROLES = {
  ADMIN: "admin",
  GERENTE: "gerente",
  LOGISTICA: "logistica",
  QA: "qa",
  TECNICO_LABORATORIO: "tecnico_laboratorio",
  TECNICO_TERRENO: "tecnico_terreno"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  OS_VIEW: "os:view",
  OS_CREATE: "os:create",
  OS_UPDATE: "os:update",
  EQUIPOS_VIEW: "equipos:view",
  LAB_VIEW: "lab:view",
  LAB_WRITE: "lab:write",
  LAB_ASSIGN: "lab:assign",
  LAB_DISPATCH: "lab:dispatch",
  QA_VIEW: "qa:view",
  QA_WRITE: "qa:write",
  BODEGA_VIEW: "bodega:view",
  BODEGA_WRITE: "bodega:write",
  USERS_VIEW: "users:view",
  USERS_WRITE: "users:write",
  REPORTS_VIEW: "reports:view",
  TRACE_VIEW: "trace:view",
  AI_VIEW: "ai:view",
  DISPATCH_VIEW: "dispatch:view",
  DISPATCH_WRITE: "dispatch:write",
  SETTINGS_VIEW: "settings:view",
  OWN_PASSWORD_UPDATE: "own-password:update"
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type RbacUser = {
  rol?: string | null;
  roles?: string[] | null;
} | null | undefined;

const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

const ROLE_PERMISSIONS: Readonly<Record<Role, ReadonlySet<Permission>>> = {
  [ROLES.ADMIN]: new Set(ALL_PERMISSIONS),
  [ROLES.GERENTE]: new Set([
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.OS_VIEW,
    PERMISSIONS.EQUIPOS_VIEW,
    PERMISSIONS.LAB_VIEW,
    PERMISSIONS.QA_VIEW,
    PERMISSIONS.BODEGA_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.TRACE_VIEW,
    PERMISSIONS.AI_VIEW,
    PERMISSIONS.DISPATCH_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.OWN_PASSWORD_UPDATE
  ]),
  [ROLES.LOGISTICA]: new Set([
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.EQUIPOS_VIEW,
    PERMISSIONS.BODEGA_VIEW,
    PERMISSIONS.BODEGA_WRITE,
    PERMISSIONS.TRACE_VIEW,
    PERMISSIONS.AI_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.OWN_PASSWORD_UPDATE
  ]),
  [ROLES.QA]: new Set([
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.QA_VIEW,
    PERMISSIONS.QA_WRITE,
    PERMISSIONS.AI_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.OWN_PASSWORD_UPDATE
  ]),
  [ROLES.TECNICO_LABORATORIO]: new Set([
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.LAB_VIEW,
    PERMISSIONS.LAB_WRITE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.OWN_PASSWORD_UPDATE
  ]),
  [ROLES.TECNICO_TERRENO]: new Set([
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.OS_CREATE,
    PERMISSIONS.OS_UPDATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.OWN_PASSWORD_UPDATE
  ])
};

export function isOfficialRole(value: unknown): value is Role {
  return typeof value === "string" && Object.values(ROLES).includes(value as Role);
}

export function getUserRole(user: RbacUser): Role | null {
  const candidate = user?.rol ?? user?.roles?.[0];
  return isOfficialRole(candidate) ? candidate : null;
}

export function hasPermission(user: RbacUser, permission: Permission): boolean {
  const role = getUserRole(user);
  return role ? ROLE_PERMISSIONS[role].has(permission) : false;
}

export const can = hasPermission;

export function isReadOnlyRole(user: RbacUser): boolean {
  return getUserRole(user) === ROLES.GERENTE;
}

export function getPermissionsForRole(role: unknown): readonly Permission[] {
  return isOfficialRole(role) ? [...ROLE_PERMISSIONS[role]] : [];
}
