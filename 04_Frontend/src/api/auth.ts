import { signInWithEmailAndPassword } from "firebase/auth";
import { fbAuth } from "../app/firebase";
import { api } from "./http";

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string };

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const cred = await signInWithEmailAndPassword(fbAuth, req.email, req.password);
  const token = await cred.user.getIdToken(); // Firebase ID Token
  return { token };
}

export async function requestSelfResetPasswordLink(): Promise<{ link?: string }> {
  const { data } = await api.post("/api/auth/reset-password-link");
  return data;
}

// preferido para /api/auth/my/reset-password-link si existe
export async function authMyResetPasswordLink(): Promise<{ link?: string }> {
  const { data } = await api.post("/api/auth/my/reset-password-link");
  return data;
}

export async function changeMyPassword(password: string): Promise<{ ok?: boolean }> {
  const { data } = await api.post("/api/auth/password", { password });
  return data;
}

export async function authResetPasswordLink(): Promise<{ link?: string }> {
  const { data } = await api.post("/api/auth/reset-password-link");
  return data;
}
