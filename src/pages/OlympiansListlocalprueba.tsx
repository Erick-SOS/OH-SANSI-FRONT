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

/* ------------------------------ Tipos & helpers ------------------------------ */
type Modality = "Individual" | "Grupal";

export type Olympian = {
  id: string;
  numero: number;
  nombreCompleto: string;
  ci?: string;
  unidadEducativa?: string;
  modalidad: Modality;
  departamento: string;
  areaCompetencia: string;
  nivel: string;
  tutorLegal: string;
};

type SortKey = keyof Pick<
  Olympian,
  | "numero"
  | "nombreCompleto"
  | "unidadEducativa"
  | "modalidad"
  | "departamento"
  | "areaCompetencia"
  | "nivel"
  | "tutorLegal"
>;

const LS_KEY = "olympians:list:v3";

/* Seed inicial */
const initialSeed: Olympian[] = [
  {
    id: crypto.randomUUID(),
    numero: 1,
    nombreCompleto: "Team Chocolatitos",
    modalidad: "Grupal",
    departamento: "Cochabamba",
    areaCompetencia: "Matemáticas",
    nivel: "Primario",
    tutorLegal: "Evan Castañeda Rojas",
  },
  {
    id: crypto.randomUUID(),
    numero: 2,
    nombreCompleto: "Julian Daniel Alvarez",
    ci: "CI: 7329843",
    unidadEducativa: "Don Bosco",
    modalidad: "Individual",
    departamento: "Cochabamba",
    areaCompetencia: "Matemáticas",
    nivel: "Primario",
    tutorLegal: "Evan Castañeda Rojas",
  },
];

