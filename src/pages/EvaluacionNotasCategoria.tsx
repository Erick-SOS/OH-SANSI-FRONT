// src/pages/EvaluacionNotasCategoria.tsx
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
  FiSave,
  FiCheckCircle,
  FiAlertTriangle,
  FiDownload,
} from "react-icons/fi";

type TipoFase = "CLASIFICATORIA" | "FINAL";
type ModalidadCategoria = "INDIVIDUAL" | "GRUPAL";

type EstadoNota = "CLASIFICADO" | "NO_CLASIFICADO" | "DESCALIFICADO";
type TipoMedalla = "ORO" | "PLATA" | "BRONCE" | "MENCION";

interface ParticipanteAsignadoDTO {
  idFase: number;
  idParticipacion: number;
  nombreCompleto: string;
  nota: number | null;
  estadoNota: EstadoNota;
  validadoPorResponsable: boolean | null;
  medalla: TipoMedalla | null;
  comentario: string | null;
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

const ITEMS_POR_PAGINA = 10;

const fieldBase =
  "w-full px-2.5 py-1.5 rounded-lg border text-xs transition focus:outline-none focus:ring-2 " +
  "bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-brand-500/40 focus:border-brand-500 " +
  "dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:border-gray-700 dark:focus:border-brand-400";

function normalizarTexto(s?: string | null): string {
  if (!s) return "";
  return s.toString().toLowerCase();
}

function claseChipEstadoNota(estado: EstadoNota): string {
  switch (estado) {
    case "CLASIFICADO":
      return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700";
    case "NO_CLASIFICADO":
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-200 dark:border-gray-600";
    case "DESCALIFICADO":
      return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-200 dark:border-gray-600";
  }
}
function claseChipMedalla(medalla: TipoMedalla | null): string {
  switch (medalla) {
    case "ORO":
      return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200 dark:border-yellow-700";
    case "PLATA":
      return "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-800/40 dark:text-gray-200 dark:border-gray-600";
    case "BRONCE":
      return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700";
    case "MENCION":
      return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-200 dark:border-gray-600";
  }
}

interface FilaNota extends ParticipanteAsignadoDTO {
  notaLocal: string;
  comentarioLocal: string;
  modificada: boolean;
  guardando?: boolean;
}

const EvaluacionNotasCategoria: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoriaIdParam = searchParams.get("categoriaId");
  const tipoFaseParam = (searchParams.get("tipoFase") ||
    "CLASIFICATORIA") as TipoFase;
  const areaParam = searchParams.get("area") || "";
  const nivelParam = searchParams.get("nivel") || "";
  const modalidadParam = (searchParams.get("modalidad") ||
    "INDIVIDUAL") as ModalidadCategoria;

  const [token, setToken] = useState<string | null>(null);

  const [filas, setFilas] = useState<FilaNota[]>([]);
  const [loading, setLoading] = useState(false);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const [confirmGuardarTodosVisible, setConfirmGuardarTodosVisible] =
    useState(false);
  const [guardandoTodos, setGuardandoTodos] = useState(false);

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

