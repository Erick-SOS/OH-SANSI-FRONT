import { apiFetch } from "./client";

export interface Nivel {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado?: boolean;
}

let nivelesCache: Nivel[] | null = null;

export async function getNiveles(forceRefresh = false): Promise<Nivel[]> {
  if (!forceRefresh && nivelesCache) {
    return nivelesCache;
  }
  
  const niveles = await apiFetch("/api/niveles", { method: "GET" });
  nivelesCache = niveles;
  return niveles;
}

export async function createNivel(payload: Omit<Nivel, "id" | "estado">): Promise<Nivel> {
  const nuevoNivel = await apiFetch("/api/niveles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  
  nivelesCache = null;
  return nuevoNivel;
}

export async function updateNivel(id: number, payload: Omit<Nivel, "id" | "estado">): Promise<Nivel> {
  const nivelActualizado = await apiFetch(`/api/niveles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  
  nivelesCache = null;
  return nivelActualizado;
}

export async function deleteNivel(id: number): Promise<{ mensaje: string; nivel: Nivel }> {
  const resultado = await apiFetch(`/api/niveles/${id}`, { method: "DELETE" });
  
  nivelesCache = null;
  return resultado;
}

export function clearNivelesCache(): void {
  nivelesCache = null;
}