/* ---------- LS ---------- */
function loadFromLS(): Olympian[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Olympian[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function saveToLS(rows: Olympian[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

/* ---------- CSV utils ---------- */
function toCSV(rows: Olympian[]): string {
  const headers = [
    "numero",
    "nombreCompleto",
    "ci",
    "unidadEducativa",
    "modalidad",
    "departamento",
    "areaDeCompetencia",
    "nivel",
    "tutorLegal",
  ];
  const body = rows.map((r) => [
    r.numero,
    r.nombreCompleto,
    r.ci ?? "",
    r.unidadEducativa ?? "",
    r.modalidad,
    r.departamento,
    r.areaCompetencia,
    r.nivel,
    r.tutorLegal,
  ]);
  return [headers, ...body]
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}
function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parser CSV básico (sin libs) */
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

/* ---------- Normalización de encabezados ---------- */
function norm(h: string) {
  return h.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}
const HEADER_ALIASES: Record<string, string> = {
  numero: "numero", n: "numero", no: "numero", ndeg: "numero",
  nombre: "nombrecompleto", nombrecompleto: "nombrecompleto", nombreyapellido: "nombrecompleto", apellidonombre: "nombrecompleto",
  ci: "ci", carnet: "ci", carnetidentidad: "ci",
  unidadeeducativa: "unidadeducativa", unidadeducativa: "unidadeducativa", unidad: "unidadeducativa",
  modalidad: "modalidad", tipo: "modalidad",
  departamento: "departamento", dpto: "departamento",
  areadecompetencia: "areadecompetencia", area: "areadecompetencia",
  nivel: "nivel", curso: "nivel",
  tutorlegal: "tutorlegal", tutor: "tutorlegal", apoderado: "tutorlegal",
};
function buildHeaderIndex(headers: string[]) {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => {
    const canon = HEADER_ALIASES[norm(h)];
    if (canon && map[canon] === undefined) map[canon] = i;
  });
  return map;
}
function pickCell(canon: string, idx: Record<string, number>, cells: string[]) {
  const i = idx[canon];
  return i !== undefined ? (cells[i]?.trim() ?? "") : "";
}

/* ---------- Validaciones texto alfa (máx 100, sin números/especiales) ---------- */
const alpha100Regex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{1,100}$/;
function validateAlpha100(label: string, value: string): string | null {
  if (!value) return `${label}: campo requerido`;
  if (value.length > 100) return `${label}: máximo 100 caracteres`;
  if (!alpha100Regex.test(value)) return `${label}: solo letras y espacios (sin números ni símbolos)`;
  return null;
}

/* ---------- UI helpers ---------- */
const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
    {children}
  </span>
);
const ModalityBadge: React.FC<{ value: Modality }> = ({ value }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
    value === "Individual" ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-700"
  }`}>{value}</span>
);
const SortIcon: React.FC<{ dir: "asc" | "desc" | null }> = ({ dir }) => {
  if (!dir) return <span className="opacity-30">↕</span>;
  return <span>{dir === "asc" ? "↑" : "↓"}</span>;
};
const CenterModal: React.FC<React.PropsWithChildren<{ open: boolean; onClose: () => void }>> = ({
  open, onClose, children,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
};
const SmallModal: React.FC<{
  open: boolean; onClose: () => void; title: string; message: string;
}> = ({ open, onClose, title, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-2 flex items-center gap-2">
          <FileWarning className="h-4 w-4 text-amber-600" />
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-700">{message}</p>
        <div className="mt-4 flex justify-end">
          <button className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm" onClick={onClose}>
            <X className="h-4 w-4" /> Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------- Componente -------------------------------- */
export const OlympiansListLocalprueba: React.FC = () => {
  // datos
  const [rows, setRows] = useState<Olympian[]>([]);
  useEffect(() => { setRows(loadFromLS() ?? initialSeed); }, []);
  useEffect(() => { saveToLS(rows); }, [rows]);

  // ui state tabla
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const [sortBy, setSortBy] = useState<SortKey>("numero");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // import modal y estados
  const [openImport, setOpenImport] = useState(false);
  const [openWrongType, setOpenWrongType] = useState(false);
  const [importOk, setImportOk] = useState<string | null>(null);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // resumen y reporte de errores
  const [summary, setSummary] = useState<{ ok: number; fail: number } | null>(null);
  type ErrorRow = { fila: number; columna: string; motivo: string; valor?: string };
  const [errorReport, setErrorReport] = useState<ErrorRow[]>([]);

  // filtrar
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return rows;
    return rows.filter((r) =>
      [r.numero, r.nombreCompleto, r.ci, r.unidadEducativa, r.modalidad, r.departamento,
       r.areaCompetencia, r.nivel, r.tutorLegal]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(text))
    );
  }, [rows, q]);

  // ordenar
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = a[sortBy] ?? ""; const vb = b[sortBy] ?? "";
      const A = typeof va === "number" ? va : String(va).toLowerCase();
      const B = typeof vb === "number" ? vb : String(vb).toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  // paginar
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // acciones tabla
  const toggleSort = (key: SortKey) => { sortBy === key ? setSortDir(d=>d==="asc"?"desc":"asc") : (setSortBy(key), setSortDir("asc")); };
  const onExport = () => download("olimpistas.csv", toCSV(sorted));
  const onDelete = (id: string) => { if (!confirm("¿Eliminar este registro?")) return; setRows(prev=>prev.filter(r=>r.id!==id)); };

  /* --------------------------- Plantilla CSV --------------------------- */
  const downloadTemplate = () => {
    const template = "numero,nombreCompleto,ci,unidadEducativa,modalidad,departamento,areaDeCompetencia,nivel,tutorLegal\n"
      + "1,Juan Pérez,,Don Bosco,Individual,Cochabamba,Matemáticas,Primario,Ana Pérez\n";
    download("plantilla_olimpistas.csv", template);
  };

  /* --------------------------- Importar CSV (UI) --------------------------- */
  const handleFiles = async (files: FileList | null) => {
    setImportErr(null); setImportOk(null); setSummary(null); setErrorReport([]);
    if (!files || !files[0]) return;
    const file = files[0];

    const isCSV = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv" || file.type === "application/vnd.ms-excel";
    if (!isCSV) { setOpenWrongType(true); return; }

    const text = await file.text();
    const matrix = parseCSV(text);
    if (matrix.length === 0) { setImportErr("El archivo está vacío."); return; }

    const headers = matrix[0]; const idx = buildHeaderIndex(headers);
    const requiredCanon = ["nombrecompleto","departamento","areadecompetencia","nivel","tutorlegal"];
    const missing = requiredCanon.filter((c)=>idx[c]===undefined);
    if (missing.length) { setImportErr("Faltan columnas obligatorias. Usa: numero,nombreCompleto,ci,unidadEducativa,modalidad,departamento,areaDeCompetencia,nivel,tutorLegal"); return; }

    let maxNumero = rows.length ? Math.max(...rows.map(r=>r.numero)) : 0;
    const nextNumero = () => (maxNumero += 1);

    const imported: Olympian[] = [];
    const errors: ErrorRow[] = [];
    const pushErr = (fila:number,columna:string,motivo:string,valor?:string)=>errors.push({fila,columna,motivo,valor});

    for (let i=1;i<matrix.length;i++){
      const cells = matrix[i];
      const numeroStr = pickCell("numero",idx,cells);
      const numero = numeroStr ? Number(numeroStr) : nextNumero();

      const nombre = pickCell("nombrecompleto",idx,cells);
      const unidad = pickCell("unidadeducativa",idx,cells);
      const modalidadRaw = pickCell("modalidad",idx,cells) || "Individual";
      const dep = pickCell("departamento",idx,cells);
      const area = pickCell("areadecompetencia",idx,cells);
      const nivel = pickCell("nivel",idx,cells);
      const tutor = pickCell("tutorlegal",idx,cells);
      const ci = pickCell("ci",idx,cells) || undefined;

      const vNombre = validateAlpha100("Nombre completo",nombre); if (vNombre) pushErr(i+1,"nombreCompleto",vNombre,nombre);
      if (unidad){
        const vUnidad = validateAlpha100("Unidad educativa",unidad); if (vUnidad) pushErr(i+1,"unidadEducativa",vUnidad,unidad);
      }
      const vMod = validateAlpha100("Modalidad",modalidadRaw); if (vMod) pushErr(i+1,"modalidad",vMod,modalidadRaw);
      const vDep = validateAlpha100("Departamento",dep); if (vDep) pushErr(i+1,"departamento",vDep,dep);
      const vArea = validateAlpha100("Área de competencia",area); if (vArea) pushErr(i+1,"areaDeCompetencia",vArea,area);
      const vNivel = validateAlpha100("Nivel",nivel); if (vNivel) pushErr(i+1,"nivel",vNivel,nivel);

      const modalidad: Modality = modalidadRaw.toLowerCase()==="grupal" ? "Grupal" : "Individual";
      const hadErr = errors.some(e=>e.fila===i+1);
      if (hadErr) continue;

      imported.push({
        id: crypto.randomUUID(),
        numero: Number.isFinite(numero) ? numero : nextNumero(),
        nombreCompleto: nombre,
        ci,
        unidadEducativa: unidad || undefined,
        modalidad,
        departamento: dep,
        areaCompetencia: area,
        nivel,
        tutorLegal: tutor,
      });
    }

    if (!imported.length && errors.length){
      setImportErr("La carga contiene errores. Revisa el reporte para corregirlos.");
      setSummary({ok:0, fail:errors.length});
      setErrorReport(errors);
      return;
    }

    const numerosTomados = new Set(rows.map(r=>r.numero));
    for (const r of imported){ if (numerosTomados.has(r.numero)) r.numero = ++maxNumero; numerosTomados.add(r.numero); }

    setRows(prev=>[...prev, ...imported]);
    setImportOk(`Subido Correctamente • ${imported.length} registro(s) importado(s).`);
    setSummary({ok: imported.length, fail: errors.length});
    setErrorReport(errors);

    const total = sorted.length + imported.length;
    setPage(Math.max(1, Math.ceil(total / pageSize)));
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e)=>handleFiles(e.target.files);
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e)=>{ e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };

  const downloadErrors = () => {
    if (!errorReport.length) return;
    const headers = ["fila","columna","motivo","valor"];
    const body = errorReport.map(r=>[r.fila,r.columna,r.motivo,r.valor ?? ""]);
    const csv = [headers, ...body].map(row=>row.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    download("reporte_errores_import.csv", csv);
  };

  /* --------------------------------- Render --------------------------------- */
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Lista de Olimpistas Inscritos</h1>
        <div className="flex gap-2">
          <button onClick={onExport} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            <Download className="h-4 w-4" /> Export
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
      <div className="mb-3">
        <div className="relative">
          <input
            value={q}
            onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
            placeholder="Search..."
            className="w-full rounded-lg border px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {([
                ["numero","N°"],
                ["nombreCompleto","Nombre Completo"],
                ["unidadEducativa","Unidad Educativa"],
                ["modalidad","Modalidad"],
                ["departamento","Departamento"],
                ["areaCompetencia","Área de Competencia"],
                ["nivel","Nivel"],
                ["tutorLegal","Tutor Legal"],
              ] as [SortKey,string][]).map(([key,label])=>{
                const dir = sortBy===key ? sortDir : null;
                return (
                  <th key={key} className="cursor-pointer select-none px-4 py-3" onClick={()=>toggleSort(key)} title="Ordenar">
                    <div className="flex items-center gap-1"><span>{label}</span> <SortIcon dir={dir} /></div>
                  </th>
                );
              })}
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length===0 && (
              <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={9}>No hay resultados.</td></tr>
            )}
            {pageRows.map(r=>(
              <tr key={r.id} className="border-t last:border-b">
                <td className="px-4 py-3">{r.numero}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold">
                      {r.nombreCompleto.split(" ").filter(Boolean).slice(0,2).map(s=>s[0]?.toUpperCase()).join("")}
                    </div>
                    <div className="leading-tight">
                      <div className="font-medium">{r.nombreCompleto}</div>
                      {r.ci && <div className="text-xs text-gray-500">{r.ci}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{r.unidadEducativa ?? "-"}</td>
                <td className="px-4 py-3"><ModalityBadge value={r.modalidad} /></td>
                <td className="px-4 py-3">{r.departamento}</td>
                <td className="px-4 py-3">{r.areaCompetencia}</td>
                <td className="px-4 py-3">{r.nivel}</td>
                <td className="px-4 py-3">{r.tutorLegal}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={()=>onDelete(r.id)} title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer: paginación */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
          <span>Mostrando {pageRows.length ? (currentPage-1)*pageSize+1 : 0} a {(currentPage-1)*pageSize+pageRows.length} de {sorted.length}</span>
          <div className="flex items-center gap-1">
            <button className="rounded-md border px-2 py-1 disabled:opacity-40" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({length: totalPages},(_,i)=>i+1).map(n=>(
              <button key={n} className={`rounded-md border px-2 py-1 ${n===currentPage ? "bg-gray-900 text-white":"bg-white"}`} onClick={()=>setPage(n)}>{n}</button>
            ))}
            <button className="rounded-md border px-2 py-1 disabled:opacity-40" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Importar CSV */}
      <CenterModal open={openImport} onClose={()=>setOpenImport(false)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Importar Olimpistas (CSV)</h2>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4" /> Plantilla
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm" onClick={()=>setOpenImport(false)}>
              <X className="h-4 w-4" /> Cerrar
            </button>
          </div>
        </div>

        {/* banners */}
        {importOk && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4" /> {importOk}
          </div>
        )}
        {importErr && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" /> {importErr}
          </div>
        )}

        {/* Resumen */}
        {summary && (
          <div className="mb-3 flex items-center gap-2 text-sm">
            <Badge>✔️ Cargados: {summary.ok}</Badge>
            <Badge>❌ Rechazados: {summary.fail}</Badge>
          </div>
        )}

        {/* Botón reporte de errores */}
        {!!errorReport.length && (
          <div className="mb-3">
            <button className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
              onClick={downloadErrors} title="Descargar reporte de errores (CSV)">
              <Download className="h-4 w-4" /> Reporte de errores
            </button>
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
          onDragLeave={()=>setDragOver(false)}
          onDrop={onDrop}
          className={`flex min-h-[220px] items-center justify-center rounded-xl border-2 border-dashed ${dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
        >
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Upload className="h-6 w-6" />
            </div>
            <div className="font-medium">Sube aquí tu archivo</div>
            <div className="text-xs text-gray-500">Solo se permiten archivos de tipo CSV</div>

            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-indigo-700 underline">
              <FileSpreadsheet className="h-4 w-4" />
              Buscar Archivo
              <input type="file" accept=".csv" className="hidden" onChange={onInputChange} />
            </label>

            <div className="mt-4 text-xs text-gray-500">
              Encabezados: <code>numero,nombreCompleto,ci,unidadEducativa,modalidad,departamento,areaDeCompetencia,nivel,tutorLegal</code><br/>
              Reglas: campos de texto solo letras y espacios, máx 100 caracteres.
            </div>
          </div>
        </div>
      </CenterModal>

      {/* MODAL: tipo de archivo no permitido */}
      <SmallModal
        open={openWrongType}
        onClose={()=>setOpenWrongType(false)}
        title="Tipo de archivo no permitido"
        message="El sistema solo acepta archivos en formato CSV con la estructura definida. No se permiten .pdf, .txt u otros formatos. Descarga la plantilla para asegurar el formato correcto."
      />
    </div>
  );
};

export default OlympiansListLocalprueba;

/* Uso:
import OlympiansListLocalprueba from "./OlympiansListLocalprueba";
export default function Page() { return <OlympiansListLocalprueba />; }
*/


