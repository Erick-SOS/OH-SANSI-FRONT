// src/api/authStorage.ts
export type Rol = "ADMINISTRADOR" | "EVALUADOR" | "RESPONSABLE";

export interface AuthUser {
  id: number;
  correo: string;
  nombreCompleto: string;
  rol: Rol;
}

const K_TOKEN = "ohsansi/auth/token";
const K_USER  = "ohsansi/auth/user";
const K_EXP   = "ohsansi/auth/expAt"; 

function decodeJwtExpSeconds(t: string): number | null {
  try {
    const [, payload] = t.split(".");
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json?.exp === "number" ? json.exp : null; // segundos UNIX
  } catch {
    return null;
  }
}


export function saveAuth(token: string, user: AuthUser, expiresInSeconds?: number) {
  localStorage.setItem(K_TOKEN, token);
  localStorage.setItem(K_USER, JSON.stringify(user));

  const jwtExpSec = decodeJwtExpSeconds(token);
  const expMs = jwtExpSec
    ? jwtExpSec * 1000
    : Date.now() + (typeof expiresInSeconds === "number" ? expiresInSeconds : 7200) * 1000;

  localStorage.setItem(K_EXP, String(expMs));
}

export function getToken(): string | null {
  return localStorage.getItem(K_TOKEN);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(K_USER);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

export function getExpAtMs(): number | null {
  const raw = localStorage.getItem(K_EXP);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function isExpired(leewaySeconds = 30): boolean {
  const expMs = getExpAtMs();
  if (!expMs) return false; 
  return Date.now() >= (expMs - leewaySeconds * 1000);
}

export function clearAuth() {
  localStorage.removeItem(K_TOKEN);
  localStorage.removeItem(K_USER);
  localStorage.removeItem(K_EXP);
}

export function isLoggedIn() {
  const t = getToken();
  return !!t && !isExpired();
}

export function roleLabel(rol?: Rol) {
  switch (rol) {
    case "ADMINISTRADOR": return "Administrador";
    case "EVALUADOR":     return "Evaluador";
    case "RESPONSABLE":   return "Responsable";
    default:              return "";
  }
}

export function authHeader(): Record<string, string> {
  const t = getToken();
  if (!t) return {};
  if (isExpired()) return {};
  return { Authorization: `Bearer ${t}` };
}
