import { apiFetch } from "./client";

export interface Area {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado?: boolean;
}

// 🟢 Obtener todas las áreas
export async function getAreas(): Promise<Area[]> {
  return apiFetch("/api/areas", { method: "GET" });
}

// 🟢 Crear nueva área
export async function createArea(payload: Omit<Area, "id" | "estado">): Promise<Area> {
  return apiFetch("/api/areas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 🟢 Actualizar un área existente
export async function updateArea(id: number, payload: Omit<Area, "id" | "estado">): Promise<Area> {
  return apiFetch(`/api/areas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 🟢 Eliminar (desactivar) un área
export async function deleteArea(id: number): Promise<{ mensaje: string; area: Area }> {
  return apiFetch(`/api/areas/${id}`, { method: "DELETE" });
}
