// src/pages/ResultadosDeCalificaciones.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Loader2, Award, CheckCircle2, XCircle } from "lucide-react";

type EstadoResultado = "Clasificado" | "No clasificado";
type Modalidad = "Individual" | "Grupal";
type TipoMedalla = "ORO" | "PLATA" | "BRONCE" | "MENCIÓN";

interface ResultadoExamen {
  area: string;
  nivel: string;
  modalidad: Modalidad;
  fase: string;
  estado: EstadoResultado;
  nota: number | null;
  notaEvaluador: string;
  medalla?: TipoMedalla | null;
  nombreEquipo?: string;
}

interface DatosEstudiante {
  nombreCompleto: string;
  ci: string;
  unidadEducativa: string;
  resultados: ResultadoExamen[];
}

const ResultadosDeCalificaciones: React.FC = () => {
  const navigate = useNavigate();

  const [ciInput, setCiInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [datosEncontrados, setDatosEncontrados] =
    useState<DatosEstudiante | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buscarPorCI = async () => {
    const ci = ciInput.trim();

    if (!ci) {
      setError("Ingrese el CI del olimpista.");
      setDatosEncontrados(null);
      return;
    }

    if (!/^\d+$/.test(ci)) {
      setError("El CI solo debe tener números.");
      setDatosEncontrados(null);
      return;
    }

    setLoading(true);
    setError(null);
    setDatosEncontrados(null);

    try {
      // Backend existente: GET /api/olimpista/:ci
      const resp = await api(`/olimpista/${ci}`);
      const data = resp.data as DatosEstudiante;
      setDatosEncontrados(data);
    } catch (err: any) {
      setDatosEncontrados(null);
      setError(
        err?.message || "No se pudieron obtener los resultados. Intente de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldBase =
    "w-full px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition";

  const getEstadoClasses = (estado: EstadoResultado) => {
    return estado === "Clasificado"
      ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
      : "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300";
  };

  const getMedallaClasses = (medalla: TipoMedalla): string => {
    switch (medalla) {
      case "ORO":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
      case "PLATA":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200";
      case "BRONCE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
      case "MENCIÓN":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200";
      default:
        return "";
    }
  };

  const getEstadoIcon = (estado: EstadoResultado) => {
    if (estado === "Clasificado") {
      return (
        <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
      );
    }
    return <XCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        {/* Título */}
        <h1 className="mb-12 text-center text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">
          Resultados de la competencia
        </h1>

        {/* BOTONES CON NAVEGACIÓN */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Lista de Clasificados */}
          <button
            onClick={() => navigate("/lista-clasificados")}
            className="group flex flex-col items-center justify-center rounded-3xl bg-blue-600 p-10 text-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-blue-700 hover:shadow-2xl"
          >
            <svg
              className="mb-6 h-20 w-20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <h3 className="mb-2 text-2xl font-bold">Lista de clasificados</h3>
            <p className="text-center text-sm opacity-90">
              Ver participantes que pasaron a la siguiente fase
            </p>
          </button>

          {/* Lista de Premiados */}
          <button
            onClick={() => navigate("/consulta-de-premiados")}
            className="group flex flex-col items-center justify-center rounded-3xl bg-blue-600 p-10 text-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:bg-blue-700 hover:shadow-2xl"
          >
            <svg
              className="mb-6 h-20 w-20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h3 className="mb-2 text-2xl font-bold">Lista de premiados</h3>
            <p className="text-center text-sm opacity-90">
              Ganadores de medallas y menciones
            </p>
          </button>
        </div>

        {/* CONSULTA INDIVIDUAL */}
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-5 text-white">
              <h2 className="text-center text-2xl font-bold">
                Consulta de resultados por CI
              </h2>
            </div>
            <div className="p-8">
              <label className="mb-4 block text-center text-lg font-medium text-gray-700 dark:text-gray-300">
                Ingrese el número de CI del olimpista
              </label>
              <input
                type="text"
                value={ciInput}
                onChange={(e) => setCiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") buscarPorCI();
                }}
                className={fieldBase}
                placeholder="Ej: 8429135"
                autoFocus
              />

              {error && (
                <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-center text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                onClick={buscarPorCI}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {loading ? (
                  <>
                    <Loader2 className="-ml-1 mr-3 h-6 w-6 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  "Consultar resultados"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        {datosEncontrados && !loading && (
          <div className="mx-auto mt-16 max-w-5xl space-y-6">
            {/* Datos del olimpista */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="grid grid-cols-1 gap-4 text-gray-700 dark:text-gray-300 md:grid-cols-3">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    Olimpista:
                  </span>{" "}
                  {datosEncontrados.nombreCompleto}
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    CI:
                  </span>{" "}
                  {datosEncontrados.ci}
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    Unidad educativa:
                  </span>{" "}
                  {datosEncontrados.unidadEducativa}
                </div>
              </div>
            </div>

            {/* Listado de resultados */}
            <div className="overflow-hidden rounded-lg border-2 border-blue-500 bg-white shadow-lg dark:bg-gray-900">
              <div className="bg-blue-600 px-6 py-3 font-semibold text-white">
                {datosEncontrados.resultados.length} resultado
                {datosEncontrados.resultados.length > 1 ? "s" : ""} encontrado
                {datosEncontrados.resultados.length > 1 ? "s" : ""}
              </div>
              <div className="space-y-6 p-6">
                {datosEncontrados.resultados.map((resultado, idx) => {
                  const estadoClasses = getEstadoClasses(resultado.estado);
                  const esClasificado = resultado.estado === "Clasificado";

                  return (
                    <div
                      key={idx}
                      className="rounded-lg bg-gray-100 p-6 dark:bg-gray-800"
                    >
                      {/* Información general */}
                      <div className="mb-4 grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Área
                          </div>
                          <div className="text-lg font-bold text-gray-800 dark:text-white">
                            {resultado.area}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Nivel
                          </div>
                          <div className="text-lg font-bold text-gray-800 dark:text-white">
                            {resultado.nivel}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Modalidad
                          </div>
                          <div className="text-lg font-bold text-gray-800 dark:text-white">
                            {resultado.modalidad}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Fase
                          </div>
                          <div className="text-lg font-bold text-gray-800 dark:text-white">
                            {resultado.fase}
                          </div>
                        </div>
                      </div>

                      {/* Estado + nota + medalla */}
                      <div
                        className={`rounded-lg border p-4 ${estadoClasses}`}
                      >
                        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-800 dark:bg-black/30 dark:text-gray-100">
                              {getEstadoIcon(resultado.estado)}
                              <span>Estado: {resultado.estado}</span>
                            </div>

                            {resultado.modalidad === "Grupal" &&
                              resultado.nombreEquipo && (
                                <div className="text-sm">
                                  <span className="font-semibold">
                                    Equipo:
                                  </span>{" "}
                                  {resultado.nombreEquipo}
                                </div>
                              )}

                            {resultado.notaEvaluador && (
                              <p className="text-sm opacity-90">
                                <span className="font-semibold">
                                  Comentario del evaluador:
                                </span>{" "}
                                {resultado.notaEvaluador}
                              </p>
                            )}

                            {resultado.medalla && (
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getMedallaClasses(
                                    resultado.medalla
                                  )}`}
                                >
                                  <Award
                                    className="mr-1.5 h-4 w-4"
                                    aria-hidden="true"
                                  />
                                  Medalla: {resultado.medalla}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Nota SOLO si no es null */}
                          {resultado.nota !== null && (
                            <div className="min-w-[140px] text-right">
                              <div className="text-xs uppercase tracking-wider opacity-80">
                                Nota obtenida
                              </div>
                              <div className="text-3xl font-extrabold">
                                {resultado.nota}
                              </div>
                              {esClasificado && (
                                <div className="mt-1 text-xs font-bold text-green-700 dark:text-green-300">
                                  Clasificado a la siguiente fase
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultadosDeCalificaciones;
