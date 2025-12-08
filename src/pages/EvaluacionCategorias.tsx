// src/pages/EvaluacionCategorias.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { getToken } from "../components/auth/authStorage";

import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import Paginacion from "../components/ui/Paginacion";
import ResultModal from "../components/modals/ResultModal";

import {
  FiFilter,
  FiTarget,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";

type TipoFase = "CLASIFICATORIA" | "FINAL";
type ModalidadCategoria = "INDIVIDUAL" | "GRUPAL";
type EstadoFase = "PENDIENTE" | "EN_EJECUCION" | "FINALIZADA" | "CANCELADO";

interface CategoriaAsignadaCardDTO {
  idCategoria: number;
  fase: TipoFase;
  area: string;
  nivel: string;
  modalidad: ModalidadCategoria;
  cantidadAsignados: number;
  responsableDeArea: string | null;
  aprobadoPorResponsable: boolean;
  fechaInicioFase: string | null;
  fechaFinFase: string | null;
  estadoFase: EstadoFase;
}

const ITEMS_POR_PAGINA = 8;

function normalizarTexto(s?: string | null): string {
  if (!s) return "";
  return s.toString().toLowerCase();
}

function chipEstadoFase(estado: EstadoFase) {
  switch (estado) {
    case "EN_EJECUCION":
      return "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700";
    case "FINALIZADA": 
      return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700";
    case "PENDIENTE":
      return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:border-yellow-700";
    case "CANCELADO":
    default:
      return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700";
  }
}

function chipFase(fase: TipoFase) {
  if (fase === "CLASIFICATORIA") {
    return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700";
  }
  return "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-700";
}

function chipModalidad(mod: ModalidadCategoria) {
  if (mod === "INDIVIDUAL") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700";
  }
  return "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700";
}

function chipAprobado(aprobado: boolean) {
  return aprobado
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700"
    : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/70 dark:text-gray-200 dark:border-gray-700";
}

function getCardAccentClass(idx: number): string {
  const accents = [
    "bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/40 dark:to-gray-900",
    "bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-gray-900",
    "bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-gray-900",
    "bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/40 dark:to-gray-900",
  ];
  return accents[idx % accents.length];
}

