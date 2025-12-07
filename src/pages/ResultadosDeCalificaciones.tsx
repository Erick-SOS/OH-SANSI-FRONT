// src/pages/ResultadosDeCalificaciones.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type EstadoParticipacion = "Clasificado" | "No clasificado";
type Modalidad = "Individual" | "Grupal";
type Medalla = "ORO" | "PLATA" | "BRONCE" | "MENCIÓN" | null;

interface ResultadoExamenDTO {
  area: string;
  nivel: string;
  modalidad: Modalidad;
  fase: string;
  estado: EstadoParticipacion;
  nota: number | null;
  notaEvaluador: string;
  medalla?: Medalla;
  nombreEquipo?: string;
}

interface OlimpistaDTO {
  nombreCompleto: string;
  ci: string;
  unidadEducativa: string;
  resultados: ResultadoExamenDTO[];
}

interface ApiRespuestaOlimpista {
  success: boolean;
  data?: OlimpistaDTO;
  message?: string;
}

const ResultadosDeCalificaciones: React.FC = () => {
  const navigate = useNavigate();

  const [ciInput, setCiInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [datosEncontrados, setDatosEncontrados] = useState<OlimpistaDTO | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const buscarPorCI = async () => {
    const ci = ciInput.trim();

    if (!ci) {
      setError("Por favor, ingrese el número de CI del olimpista.");
      return;
    }

    if (!/^\d+$/.test(ci)) {
      setError("El CI solo debe contener números.");
      return;
    }

    setLoading(true);
    setError(null);
    setDatosEncontrados(null);

    try {
      const resp = (await api(`/olimpista/${ci}`)) as ApiRespuestaOlimpista;

      if (!resp.success || !resp.data) {
        setError(resp.message || "No se encontraron resultados.");
        return;
      }

      setDatosEncontrados(resp.data);
    } catch (e: any) {
      setError(e?.message || "No se pudo consultar los resultados.");
    } finally {
      setLoading(false);
    }
  };

  const fieldBase =
    "w-full px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition";

  const getMedallaLabel = (medalla?: Medalla) => {
    if (!medalla) return null;
    switch (medalla) {
      case "ORO":
        return "Medalla de oro";
      case "PLATA":
        return "Medalla de plata";
      case "BRONCE":
        return "Medalla de bronce";
      case "MENCIÓN":
        return "Mención de honor";
      default:
        return null;
    }
  };

  const medallaChipClasses = (medalla?: Medalla) => {
    if (!medalla) return "";
    switch (medalla) {
      case "ORO":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      case "PLATA":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-200 border-gray-300 dark:border-gray-600";
      case "BRONCE":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700";
      case "MENCIÓN":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Título */}
        <h1 className="text-center text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-12">
          Resultados de la Competencia
        </h1>

        {/* BOTONES CON NAVEGACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Lista de Clasificados */}
          <button
            onClick={() => navigate("/lista-clasificados")}
            className="group flex flex-col items-center justify-center p-10 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
          >
            <svg
              className="w-20 h-20 mb-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Lista de Clasificados</h3>
            <p className="text-sm opacity-90 text-center">
              Ver estudiantes que pasaron a la siguiente fase
            </p>
          </button>

          {/* Lista de Premiados */}
          <button
            onClick={() => navigate("/consulta-de-premiados")}
            className="group flex flex-col items-center justify-center p-10 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
          >
            <svg
              className="w-20 h-20 mb-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Lista de Premiados</h3>
            <p className="text-sm opacity-90 text-center">
              Ganadores de medallas y menciones de honor
            </p>
          </button>
        </div>

        {/* CONSULTA INDIVIDUAL */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5">
              <h2 className="text-2xl font-bold text-center">
                Realice la consulta de un Olimpista específico
              </h2>
            </div>
            <div className="p-8">
              <label className="block text-center text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                Ingrese el número de CI del olimpista
              </label>
              <input
                type="text"
                value={ciInput}
                onChange={(e) => setCiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarPorCI()}
                className={fieldBase}
                placeholder="Ej: 8429135"
                autoFocus
              />

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={buscarPorCI}
                disabled={loading}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] shadow-lg flex justify-center items-center text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Consultando...
                  </>
                ) : (
                  "Consultar Resultados"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        {datosEncontrados && !loading && (
          <div className="mt-16 space-y-6 max-w-5xl mx-auto">
            {/* Datos del olimpista */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    Nombre del olimpista:
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
                    Unidad Educativa:
                  </span>{" "}
                  {datosEncontrados.unidadEducativa}
                </div>
              </div>
            </div>

            {/* Lista de resultados */}
            <div className="border-2 border-blue-500 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-lg">
              <div className="bg-blue-600 text-white px-6 py-3 font-semibold">
                {datosEncontrados.resultados.length} resultado
                {datosEncontrados.resultados.length !== 1 ? "s" : ""} encontrados
              </div>
              <div className="p-6 space-y-6">
                {datosEncontrados.resultados.map((resultado, index) => {
                  const estaClasificado = resultado.estado === "Clasificado";
                  const medallaLabel = getMedallaLabel(resultado.medalla);

                  return (
                    <div
                      key={`${resultado.area}-${resultado.nivel}-${resultado.fase}-${index}`}
                      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6"
                    >
                      {/* Encabezado: área, nivel, modalidad, fase y medalla */}
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              Área
                            </div>
                            <div className="font-bold text-gray-800 dark:text-white text-lg">
                              {resultado.area}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              Nivel
                            </div>
                            <div className="font-bold text-gray-800 dark:text-white text-lg">
                              {resultado.nivel}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              Modalidad
                            </div>
                            <div className="font-bold text-gray-800 dark:text-white text-lg">
                              {resultado.modalidad}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                              Fase
                            </div>
                            <div className="font-bold text-gray-800 dark:text-white text-lg">
                              {resultado.fase}
                            </div>
                          </div>
                        </div>

                        {/* Medalla y equipo (si aplica) */}
                        <div className="flex flex-col items-start md:items-end gap-2">
                          {medallaLabel && (
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${medallaChipClasses(
                                resultado.medalla
                              )}`}
                            >
                              {medallaLabel}
                            </span>
                          )}
                          {resultado.nombreEquipo && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              Equipo: {resultado.nombreEquipo}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Estado / nota / comentario */}
                      <div
                        className={`rounded-lg p-4 border ${
                          estaClasificado
                            ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
                            : "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">
                              Estado: {resultado.estado}
                            </h3>
                            <p className="text-sm opacity-90">
                              Nota del evaluador:{" "}
                              <span className="font-medium">
                                {resultado.notaEvaluador}
                              </span>
                            </p>
                          </div>
                          <div className="text-right min-w-[120px]">
                            <div className="text-3xl font-bold">
                              {resultado.nota !== null
                                ? resultado.nota.toFixed(2)
                                : "—"}
                            </div>
                            <div className="text-xs uppercase tracking-wider opacity-80">
                              Nota final
                            </div>
                            {estaClasificado && (
                              <div className="text-xs font-bold mt-1 text-green-700 dark:text-green-300">
                                Habilitado para la siguiente fase
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sin resultados pero sin error: no mostramos nada extra */}
      </div>
    </div>
  );
};

export default ResultadosDeCalificaciones;
