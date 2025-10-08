/// <reference types="vite/client" />

/**
 * client.ts
 * Wrapper para llamadas API usando la base URL configurada en Vite (.env VITE_API_BASE_URL).
 * Evita usar process.env en código del cliente.
 */

const BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL ?? "https://back-oh-sansi.vercel.app";

export interface ApiOptions extends RequestInit {}

export async function apiFetch(path: string, options: ApiOptions = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const res = await fetch(url, { ...options, headers, credentials: options.credentials ?? "same-origin" });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // respuesta no JSON -> ignorar
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || `Error ${res.status}`;
    throw new Error(message);
  }

  return data;
}
