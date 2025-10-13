import { apiFetch } from "./client";

export interface Area {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado?: boolean;
}

// Cache simple en memoria
let areasCache: Area[] | null = null;

export async function getAreas(forceRefresh = false): Promise<Area[]> {
  if (!forceRefresh && areasCache) {
    return areasCache;
  }
  
  const areas = await apiFetch("/api/areas", { method: "GET" });
  areasCache = areas;
  return areas;
}

export async function createArea(payload: Omit<Area, "id" | "estado">): Promise<Area> {
  const nuevaArea = await apiFetch("/api/areas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  
  // Invalidar cache
  areasCache = null;
  return nuevaArea;
}

export async function updateArea(id: number, payload: Omit<Area, "id" | "estado">): Promise<Area> {
  const areaActualizada = await apiFetch(`/api/areas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  
  areasCache = null;
  return areaActualizada;
}

export async function deleteArea(id: number): Promise<{ mensaje: string; area: Area }> {
  const resultado = await apiFetch(`/api/areas/${id}`, { method: "DELETE" });
  
  areasCache = null;
  return resultado;
}

// Función para limpiar cache manualmente
export function clearAreasCache(): void {
  areasCache = null;
}

