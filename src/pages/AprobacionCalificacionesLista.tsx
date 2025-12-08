// src/pages/AprobacionCalificacionesResumen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { getToken } from "../components/auth/authStorage";

import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ResultModal from "../components/modals/ResultModal";

import {
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiTarget,
  FiArrowRight,
  FiDownload,
} from "react-icons/fi";

type TipoFase = "CLASIFICATORIA" | "FINAL";
type ModalidadCategoria = "INDIVIDUAL" | "GRUPAL";

interface ApiResponse<T = any> {
  ok?: boolean;
  message?: string;
  data?: T;
}

interface FaseResumenDTO {
  tipoFase: TipoFase;
  totalAsignados: number;
  totalConEvaluacion: number;
  totalAprobadas: number;
  totalPendientes: number;
}
interface ParticipanteCategoriaResponsableDTO {
  idParticipacion: number;
  nombreParticipante: string;
  nota: number | null;
  comentario: string | null;
  estado: "CLASIFICADO" | "NO_CLASIFICADO" | "DESCALIFICADO";
}

interface EvaluadorResumenDTO {
  idEvaluador: number;
  nombreCompleto: string;
  fases: FaseResumenDTO[];
}

interface ResumenCategoriaAprobacionDTO {
  asignado: boolean;
  message?: string;
  categoria?: {
    idCategoria: number;
    gestion: number;
    area: string;
    nivel: string;
    modalidad: ModalidadCategoria;
  };
  evaluadores?: EvaluadorResumenDTO[];
}

const ITEMS_POR_PAGINA = 6;

