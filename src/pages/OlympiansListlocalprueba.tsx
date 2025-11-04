import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  FileSpreadsheet,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileWarning,
  X,
} from "lucide-react";
import { Olympian } from "../types/olympista";

/* ------------------------------ Tipos ------------------------------ */


const LS_KEY = "olympians:v4";

/* ------------------------------ Seed inicial ------------------------------ */
const initialSeed: Olympian[] = [
  {
    id: crypto.randomUUID(),
    TIPO_PART: "Individual",
    AREA_COD: "MAT01",
    AREA_NOM: "Matemáticas",
    NIVEL_COD: "PRI",
    NIVEL_NOM: "Primario",
    OLI_TDOC: "CI",
    OLI_NRODOC: "7329843",
    OLI_NOMBRE: "Julian Daniel",
    OLI_AP_PAT: "Alvarez",
    OLI_AP_MAT: "Torrez",
    OLI_UNID_EDU: "Don Bosco",
    OLI_DEPTO: "Cochabamba",
    OLI_GRADO: "6to",
    OLI_F_NAC: "2013-05-20",
    OLI_SEXO: "M",
    OLI_CORREO: "julian@example.com",
    TUTOR_TDOC: "CI",
    TUTOR_NRODOC: "5638291",
    TUTOR_NOMBRE: "Evan",
    TUTOR_AP_PAT: "Castañeda",
    TUTOR_AP_MAT: "Rojas",
    TUTOR_TEL: "76483920",
    TUTOR_CORREO: "evan@example.com",
    TUTOR_UNID_EDU: "Don Bosco",
    TUTOR_PROF: "Profesor",
    EQUIPO_NOMBRE: "Los Matemáticos",
    ROL_EQUIPO: "Capitán",
  },
  {
    id: crypto.randomUUID(),
    TIPO_PART: "Individual",
    AREA_COD: "MAT01",
    AREA_NOM: "Matemáticas",
    NIVEL_COD: "PRI",
    NIVEL_NOM: "Primario",
    OLI_TDOC: "CI",
    OLI_NRODOC: "7329843",
    OLI_NOMBRE: "Julian Daniel",
    OLI_AP_PAT: "Alvarez",
    OLI_AP_MAT: "Torrez",
    OLI_UNID_EDU: "Don Bosco",
    OLI_DEPTO: "Cochabamba",
    OLI_GRADO: "6to",
    OLI_F_NAC: "2013-05-20",
    OLI_SEXO: "M",
    OLI_CORREO: "julian@example.com",
    TUTOR_TDOC: "CI",
    TUTOR_NRODOC: "5638291",
    TUTOR_NOMBRE: "Evan",
    TUTOR_AP_PAT: "Castañeda",
    TUTOR_AP_MAT: "Rojas",
    TUTOR_TEL: "76483920",
    TUTOR_CORREO: "evan@example.com",
    TUTOR_UNID_EDU: "Don Bosco",
    TUTOR_PROF: "Profesor",
    EQUIPO_NOMBRE: "Los Matemáticos",
    ROL_EQUIPO: "Capitán",
  },
];