  const [filaParaDescalificar, setFilaParaDescalificar] =
    useState<FilaNota | null>(null);
  const [motivoDescalificar, setMotivoDescalificar] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");
  const [modalMotivoVisible, setModalMotivoVisible] = useState(false);
  const [confirmDescalificarVisible, setConfirmDescalificarVisible] =
    useState(false);
  const [descalificando, setDescalificando] = useState(false);

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
    if (!categoriaIdParam) return;
    cargarParticipantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, categoriaIdParam, tipoFaseParam]);

  async function cargarParticipantes() {
    if (!categoriaIdParam) return;

    setLoading(true);
    try {
      const query = new URLSearchParams({
        categoriaId: categoriaIdParam,
        tipoFase: tipoFaseParam,
      }).toString();

      const resp = (await api(`/evaluaciones/participantes?${query}`, {
        token: token ?? undefined,
      })) as {
        success?: boolean;
        ok?: boolean;
        data?: ParticipanteAsignadoDTO[];
        message?: string;
      };

      if (resp && resp.success === false) {
        showResult(
          "error",
          "No se pudieron cargar los participantes",
          resp.message ||
            "Ocurrió un error al consultar los participantes asignados."
        );
        setFilas([]);
        setPaginaActual(1);
        return;
      }

      const data = Array.isArray(resp.data) ? resp.data : [];
      const filasConEstado: FilaNota[] = data.map((p) => ({
        ...p,
        notaLocal: p.nota !== null ? String(p.nota) : "",
        comentarioLocal: p.comentario ?? "",
        modificada: false,
        guardando: false,
      }));

      setFilas(filasConEstado);
      setPaginaActual(1);
    } catch (err: any) {
      showResult(
        "error",
        "No se pudieron cargar los participantes",
        err?.message ||
          "Ocurrió un error al consultar los participantes asignados."
      );
      setFilas([]);
      setPaginaActual(1);
    } finally {
      setLoading(false);
    }
  }

  const filasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) return filas;

    const q = normalizarTexto(terminoBusqueda.trim());
    return filas.filter((f) => normalizarTexto(f.nombreCompleto).includes(q));
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

  function mismaFila(a: FilaNota, b: FilaNota): boolean {
    return a.idFase === b.idFase && a.idParticipacion === b.idParticipacion;
  }

  function handleNotaChange(filaRef: FilaNota, value: string) {
    setFilas((prev) =>
      prev.map((f) =>
        mismaFila(f, filaRef)
          ? f.validadoPorResponsable === true
            ? f
            : {
                ...f,
                notaLocal: value,
                modificada: true,
              }
          : f
      )
    );
  }

  function handleComentarioChange(filaRef: FilaNota, value: string) {
    setFilas((prev) =>
      prev.map((f) =>
        mismaFila(f, filaRef)
          ? f.validadoPorResponsable === true
            ? f
            : {
                ...f,
                comentarioLocal: value,
                modificada: true,
              }
          : f
      )
    );
  }

  async function guardarFilaPorFila(filaRef: FilaNota) {
    const fila = filas.find((f) => mismaFila(f, filaRef));
    if (!fila) return;

    if (fila.validadoPorResponsable === true) {
      showResult(
        "error",
        "Fila bloqueada",
        "Esta evaluación ya fue validada por el responsable y no puede modificarse."
      );
      return;
    }

    const valor = fila.notaLocal.trim();
    if (valor === "" || isNaN(Number(valor))) {
      showResult(
        "error",
        "Nota inválida",
        "Ingrese una nota numérica válida antes de guardar."
      );
      return;
    }

    const notaNumber = Number(valor);
    const comentario = fila.comentarioLocal.trim();

    setFilas((prev) =>
      prev.map((f) => (mismaFila(f, filaRef) ? { ...f, guardando: true } : f))
    );

    try {
      const resp = (await api("/evaluaciones/guardar", {
        method: "POST",
        token: token ?? undefined,
        body: {
          idParticipacion: fila.idParticipacion,
          tipoFase: tipoFaseParam,
          nota: notaNumber,
          comentario: comentario || undefined,
        },
      })) as {
        success?: boolean;
        message?: string;
        data?: any;
      };

      setFilas((prev) =>
        prev.map((f) =>
          mismaFila(f, filaRef)
            ? {
                ...f,
                nota: notaNumber,
                notaLocal: String(notaNumber),
                comentarioLocal: comentario,
                modificada: false,
                guardando: false,
              }
            : f
        )
      );

      await cargarParticipantes();

      showResult(
        "success",
        "Nota guardada",
        resp?.message || "La nota se guardó correctamente."
      );
    } catch (err: any) {
      setFilas((prev) =>
        prev.map((f) =>
          mismaFila(f, filaRef) ? { ...f, guardando: false } : f
        )
      );
      showResult(
        "error",
        "No se pudo guardar la nota",
        err?.message || "Ocurrió un error al guardar la nota."
      );
    }
  }

  async function guardarTodos() {
    const filasModificadas = filas.filter(
      (f) => f.modificada && f.validadoPorResponsable !== true
    );

    if (filasModificadas.length === 0) {
      showResult(
        "error",
        "Sin cambios",
        "No hay notas modificadas para guardar."
      );
      return;
    }

    setGuardandoTodos(true);

    let exitos = 0;
    let errores = 0;

    for (const f of filasModificadas) {
      const valor = f.notaLocal.trim();
      if (valor === "" || isNaN(Number(valor))) {
        errores++;
        continue;
      }

      const notaNumber = Number(valor);
      const comentario = f.comentarioLocal.trim();

      setFilas((prev) =>
        prev.map((x) => (mismaFila(x, f) ? { ...x, guardando: true } : x))
      );

      try {
        await api("/evaluaciones/guardar", {
          method: "POST",
          token: token ?? undefined,
          body: {
            idParticipacion: f.idParticipacion,
            tipoFase: tipoFaseParam,
            nota: notaNumber,
            comentario: comentario || undefined,
          },
        });

        exitos++;

        setFilas((prev) =>
          prev.map((x) =>
            mismaFila(x, f)
              ? {
                  ...x,
                  nota: notaNumber,
                  notaLocal: String(notaNumber),
                  comentarioLocal: comentario,
                  modificada: false,
                  guardando: false,
                }
              : x
          )
        );
      } catch {
        errores++;
        setFilas((prev) =>
          prev.map((x) => (mismaFila(x, f) ? { ...x, guardando: false } : x))
        );
      }
    }

    setGuardandoTodos(false);
    setConfirmGuardarTodosVisible(false);

    await cargarParticipantes();

    showResult(
      errores === 0 ? "success" : "error",
      "Resultado del guardado",
      `Notas guardadas correctamente: ${exitos}. Errores: ${errores}.`
    );
  }

  function abrirConfirmGuardarTodos() {
    const hayModificados = filas.some(
      (f) => f.modificada && f.validadoPorResponsable !== true
    );
    if (!hayModificados) {
      showResult(
        "error",
        "Sin cambios",
        "No hay notas modificadas para guardar."
      );
      return;
    }
    setConfirmGuardarTodosVisible(true);
  }

  function abrirModalDescalificar(fila: FilaNota) {
    if (fila.validadoPorResponsable === true) {
      showResult(
        "error",
        "Fila bloqueada",
        "Esta evaluación ya fue validada por el responsable y no puede descalificarse desde aquí."
      );
      return;
    }
    setFilaParaDescalificar(fila);
    setMotivoDescalificar("");
    setErrorMotivo("");
    setModalMotivoVisible(true);
  }

  function cerrarModalMotivo() {
    if (descalificando) return;
    setModalMotivoVisible(false);
    setErrorMotivo("");
    setMotivoDescalificar("");
    setFilaParaDescalificar(null);
  }

  function continuarDesdeModalMotivo() {
    if (!motivoDescalificar.trim()) {
      setErrorMotivo("Debe ingresar un motivo (máx. 30 caracteres).");
      return;
    }
    setModalMotivoVisible(false);
    setConfirmDescalificarVisible(true);
  }

  async function handleConfirmDescalificar() {
    if (!filaParaDescalificar) {
      setConfirmDescalificarVisible(false);
      showResult(
        "error",
        "No se puede descalificar",
        "Faltan datos de la participación que desea descalificar."
      );
      return;
    }
    if (!categoriaIdParam) {
      setConfirmDescalificarVisible(false);
      showResult(
        "error",
        "Categoría inválida",
        "No se encontró la categoría en la URL."
      );
      return;
    }

    setDescalificando(true);
    try {
      const resp = (await api("/evaluaciones/descalificar", {
        method: "POST",
        token: token ?? undefined,
        body: {
          idParticipacion: filaParaDescalificar.idParticipacion,
          motivo: motivoDescalificar.trim(),
          tipoFase: tipoFaseParam,
        },
      })) as {
        success?: boolean;
        message?: string;
        data?: any;
      };

      setConfirmDescalificarVisible(false);
      setFilaParaDescalificar(null);
      setMotivoDescalificar("");
      setErrorMotivo("");

      await cargarParticipantes();

      showResult(
        "success",
        "Participación descalificada",
        resp?.message || "La participación fue descalificada correctamente."
      );
    } catch (err: any) {
      setConfirmDescalificarVisible(false);
      showResult(
        "error",
        "No se pudo descalificar",
        err?.message || "Ocurrió un error al descalificar la participación."
      );
    } finally {
      setDescalificando(false);
    }
  }

  async function exportarExcel() {
    if (!filas.length) {
      showResult(
        "error",
        "Sin datos",
        "No hay participantes para exportar a Excel."
      );
      return;
    }

    try {
      setExportando(true);

      const header = [
        "Participante / Equipo",
        "Nota",
        "Estado",
        "Comentario",
        "Validado por responsable",
      ];

      const filasCSV = filas.map((f) => {
        const nombre = (f.nombreCompleto || "").replace(/"/g, '""');
        const nota =
          f.nota !== null && f.nota !== undefined
            ? Number(f.nota).toFixed(2).replace(".", ",")
            : "";

        let estado: string;
        if (tipoFaseParam === "FINAL") {
          estado = f.medalla
            ? f.medalla === "ORO"
              ? "Oro"
              : f.medalla === "PLATA"
              ? "Plata"
              : f.medalla === "BRONCE"
              ? "Bronce"
              : "Mención"
            : "Sin medalla";
        } else {
          estado =
            f.estadoNota === "CLASIFICADO"
              ? "Clasificado"
              : f.estadoNota === "NO_CLASIFICADO"
              ? "No clasificado"
              : "Descalificado";
        }

        const comentario = (f.comentarioLocal || "").replace(/"/g, '""');
        const validadoTexto =
          f.validadoPorResponsable === true
            ? "Sí"
            : f.validadoPorResponsable === false
            ? "No"
            : "Pendiente";

        return [nombre, nota, estado, comentario, validadoTexto];
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

      const fileName = `notas_${tipoFaseParam.toLowerCase()}_${(
        areaParam || "area"
      )
        .replace(/\s+/g, "_")
        .toLowerCase()}_${(nivelParam || "nivel")
        .replace(/\s+/g, "_")
        .toLowerCase()}.csv`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showResult(
        "success",
        "Archivo generado",
        "Se generó el archivo CSV (compatible con Excel) con las notas de esta categoría."
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

  const columnasTabla: ColumnaConfig<FilaNota>[] = useMemo(() => {
    return [
      {
        clave: "nombreCompleto",
        titulo: "Participante / Equipo",
        ordenable: true,
      },
      {
        clave: "notaLocal",
        titulo: "Nota (fase actual)",
        alineacion: "centro",
        ordenable: false,
        formatearCelda: (_valor: any, fila: FilaNota) => {
          const deshabilitado =
            fila.guardando || fila.validadoPorResponsable === true;
          return (
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={fila.notaLocal}
              onChange={(e) => handleNotaChange(fila, e.target.value)}
              disabled={deshabilitado}
              className={
                fieldBase +
                " text-center" +
                (deshabilitado
                  ? " bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70"
                  : "")
              }
            />
          );
        },
      },
      {
        clave: "comentarioLocal",
        titulo: "Comentario (máx. 30)",
        alineacion: "centro",
        ordenable: false,
        formatearCelda: (_valor: any, fila: FilaNota) => {
          const deshabilitado =
            fila.guardando || fila.validadoPorResponsable === true;
          return (
            <input
              type="text"
              maxLength={30}
              value={fila.comentarioLocal}
              onChange={(e) => handleComentarioChange(fila, e.target.value)}
              disabled={deshabilitado}
              className={
                fieldBase +
                " text-xs" +
                (deshabilitado
                  ? " bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70"
                  : "")
              }
              placeholder="Opcional"
            />
          );
        },
      },
      {
        clave: "estadoNota",
        titulo: tipoFaseParam === "FINAL" ? "Medalla" : "Estado", // 👈 título cambia opcionalmente
        alineacion: "centro",
        ordenable: false,
        formatearCelda: (_valor: any, fila: FilaNota) => {
          // 👇 CLASIFICATORIA: se muestra estado
          if (tipoFaseParam === "CLASIFICATORIA") {
            return (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${claseChipEstadoNota(
                  fila.estadoNota
                )}`}
              >
                {fila.estadoNota === "CLASIFICADO" && (
                  <FiCheckCircle className="h-3 w-3" />
                )}
                {fila.estadoNota === "NO_CLASIFICADO" && (
                  <FiAlertTriangle className="h-3 w-3" />
                )}
                {fila.estadoNota === "DESCALIFICADO" && (
                  <FiAlertTriangle className="h-3 w-3" />
                )}
                {fila.estadoNota === "CLASIFICADO"
                  ? "Clasificado"
                  : fila.estadoNota === "NO_CLASIFICADO"
                  ? "No clasificado"
                  : "Descalificado"}
              </span>
            );
          }

          // 👇 FINAL: se muestra medalla o "Sin medalla"
          const medalla = fila.medalla;
          const textoMedalla = medalla
            ? medalla === "ORO"
              ? "Oro"
              : medalla === "PLATA"
              ? "Plata"
              : medalla === "BRONCE"
              ? "Bronce"
              : "Mención"
            : "Sin medalla";

          return (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${claseChipMedalla(
                medalla
              )}`}
            >
              {textoMedalla}
            </span>
          );
        },
      },
    ];
  }, [tipoFaseParam]);

  function renderAcciones(fila: FilaNota) {
    const bloqueado = fila.validadoPorResponsable === true;
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => guardarFilaPorFila(fila)}
          disabled={fila.guardando || !fila.modificada || bloqueado}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:border-emerald-500 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          title="Guardar esta fila"
        >
          <FiSave className="mr-1 h-3.5 w-3.5" />
          Guardar
        </button>

        <button
          type="button"
          onClick={() => abrirModalDescalificar(fila)}
          disabled={
            fila.guardando || fila.estadoNota === "DESCALIFICADO" || bloqueado
          }
          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-100 hover:border-red-300 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:border-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          title="Descalificar participación"
        >
          <FiAlertTriangle className="mr-1 h-3.5 w-3.5" />
          Descalificar
        </button>
      </div>
    );
  }

  function volver() {
    navigate("/evaluaciones/categorias");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
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
                Evaluación de participantes
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                {areaParam || "Área"} – {nivelParam || "Nivel"}
              </h1>
              <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                Modalidad:{" "}
                <span className="font-semibold">
                  {modalidadParam === "INDIVIDUAL" ? "Individual" : "Grupal"}
                </span>{" "}
                · Fase:{" "}
                <span className="font-semibold">
                  {tipoFaseParam === "CLASIFICATORIA"
                    ? "Clasificatoria"
                    : "Final"}
                </span>
                . Registre o edite las notas de los participantes asignados.
              </p>
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

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Participantes asignados
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Total en la categoría:{" "}
                <span className="font-semibold">{filas.length}</span>
                {" · "}
                Mostrando:{" "}
                <span className="font-semibold">{datosPaginados.length}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportarExcel}
                disabled={exportando || filas.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiDownload className="h-4 w-4" />
                {exportando ? "Generando Excel..." : "Descargar Excel"}
              </button>

              <button
                type="button"
                onClick={abrirConfirmGuardarTodos}
                disabled={loading || filas.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave className="h-4 w-4" />
                Guardar todos los cambios
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              Cargando participantes asignados…
            </div>
          )}

          {!loading && !hayDatos && (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              No hay participantes asignados para esta fase y categoría.
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

        {filaParaDescalificar && modalMotivoVisible && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
          >
            <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-5 shadow-xl ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800 sm:p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Descalificar participante
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Está a punto de descalificar a{" "}
                  <span className="font-semibold">
                    {filaParaDescalificar.nombreCompleto}
                  </span>{" "}
                  en esta categoría. Ingrese el motivo (máx. 30 caracteres) que
                  quedará registrado en el sistema.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Motivo de descalificación
                </label>
                <input
                  type="text"
                  value={motivoDescalificar}
                  maxLength={30}
                  onChange={(e) => {
                    setMotivoDescalificar(e.target.value);
                    if (errorMotivo) setErrorMotivo("");
                  }}
                  className={
                    fieldBase +
                    " text-sm" +
                    (errorMotivo
                      ? " border-red-500 focus:border-red-500 focus:ring-red-500/30"
                      : "")
                  }
                  placeholder="Ej.: Copia de examen, conducta..."
                />
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <span>{motivoDescalificar.length} / 30 caracteres</span>
                  {errorMotivo && (
                    <span className="text-red-500">{errorMotivo}</span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarModalMotivo}
                  disabled={descalificando}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:focus-visible:ring-offset-gray-900 sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={continuarDesdeModalMotivo}
                  disabled={descalificando}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-red-500 dark:hover:bg-red-400 dark:focus-visible:ring-offset-gray-900 sm:w-auto disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          visible={confirmGuardarTodosVisible}
          title="Guardar todas las notas modificadas"
          message="Se guardarán en la base de datos todas las notas y comentarios que hayan sido modificados en esta categoría y fase (excepto las filas ya validadas por el responsable). ¿Desea continuar?"
          onCancel={() => {
            if (guardandoTodos) return;
            setConfirmGuardarTodosVisible(false);
          }}
          onConfirm={guardarTodos}
          confirmText="Guardar todas"
          cancelText="Cancelar"
          danger={false}
          loading={guardandoTodos}
        />

        <ConfirmModal
          visible={confirmDescalificarVisible}
          title="Confirmar descalificación"
          message={
            filaParaDescalificar
              ? `Se descalificará a "${filaParaDescalificar.nombreCompleto}" en esta categoría. Motivo: "${motivoDescalificar}". Esta acción actualizará el estado de su participación. ¿Desea continuar?`
              : ""
          }
          onCancel={() => {
            if (descalificando) return;
            setConfirmDescalificarVisible(false);
          }}
          onConfirm={handleConfirmDescalificar}
          confirmText="Sí, descalificar"
          cancelText="Cancelar"
          danger
          loading={descalificando}
        />

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

export default EvaluacionNotasCategoria;
