// src/pages/AprobacionCalificacionesTabla.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { getToken } from "../components/auth/authStorage";

import TablaBase from "../components/tables/TablaBase";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import Paginacion from "../components/ui/Paginacion";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiMinusCircle,
  FiDownload,
} from "react-icons/fi";

type TipoFase = "CLASIFICATORIA" | "FINAL";
type ModalidadCategoria = "INDIVIDUAL" | "GRUPAL";

interface ApiResponse<T = any> {
  ok?: boolean;
  message?: string;
  data?: T;
}

interface FilaAprobacionDTO {
  idEvaluacion: number | null;
  nombreParticipante: string;
  nota: number | null;
  comentario: string | null;
  validado: boolean | null;
}

interface TablaAprobacionDTO {
  categoria: {
    idCategoria: number;
    gestion: number;
    area: string;
    nivel: string;
    modalidad: ModalidadCategoria;
  };
  evaluador: {
    idEvaluador: number;
    nombreCompleto: string;
  };
  tipoFase: TipoFase;
  totales: {
    totalAsignados: number;
    totalConEvaluacion: number;
    totalAprobadas: number;
    totalPendientes: number;
  };
  filas: FilaAprobacionDTO[];
}

type TipoAlineacion = "izquierda" | "centro" | "derecha";

interface ColumnaConfig<T = any> {
  clave: string;
  titulo: string;
  alineacion?: TipoAlineacion;
  ancho?: string;
  ordenable?: boolean;
  formatearCelda?: (valor: any, fila: T) => React.ReactNode;
}

interface FilaUI extends FilaAprobacionDTO {
  actualizando?: boolean;
}

type TipoAccionMasiva = "aprobar_todos" | "rechazar_todos";

const ITEMS_POR_PAGINA = 10;

function normalizarTexto(s?: string | null): string {
  if (!s) return "";
  return s.toString().toLowerCase();
}

function claseChipValidacion(
  idEvaluacion: number | null,
  validado: boolean | null
): string {
  if (idEvaluacion === null) {
    // Sin evaluación registrada
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-200 dark:border-gray-600";
  }
  if (validado === true) {
    return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700";
  }
  if (validado === false) {
    return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700";
  }
  // validado null pero existe evaluación (caso raro)
  return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700";
}

function textoEstadoValidacion(
  idEvaluacion: number | null,
  validado: boolean | null
): string {
  if (idEvaluacion === null) return "Sin evaluación";
  if (validado === true) return "Aprobada";
  if (validado === false) return "Rechazada";
  return "Pendiente";
}