/* ------------------------------ Helpers ------------------------------ */
function loadFromLS(): Olympian[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Olympian[];
  } catch {
    return null;
  }
}
function saveToLS(rows: Olympian[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

function toCSV(rows: Olympian[]): string {
  const headers = [
    "TIPO_PART","AREA_COD","AREA_NOM","NIVEL_COD","NIVEL_NOM","OLI_TDOC","OLI_NRODOC",
    "OLI_NOMBRE","OLI_AP_PAT","OLI_AP_MAT","OLI_UNID_EDU","OLI_DEPTO","OLI_GRADO",
    "OLI_F_NAC","OLI_SEXO","OLI_CORREO","TUTOR_TDOC","TUTOR_NRODOC","TUTOR_NOMBRE",
    "TUTOR_AP_PAT","TUTOR_AP_MAT","TUTOR_TEL","TUTOR_CORREO","TUTOR_UNID_EDU",
    "TUTOR_PROF","EQUIPO_NOMBRE","ROL_EQUIPO"
  ];
  const body = rows.map(r => headers.map(h => (r as any)[h] ?? ""));
  return [headers, ...body].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function parseCSV(text: string): string[][] {
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

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------ Component ------------------------------ */
export const OlympiansListLocalprueba: React.FC = () => {
  const [rows, setRows] = useState<Olympian[]>([]);
  useEffect(() => { setRows(loadFromLS() ?? initialSeed); }, []);
  useEffect(() => { saveToLS(rows); }, [rows]);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(t)));
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onExport = () => download("olimpistas.csv", toCSV(rows));
  const onDelete = (id: string) => { if (confirm("¿Eliminar este registro?")) setRows(p => p.filter(r => r.id !== id)); };

  /* -------- Import CSV -------- */
  const [openImport, setOpenImport] = useState(false);
  const [importOk, setImportOk] = useState<string | null>(null);
  const [importErr, setImportErr] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    setImportErr(null); setImportOk(null);
    if (!files || !files[0]) return;
    const file = files[0];
    if (!file.name.toLowerCase().endsWith(".csv")) { setImportErr("Solo archivos CSV"); return; }
    const text = await file.text();
    const matrix = parseCSV(text);
    if (matrix.length < 2) { setImportErr("Archivo vacío o sin datos."); return; }
    const headers = matrix[0];
    const required = [
      "TIPO_PART","AREA_NOM","NIVEL_NOM","OLI_NOMBRE","OLI_AP_PAT","OLI_UNID_EDU","OLI_DEPTO"
    ];
    const missing = required.filter(h => !headers.includes(h));
    if (missing.length) { setImportErr("Faltan columnas requeridas."); return; }

    const newRows: Olympian[] = [];
    for (let i = 1; i < matrix.length; i++) {
      const cells = matrix[i];
      const r: any = { id: crypto.randomUUID() };
      headers.forEach((h, j) => r[h] = cells[j] ?? "");
      newRows.push(r as Olympian);
    }

    setRows(prev => [...prev, ...newRows]);
    setImportOk(`Importado correctamente: ${newRows.length} registro(s).`);
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = e => handleFiles(e.target.files);

  const downloadTemplate = () => {
    const headers = [
      "TIPO_PART","AREA_COD","AREA_NOM","NIVEL_COD","NIVEL_NOM","OLI_TDOC","OLI_NRODOC",
      "OLI_NOMBRE","OLI_AP_PAT","OLI_AP_MAT","OLI_UNID_EDU","OLI_DEPTO","OLI_GRADO",
      "OLI_F_NAC","OLI_SEXO","OLI_CORREO","TUTOR_TDOC","TUTOR_NRODOC","TUTOR_NOMBRE",
      "TUTOR_AP_PAT","TUTOR_AP_MAT","TUTOR_TEL","TUTOR_CORREO","TUTOR_UNID_EDU",
      "TUTOR_PROF","EQUIPO_NOMBRE","ROL_EQUIPO"
    ];
    const example = "Individual,MAT01,Matemáticas,PRI,Primario,CI,7329843,Julian,Alvarez,Torrez,Don Bosco,Cochabamba,6to,2013-05-20,M,julian@example.com,CI,5638291,Evan,Castañeda,Rojas,76483920,evan@example.com,Don Bosco,Profesor,Los Matemáticos,Capitán\n";
    download("plantilla_olimpistas.csv", headers.join(",") + "\n" + example);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Lista de Olimpistas</h1>
        <div className="flex gap-2">
          <button onClick={onExport} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            <Download className="h-4 w-4" /> Exportar
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
            onClick={() => setOpenImport(true)}
          >
            <FileSpreadsheet className="h-4 w-4" /> Importar CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3 relative">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Buscar..."
          className="w-full rounded-lg border px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-3">OLIMPISTA</th>
              <th className="px-3 py-3">NOMBRE</th>
              <th className="px-3 py-3">APELLIDO PATERNO</th>
              <th className="px-3 py-3">UNIDAD EDUCATIVA</th>
              <th className="px-3 py-3">DEPARTAMENTO</th>
              <th className="px-3 py-3">AREA</th>
              <th className="px-3 py-3">NIVEL</th>
              <th className="px-3 py-3">NOMBRE EQUIPO</th>
              <th className="px-3 py-3">ROL EQUIPO</th>
              <th className="px-3 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-6 text-center text-gray-500">Sin resultados</td></tr>
            )}
            {pageRows.map(r => (
              <tr key={r.id} className="border-t last:border-b">
                <td className="px-3 py-2">{r.TIPO_PART}</td>
                <td className="px-3 py-2">{r.OLI_NOMBRE}</td>
                <td className="px-3 py-2">{r.OLI_AP_PAT}</td>
                <td className="px-3 py-2">{r.OLI_UNID_EDU}</td>
                <td className="px-3 py-2">{r.OLI_DEPTO}</td>
                <td className="px-3 py-2">{r.AREA_NOM}</td>
                <td className="px-3 py-2">{r.NIVEL_NOM}</td>
                <td className="px-3 py-2">{r.EQUIPO_NOMBRE}</td>
                <td className="px-3 py-2">{r.ROL_EQUIPO}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer paginación */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
          <span>Mostrando {pageRows.length ? (currentPage - 1) * pageSize + 1 : 0} a {(currentPage - 1) * pageSize + pageRows.length} de {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button className="rounded-md border px-2 py-1 disabled:opacity-40" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`rounded-md border px-2 py-1 ${n === currentPage ? "bg-gray-900 text-white" : "bg-white"}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="rounded-md border px-2 py-1 disabled:opacity-40" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal import */}
      {openImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/35" onClick={() => setOpenImport(false)} />
          <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Importar Olimpistas (CSV)</h2>
              <div className="flex gap-2">
                <button onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
                  <Download className="h-4 w-4" /> Plantilla
                </button>
                <button onClick={() => setOpenImport(false)} className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
                  <X className="h-4 w-4" /> Cerrar
                </button>
              </div>
            </div>

            {importOk && <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 className="h-4 w-4" /> {importOk}</div>}
            {importErr && <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="h-4 w-4" /> {importErr}</div>}

            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 text-center">
              <Upload className="h-6 w-6 mb-3" />
              <div className="font-medium mb-2">Arrastra o selecciona un archivo CSV</div>
              <input type="file" accept=".csv" onChange={onInputChange} />
              <p className="mt-2 text-xs text-gray-500">Encabezados requeridos: {`TIPO_PART, AREA_NOM, NIVEL_NOM, OLI_NOMBRE, OLI_AP_PAT, OLI_UNID_EDU, OLI_DEPTO`}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
