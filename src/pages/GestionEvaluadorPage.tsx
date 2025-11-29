// src/pages/GestionEvaluadorPage.tsx
import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/** Tipo que viene del backend */
type BackendEvaluador = {
  id: number;
  numeroDocumento: string;
  nombreCompleto: string;
  profesion: string;
  institucion: string;
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

        const resp = await fetch(`${API_URL}/evaluadores`);
        if (!resp.ok) {
          console.error("Error HTTP al obtener evaluadores:", resp.status, resp.statusText);
          throw new Error("Error al obtener evaluadores");
        }

        const data = await resp.json();
        // asumo respuesta { ok: true, data: BackendEvaluador[] } o directamente []
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
        ev.profesion,
        ev.institucion,
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
      const resp = await fetch(`${API_URL}/evaluadores/${evaluador.id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habilitado: nuevoEstado }),
      });

      if (!resp.ok) throw new Error("Error al actualizar estado");

      // Actualizar en memoria
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
    <div className="flex flex-col gap-6">
      {/* Título y breadcrumb, similar a otras pantallas */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-800">
          Gestión de Evaluador
        </h1>
        <span className="text-sm text-slate-500">
          Inicio › Gestión de Evaluador
        </span>
      </div>

      {/* Card principal */}
      <div className="rounded-sm border border-stroke bg-white px-6 pt-6 pb-4 shadow-default">
        {/* Barra de búsqueda */}
        <div className="mb-4 flex justify-between items-center">
          <div className="w-full max-w-md">
            <input
              type="text"
              className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 text-sm outline-none focus:border-primary"
              placeholder="Buscar por nombre, documento, profesión o institución..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-50 text-left text-sm font-semibold text-slate-600">
                <th className="py-3 px-4 w-[60px]">N°</th>
                <th className="py-3 px-4">N° Documento</th>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Profesión</th>
                <th className="py-3 px-4">Institución</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 w-[160px]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-sm">
                    Cargando evaluadores...
                  </td>
                </tr>
              )}

              {!cargando && error && (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!cargando && !error && evaluadoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-sm">
                    No se encontraron evaluadores.
                  </td>
                </tr>
              )}

              {!cargando &&
                !error &&
                evaluadoresFiltrados.map((ev, index) => (
                  <tr
                    key={ev.id}
                    className="border-t border-slate-100 text-sm text-slate-700"
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{ev.numeroDocumento}</td>
                    <td className="py-3 px-4">{ev.nombreCompleto}</td>
                    <td className="py-3 px-4">{ev.profesion}</td>
                    <td className="py-3 px-4">{ev.institucion}</td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          ev.habilitado
                            ? "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                            : "inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700"
                        }
                      >
                        {ev.habilitado ? "Habilitado" : "Inhabilitado"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        className={
                          ev.habilitado
                            ? "rounded-full bg-rose-500 px-4 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                            : "rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white hover:bg-emerald-600"
                        }
                        onClick={() => handleToggleEstado(ev)}
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
  );
};

export default GestionEvaluadorPage;
