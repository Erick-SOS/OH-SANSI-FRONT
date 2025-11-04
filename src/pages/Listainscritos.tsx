import React, { useEffect, useMemo, useState } from "react";

/* ------------------------------ Tipos & helpers ------------------------------ */
export type Olympian = {
  id: string;
  TIPO_PART: "Individual" | "Grupal";
  AREA_COD: string;
  AREA_NOM: string;
  NIVEL_COD: string;
  NIVEL_NOM: string;
  OLI_TDOC: string;
  OLI_NRODOC: string;
  OLI_NOMBRE: string;
  OLI_AP_PAT: string;
  OLI_AP_MAT: string;
  OLI_UNID_EDU: string;
  OLI_DEPTO: string;
  OLI_GRADO: string;
  OLI_F_NAC: string;
  OLI_SEXO: "M" | "F";
  OLI_CORREO: string;
  TUTOR_TDOC: string;
  TUTOR_NRODOC: string;
  TUTOR_NOMBRE: string;
  TUTOR_AP_PAT: string;
  TUTOR_AP_MAT: string;
  TUTOR_TEL: string;
  TUTOR_CORREO: string;
  TUTOR_UNID_EDU: string;
  TUTOR_PROF: string;
  EQUIPO_NOMBRE?: string;
  ROL_EQUIPO?: string;
};

type SortKey = keyof Pick<
  Olympian,
  | "OLI_NOMBRE"
  | "OLI_AP_PAT"
  | "OLI_AP_MAT"
  | "TIPO_PART"
  | "AREA_NOM"
  | "NIVEL_NOM"
  | "OLI_DEPTO"
  | "EQUIPO_NOMBRE"
>;

const LS_KEY = "olympians:list:v2";

const initialSeed: Olympian[] = [
  {
    id: crypto.randomUUID(),
    TIPO_PART: "Grupal",
    AREA_COD: "MAT01",
    AREA_NOM: "Matemáticas",
    NIVEL_COD: "PRIM",
    NIVEL_NOM: "Primario",
    OLI_TDOC: "CI",
    OLI_NRODOC: "7329843",
    OLI_NOMBRE: "Julian Daniel",
    OLI_AP_PAT: "Alvarez",
    OLI_AP_MAT: "",
    OLI_UNID_EDU: "Don Bosco",
    OLI_DEPTO: "Cochabamba",
    OLI_GRADO: "6to",
    OLI_F_NAC: "2012-05-03",
    OLI_SEXO: "M",
    OLI_CORREO: "julian@gmail.com",
    TUTOR_TDOC: "CI",
    TUTOR_NRODOC: "4561237",
    TUTOR_NOMBRE: "Evan",
    TUTOR_AP_PAT: "Castañeda",
    TUTOR_AP_MAT: "Rojas",
    TUTOR_TEL: "77451232",
    TUTOR_CORREO: "evan.cast@gmail.com",
    TUTOR_UNID_EDU: "",
    TUTOR_PROF: "Profesor de Matemáticas",
    EQUIPO_NOMBRE: "Team Chocolatitos",
    ROL_EQUIPO: "Capitán",
  },
];

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

