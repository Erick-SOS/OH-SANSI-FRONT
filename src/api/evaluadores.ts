import { apiFetch } from "./client";

export interface RegistroEvaluadorPayload {
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  correo: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  tipo_documento: string;
  numero_documento: string;
  profesion?: string;
  institucion?: string;
  cargo?: string;
  aceptaTerminos?: boolean;
}

export async function registroEvaluador(payload: RegistroEvaluadorPayload) {
  return apiFetch("/api/evaluadores/registro", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}