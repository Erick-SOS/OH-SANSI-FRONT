// src/pages/GestionEvaluadorPage.tsx
import React, { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://back-oh-sansi.vercel.app";

/** Tipo que viene del backend */
type BackendEvaluador = {
  id: number;
  numeroDocumento: string;
  nombreCompleto: string;
  profesion: string | null;
  institucion: string | null;
  habilitado: boolean; // true = Habilitado, false = Inhabilitado
};

const GestionEvaluadorPage: React.FC = () => {
  const [evaluadores, setEvaluadores] = useState<BackendEvaluador[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Cargar lista de evaluadores */
  useEffect(() => {
    const fetchEvaluadores = async () => {
      try {
        setCargando(true);
        setError(null);

        // 👇 Ahora apunta a /api/evaluadores en el backend
        const resp = await fetch(`${API_URL}/api/evaluadores`);
        if (!resp.ok) throw new Error("Error al obtener evaluadores");

        const data = await resp.json();
        // { ok: true, data: [...] } o directamente [...]
        setEvaluadores(data.data ?? data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la lista de evaluadores");
      } finally {
        setCargando(false);
      }
    };

    fetchEvaluadores();
  }, []);

  /** Filtro por búsqueda */
  const evaluadoresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return evaluadores;
    return evaluadores.filter((ev) =>
      [
        ev.numeroDocumento,
        ev.nombreCompleto,
        ev.profesion ?? "",
        ev.institucion ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(texto)
    );
  }, [busqueda, evaluadores]);

  /** Toggle de habilitado/inhabilitado */
  const handleToggleEstado = async (evaluador: BackendEvaluador) => {
    const nuevoEstado = !evaluador.habilitado;

    try {
      // 👇 También con /api delante
      const resp = await fetch(
        `${API_URL}/api/evaluadores/${evaluador.id}/estado`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habilitado: nuevoEstado }),
        }
      );

      if (!resp.ok) throw new Error("Error al actualizar estado");

      setEvaluadores((prev) =>
        prev.map((ev) =>
          ev.id === evaluador.id ? { ...ev, habilitado: nuevoEstado } : ev
        )
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado del evaluador");
    }
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Título y breadcrumb */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Evaluador
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Inicio › Gestión de Evaluador
        </p>
      </div>

      {/* Card principal */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
        <div className="px-6 pt-6 pb-4">
          {/* Buscador */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por nombre, documento, profesión o institución..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-brand-400"
            />
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                  <th className="px-4 py-3 text-center">N°</th>
                  <th className="px-4 py-3">N° Documento</th>
                  <th className="px-4 py-3">Nombre Completo</th>
                  <th className="px-4 py-3">Profesión</th>
                  <th className="px-4 py-3">Institución</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {cargando && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      Cargando evaluadores...
                    </td>
                  </tr>
                )}

                {error && !cargando && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-red-600 dark:text-red-400"
                    >
                      {error}
                    </td>
                  </tr>
                )}

                {!cargando && !error && evaluadoresFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      No se encontraron evaluadores.
                    </td>
                  </tr>
                )}

                {!cargando &&
                  !error &&
                  evaluadoresFiltrados.map((ev, index) => (
                    <tr
                      key={ev.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-4 text-center text-gray-700 dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                        {ev.numeroDocumento}
                      </td>
                      <td className="px-4 py-4 text-gray-800 dark:text-gray-200">
                        {ev.nombreCompleto}
                      </td>
                      <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                        {ev.profesion ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                        {ev.institucion ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            ev.habilitado
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}
                        >
                          {ev.habilitado ? "Habilitado" : "Inhabilitado"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleEstado(ev)}
                          className={`rounded-lg px-5 py-2 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 ${
                            ev.habilitado
                              ? "bg-rose-600 hover:bg-rose-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {ev.habilitado ? "Inhabilitar" : "Habilitar"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionEvaluadorPage;
