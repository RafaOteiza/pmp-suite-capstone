import axios from "axios";
import { getToken, clearToken } from "../app/token";
import { getApiErrorMessage, isReadOnlyRoleError, READ_ONLY_DENIED_EVENT, SESSION_INVALIDATED_EVENT } from "./errors";

// Compat: VITE_CORE_URL (nuevo) o VITE_API_URL (legacy)
const CORE_BASE =
  import.meta.env.VITE_CORE_URL ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:4000";

export const coreApi = axios.create({
  baseURL: CORE_BASE,
  timeout: 30000
});

// alias cómodo
export const api = coreApi;

// Interceptor JWT seguro
coreApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401, limpias sesión
coreApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
    }
    if (isReadOnlyRoleError(err) && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(READ_ONLY_DENIED_EVENT, {
        detail: { message: getApiErrorMessage(err) }
      }));
    }
    return Promise.reject(err);
  }
);