function normalizarTexto(s?: string | null): string {
  if (!s) return "";
  return s.toString().toLowerCase();
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

function getCardAccentClass(idx: number): string {
  const accents = [
    "bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/40 dark:to-gray-900",
    "bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-gray-900",
    "bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-gray-900",
    "bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/40 dark:to-gray-900",
  ];
  return accents[idx % accents.length];
}

const AprobacionCalificacionesResumen: React.FC = () => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [resumen, setResumen] =
    useState<ResumenCategoriaAprobacionDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [exportando, setExportando] = useState(false);
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
    cargarResumen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function cargarResumen() {
    setLoading(true);
    try {
      const resp = (await api("/aprobacion-calificaciones/resumen", {
        token: token ?? undefined,
      })) as ApiResponse<ResumenCategoriaAprobacionDTO>;

      if (!resp.ok) {
        showResult(
          "error",
          "No se pudo cargar la información",
          resp.message ||
            "Ocurrió un error al consultar el resumen de aprobación."
        );
        setResumen(null);
        return;
      }

      setResumen(resp.data || null);
      setPaginaActual(1);
    } catch (err: any) {
      showResult(
        "error",
        "No se pudo cargar la información",
        err?.message ||
          "Ocurrió un error al consultar el resumen de aprobación."
      );
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }
async function exportarClasificadosExcel() {
  if (!token) {
    showResult(
      "error",
      "Sesión no encontrada",
      "Debe iniciar sesión nuevamente para generar el archivo."
    );
    return;
  }

  if (!categoria) {
    showResult(
      "error",
      "Sin categoría",
      "No se encontró una categoría asignada para generar la lista."
    );
    return;
  }

  try {
    setExportando(true);

    const resp = (await api(
      "/aprobacion-calificaciones/categoria/participantes",
      {
        token: token ?? undefined,
      }
    )) as ApiResponse<ParticipanteCategoriaResponsableDTO[]>;

    if (!resp.ok) {
      showResult(
        "error",
        "No se pudo generar el archivo",
        resp.message ||
          "Ocurrió un error al obtener la lista de participantes."
      );
      return;
    }

    const participantes = (resp.data || []).filter(
      (p) => p.estado === "CLASIFICADO"
    );

    if (participantes.length === 0) {
      showResult(
        "error",
        "Sin clasificados",
        "No hay participantes clasificados en esta categoría."
      );
      return;
    }

    // Construir CSV (Excel lo abre sin problema)
    const header = ["N°", "Nombre/Equipo", "Nota", "Comentario"];
    const filas = participantes.map((p, index) => {
      const nombre = (p.nombreParticipante || "").replace(/"/g, '""');
      const nota =
        p.nota !== null && p.nota !== undefined
          ? String(p.nota).replace(".", ",")
          : "";
      const comentario = (p.comentario || "").replace(/"/g, '""');

      return [
        String(index + 1),
        nombre,
        nota,
        comentario,
      ];
    });

    const lineas = [
      header.join(";"),
      ...filas.map((cols) =>
        cols.map((c) => `"${c}"`).join(";")
      ),
    ];

    const blob = new Blob([lineas.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    const fileName = `clasificados_${categoria.gestion}_${categoria.area}_${categoria.nivel}.csv`
      .replace(/\s+/g, "_")
      .toLowerCase();

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showResult(
      "success",
      "Archivo generado",
      "Se generó la lista de clasificados en formato CSV (Excel)."
    );
  } catch (err: any) {
    showResult(
      "error",
      "Error al generar el archivo",
      err?.message ||
        "Ocurrió un error al generar la lista de clasificados."
    );
  } finally {
    setExportando(false);
  }
}

  const evaluadores = resumen?.evaluadores || [];

  const evaluadoresFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return evaluadores;

    const q = normalizarTexto(terminoBusqueda.trim());
    return evaluadores.filter((e) =>
      normalizarTexto(e.nombreCompleto).includes(q)
    );
  }, [evaluadores, terminoBusqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(evaluadoresFiltrados.length / ITEMS_POR_PAGINA)
  );

  const evaluadoresPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return evaluadoresFiltrados.slice(
      inicio,
      inicio + ITEMS_POR_PAGINA
    );
  }, [evaluadoresFiltrados, paginaActual]);

  function irATabla(
    evaluador: EvaluadorResumenDTO,
    fase: FaseResumenDTO
  ) {
    const params = new URLSearchParams({
      evaluadorId: String(evaluador.idEvaluador),
      tipoFase: fase.tipoFase,
    }).toString();

    navigate(`/aprobacion-calificaciones/tabla?${params}`);
  }

  const categoria = resumen?.categoria;

  const hayAsignacion = resumen?.asignado && categoria;

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {/* HEADER */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
              <FiUsers className="h-4 w-4" />
              Panel de aprobación – Calificaciones por evaluador
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Aprobación de notas por responsable
            </h1>
            <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              Revise el avance de calificaciones de cada evaluador en su
              categoría asignada. Desde aquí puede ingresar a cada fase para
              aprobar o rechazar las evaluaciones registradas.
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

        {/* INFO DE CATEGORÍA */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {loading && (
            <div className="text-sm text-gray-700 dark:text-gray-200">
              Cargando información de su categoría asignada…
            </div>
          )}

          {!loading && !hayAsignacion && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              {resumen?.message ||
                "El usuario responsable aún no se encuentra asignado a una categoría para aprobación de calificaciones."}
            </div>
          )}

          {!loading && hayAsignacion && categoria && (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Categoría asignada como responsable
                </h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                  Gestión{" "}
                  <span className="font-semibold">
                    {categoria.gestion}
                  </span>{" "}
                  · Área{" "}
                  <span className="font-semibold">
                    {categoria.area}
                  </span>{" "}
                  · Nivel{" "}
                  <span className="font-semibold">
                    {categoria.nivel}
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                  ID categoría:{" "}
                  <span className="font-mono text-xs font-semibold">
                    #{categoria.idCategoria}
                  </span>
                </p>
              </div>

                  <div className="flex flex-col items-start gap-2 md:items-end">
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold ${chipModalidad(
          categoria.modalidad
        )}`}
      >
        {categoria.modalidad === "INDIVIDUAL"
          ? "Modalidad individual"
          : "Modalidad grupal"}
      </span>

      <button
        type="button"
        onClick={exportarClasificadosExcel}
        disabled={exportando}
        className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiDownload className="h-3 w-3" />
        {exportando
          ? "Generando lista..."
          : "Descargar clasificados (Excel)"}
      </button>
    </div>

            </div>
          )}
        </section>

        {/* LISTA DE EVALUADORES */}
        {!loading && hayAsignacion && (
          <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Evaluadores asignados a la categoría
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Total evaluadores:{" "}
                  <span className="font-semibold">
                    {evaluadores.length}
                  </span>{" "}
                  · Mostrando{" "}
                  <span className="font-semibold">
                    {evaluadoresPaginados.length}
                  </span>{" "}
                  en esta página
                </p>
              </div>
            </div>

            {evaluadores.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                No hay evaluadores asignados a esta categoría.
              </div>
            )}

            {evaluadores.length > 0 && evaluadoresFiltrados.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                No se encontraron evaluadores que coincidan con la
                búsqueda.
              </div>
            )}

            {evaluadoresFiltrados.length > 0 && (
              <>
                <div className="flex flex-col gap-4">
                  {evaluadoresPaginados.map((ev, idx) => (
                    <div
                      key={ev.idEvaluador}
                      className={`rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-gray-800 ${getCardAccentClass(
                        idx
                      )}`}
                    >
                      {/* Header evaluador */}
                      <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
                            <FiUsers className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Evaluador
                            </p>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {ev.nombreCompleto}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Fases */}
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {ev.fases.map((fase) => (
                          <button
                            key={fase.tipoFase}
                            type="button"
                            onClick={() => irATabla(ev, fase)}
                            className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white/80 p-3 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/80"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${chipFase(
                                    fase.tipoFase
                                  )}`}
                                >
                                  {fase.tipoFase ===
                                  "CLASIFICATORIA" ? (
                                    <FiAlertCircle className="h-3 w-3" />
                                  ) : (
                                    <FiCheckCircle className="h-3 w-3" />
                                  )}
                                  Fase{" "}
                                  {fase.tipoFase === "CLASIFICATORIA"
                                    ? "clasificatoria"
                                    : "final"}
                                </span>

                                <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
                                  Asignados:{" "}
                                  <span className="font-semibold">
                                    {fase.totalAsignados}
                                  </span>
                                  {" · "}Con evaluación:{" "}
                                  <span className="font-semibold">
                                    {fase.totalConEvaluacion}
                                  </span>
                                </p>
                                <p className="text-[11px] text-gray-600 dark:text-gray-300">
                                  Aprobadas:{" "}
                                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                    {fase.totalAprobadas}
                                  </span>
                                  {" · "}Pendientes:{" "}
                                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                                    {fase.totalPendientes}
                                  </span>
                                </p>
                              </div>

                              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-brand-700 shadow-sm transition group-hover:bg-brand-50 dark:bg-gray-900 dark:text-brand-300">
                                Ver tabla
                                <FiArrowRight className="h-3 w-3" />
                              </span>
                            </div>

                            <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                              <FiTarget className="h-3 w-3" />
                              Haga clic para aprobar/rechazar notas
                              registradas en esta fase.
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div className="mt-3 flex justify-end">
                    {/* Reutilizamos tu componente de paginación */}
                    {/* @ts-ignore - mismo API que usas en otras páginas */}
                    <Paginacion
                      paginaActual={paginaActual}
                      totalPaginas={totalPaginas}
                      totalRegistros={evaluadoresFiltrados.length}
                      registrosPorPagina={ITEMS_POR_PAGINA}
                      onPaginaChange={setPaginaActual}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* MODAL RESULTADO */}
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

// IMPORTANTE: necesitas importar Paginacion al final para evitar ciclo arriba
import Paginacion from "../components/ui/Paginacion";

export default AprobacionCalificacionesResumen;
