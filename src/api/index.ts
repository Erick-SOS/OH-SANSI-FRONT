// src/api/index.ts

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  headers?: Record<string, string>;
  token?: string;
  timeoutMs?: number;
};

export const API_ROOT = "https://back-oh-sansi.vercel.app";
const BASE = `${API_ROOT.replace(/\/$/, "")}/api`;

export async function api(path: string, opts: Options = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);

  const url = path.startsWith("http")
    ? path
    : `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.headers ?? {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: controller.signal,
  }).catch(() => {
    clearTimeout(t);
    throw new Error("No se pudo conectar con el servidor.");
  });

  clearTimeout(t);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // puede venir sin body
  }

  if (!res.ok || json?.ok === false) {
    const msg =
      json?.message ||
      json?.mensaje ||
      json?.error ||
      json?.err ||
      "Ocurrió un error inesperado.";
    throw new Error(msg);
  }

  return json;
}
