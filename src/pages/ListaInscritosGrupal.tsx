// src/pages/ListaInscritosGrupal.tsx
import React, { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://back-oh-sansi.vercel.app";

type TeamRow = {
  idParticipacion: number;
  idEquipo: number;
  nombreEquipo: string;
  unidadEducativa: string;
  area: string;
  nivel: string;
  departamento: string;
};

type SortKey = keyof Pick<
  TeamRow,
  "nombreEquipo" | "unidadEducativa" | "area" | "nivel" | "departamento"
>;

type BackendInscritoEquipo = {
  idParticipacion: number;
  modalidad: "INDIVIDUAL" | "EQUIPO";
  estado: "CLASIFICADO" | "NO_CLASIFICADO" | "DESCALIFICADO";
  area: { id: number; nombre: string };
  nivel: { id: number; nombre: string };
  equipo: {
    id: number;
    nombre: string;
    unidadEducativa?: string | null;
    departamento?: string | null;
  } | null;
};

type BackendListResponse = {
  ok?: boolean;
  total: number;
  page: number;
  pageSize: number;
  data: BackendInscritoEquipo[];
};

type Miembro = {
  idOlimpista: number;
  nombreCompleto: string;
  unidadEducativa: string;
  departamento: string;
  rolEnEquipo: string;
};

const ListaInscritosGrupal: React.FC = () => {
  // ---------- STATE PRINCIPAL ----------
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("nombreEquipo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ---------- STATE PARA MIEMBROS ----------
  const [openMiembros, setOpenMiembros] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loadingMiembros, setLoadingMiembros] = useState(false);
  const [errorMiembros, setErrorMiembros] = useState<string | null>(null);

  // ---------- CARGAR LISTA DESDE BACK ----------
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const params = new URLSearchParams();
        params.set("tipo", "EQUIPO");
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        if (q.trim()) params.set("search", q.trim());

        const res = await fetch(
          `${API_URL}/api/inscritos?${params.toString()}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: BackendListResponse = await res.json();
        setTotal(json.total);

        const mapped: TeamRow[] = json.data
          .filter((i) => i.equipo) // sólo los que tienen equipo
          .map((i) => ({
            idParticipacion: i.idParticipacion,
            idEquipo: i.equipo!.id,
            nombreEquipo: i.equipo!.nombre,
            unidadEducativa: i.equipo!.unidadEducativa ?? "-",
            area: i.area.nombre,
            nivel: i.nivel.nombre,
            departamento: i.equipo!.departamento ?? "-",
          }));

        setRows(mapped);
      } catch (err) {
        console.error("Error cargando equipos inscritos", err);
        setErrorMsg("No se pudieron cargar los equipos inscritos.");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipos();
  }, [page, q]);

  // ---------- BUSCADOR ----------
  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((r) =>
      [r.nombreEquipo, r.unidadEducativa, r.area, r.nivel, r.departamento]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [rows, q]);

  // ---------- ORDENAMIENTO ----------
  const ordenados = useMemo(() => {
    const copy = [...filtrados];
    copy.sort((a, b) => {
      const va = a[sortBy] ?? "";
      const vb = b[sortBy] ?? "";
      const A = String(va).toLowerCase();
      const B = String(vb).toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtrados, sortBy, sortDir]);

  // ---------- PAGINACIÓN ----------
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = ordenados.slice(startIndex, startIndex + pageSize);
  const startLabel = total === 0 ? 0 : startIndex + 1;
  const endLabel = startIndex + pageRows.length;

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortBy !== key) {
      return (
        <span className="ml-1 text-[10px] text-gray-400 select-none">↑↓</span>
      );
    }
    return (
      <span className="ml-1 text-[10px] text-brand-500 select-none">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  // ---------- EXPORTAR ----------
  const exportToExcel = () => {
    const headers = [
      "N°",
      "Nombre de Equipo",
      "Unidad Educativa",
      "Área de Competencia",
      "Nivel",
      "Departamento",
    ];
    const body = ordenados.map((r, idx) => [
      idx + 1,
      r.nombreEquipo,
      r.unidadEducativa,
      r.area,
      r.nivel,
      r.departamento,
    ]);

    const csv = [headers, ...body]
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

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "equipos_olimpistas.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Inscritos grupal</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f3f4f6; text-align: left; }
            h1 { font-size: 18px; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h1>Inscritos grupal</h1>
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Nombre de Equipo</th>
                <th>Unidad Educativa</th>
                <th>Área de Competencia</th>
                <th>Nivel</th>
                <th>Departamento</th>
              </tr>
            </thead>
            <tbody>
              ${ordenados
                .map(
                  (r, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${r.nombreEquipo}</td>
                  <td>${r.unidadEducativa}</td>
                  <td>${r.area}</td>
                  <td>${r.nivel}</td>
                  <td>${r.departamento}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  // ---------- VER MIEMBROS ----------
  const handleVerMiembros = async (row: TeamRow) => {
    try {
      setEquipoSeleccionado({ id: row.idEquipo, nombre: row.nombreEquipo });
      setOpenMiembros(true);
      setLoadingMiembros(true);
      setErrorMiembros(null);
      setMiembros([]);

      const res = await fetch(
        `${API_URL}/api/equipos/${row.idEquipo}/miembros`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Error");

      setMiembros(json.miembros as Miembro[]);
    } catch (err) {
      console.error("Error cargando miembros", err);
      setErrorMiembros("No se pudieron cargar los miembros del equipo.");
    } finally {
      setLoadingMiembros(false);
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="space-y-6">
      {/* Título + botones exportar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Lista de Olimpistas
          </h1>
          <nav className="mt-1 text-sm text-gray-500">
            <span>Inicio</span>
            <span className="mx-1">›</span>
            <span className="text-gray-700">Inscritos grupal</span>
          </nav>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <span className="mr-2">⬇️</span>
            Exportar Excel
          </button>
          <button
            type="button"
            onClick={exportToPDF}
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <span className="mr-2">⬇️</span>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre de equipo, unidad educativa, área..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs font-medium tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3">N°</th>

                <th
                  className="cursor-pointer px-6 py-3"
                  onClick={() => toggleSort("nombreEquipo")}
                >
                  <div className="flex items-center gap-1">
                    <span>Nombre de Equipo</span>
                    {renderSortIcon("nombreEquipo")}
                  </div>
                </th>

                <th
                  className="cursor-pointer px-6 py-3"
                  onClick={() => toggleSort("unidadEducativa")}
                >
                  <div className="flex items-center gap-1">
                    <span>Unidad Educativa</span>
                    {renderSortIcon("unidadEducativa")}
                  </div>
                </th>

                <th
                  className="cursor-pointer px-6 py-3"
                  onClick={() => toggleSort("area")}
                >
                  <div className="flex items-center gap-1">
                    <span>Área de Competencia</span>
                    {renderSortIcon("area")}
                  </div>
                </th>

                <th
                  className="cursor-pointer px-6 py-3"
                  onClick={() => toggleSort("nivel")}
                >
                  <div className="flex items-center gap-1">
                    <span>Nivel</span>
                    {renderSortIcon("nivel")}
                  </div>
                </th>

                <th
                  className="cursor-pointer px-6 py-3"
                  onClick={() => toggleSort("departamento")}
                >
                  <div className="flex items-center gap-1">
                    <span>Departamento</span>
                    {renderSortIcon("departamento")}
                  </div>
                </th>

                <th className="px-6 py-3 text-right">Acción</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Cargando equipos...
                  </td>
                </tr>
              )}

              {!loading && errorMsg && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-600">
                    {errorMsg}
                  </td>
                </tr>
              )}

              {!loading && !errorMsg && pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No hay resultados.
                  </td>
                </tr>
              )}

              {!loading &&
                !errorMsg &&
                pageRows.map((row, idx) => (
                  <tr
                    key={row.idParticipacion}
                    className="border-t border-gray-100 last:border-b"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {startIndex + idx + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.nombreEquipo}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {row.unidadEducativa}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{row.area}</td>
                    <td className="px-6 py-4 text-gray-700">{row.nivel}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {row.departamento}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-sm font-medium text-brand-500 hover:underline"
                        onClick={() => handleVerMiembros(row)}
                      >
                        Ver miembros
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer paginación */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm text-gray-600">
          <span>
            Mostrando {startLabel} a {endLabel} de {total}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-sm disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <span className="mx-1 rounded-lg bg-brand-500 px-3 py-1 text-sm font-medium text-white">
              {currentPage}
            </span>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-sm disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* MODAL MIEMBROS */}
      {openMiembros && equipoSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpenMiembros(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Miembros de {equipoSeleccionado.nombre}
              </h2>
              <button
                className="text-sm text-gray-500 hover:text-gray-800"
                onClick={() => setOpenMiembros(false)}
              >
                ✕
              </button>
            </div>

            {loadingMiembros && (
              <p className="text-sm text-gray-500">Cargando miembros...</p>
            )}

            {errorMiembros && (
              <p className="text-sm text-red-600">{errorMiembros}</p>
            )}

            {!loadingMiembros && !errorMiembros && miembros.length === 0 && (
              <p className="text-sm text-gray-500">
                Este equipo no tiene miembros registrados.
              </p>
            )}

            {!loadingMiembros && miembros.length > 0 && (
              <table className="mt-2 w-full text-left text-sm text-gray-700">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="py-1 pr-2">N°</th>
                    <th className="py-1 pr-2">Nombre</th>
                    <th className="py-1 pr-2">Unidad Educativa</th>
                    <th className="py-1 pr-2">Departamento</th>
                    <th className="py-1 pr-2">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {miembros.map((m, idx) => (
                    <tr key={m.idOlimpista} className="border-b last:border-0">
                      <td className="py-1 pr-2 text-gray-500">{idx + 1}</td>
                      <td className="py-1 pr-2">{m.nombreCompleto}</td>
                      <td className="py-1 pr-2">{m.unidadEducativa}</td>
                      <td className="py-1 pr-2">{m.departamento}</td>
                      <td className="py-1 pr-2">{m.rolEnEquipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaInscritosGrupal;
