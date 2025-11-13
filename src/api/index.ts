// src/api/index.ts
import { authHeader, clearAuth, isExpired } from "./authStorage";

export const API_ROOT = "https://back-oh-sansi.vercel.app";
const BASE = `${API_ROOT.replace(/\/$/, "")}/api`;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Options = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;       
  timeoutMs?: number;   
};

function tryParseJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return null; }
}

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {

  if (!opts.token && isExpired()) {
    clearAuth();
    throw new Error("Sesión expirada. Inicie sesión nuevamente.");
  }

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);

  const url = path.startsWith("http")
    ? path
    : `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        ...(opts.headers ?? {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(to);
    const isAbort = (e as { name?: string })?.name === "AbortError";
    throw new Error(isAbort ? "Tiempo de espera agotado." : "No se pudo conectar con el servidor.");
  }

  clearTimeout(to);

  const raw = await res.text();
  const json = tryParseJson(raw) as { ok?: boolean; message?: string; error?: string } | Record<string, unknown> | null;

  if (res.status === 401) {
    clearAuth();
    const msg = (json as { message?: string } | null)?.message ?? "Sesión expirada. Inicie sesión nuevamente.";
    throw new Error(msg);
  }

  if (!res.ok || (json && "ok" in json && (json as { ok?: boolean }).ok === false)) {
    const j = (json as { message?: string; error?: string } | null);
    const msg = j?.message || j?.error || `Error ${res.status}${res.statusText ? ` - ${res.statusText}` : ""}.`;
    throw new Error(msg);
  }

  return (json as unknown as T) ?? (null as unknown as T);
}

/* ====== Atajos HTTP genéricos ====== */
export const http = {
  get:  <T = unknown>(p: string, o?: Omit<Options, "method" | "body">) =>
    api<T>(p, { ...(o ?? {}), method: "GET" }),
  post: <T = unknown>(p: string, body?: unknown, o?: Omit<Options, "method" | "body">) =>
    api<T>(p, { ...(o ?? {}), method: "POST", body }),
  put:  <T = unknown>(p: string, body?: unknown, o?: Omit<Options, "method" | "body">) =>
    api<T>(p, { ...(o ?? {}), method: "PUT", body }),
  patch:<T = unknown>(p: string, body?: unknown, o?: Omit<Options, "method" | "body">) =>
    api<T>(p, { ...(o ?? {}), method: "PATCH", body }),
  del:  <T = unknown>(p: string, o?: Omit<Options, "method" | "body">) =>
    api<T>(p, { ...(o ?? {}), method: "DELETE" }),
};