const EvaluacionCategorias: React.FC = () => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<CategoriaAsignadaCardDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const [resultModal, setResultModal] = useState<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const showResult = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setResultModal({
      visible: true,
      type,
      title,
      message,
    });
  };

  const closeResultModal = () =>
    setResultModal((prev) => ({ ...prev, visible: false }));

  useEffect(() => {
    (async () => {
      const t = await getToken();
      setToken(t);
    })();
  }, []);

  useEffect(() => {
    if (!token) return;
    cargarCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function cargarCategorias() {
    setLoading(true);
    try {
      const resp = (await api("/evaluaciones/mis-categorias", {
        token: token ?? undefined,
      })) as {
        ok?: boolean;
        data?: CategoriaAsignadaCardDTO[];
        message?: string;
      };

      const data = Array.isArray(resp.data) ? resp.data : [];
      setCategorias(data);
      setPaginaActual(1);
    } catch (err: any) {
      showResult(
        "error",
        "No se pudieron cargar las categorías",
        err?.message || "Ocurrió un error al consultar las categorías asignadas."
      );
    } finally {
      setLoading(false);
    }
  }

  const categoriasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) return categorias;

    const q = normalizarTexto(terminoBusqueda.trim());
    return categorias.filter((c) => {
      return (
        normalizarTexto(c.area).includes(q) ||
        normalizarTexto(c.nivel).includes(q) ||
        normalizarTexto(c.modalidad).includes(q) ||
        normalizarTexto(c.fase).includes(q) ||
        normalizarTexto(c.responsableDeArea).includes(q)
      );
    });
  }, [categorias, terminoBusqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(categoriasFiltradas.length / ITEMS_POR_PAGINA)
  );

  const categoriasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return categoriasFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [categoriasFiltradas, paginaActual]);

  function irADetalleCategoria(card: CategoriaAsignadaCardDTO) {
    const hoy = new Date();

    if (!card.fechaInicioFase || !card.fechaFinFase) {
      showResult(
        "error",
        "Fase sin fechas configuradas",
        "No se puede ingresar a la evaluación porque esta fase no tiene configuradas las fechas de inicio y fin."
      );
      return;
    }

    const inicio = new Date(card.fechaInicioFase);
    const fin = new Date(card.fechaFinFase);

    const hoyDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    ).getTime();
    const inicioDia = new Date(
      inicio.getFullYear(),
      inicio.getMonth(),
      inicio.getDate()
    ).getTime();
    const finDia = new Date(
      fin.getFullYear(),
      fin.getMonth(),
      fin.getDate()
    ).getTime();

    if (card.estadoFase !== "EN_EJECUCION") {
      showResult(
        "error",
        "Fase no disponible para evaluación",
        `Solo se puede ingresar a evaluar cuando la fase está en ejecución. Estado actual: ${card.estadoFase
          .toLowerCase()
          .replace("_", " ")}.`
      );
      return;
    }

    if (hoyDia < inicioDia || hoyDia > finDia) {
      showResult(
        "error",
        "Fuera del rango de fechas",
        "Solo se puede evaluar esta fase dentro del rango de fechas configurado por la organización."
      );
      return;
    }

    if (card.fase === "FINAL") {
      const clasif = categorias.find(
        (c) =>
          c.idCategoria === card.idCategoria &&
          c.fase === "CLASIFICATORIA"
      );

      if (!clasif) {
        showResult(
          "error",
          "Fase clasificatoria no encontrada",
          "No se encontró la fase clasificatoria asociada a esta categoría. Consulte con el administrador del sistema."
        );
        return;
      }

      if (clasif.estadoFase === "EN_EJECUCION") {
        showResult(
          "error",
          "Fase final bloqueada",
          "No puede ingresar a la fase final mientras la fase clasificatoria se encuentra en ejecución."
        );
        return;
      }

      if (clasif.estadoFase !== "FINALIZADA") {
        showResult(
          "error",
          "Fase final no habilitada",
          "Solo se habilita la evaluación de la fase final cuando la fase clasificatoria ha sido finalizada."
        );
        return;
      }
    }

    const params = new URLSearchParams({
      categoriaId: String(card.idCategoria),
      tipoFase: card.fase,
      area: card.area,
      nivel: card.nivel,
      modalidad: card.modalidad,
    }).toString();

    navigate(`/evaluaciones/categoria?${params}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
              <FiFilter className="h-4 w-4" />
              Panel de evaluación – Categorías asignadas
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Mis categorías para evaluar
            </h1>
            <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              Aquí se muestran las categorías que tiene asignadas como
              evaluador(a). Seleccione una tarjeta para ir a la lista de
              participantes y registrar/editar sus calificaciones.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <BarraBusquedaAreas
              terminoBusqueda={terminoBusqueda}
              onBuscarChange={(t: string) => {
                setTerminoBusqueda(t);
                setPaginaActual(1);
              }}
            />
          </div>
        </header>

        {loading && (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            Cargando categorías asignadas para evaluación…
          </div>
        )}

        {!loading && categorias.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            No tiene categorías asignadas para evaluación en esta gestión.
          </div>
        )}

        {!loading && categorias.length > 0 && (
          <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Categorías asignadas
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Total:{" "}
                  <span className="font-semibold">
                    {categorias.length}
                  </span>{" "}
                  · Mostrando{" "}
                  <span className="font-semibold">
                    {categoriasPaginadas.length}
                  </span>{" "}
                  en esta página
                </p>
              </div>
            </div>

            {categoriasFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                No se encontraron categorías que coincidan con la búsqueda.
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {categoriasPaginadas.map((card, idx) => (
                    <button
                      key={`${card.idCategoria}-${card.fase}-${idx}`}
                      type="button"
                      onClick={() => irADetalleCategoria(card)}
                      className={`group flex flex-col justify-between rounded-2xl border border-gray-200 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md dark:border-gray-800 dark:hover:border-brand-400 ${getCardAccentClass(
                        idx
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm dark:bg-gray-900/70 dark:text-gray-200">
                            <FiTarget className="h-3.5 w-3.5" />
                            {card.area} – {card.nivel}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Categoría #{card.idCategoria}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Participantes asignados en esta categoría:{" "}
                            <span className="font-semibold">
                              {card.cantidadAsignados}
                            </span>
                          </p>
                          {card.responsableDeArea && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Responsable de área:{" "}
                              <span className="font-semibold">
                                {card.responsableDeArea}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1 text-[11px]">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium ${chipFase(
                              card.fase
                            )}`}
                          >
                            {card.fase === "CLASIFICATORIA" ? (
                              <FiAlertCircle className="h-3 w-3" />
                            ) : (
                              <FiCheckCircle className="h-3 w-3" />
                            )}
                            Fase {card.fase.toLowerCase()}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium ${chipModalidad(
                              card.modalidad
                            )}`}
                          >
                            {card.modalidad === "INDIVIDUAL"
                              ? "Individual"
                              : "Grupal"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium ${chipAprobado(
                              card.aprobadoPorResponsable
                            )}`}
                          >
                            <FiCheckCircle className="h-3 w-3" />
                            {card.aprobadoPorResponsable
                              ? "Aprobado por responsable"
                              : "Pendiente de revisión"}
                          </span>
                          <span
    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium ${chipEstadoFase(
      card.estadoFase
    )}`}
  >
    Estado:{" "}
    {card.estadoFase.toLowerCase().replace("_", " ")}
  </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-gray-600 dark:text-gray-300">
                        <span>
                          Haga clic para ir a la{" "}
                          <span className="font-semibold">
                            lista de participantes
                          </span>{" "}
                          y registrar sus notas.
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold text-brand-700 shadow-sm transition group-hover:bg-brand-50 dark:bg-gray-900/70 dark:text-brand-300">
                          Ir a evaluar
                          <FiArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div className="mt-3 flex justify-end">
                    <Paginacion
                      paginaActual={paginaActual}
                      totalPaginas={totalPaginas}
                      totalRegistros={categoriasFiltradas.length}
                      registrosPorPagina={ITEMS_POR_PAGINA}
                      onPaginaChange={setPaginaActual}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <ResultModal
          visible={resultModal.visible}
          type={resultModal.type}
          title={resultModal.title}
          message={resultModal.message}
          onClose={closeResultModal}
        />
      </div>
    </div>
  );
};

export default EvaluacionCategorias;
