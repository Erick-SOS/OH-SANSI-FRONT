// api/authStorage.ts
export type Rol = "ADMINISTRADOR" | "EVALUADOR" | "RESPONSABLE";

export interface AuthUser {
  id: number;
  correo: string;
  nombreCompleto: string;
  rol: Rol;
}

const K_TOKEN = "ohsansi/auth/token";
const K_USER  = "ohsansi/auth/user";

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(K_TOKEN, token);
  localStorage.setItem(K_USER, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(K_TOKEN);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(K_USER);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem(K_TOKEN);
  localStorage.removeItem(K_USER);
}

export function isLoggedIn() {
  return !!getToken();
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
  return t ? { Authorization: `Bearer ${t}` } : {};
}
