import React, { useMemo, useState } from "react";

type TeamRow = {
  id: number;
  numero: number;
  nombreEquipo: string;
  unidadEducativa: string;
  area: string;
  nivel: string;
  tutorLegal: string;
  departamento: string;
  miembros: string[];
};

const DATA_EJEMPLO: TeamRow[] = [
  {
    id: 1,
    numero: 1,
    nombreEquipo: "Equipo Newton",
    unidadEducativa: "Colegio Don Bosco",
    area: "Física",
    nivel: "Secundario",
    tutorLegal: "María Pérez",
    departamento: "Cochabamba",
    miembros: [
      "Juan López Vargas",
      "Ana María Rojas",
      "Carlos Martínez",
    ],
  },
  {
    id: 2,
    numero: 2,
    nombreEquipo: "Team Euler",
    unidadEducativa: "Colegio La Salle",
    area: "Matemáticas",
    nivel: "Primario",
    tutorLegal: "Evan Castañeda",
    departamento: "La Paz",
    miembros: [
      "Sofía Gutiérrez",
      "Luis Fernández",
      "Diego Rocha",
    ],
  },
  {
    id: 3,
    numero: 3,
    nombreEquipo: "Los Programadores",
    unidadEducativa: "UMSS",
    area: "Informática",
    nivel: "Universitario",
    tutorLegal: "Carlos Andrade",
    departamento: "Cochabamba",
    miembros: [
      "Miguel Cárdenas",
      "Roberto Leeson",
      "Alicia Josías",
    ],
  },
];

const ListaDeInscritosGrupal: React.FC = () => {
  const [rows] = useState<TeamRow[]>(DATA_EJEMPLO);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const [teamSeleccionado, setTeamSeleccionado] = useState<TeamRow | null>(
    null
  );

  // 🔍 filtro por texto
  const filtrados = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return rows;

    return rows.filter((r) =>
      [
        r.numero,
        r.nombreEquipo,
        r.unidadEducativa,
        r.area,
        r.nivel,
        r.tutorLegal,
        r.departamento,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(text))
    );
  }, [rows, q]);

  // 📄 paginación
  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtrados.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Título + botones (igual que Individual, pero texto Grupal) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lista de Olímpistas (Grupal)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Equipos inscritos: nombre de equipo, área, nivel, tutor y miembros.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              <span>Exportar</span>
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 dark:bg-indigo-600 dark:hover:bg-indigo-700">
              <span>Importar CSV</span>
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por equipo, área, nivel, tutor, departamento..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
            />
            <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">N°</th>
                <th className="px-4 py-3">Nombre de equipo</th>
                <th className="px-4 py-3">Unidad educativa</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3">Tutor legal</th>
                <th className="px-4 py-3">Departamento</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No hay equipos registrados.
                  </td>
                </tr>
              )}

              {pageRows.map((r) => (
                <tr key={r.id} className="border-t last:border-b dark:border-gray-700">
                  <td className="px-4 py-3 dark:text-gray-300">{r.numero}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {r.nombreEquipo}
                  </td>
                  <td className="px-4 py-3 dark:text-gray-300">{r.unidadEducativa}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{r.area}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{r.nivel}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{r.tutorLegal}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{r.departamento}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-gray-600 dark:text-indigo-400 dark:hover:bg-gray-700"
                        onClick={() => setTeamSeleccionado(r)}
                      >
                        <span>Ver miembros</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pie de tabla: paginación simple */}
          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Mostrando{" "}
              {pageRows.length
                ? (currentPage - 1) * pageSize + 1
                : 0}{" "}
              – {(currentPage - 1) * pageSize + pageRows.length} de{" "}
              {filtrados.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="rounded-md border px-2 py-1 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`rounded-md border px-2 py-1 ${n === currentPage
                      ? "bg-gray-900 text-white dark:bg-indigo-600"
                      : "bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                    }`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="rounded-md border px-2 py-1 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Modal: ver miembros */}
        {teamSeleccionado && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            onClick={() => setTeamSeleccionado(null)}
          >
            <div
              className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800 dark:border dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
                Miembros de {teamSeleccionado.nombreEquipo}
              </h2>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                Equipo de {teamSeleccionado.unidadEducativa} —{" "}
                {teamSeleccionado.area} ({teamSeleccionado.nivel})
              </p>
              <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-gray-800 dark:text-gray-300">
                {teamSeleccionado.miembros.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
              <div className="flex justify-end">
                <button
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setTeamSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaDeInscritosGrupal;
