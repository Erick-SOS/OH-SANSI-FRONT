import { apiFetch } from "./client";

export interface Nivel {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado?: boolean;
}

// 🟢 Obtener todos los niveles
export async function getNiveles(): Promise<Nivel[]> {
  return apiFetch("/api/niveles", { method: "GET" });
}

// 🟢 Crear un nuevo nivel
export async function createNivel(payload: Omit<Nivel, "id" | "estado">): Promise<Nivel> {
  return apiFetch("/api/niveles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 🟢 Actualizar un nivel existente
export async function updateNivel(id: number, payload: Omit<Nivel, "id" | "estado">): Promise<Nivel> {
  return apiFetch(`/api/niveles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 🟢 Eliminar (desactivar) un nivel
export async function deleteNivel(id: number): Promise<{ mensaje: string; nivel: Nivel }> {
  return apiFetch(`/api/niveles/${id}`, { method: "DELETE" });
}
