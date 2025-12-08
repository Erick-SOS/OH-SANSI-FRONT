// src/pages/ListaDeClasificados.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle, Users } from "lucide-react";
import TablaBase from "../components/tables/TablaBase";
import { api } from "../api";

type EstadoParticipacion = "CLASIFICADO" | "NO_CLASIFICADO" | "DESCALIFICADO";
type ModalidadCategoria = "INDIVIDUAL" | "GRUPAL";

interface ClasificadoItem {
  nombreCompleto: string;
  unidadEducativa: string;
  nota: number | null;
  modalidad: ModalidadCategoria;
  estado: EstadoParticipacion;
}

interface FiltroCategoriaDTO {
  area: string;
  niveles: string[];
}

const ListaDeClasificados: React.FC = () => {
  const navigate = useNavigate();
  const gestion = new Date().getFullYear();

  const [filtrosCategorias, setFiltrosCategorias] = useState<FiltroCategoriaDTO[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<string>("");
  const [nivelSeleccionado, setNivelSeleccionado] = useState<string>("");

  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [errorFiltros, setErrorFiltros] = useState<string | null>(null);

  const [loadingResultados, setLoadingResultados] = useState(false);
  const [errorResultados, setErrorResultados] = useState<string | null>(null);

  const [resultados, setResultados] = useState<ClasificadoItem[]>([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [notaMinimaClasificacion, setNotaMinimaClasificacion] = useState<number | null>(null);
  const [totalParticipantes, setTotalParticipantes] = useState<number>(0);

  // =========================
  // Cargar filtros (áreas y niveles) desde backend
  // =========================
  useEffect(() => {
    const cargarFiltros = async () => {
      setLoadingFiltros(true);
      setErrorFiltros(null);

      try {
        const resp = await api(`/filtros/categorias?gestion=${gestion}`);
        const data = (resp.data ?? []) as FiltroCategoriaDTO[];

        setFiltrosCategorias(data);

        if (data.length > 0) {
          const primeraArea = data[0].area;
          const primerNivel = data[0].niveles[0] ?? "";
          setAreaSeleccionada((prev) => prev || primeraArea);
          setNivelSeleccionado((prev) => prev || primerNivel);
        }
      } catch (err: any) {
        setErrorFiltros(
          err?.message || "No se pudieron cargar los filtros de categorías."
        );
      } finally {
        setLoadingFiltros(false);
      }
    };

    cargarFiltros();
  }, [gestion]);

  const nivelesDisponibles = useMemo(() => {
    if (!areaSeleccionada) return [];
    const filtroArea = filtrosCategorias.find((f) => f.area === areaSeleccionada);
    return filtroArea?.niveles ?? [];
  }, [filtrosCategorias, areaSeleccionada]);

  // =========================
  // Búsqueda de clasificados
  // =========================
  const handleBuscarClasificados = async () => {
    if (!areaSeleccionada || !nivelSeleccionado) {
      setErrorResultados("Seleccione un área y un nivel.");
      setResultados([]);
      setBusquedaRealizada(true);
      setNotaMinimaClasificacion(null);
      setTotalParticipantes(0);
      return;
    }

    setLoadingResultados(true);
    setErrorResultados(null);
    setResultados([]);
    setBusquedaRealizada(true);
    setNotaMinimaClasificacion(null);
    setTotalParticipantes(0);

    try {
      const params = new URLSearchParams({
        area: areaSeleccionada,
        nivel: nivelSeleccionado,
        gestion: String(gestion),
      });

      const resp = await api(`/clasificados?${params.toString()}`);

      const data = (resp.data ?? []) as ClasificadoItem[];
      setResultados(data);
      setTotalParticipantes(resp.total ?? data.length ?? 0);

      const notaMin = typeof resp.nota_min_clasificacion === "number"
        ? resp.nota_min_clasificacion
        : null;
      setNotaMinimaClasificacion(notaMin);
    } catch (err: any) {
      setErrorResultados(
        err?.message || "No se pudieron cargar los clasificados."
      );
      setResultados([]);
      setTotalParticipantes(0);
      setNotaMinimaClasificacion(null);
    } finally {
      setLoadingResultados(false);
    }
  };

  // =========================
  // Columnas tabla
  // =========================
  const columnas = [
    {
      clave: "nombreCompleto" as const,
      titulo: "Participante / equipo",
      alineacion: "izquierda" as const,
      formatearCelda: (valor: string, fila: ClasificadoItem) => (
        <div className="flex flex-col gap-1">
          <span
            className={`font-semibold ${
              fila.estado === "CLASIFICADO"
                ? "text-green-700 dark:text-green-400"
                : fila.estado === "DESCALIFICADO"
                ? "text-red-700 dark:text-red-400"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {valor}
          </span>
          {fila.modalidad === "GRUPAL" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
              <Users className="h-3 w-3" />
              Modalidad grupal
            </span>
          )}
        </div>
      ),
    },
    {
      clave: "unidadEducativa" as const,
      titulo: "Unidad educativa",
      alineacion: "izquierda" as const,
      formatearCelda: (valor: string) => (
        <span className="text-sm text-gray-800 dark:text-gray-200">
          {valor}
        </span>
      ),
    },
    {
      clave: "modalidad" as const,
      titulo: "Modalidad",
      alineacion: "centro" as const,
      formatearCelda: (valor: ModalidadCategoria) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            valor === "INDIVIDUAL"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          }`}
        >
          {valor === "INDIVIDUAL" ? "Individual" : "Grupal"}
        </span>
      ),
    },
    {
      clave: "nota" as const,
      titulo: "Nota",
      alineacion: "centro" as const,
      formatearCelda: (valor: number | null, fila: ClasificadoItem) => {
        if (fila.estado === "DESCALIFICADO") {
          return (
            <span className="text-sm font-bold text-red-700 dark:text-red-400">
              Descalificado
            </span>
          );
        }

        if (valor === null) {
          return (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              —
            </span>
          );
        }

        const cumpleMinimo =
          typeof notaMinimaClasificacion === "number" &&
          notaMinimaClasificacion > 0
            ? valor >= notaMinimaClasificacion
            : valor >= 0; // fallback

        return (
          <span
            className={`inline-block rounded-full px-4 py-2 text-sm font-semibold shadow ${
              cumpleMinimo
                ? "bg-green-100 text-green-800 shadow-green-500/30 dark:bg-green-900/50 dark:text-green-200"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {valor.toFixed(2)}
          </span>
        );
      },
    },
    {
      clave: "estado" as const,
      titulo: "Estado",
      alineacion: "centro" as const,
      formatearCelda: (valor: EstadoParticipacion) => {
        let classes =
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ";
        let label = "";
        let icon = null as React.ReactNode;

        if (valor === "CLASIFICADO") {
          classes +=
            "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300";
          label = "Clasificado";
          icon = <CheckCircle2 className="mr-1.5 h-4 w-4" />;
        } else if (valor === "NO_CLASIFICADO") {
          classes +=
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
          label = "No clasificado";
          icon = <XCircle className="mr-1.5 h-4 w-4" />;
        } else {
          classes +=
            "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
          label = "Descalificado";
          icon = <AlertCircle className="mr-1.5 h-4 w-4" />;
        }

        return (
          <span className={classes}>
            {icon}
            {label}
          </span>
        );
      },
    },
  ];

  const fieldBase =
    "w-full px-4 py-3 rounded-lg border transition focus:outline-none focus:ring-2 bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-blue-500/30 focus:border-blue-300 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:border-gray-600 dark:focus:border-blue-500";

  const claseFila = (fila: ClasificadoItem) => {
    if (fila.estado === "CLASIFICADO") {
      return "bg-green-50/70 dark:bg-green-900/20 border-l-4 border-green-500";
    }
    if (fila.estado === "DESCALIFICADO") {
      return "bg-red-50/70 dark:bg-red-900/20 border-l-4 border-red-500 opacity-90";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        {/* Botón volver */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-500 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        </div>

        {/* Título */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Lista de clasificados
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Resultados oficiales de la fase clasificatoria. Gestión {gestion}.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs font-medium">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              Clasificado
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-gray-400" />
              No clasificado
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              Descalificado
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Área
              </label>
              <select
                value={areaSeleccionada}
                onChange={(e) => {
                  const nuevaArea = e.target.value;
                  setAreaSeleccionada(nuevaArea);
                  const filtroArea = filtrosCategorias.find(
                    (f) => f.area === nuevaArea
                  );
                  setNivelSeleccionado(filtroArea?.niveles[0] ?? "");
                  setResultados([]);
                  setBusquedaRealizada(false);
                  setErrorResultados(null);
                  setNotaMinimaClasificacion(null);
                  setTotalParticipantes(0);
                }}
                className={fieldBase}
                disabled={loadingFiltros || !filtrosCategorias.length}
              >
                {filtrosCategorias.map((f) => (
                  <option key={f.area} value={f.area}>
                    {f.area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nivel
              </label>
              <select
                value={nivelSeleccionado}
                onChange={(e) => {
                  setNivelSeleccionado(e.target.value);
                  setResultados([]);
                  setBusquedaRealizada(false);
                  setErrorResultados(null);
                  setNotaMinimaClasificacion(null);
                  setTotalParticipantes(0);
                }}
                className={fieldBase}
                disabled={loadingFiltros || !nivelesDisponibles.length}
              >
                {nivelesDisponibles.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorFiltros && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4" />
              <span>{errorFiltros}</span>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={handleBuscarClasificados}
              disabled={
                loadingResultados ||
                loadingFiltros ||
                !areaSeleccionada ||
                !nivelSeleccionado
              }
              className="mx-auto flex w-full max-w-md items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {loadingResultados ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Consultando resultados
                </>
              ) : (
                "Ver resultados oficiales"
              )}
            </button>
          </div>

          {notaMinimaClasificacion !== null && busquedaRealizada && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>
                Nota mínima de clasificación para esta categoría:{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {notaMinimaClasificacion.toFixed(2)} puntos
                </span>
                .
              </span>
            </div>
          )}
        </div>

        {/* Resultados */}
        {busquedaRealizada && !loadingResultados && (
          <div className="animate-fade-in">
            {errorResultados && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span>{errorResultados}</span>
              </div>
            )}

            {!errorResultados && (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Resultados para {areaSeleccionada} · {nivelSeleccionado}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Gestión {gestion}. Total de participantes encontrados:{" "}
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {totalParticipantes}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                {resultados.length > 0 ? (
                  <TablaBase
                    datos={resultados}
                    columnas={columnas}
                    className="overflow-hidden rounded-2xl shadow-2xl"
                    conOrdenamiento={false}
                    claseFila={claseFila}
                  />
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No hay participantes para esta categoría o los resultados
                      aún no fueron publicados.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaDeClasificados;
