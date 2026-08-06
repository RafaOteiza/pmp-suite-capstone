import { jwtDecode } from "jwt-decode";
import { getToken } from "./token";

export type JwtPayload = {
  id: string;
  nombre?: string;
  email?: string;
  rol?: string;
  exp?: number;
  iat?: number;
};

export function getSession(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload?.exp && Date.now() >= payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getSession());
}
