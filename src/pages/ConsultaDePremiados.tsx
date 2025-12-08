// src/pages/ConsultaDePremiados.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Award, Medal, Star, Info } from "lucide-react";
import TablaBase from "../components/tables/TablaBase";
import { api } from "../api";

type ModalidadCategoria = "INDIVIDUAL" | "GRUPAL";
type Medalla = "ORO" | "PLATA" | "BRONCE" | "MENCIÓN" | null;

interface PremiadoItem {
  id: number;
  nombreCompleto: string;
  unidadEducativa: string;
  nota: number;
  modalidad: ModalidadCategoria;
  posicion: number;
  medalla: Medalla;
}

interface MedalleroBackend {
  oros_final: number;
  platas_final: number;
  bronces_final: number;
  menciones_final: number;
}

interface FiltroCategoriaDTO {
  area: string;
  niveles: string[];
}

const ConsultaDePremiados: React.FC = () => {
  const navigate = useNavigate();
  const gestion = new Date().getFullYear();

  const [filtrosCategorias, setFiltrosCategorias] = useState<FiltroCategoriaDTO[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<string>("");
  const [nivelSeleccionado, setNivelSeleccionado] = useState<string>("");

  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [errorFiltros, setErrorFiltros] = useState<string | null>(null);

  const [loadingResultados, setLoadingResultados] = useState(false);
  const [errorResultados, setErrorResultados] = useState<string | null>(null);

  const [premiados, setPremiados] = useState<PremiadoItem[]>([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [medallero, setMedallero] = useState<MedalleroBackend | null>(null);
  const [totalPremiados, setTotalPremiados] = useState(0);

  // =========================
  // Filtros (área / nivel)
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
  // Consulta de premiados
  // =========================
  const handleBuscarPremiados = async () => {
    if (!areaSeleccionada || !nivelSeleccionado) {
      setErrorResultados("Seleccione un área y un nivel.");
      setPremiados([]);
      setMedallero(null);
      setTotalPremiados(0);
      setBusquedaRealizada(true);
      return;
    }

    setLoadingResultados(true);
    setErrorResultados(null);
    setPremiados([]);
    setMedallero(null);
    setTotalPremiados(0);
    setBusquedaRealizada(true);

    try {
      const params = new URLSearchParams({
        area: areaSeleccionada,
        nivel: nivelSeleccionado,
        gestion: String(gestion),
      });

      const resp = await api(`/premiados?${params.toString()}`);
      const data = (resp.data ?? []) as PremiadoItem[];

      setPremiados(data);
      setTotalPremiados(resp.total ?? data.length ?? 0);
      setMedallero(resp.medallero ?? null);
    } catch (err: any) {
      setErrorResultados(err?.message || "No se pudieron cargar los premiados.");
      setPremiados([]);
      setMedallero(null);
      setTotalPremiados(0);
    } finally {
      setLoadingResultados(false);
    }
  };

  // =========================
  // Métricas por tipo de medalla
  // =========================
  const conteos = useMemo(() => {
    const oro = premiados.filter((p) => p.medalla === "ORO").length;
    const plata = premiados.filter((p) => p.medalla === "PLATA").length;
    const bronce = premiados.filter((p) => p.medalla === "BRONCE").length;
    const mencion = premiados.filter((p) => p.medalla === "MENCIÓN").length;
    return { oro, plata, bronce, mencion };
  }, [premiados]);

  // =========================
  // Tabla
  // =========================
  const columnas = [
    {
      clave: "posicion" as const,
      titulo: "Posición",
      alineacion: "centro" as const,
      formatearCelda: (valor: number) => (
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          #{valor}
        </span>
      ),
    },
    {
      clave: "nombreCompleto" as const,
      titulo: "Ganador / equipo",
      alineacion: "izquierda" as const,
      formatearCelda: (valor: string, fila: PremiadoItem) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {valor}
          </span>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {fila.modalidad === "INDIVIDUAL" ? "Modalidad individual" : "Modalidad grupal"}
          </span>
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
      clave: "nota" as const,
      titulo: "Nota",
      alineacion: "centro" as const,
      formatearCelda: (valor: number) => (
        <span className="inline-flex rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-800 shadow-sm dark:bg-blue-900/40 dark:text-blue-200">
          {valor.toFixed(2)}
        </span>
      ),
    },
    {
      clave: "medalla" as const,
      titulo: "Distinción",
      alineacion: "centro" as const,
      formatearCelda: (valor: Medalla) => {
        if (!valor) {
          return (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Sin medalla
            </span>
          );
        }

        let classes =
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ";
        let label = "";
        let icon: React.ReactNode = null;

        if (valor === "ORO") {
          classes +=
            "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
          label = "Medalla de oro";
          icon = <Award className="mr-1.5 h-4 w-4" />;
        } else if (valor === "PLATA") {
          classes +=
            "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
          label = "Medalla de plata";
          icon = <Star className="mr-1.5 h-4 w-4" />;
        } else if (valor === "BRONCE") {
          classes +=
            "bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
          label = "Medalla de bronce";
          icon = <Medal className="mr-1.5 h-4 w-4" />;
        } else {
          classes +=
            "bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200";
          label = "Mención de honor";
          icon = <Info className="mr-1.5 h-4 w-4" />;
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

  const claseFila = (fila: PremiadoItem) => {
    if (fila.medalla === "ORO") {
      return "bg-yellow-50 dark:bg-yellow-900/25 border-l-4 border-yellow-500";
    }
    if (fila.medalla === "PLATA") {
      return "bg-slate-50 dark:bg-slate-800/60 border-l-4 border-slate-400";
    }
    if (fila.medalla === "BRONCE") {
      return "bg-orange-50 dark:bg-orange-900/25 border-l-4 border-orange-500";
    }
    if (fila.medalla === "MENCIÓN") {
      return "bg-indigo-50 dark:bg-indigo-900/25 border-l-4 border-indigo-500";
    }
    return "hover:bg-gray-50 dark:hover:bg-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-md transition hover:border-blue-500 hover:bg-gray-50 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Lista de premiados
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ganadores por área y nivel. Gestión {gestion}.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs font-medium">
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-yellow-500" />
                Oro
              </span>
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-slate-500" />
                Plata
              </span>
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-orange-500" />
                Bronce
              </span>
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-indigo-500" />
                Mención de honor
              </span>
            </div>
          </div>
        </header>

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
                  setPremiados([]);
                  setBusquedaRealizada(false);
                  setErrorResultados(null);
                  setMedallero(null);
                  setTotalPremiados(0);
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
                  setPremiados([]);
                  setBusquedaRealizada(false);
                  setErrorResultados(null);
                  setMedallero(null);
                  setTotalPremiados(0);
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
              onClick={handleBuscarPremiados}
              disabled={
                loadingResultados ||
                loadingFiltros ||
                !areaSeleccionada ||
                !nivelSeleccionado
              }
              className="mx-auto flex w-full max-w-md items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {loadingResultados ? "Consultando resultados..." : "Ver resultados finales"}
            </button>
          </div>

          {medallero && busquedaRealizada && !errorResultados && (
            <div className="mt-6 grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-200 md:grid-cols-2">
              <div className="flex items-start gap-2">
                <Award className="mt-0.5 h-4 w-4 text-yellow-500" />
                <div>
                  <p className="font-semibold">Configuración de medallero</p>
                  <p>
                    Oro:{" "}
                    <span className="font-semibold">
                      {medallero.oros_final}
                    </span>{" "}
                    · Plata:{" "}
                    <span className="font-semibold">
                      {medallero.platas_final}
                    </span>{" "}
                    · Bronce:{" "}
                    <span className="font-semibold">
                      {medallero.bronces_final}
                    </span>{" "}
                    · Menciones:{" "}
                    <span className="font-semibold">
                      {medallero.menciones_final}
                    </span>
                    .
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-semibold">Resumen de ganadores</p>
                  <p>
                    Oro:{" "}
                    <span className="font-semibold">{conteos.oro}</span> · Plata:{" "}
                    <span className="font-semibold">{conteos.plata}</span> · Bronce:{" "}
                    <span className="font-semibold">{conteos.bronce}</span> ·
                    Menciones:{" "}
                    <span className="font-semibold">{conteos.mencion}</span> ·
                    Total premiados:{" "}
                    <span className="font-semibold">{totalPremiados}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        {busquedaRealizada && !loadingResultados && (
          <div className="space-y-6">
            {errorResultados && (
              <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span>{errorResultados}</span>
              </div>
            )}

            {!errorResultados && (
              <>
                <div className="mb-2 text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Ganadores para {areaSeleccionada} · {nivelSeleccionado}
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Gestión {gestion}. Total de premiados:{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {totalPremiados}
                    </span>
                    .
                  </p>
                </div>

                {premiados.length > 0 ? (
                  <TablaBase
                    datos={premiados}
                    columnas={columnas}
                    className="overflow-hidden rounded-2xl shadow-2xl"
                    conOrdenamiento={false}
                    claseFila={claseFila}
                  />
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white py-16 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No se encontraron premiados para esta área y nivel o los
                      resultados finales aún no fueron publicados.
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

export default ConsultaDePremiados;
