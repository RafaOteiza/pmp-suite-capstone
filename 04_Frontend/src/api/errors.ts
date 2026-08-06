export const READ_ONLY_ROLE = "READ_ONLY_ROLE";
export const READ_ONLY_ROLE_MESSAGE = "El rol gerente posee acceso de solo lectura";
export const READ_ONLY_DENIED_EVENT = "pmp:read-only-denied";
export const SESSION_INVALIDATED_EVENT = "pmp:session-invalidated";

type ApiErrorLike = {
  response?: {
    data?: {
      error?: unknown;
      message?: unknown;
      detail?: unknown;
    };
  };
  message?: unknown;
};

export function isReadOnlyRoleError(error: unknown): boolean {
  return (error as ApiErrorLike)?.response?.data?.error === READ_ONLY_ROLE;
}

export function getApiErrorMessage(error: unknown, fallback = "No se pudo completar la operación"): string {
  const candidate = error as ApiErrorLike;
  const data = candidate?.response?.data;
  if (data?.error === READ_ONLY_ROLE) {
    return typeof data.message === "string" && data.message.trim()
      ? data.message
      : READ_ONLY_ROLE_MESSAGE;
  }

  for (const value of [data?.message, data?.detail, data?.error, candidate?.message]) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
}
