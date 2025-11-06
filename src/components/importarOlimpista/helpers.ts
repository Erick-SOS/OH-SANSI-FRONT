import { Olympian } from "./types/olympista";


export const LS_KEY = "olympians:v4";

export function loadFromLS(): Olympian[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Olympian[];
  } catch {
    return null;
  }
}

export function saveToLS(rows: Olympian[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

export function toCSV(rows: Olympian[]): string {
  const headers = [
    "TIPO_PART", "AREA_COD", "AREA_NOM", "NIVEL_COD", "NIVEL_NOM",
    "OLI_TDOC", "OLI_NRODOC", "OLI_NOMBRE", "OLI_AP_PAT", "OLI_AP_MAT",
    "OLI_UNID_EDU", "OLI_DEPTO", "OLI_GRADO", "OLI_F_NAC", "OLI_SEXO",
    "OLI_CORREO", "TUTOR_TDOC", "TUTOR_NRODOC", "TUTOR_NOMBRE",
    "TUTOR_AP_PAT", "TUTOR_AP_MAT", "TUTOR_TEL", "TUTOR_CORREO",
    "TUTOR_UNID_EDU", "TUTOR_PROF", "EQUIPO_NOMBRE", "ROL_EQUIPO"
  ];
  const body = rows.map(r => headers.map(h => (r as any)[h] ?? ""));
  return [headers, ...body]
    .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur = "", row: string[] = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"' && inQuotes && next === '"') { cur += '"'; i++; continue; }
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === "," && !inQuotes) { row.push(cur); cur = ""; continue; }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (cur !== "" || row.length) { row.push(cur); rows.push(row); row = []; cur = ""; }
      continue;
    }
    cur += ch;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ""));
}

export function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
