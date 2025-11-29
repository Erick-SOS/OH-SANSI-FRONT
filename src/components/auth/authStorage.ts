// src/components/auth/authStorage.ts

// === Tipos de rol iguales al backend ===
export type Rol = "ADMINISTRADOR" | "EVALUADOR" | "RESPONSABLE";

// Lo que guarda el front en localStorage (mismo shape que AuthTokenPayload del back)
export interface AuthUser {
    idUser: number;        // id usuario
    jti: string;           // id de sesión
    nombreCompleto: string;
    rol: Rol;
    correo: string;
}

// Claves en localStorage
const K_TOKEN = "ohsansi/auth/token";
const K_USER = "ohsansi/auth/user";

// Helper: verificar que estamos en navegador
const hasWindow =
    typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function safeSetItem(key: string, value: string) {
    if (!hasWindow) return;
    try {
        window.localStorage.setItem(key, value);
    } catch (err) {
        console.error("Error guardando en localStorage:", err);
    }
}

function safeGetItem(key: string): string | null {
    if (!hasWindow) return null;
    try {
        return window.localStorage.getItem(key);
    } catch (err) {
        console.error("Error leyendo de localStorage:", err);
        return null;
    }
}

function safeRemoveItem(key: string) {
    if (!hasWindow) return;
    try {
        window.localStorage.removeItem(key);
    } catch (err) {
        console.error("Error eliminando de localStorage:", err);
    }
}

// Type guard básico por si el JSON está corrupto
function isAuthUser(x: unknown): x is AuthUser {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;

    const validRol =
        o.rol === "ADMINISTRADOR" ||
        o.rol === "EVALUADOR" ||
        o.rol === "RESPONSABLE";

    return (
        typeof o.idUser === "number" &&
        typeof o.jti === "string" &&
        typeof o.nombreCompleto === "string" &&
        typeof o.correo === "string" &&
        validRol
    );
}

/**
 * Guarda token y usuario autenticado en localStorage.
 * Mantiene la API async para que sea similar al de React Native.
 */
export async function saveAuth(token: string, user: AuthUser): Promise<void> {
    safeSetItem(K_TOKEN, token);
    safeSetItem(K_USER, JSON.stringify(user));
}

/** Devuelve el token JWT almacenado o null si no hay. */
export async function getToken(): Promise<string | null> {
    return safeGetItem(K_TOKEN);
}

/** Devuelve el usuario autenticado o null si no hay / está corrupto. */
export async function getUser(): Promise<AuthUser | null> {
    const str = safeGetItem(K_USER);
    if (!str) return null;

    try {
        const parsed = JSON.parse(str);
        return isAuthUser(parsed) ? parsed : null;
    } catch {
        console.warn("authStorage: user inválido en localStorage, limpiando…");
        safeRemoveItem(K_USER);
        return null;
    }
}

/** Limpia token y user de localStorage (logout). */
export async function clearAuth(): Promise<void> {
    safeRemoveItem(K_TOKEN);
    safeRemoveItem(K_USER);
}

/** Etiqueta legible para mostrar el rol en UI. */
export function roleLabel(rol?: Rol): string {
    switch (rol) {
        case "ADMINISTRADOR":
            return "Administrador";
        case "EVALUADOR":
            return "Evaluador";
        case "RESPONSABLE":
            return "Responsable";
        default:
            return "";
    }
}
