import React, { useEffect, useMemo, useState } from "react";

/* ------------------------------ Tipos & helpers ------------------------------ */
type Modality = "Individual" | "Grupal";

export type Olympian = {
  id: string;
  numero: number;                // N°
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

const LS_KEY = "olympians:list:v1";

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
  {
    id: crypto.randomUUID(),
    numero: 3,
    nombreCompleto: "Roberto Leeson",
    ci: "CI: 7329843",
    unidadEducativa: "Don Bosco",
    modalidad: "Individual",
    departamento: "Cochabamba",
    areaCompetencia: "Matemáticas",
    nivel: "Primario",
    tutorLegal: "Evan Castañeda Rojas",
  },
  {
    id: crypto.randomUUID(),
    numero: 4,
    nombreCompleto: "Alicia Josías",
    ci: "CI: 7329843",
    unidadEducativa: "Don Bosco",
    modalidad: "Individual",
    departamento: "Cochabamba",
    areaCompetencia: "Matemáticas",
    nivel: "Primario",
    tutorLegal: "Evan Castañeda Rojas",
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
    "N°",
    "Nombre Completo",
    "CI",
    "Unidad Educativa",
    "Modalidad",
    "Departamento",
    "Área de Competencia",
    "Nivel",
    "Tutor Legal",
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

const ModalityBadge: React.FC<{ value: Modality }> = ({ value }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      value === "Individual" ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-700"
    }`}
  >
    {value}
  </span>
);

const SortIcon: React.FC<{ dir: "asc" | "desc" | null }> = ({ dir }) => {
  if (!dir) return <span className="opacity-30">↕</span>;
  return <span>{dir === "asc" ? "↑" : "↓"}</span>;
};

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
      className="w-full max-w-xl rounded-xl bg-white p-4 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

type AddFormValues = Omit<
  Olympian,
  "id" | "numero"
> & { numero?: number };

const emptyForm: AddFormValues = {
  nombreCompleto: "",
  ci: "",
  unidadEducativa: "",
  modalidad: "Individual",
  departamento: "",
  areaCompetencia: "",
  nivel: "",
  tutorLegal: "",
};

/* ------------------------------- Componente -------------------------------- */
export const OlympiansListLocal: React.FC = () => {
  // datos
  const [rows, setRows] = useState<Olympian[]>([]);
  useEffect(() => {
    const cached = loadFromLS();
    setRows(cached ?? initialSeed);
  }, []);
  useEffect(() => {
    saveToLS(rows);
  }, [rows]);

  // ui state
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const [sortBy, setSortBy] = useState<SortKey>("numero");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddFormValues>(emptyForm);

  // filtrar
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return rows;
    return rows.filter((r) =>
      [
        r.numero,
        r.nombreCompleto,
        r.ci,
        r.unidadEducativa,
        r.modalidad,
        r.departamento,
        r.areaCompetencia,
        r.nivel,
        r.tutorLegal,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(text))
    );
  }, [rows, q]);

  // ordenar
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

  // paginar
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // acciones
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

  const openAdd = () => {
    setForm(emptyForm);
    setShowAdd(true);
  };
  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numero =
      (form.numero && Number(form.numero)) ||
      (rows.length ? Math.max(...rows.map((r) => r.numero)) + 1 : 1);
    if (!form.nombreCompleto || !form.departamento || !form.areaCompetencia || !form.nivel || !form.tutorLegal) {
      alert("Completa al menos: Nombre, Departamento, Área, Nivel y Tutor.");
      return;
    }
    const newRow: Olympian = {
      id: crypto.randomUUID(),
      numero,
      nombreCompleto: form.nombreCompleto.trim(),
      ci: form.ci?.trim() || undefined,
      unidadEducativa: form.unidadEducativa?.trim() || undefined,
      modalidad: form.modalidad,
      departamento: form.departamento.trim(),
      areaCompetencia: form.areaCompetencia.trim(),
      nivel: form.nivel.trim(),
      tutorLegal: form.tutorLegal.trim(),
    };
    setRows((prev) => [...prev, newRow]);
    setShowAdd(false);
    // ir a última página probable
    setPage(Math.max(1, Math.ceil((sorted.length + 1) / pageSize)));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Lista de Olimpistas Inscritos</h1>
          <p className="text-sm text-gray-500">
            Visualiza, busca, ordena, pagina y exporta — sin backend (datos locales).
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onExport} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            Export
          </button>
          <button
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
            onClick={openAdd}
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="w-full rounded-lg border px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">🔎</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {([
                ["numero", "N°"],
                ["nombreCompleto", "Nombre Completo"],
                ["unidadEducativa", "Unidad Educativa"],
                ["modalidad", "Modalidad"],
                ["departamento", "Departamento"],
                ["areaCompetencia", "Área de Competencia"],
                ["nivel", "Nivel"],
                ["tutorLegal", "Tutor Legal"],
              ] as [SortKey, string][]).map(([key, label]) => {
                const dir = sortBy === key ? sortDir : null;
                return (
                  <th
                    key={key}
                    className="cursor-pointer select-none px-4 py-3"
                    onClick={() => toggleSort(key)}
                    title="Ordenar"
                  >
                    <div className="flex items-center gap-1">
                      <span>{label}</span> <SortIcon dir={dir} />
                    </div>
                  </th>
                );
              })}
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={9}>
                  No hay resultados.
                </td>
              </tr>
            )}
            {pageRows.map((r) => (
              <tr key={r.id} className="border-t last:border-b">
                <td className="px-4 py-3">{r.numero}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold">
                      {r.nombreCompleto
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((s) => s[0]?.toUpperCase())
                        .join("")}
                    </div>
                    <div className="leading-tight">
                      <div className="font-medium">{r.nombreCompleto}</div>
                      {r.ci && <div className="text-xs text-gray-500">{r.ci}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{r.unidadEducativa ?? "-"}</td>
                <td className="px-4 py-3">
                  <ModalityBadge value={r.modalidad} />
                </td>
                <td className="px-4 py-3">{r.departamento}</td>
                <td className="px-4 py-3">{r.areaCompetencia}</td>
                <td className="px-4 py-3">{r.nivel}</td>
                <td className="px-4 py-3">{r.tutorLegal}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(r.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer: paginación */}
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
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">N° (opcional)</label>
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.numero ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, numero: Number(e.target.value) }))}
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">Nombre completo *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.nombreCompleto}
                onChange={(e) => setForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">CI</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.ci}
                onChange={(e) => setForm((f) => ({ ...f, ci: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Unidad Educativa</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.unidadEducativa}
                onChange={(e) => setForm((f) => ({ ...f, unidadEducativa: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Modalidad</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.modalidad}
                onChange={(e) =>
                  setForm((f) => ({ ...f, modalidad: e.target.value as Modality }))
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
                value={form.departamento}
                onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Área de Competencia *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.areaCompetencia}
                onChange={(e) => setForm((f) => ({ ...f, areaCompetencia: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Nivel *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.nivel}
                onChange={(e) => setForm((f) => ({ ...f, nivel: e.target.value }))}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-500">Tutor Legal *</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={form.tutorLegal}
                onChange={(e) => setForm((f) => ({ ...f, tutorLegal: e.target.value }))}
                required
              />
            </div>

            <div className="col-span-2 mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </Backdrop>
      )}
    </div>
  );
};

export default OlympiansListLocal;

/* Uso:
import OlympiansListLocal from "./OlympiansListLocal";
export default function Page() {
  return <OlympiansListLocal />;
}
*/
