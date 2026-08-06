import { getMe, type Me } from "../api/me";
import { getToken, clearToken } from "./token";

const ME_KEY = "pmp_me_cache";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export type InitialSessionState = {
  status: SessionStatus;
  me: Me | null;
  previewMe: Me | null;
};

export function getCachedMe(): Me | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(ME_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Me;
  } catch {
    localStorage.removeItem(ME_KEY);
    return null;
  }
}

export function setCachedMe(me: Me): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(ME_KEY, JSON.stringify(me));
  }
}

export function clearCachedMe(): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem(ME_KEY);
}

export function getInitialSessionState(token: string | null, cachedMe: Me | null): InitialSessionState {
  return {
    status: token ? "loading" : "unauthenticated",
    me: null,
    previewMe: token ? cachedMe : null
  };
}

export async function loadMeOrNull(): Promise<Me | null> {
  if (!getToken()) {
    clearCachedMe();
    return null;
  }

  try {
    const me = await getMe();
    setCachedMe(me);
    return me;
  } catch {
    clearToken();
    clearCachedMe();
    return null;
  }
}