const AprobacionCalificacionesTabla: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const evaluadorIdParam = searchParams.get("evaluadorId");
  const tipoFaseParam = (searchParams.get("tipoFase") ||
    "CLASIFICATORIA") as TipoFase;

  const [token, setToken] = useState<string | null>(null);

  const [tabla, setTabla] = useState<TablaAprobacionDTO | null>(null);
  const [filas, setFilas] = useState<FilaUI[]>([]);
  const [loading, setLoading] = useState(false);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const [accionPendiente, setAccionPendiente] = useState<{
    visible: boolean;
    tipo: "aprobar" | "rechazar";
    idEvaluacion: number | null;
    nombreParticipante: string;
  }>({
    visible: false,
    tipo: "aprobar",
    idEvaluacion: null,
    nombreParticipante: "",
  });

  const [procesandoAccion, setProcesandoAccion] = useState(false);

  const [accionMasiva, setAccionMasiva] = useState<{
    visible: boolean;
    tipo: TipoAccionMasiva;
  }>({
    visible: false,
    tipo: "aprobar_todos",
  });

  const [procesandoMasivo, setProcesandoMasivo] = useState(false);
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
    if (!evaluadorIdParam) return;
    cargarTabla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, evaluadorIdParam, tipoFaseParam]);

  async function cargarTabla() {
    if (!evaluadorIdParam) return;

    setLoading(true);
    try {
      const query = new URLSearchParams({
        evaluadorId: evaluadorIdParam,
        tipoFase: tipoFaseParam,
      }).toString();

      const resp = (await api(`/aprobacion-calificaciones/tabla?${query}`, {
        token: token ?? undefined,
      })) as ApiResponse<TablaAprobacionDTO>;

      if (!resp.ok) {
        showResult(
          "error",
          "No se pudo cargar la tabla",
          resp.message ||
            "Ocurrió un error al consultar la tabla de aprobación."
        );
        setTabla(null);
        setFilas([]);
        return;
      }

      const data = resp.data;
      if (!data) {
        setTabla(null);
        setFilas([]);
        return;
      }

      setTabla(data);
      setFilas(
        (data.filas || []).map((f) => ({
          ...f,
          actualizando: false,
        }))
      );
      setPaginaActual(1);
    } catch (err: any) {
      showResult(
        "error",
        "No se pudo cargar la tabla",
        err?.message || "Ocurrió un error al consultar la tabla de aprobación."
      );
      setTabla(null);
      setFilas([]);
    } finally {
      setLoading(false);
    }
  }

  const filasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) return filas;

    const q = normalizarTexto(terminoBusqueda.trim());
    return filas.filter((f) =>
      normalizarTexto(f.nombreParticipante).includes(q)
    );
  }, [filas, terminoBusqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filasFiltradas.length / ITEMS_POR_PAGINA)
  );

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return filasFiltradas.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [filasFiltradas, paginaActual]);

  const hayDatos = filasFiltradas.length > 0;

  const totalConEvaluacion = useMemo(
    () => filas.filter((f) => f.idEvaluacion !== null).length,
    [filas]
  );

  function abrirAccion(tipo: "aprobar" | "rechazar", fila: FilaUI) {
    if (!fila.idEvaluacion) return; // por si acaso

    setAccionPendiente({
      visible: true,
      tipo,
      idEvaluacion: fila.idEvaluacion,
      nombreParticipante: fila.nombreParticipante,
    });
  }

  function cerrarAccion() {
    if (procesandoAccion) return;
    setAccionPendiente({
      visible: false,
      tipo: "aprobar",
      idEvaluacion: null,
      nombreParticipante: "",
    });
  }

  async function confirmarAccion() {
    if (!accionPendiente.idEvaluacion || !token || !tabla) return;

    setProcesandoAccion(true);
    const { tipo, idEvaluacion } = accionPendiente;

    // Marcar fila como actualizando
    setFilas((prev) =>
      prev.map((f) =>
        f.idEvaluacion === idEvaluacion ? { ...f, actualizando: true } : f
      )
    );

    try {
      const endpoint =
        tipo === "aprobar"
          ? `/aprobacion-calificaciones/evaluaciones/${idEvaluacion}/aprobar`
          : `/aprobacion-calificaciones/evaluaciones/${idEvaluacion}/rechazar`;

      const resp = (await api(endpoint, {
        method: "PATCH",
        token: token ?? undefined,
      })) as ApiResponse<{
        idEvaluacion: number;
        validado: boolean;
      }>;

      if (!resp.ok || !resp.data) {
        throw new Error(
          resp.message || "La operación no se pudo completar correctamente."
        );
      }

      const { idEvaluacion: idActualizado, validado } = resp.data;

      // Actualizar fila y totales en memoria
      setFilas((prev) =>
        prev.map((f) =>
          f.idEvaluacion === idActualizado
            ? { ...f, validado, actualizando: false }
            : f
        )
      );

      setTabla((prev) => {
        if (!prev) return prev;
        const filasNew = prev.filas.map((f) =>
          f.idEvaluacion === idActualizado ? { ...f, validado } : f
        );
        const totalConEval = filasNew.filter(
          (f) => f.idEvaluacion !== null
        ).length;
        const totalAprobadas = filasNew.filter(
          (f) => f.validado === true
        ).length;
        const totalPendientes = totalConEval - totalAprobadas;

        return {
          ...prev,
          filas: filasNew,
          totales: {
            ...prev.totales,
            totalConEvaluacion: totalConEval,
            totalAprobadas,
            totalPendientes,
          },
        };
      });

      showResult(
        "success",
        tipo === "aprobar" ? "Evaluación aprobada" : "Evaluación rechazada",
        resp.message ||
          (tipo === "aprobar"
            ? "La evaluación fue aprobada correctamente."
            : "La evaluación fue rechazada correctamente.")
      );
    } catch (err: any) {
      showResult(
        "error",
        "No se pudo actualizar la evaluación",
        err?.message || "Ocurrió un error al aprobar/rechazar la evaluación."
      );
      setFilas((prev) =>
        prev.map((f) =>
          f.idEvaluacion === accionPendiente.idEvaluacion
            ? { ...f, actualizando: false }
            : f
        )
      );
    } finally {
      setProcesandoAccion(false);
      cerrarAccion();
    }
  }

  function abrirAccionMasiva(tipo: TipoAccionMasiva) {
    if (!totalConEvaluacion) {
      showResult(
        "error",
        "Sin evaluaciones",
        "No hay evaluaciones registradas para procesar de forma masiva."
      );
      return;
    }
    setAccionMasiva({
      visible: true,
      tipo,
    });
  }

  function cerrarAccionMasiva() {
    if (procesandoMasivo) return;
    setAccionMasiva({
      visible: false,
      tipo: "aprobar_todos",
    });
  }

  async function confirmarAccionMasiva() {
    if (!token || !tabla) return;

    const objetivos = filas.filter((f) => f.idEvaluacion !== null);
    if (objetivos.length === 0) {
      showResult(
        "error",
        "Sin evaluaciones",
        "No hay evaluaciones con ID para procesar."
      );
      cerrarAccionMasiva();
      return;
    }

    setProcesandoMasivo(true);

    // Marcar todas las filas objetivo como actualizando
    const idsObjetivo = objetivos
      .map((f) => f.idEvaluacion!)
      .filter((id) => !!id);

    setFilas((prev) =>
      prev.map((f) =>
        f.idEvaluacion && idsObjetivo.includes(f.idEvaluacion)
          ? { ...f, actualizando: true }
          : f
      )
    );

    const errores: string[] = [];
    const esAprobar = accionMasiva.tipo === "aprobar_todos";

    try {
      for (const objetivo of objetivos) {
        const idEval = objetivo.idEvaluacion!;
        const nombre = objetivo.nombreParticipante;

        try {
          const endpoint = esAprobar
            ? `/aprobacion-calificaciones/evaluaciones/${idEval}/aprobar`
            : `/aprobacion-calificaciones/evaluaciones/${idEval}/rechazar`;

          const resp = (await api(endpoint, {
            method: "PATCH",
            token: token ?? undefined,
          })) as ApiResponse<{
            idEvaluacion: number;
            validado: boolean;
          }>;

          if (!resp.ok || !resp.data) {
            throw new Error(
              resp.message || "La operación no se pudo completar correctamente."
            );
          }

          const { idEvaluacion: idActualizado, validado } = resp.data;

          // Actualizar fila y totales en memoria
          setFilas((prev) =>
            prev.map((f) =>
              f.idEvaluacion === idActualizado
                ? { ...f, validado, actualizando: false }
                : f
            )
          );

          setTabla((prev) => {
            if (!prev) return prev;
            const filasNew = prev.filas.map((f) =>
              f.idEvaluacion === idActualizado ? { ...f, validado } : f
            );
            const totalConEval = filasNew.filter(
              (f) => f.idEvaluacion !== null
            ).length;
            const totalAprobadas = filasNew.filter(
              (f) => f.validado === true
            ).length;
            const totalPendientes = totalConEval - totalAprobadas;

            return {
              ...prev,
              filas: filasNew,
              totales: {
                ...prev.totales,
                totalConEvaluacion: totalConEval,
                totalAprobadas,
                totalPendientes,
              },
            };
          });
        } catch (_e: any) {
          errores.push(nombre);
          setFilas((prev) =>
            prev.map((f) =>
              f.idEvaluacion === idEval ? { ...f, actualizando: false } : f
            )
          );
        }
      }

      const titulo = esAprobar
        ? "Aprobación masiva completada"
        : "Rechazo masivo completado";

      if (errores.length === 0) {
        showResult(
          "success",
          titulo,
          "Se procesaron correctamente todas las evaluaciones seleccionadas."
        );
      } else {
        const listaErrores = errores.map((n) => `- ${n}`).join("\n");
        showResult(
          "success",
          titulo,
          `Se procesó la mayoría de las evaluaciones, pero NO se pudo actualizar las de:\n${listaErrores}`
        );
      }
    } finally {
      setProcesandoMasivo(false);
      cerrarAccionMasiva();
    }
  }

  async function exportarExcel() {
    if (!tabla) {
      showResult(
        "error",
        "Sin datos",
        "No se encontró información de la tabla para exportar."
      );
      return;
    }

    if (!filas.length) {
      showResult("error", "Sin datos", "No hay filas para exportar a Excel.");
      return;
    }

    try {
      setExportando(true);

      const header = ["Participante / Equipo", "Nota", "Estado evaluación"];

      const filasCSV = filas.map((f) => {
        const nombre = (f.nombreParticipante || "").replace(/"/g, '""');
        const nota =
          f.nota !== null && f.nota !== undefined
            ? Number(f.nota).toFixed(2).replace(".", ",")
            : "";
        const estado = textoEstadoValidacion(f.idEvaluacion, f.validado);

        return [nombre, nota, estado];
      });

      const lineas = [
        header.join(";"),
        ...filasCSV.map((cols) => cols.map((c) => `"${c}"`).join(";")),
      ];

      const blob = new Blob([lineas.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const cat = tabla.categoria;
      const evalInfo = tabla.evaluador;
      const fase = tabla.tipoFase;

      const fileName =
        `aprobacion_${cat.gestion}_${cat.area}_${cat.nivel}_eval_${evalInfo.idEvaluador}_fase_${fase}.csv`
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
        "Se generó el archivo CSV (compatible con Excel) con las evaluaciones de este evaluador."
      );
    } catch (err: any) {
      showResult(
        "error",
        "Error al exportar",
        err?.message || "Ocurrió un error al generar el archivo de Excel."
      );
    } finally {
      setExportando(false);
    }
  }

  const columnasTabla: ColumnaConfig<FilaUI>[] = useMemo(() => {
    return [
      {
        clave: "nombreParticipante",
        titulo: "Participante / Equipo",
        ordenable: true,
      },
      {
        clave: "nota",
        titulo: "Nota",
        alineacion: "centro",
        ordenable: true,
        formatearCelda: (valor: any, fila: FilaUI) => {
          if (fila.idEvaluacion === null || valor === null) {
            return (
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Sin evaluación
              </span>
            );
          }
          return (
            <span className="font-semibold">{Number(valor).toFixed(2)}</span>
          );
        },
      },
      {
        clave: "comentario",
        titulo: "Comentario",
        alineacion: "izquierda",
        ordenable: false,
        formatearCelda: (valor: any, fila: FilaUI) => {
          if (fila.idEvaluacion === null || !valor) {
            return (
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Sin comentario
              </span>
            );
          }
          return (
            <span
              className="block max-w-xs truncate text-[11px] text-gray-800 dark:text-gray-100"
              title={String(valor)}
            >
              {valor}
            </span>
          );
        },
      },
      {
        clave: "validado",
        titulo: "Estado de validación",
        alineacion: "centro",
        ordenable: false,
        formatearCelda: (_valor: any, fila: FilaUI) => {
          const clase = claseChipValidacion(fila.idEvaluacion, fila.validado);

          let icon: React.ReactNode = <FiMinusCircle className="h-3 w-3" />;
          let texto = "Sin evaluación";

          if (fila.idEvaluacion !== null) {
            if (fila.validado === true) {
              icon = <FiCheckCircle className="h-3 w-3" />;
              texto = "Aprobada";
            } else if (fila.validado === false) {
              icon = <FiXCircle className="h-3 w-3" />;
              texto = "Rechazada";
            } else {
              icon = <FiAlertTriangle className="h-3 w-3" />;
              texto = "Pendiente";
            }
          }

          return (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${clase}`}
            >
              {icon}
              {texto}
            </span>
          );
        },
      },
    ];
  }, []);

  function renderAcciones(fila: FilaUI) {
    const sinEvaluacion = fila.idEvaluacion === null;
    const deshabilitadoBase = sinEvaluacion || fila.actualizando;

    return (
      <div className="flex flex-wrap items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => abrirAccion("aprobar", fila)}
          disabled={deshabilitadoBase}
          className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm hover:border-emerald-500 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          title={
            sinEvaluacion
              ? "No hay evaluación registrada para aprobar."
              : "Aprobar evaluación"
          }
        >
          <FiCheckCircle className="mr-1 h-3 w-3" />
          Aprobar
        </button>
        <button
          type="button"
          onClick={() => abrirAccion("rechazar", fila)}
          disabled={deshabilitadoBase}
          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 shadow-sm hover:border-red-500 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          title={
            sinEvaluacion
              ? "No hay evaluación registrada para rechazar."
              : "Rechazar evaluación"
          }
        >
          <FiXCircle className="mr-1 h-3 w-3" />
          Rechazar
        </button>
      </div>
    );
  }

  function volver() {
    navigate("/aprobacion-calificaciones");
  }

  const categoria = tabla?.categoria;
  const evaluador = tabla?.evaluador;

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {/* HEADER */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={volver}
              className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow-sm hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <FiArrowLeft className="h-3.5 w-3.5" />
              Volver
            </button>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                Aprobación de calificaciones
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                {categoria
                  ? `${categoria.area} – ${categoria.nivel}`
                  : "Detalle de aprobaciones"}
              </h1>
              <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                {categoria && (
                  <>
                    Gestión{" "}
                    <span className="font-semibold">{categoria.gestion}</span> ·
                    Modalidad:{" "}
                    <span className="font-semibold">
                      {categoria.modalidad === "INDIVIDUAL"
                        ? "Individual"
                        : "Grupal"}
                    </span>{" "}
                    · Fase:{" "}
                    <span className="font-semibold">
                      {tipoFaseParam === "CLASIFICATORIA"
                        ? "Clasificatoria"
                        : "Final"}
                    </span>
                    .
                  </>
                )}{" "}
                Revise la lista de participantes asignados al evaluador y
                apruebe o rechace sus notas registradas.
              </p>
              {evaluador && (
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Evaluador:{" "}
                  <span className="font-semibold">
                    {evaluador.nombreCompleto}
                  </span>{" "}
                  (ID:{" "}
                  <span className="font-mono text-xs">
                    #{evaluador.idEvaluador}
                  </span>
                  )
                </p>
              )}
            </div>
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

        {/* CONTROLES + TABLA */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Participantes asignados al evaluador
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Total asignados en la fase:{" "}
                <span className="font-semibold">
                  {tabla?.totales.totalAsignados ?? 0}
                </span>
                {" · "}Con evaluación registrada:{" "}
                <span className="font-semibold">
                  {tabla?.totales.totalConEvaluacion ?? 0}
                </span>
                {" · "}Aprobadas:{" "}
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {tabla?.totales.totalAprobadas ?? 0}
                </span>
                {" · "}Pendientes / no aprobadas:{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-300">
                  {tabla?.totales.totalPendientes ?? 0}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
              <button
                type="button"
                onClick={exportarExcel}
                disabled={exportando || !hayDatos}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] font-semibold text-gray-700 shadow-sm hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiDownload className="h-3.5 w-3.5" />
                {exportando ? "Generando Excel..." : "Descargar en Excel"}
              </button>

              <button
                type="button"
                onClick={() => abrirAccionMasiva("aprobar_todos")}
                disabled={procesandoMasivo || !totalConEvaluacion}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm hover:border-emerald-500 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiCheckCircle className="h-3.5 w-3.5" />
                Aprobar todo
              </button>

              <button
                type="button"
                onClick={() => abrirAccionMasiva("rechazar_todos")}
                disabled={procesandoMasivo || !totalConEvaluacion}
                className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700 shadow-sm hover:border-red-500 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiXCircle className="h-3.5 w-3.5" />
                Rechazar todo
              </button>
            </div>
          </div>

          {/* ESTADOS */}
          {loading && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              Cargando participantes y evaluaciones…
            </div>
          )}

          {!loading && !hayDatos && (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              No hay participantes asignados (o no cumplen las condiciones para
              esta fase) para el evaluador seleccionado.
            </div>
          )}

          {!loading && hayDatos && (
            <div className="mt-4 space-y-4">
              <TablaBase
                datos={datosPaginados}
                columnas={columnasTabla}
                conAcciones
                renderAcciones={renderAcciones}
              />

              {totalPaginas > 1 && (
                <div className="mt-2 flex justify-end">
                  <Paginacion
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    totalRegistros={filasFiltradas.length}
                    registrosPorPagina={ITEMS_POR_PAGINA}
                    onPaginaChange={setPaginaActual}
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* MODAL CONFIRMAR APROBAR / RECHAZAR (FILA) */}
        <ConfirmModal
          visible={accionPendiente.visible}
          title={
            accionPendiente.tipo === "aprobar"
              ? "Aprobar evaluación"
              : "Rechazar evaluación"
          }
          message={
            accionPendiente.idEvaluacion
              ? accionPendiente.tipo === "aprobar"
                ? `Se marcará como APROBADA la evaluación de "${accionPendiente.nombreParticipante}". ¿Desea continuar?`
                : `Se marcará como RECHAZADA la evaluación de "${accionPendiente.nombreParticipante}". ¿Desea continuar?`
              : "No se encontró la evaluación seleccionada."
          }
          onCancel={cerrarAccion}
          onConfirm={confirmarAccion}
          confirmText={
            accionPendiente.tipo === "aprobar" ? "Aprobar" : "Rechazar"
          }
          cancelText="Cancelar"
          danger={accionPendiente.tipo === "rechazar"}
          loading={procesandoAccion}
        />

        {/* MODAL CONFIRMAR APROBAR / RECHAZAR TODO */}
        <ConfirmModal
          visible={accionMasiva.visible}
          title={
            accionMasiva.tipo === "aprobar_todos"
              ? "Aprobar todas las evaluaciones"
              : "Rechazar todas las evaluaciones"
          }
          message={
            accionMasiva.tipo === "aprobar_todos"
              ? `Se intentará APROBAR todas las evaluaciones con ID registrado (${totalConEvaluacion} en total). Si alguna falla, se omitirá y se mostrará un reporte al final. ¿Desea continuar?`
              : `Se intentará RECHAZAR todas las evaluaciones con ID registrado (${totalConEvaluacion} en total). Si alguna falla, se omitirá y se mostrará un reporte al final. ¿Desea continuar?`
          }
          onCancel={cerrarAccionMasiva}
          onConfirm={confirmarAccionMasiva}
          confirmText={
            accionMasiva.tipo === "aprobar_todos"
              ? "Aprobar todo"
              : "Rechazar todo"
          }
          cancelText="Cancelar"
          danger={accionMasiva.tipo === "rechazar_todos"}
          loading={procesandoMasivo}
        />

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

export default AprobacionCalificacionesTabla;