function toCSV(rows: Olympian[]): string {
  const headers = [
    "TIPO_PART",
    "AREA_COD",
    "AREA_NOM",
    "NIVEL_COD",
    "NIVEL_NOM",
    "OLI_TDOC",
    "OLI_NRODOC",
    "OLI_NOMBRE",
    "OLI_AP_PAT",
    "OLI_AP_MAT",
    "OLI_UNID_EDU",
    "OLI_DEPTO",
    "OLI_GRADO",
    "OLI_F_NAC",
    "OLI_SEXO",
    "OLI_CORREO",
    "TUTOR_TDOC",
    "TUTOR_NRODOC",
    "TUTOR_NOMBRE",
    "TUTOR_AP_PAT",
    "TUTOR_AP_MAT",
    "TUTOR_TEL",
    "TUTOR_CORREO",
    "TUTOR_UNID_EDU",
    "TUTOR_PROF",
    "EQUIPO_NOMBRE",
    "ROL_EQUIPO",
  ];

  const body = rows.map((r) => headers.map((key) => (r as any)[key] ?? ""));
  return [headers, ...body]
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;
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

/* --------------------------------- Modal UI -------------------------------- */
const Backdrop: React.FC<React.PropsWithChildren<{ onClose: () => void }>> = ({
  onClose,
  children,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

/* ------------------------------- Componente -------------------------------- */
export const OlympiansListLocal: React.FC = () => {
  const [rows, setRows] = useState<Olympian[]>([]);
  useEffect(() => {
    const cached = loadFromLS();
    setRows(cached ?? initialSeed);
  }, []);
  useEffect(() => {
    saveToLS(rows);
  }, [rows]);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const [sortBy, setSortBy] = useState<SortKey>("OLI_NOMBRE");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Olympian>>({ TIPO_PART: "Individual" });

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return rows;
    return rows.filter((r) =>
      Object.values(r)
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(text))
    );
  }, [rows, q]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = a[sortBy] ?? "";
      const vb = b[sortBy] ?? "";
      const A = typeof va === "number" ? va : String(va).toLowerCase();
      const B = typeof vb === "number" ? vb : String(vb).toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const onExport = () => download("olimpistas.csv", toCSV(sorted));

  const onDelete = (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = ["OLI_NOMBRE", "OLI_AP_PAT", "OLI_DEPTO", "AREA_NOM", "NIVEL_NOM"];
    if (requiredFields.some((f) => !(form as any)[f])) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
    const newRow: Olympian = {
      id: crypto.randomUUID(),
      ...form,
    } as Olympian;
    setRows((prev) => [...prev, newRow]);
    setShowAdd(false);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Lista de Olimpistas Inscritos</h1>
          <p className="text-sm text-gray-500">Versión adaptada a estructura oficial de columnas.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onExport} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            Exportar CSV
          </button>
          <button
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
            onClick={() => setShowAdd(true)}
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar..."
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {(
                [
                  ["OLI_NOMBRE", "Nombre"],
                  ["OLI_AP_PAT", "Ap. Paterno"],
                  ["OLI_AP_MAT", "Ap. Materno"],
                  ["TIPO_PART", "Tipo"],
                  ["AREA_NOM", "Área"],
                  ["NIVEL_NOM", "Nivel"],
                  ["OLI_DEPTO", "Depto"],
                  ["EQUIPO_NOMBRE", "Equipo"],
                ] as [SortKey, string][]
              ).map(([key, label]) => {
                const dir = sortBy === key ? sortDir : null;
                return (
                  <th
                    key={key}
                    className="cursor-pointer select-none px-4 py-3"
                    onClick={() => toggleSort(key)}
                    title="Ordenar"
                  >
                    <div className="flex items-center gap-1">
                      <span>{label}</span> {dir ? (dir === "asc" ? "↑" : "↓") : "↕"}
                    </div>
                  </th>
                );
              })}
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={9}>
                  No hay resultados.
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">{r.OLI_NOMBRE}</td>
                  <td className="px-4 py-3">{r.OLI_AP_PAT}</td>
                  <td className="px-4 py-3">{r.OLI_AP_MAT}</td>
                  <td className="px-4 py-3">{r.TIPO_PART}</td>
                  <td className="px-4 py-3">{r.AREA_NOM}</td>
                  <td className="px-4 py-3">{r.NIVEL_NOM}</td>
                  <td className="px-4 py-3">{r.OLI_DEPTO}</td>
                  <td className="px-4 py-3">{r.EQUIPO_NOMBRE ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(r.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
          <span>
            Mostrando {pageRows.length ? (currentPage - 1) * pageSize + 1 : 0} a{" "}
            {(currentPage - 1) * pageSize + pageRows.length} de {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="rounded-md border px-2 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`rounded-md border px-2 py-1 ${
                  n === currentPage ? "bg-gray-900 text-white" : "bg-white"
                }`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="rounded-md border px-2 py-1 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Modal Agregar */}
      {showAdd && (
        <Backdrop onClose={() => setShowAdd(false)}>
          <h2 className="mb-3 text-base font-semibold">Agregar inscrito</h2>
          <form className="grid grid-cols-2 gap-3" onSubmit={submitAdd}>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nombre *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.OLI_NOMBRE ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, OLI_NOMBRE: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Apellido Paterno *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.OLI_AP_PAT ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, OLI_AP_PAT: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Apellido Materno</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.OLI_AP_MAT ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, OLI_AP_MAT: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Tipo de Participación</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.TIPO_PART}
                onChange={(e) =>
                  setForm((f) => ({ ...f, TIPO_PART: e.target.value as "Individual" | "Grupal" }))
                }
              >
                <option>Individual</option>
                <option>Grupal</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Departamento *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.OLI_DEPTO ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, OLI_DEPTO: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Área *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.AREA_NOM ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, AREA_NOM: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nivel *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.NIVEL_NOM ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, NIVEL_NOM: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nombre del equipo</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.EQUIPO_NOMBRE ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, EQUIPO_NOMBRE: e.target.value }))}
              />
            </div>
            <div className="col-span-2 mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => setShowAdd(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">
                Guardar
              </button>
            </div>
          </form>
        </Backdrop>
      )}
    </div>
  );
};
