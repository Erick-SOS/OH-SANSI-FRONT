import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Flag,
  Layers,
  PlayCircle,
  StopCircle,
  UploadCloud,
  Edit3,
  Plus,
  ChevronDown,
} from "lucide-react";
import { api } from "../api";
import { getToken } from "../components/auth/authStorage";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";

type EstadoFase = "PENDIENTE" | "EN_EJECUCION" | "FINALIZADA" | "CANCELADA";
type TipoFase = "CLASIFICATORIA" | "FINAL";
type AccionFase = "ABRIR" | "CERRAR" | "PUBLICAR" | "QUITAR_PUBLICACION";

interface FaseResumen {
  id: number;
  nombre: string;
  tipo: TipoFase;
  descripcion: string | null;
  inicio: string | null;
  fin: string | null;
  estado: EstadoFase;
  correos_enviados: boolean;
  resultados_publicados: boolean;
  gestion: number;
}

interface GestionFases {
  gestion: number;
  descripcion: string | null;
  inicio: string | null;
  fin: string | null;
  fases: FaseResumen[];
}

interface ListResponse {
  success: boolean;
  data: GestionFases[];
  total: number;
}

interface CrearGestionResponse {
  success: boolean;
  message: string;
  data: GestionFases;
}

interface ActualizarGestionResponse {
  success: boolean;
  message: string;
  data: GestionFases;
}

interface FaseAccionResponse {
  success: boolean;
  message: string;
  data: FaseResumen;
}

const fieldBase =
  "w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 " +
  "bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-brand-500/40 focus:border-brand-500 " +
  "dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:border-gray-700 dark:focus:border-brand-400";

const currentYear = new Date().getFullYear();

function formatFecha(fecha: string | null | undefined) {
  if (!fecha) return "-";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toDateTimeLocalValue(fecha: string | null | undefined) {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function estadoBadgeClasses(estado: EstadoFase): string {
  switch (estado) {
    case "PENDIENTE":
      return "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    case "EN_EJECUCION":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700";
    case "FINALIZADA":
      return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700";
    case "CANCELADA":
      return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700";
    default:
      return "";
  }
}

function tipoLabel(tipo: TipoFase) {
  return tipo === "CLASIFICATORIA" ? "Fase clasificatoria" : "Fase final";
}

function accionLabel(accion: AccionFase, fase: FaseResumen): string {
  switch (accion) {
    case "ABRIR":
      return `Abrir fase ${
        fase.tipo === "CLASIFICATORIA" ? "clasificatoria" : "final"
      }`;
    case "CERRAR":
      return `Finalizar fase ${
        fase.tipo === "CLASIFICATORIA" ? "clasificatoria" : "final"
      }`;
    case "PUBLICAR":
      return `Publicar resultados de la fase ${
        fase.tipo === "CLASIFICATORIA" ? "clasificatoria" : "final"
      }`;
    case "QUITAR_PUBLICACION":
      return `Quitar publicación de resultados de la fase ${
        fase.tipo === "CLASIFICATORIA" ? "clasificatoria" : "final"
      }`;
    default:
      return "Acción sobre fase";
  }
}

const GestionDeFases: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  const [gestiones, setGestiones] = useState<GestionFases[]>([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  // Modal creación
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [crearTitulo, setCrearTitulo] = useState("");
  const [crearInicio, setCrearInicio] = useState("");
  const [crearFin, setCrearFin] = useState("");
  const [crearLoading, setCrearLoading] = useState(false);

  // Modal edición
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [editarGestion, setEditarGestion] = useState<number | null>(null);
  const [editarTitulo, setEditarTitulo] = useState("");
  const [editarInicio, setEditarInicio] = useState("");
  const [editarFin, setEditarFin] = useState("");
  const [editarLoading, setEditarLoading] = useState(false);

  // Confirmación de acción sobre fase
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [faseSeleccionada, setFaseSeleccionada] = useState<FaseResumen | null>(
    null
  );
  const [accionSeleccionada, setAccionSeleccionada] =
    useState<AccionFase | null>(null);

  // Result modal
  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  // Expandir/colapsar detalle por gestión
  const [gestionesExpand, setGestionesExpand] = useState<
    Record<number, boolean>
  >({});

  const yaExisteGestionActual = useMemo(
    () => !!gestiones.find((g) => g.gestion === currentYear),
    [gestiones]
  );

  useEffect(() => {
    (async () => {
      const t = await getToken();
      setToken(t);
      if (!t) {
        setErrorGlobal("Debe iniciar sesión para gestionar las fases.");
        return;
      }
      await cargarGestiones(t);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarGestiones(tkn?: string) {
    const tk = tkn ?? token;
    if (!tk) return;

    setLoadingPage(true);
    setErrorGlobal(null);

    try {
      const resp = (await api("/gestion-fases?desde=2025&hasta=2030", {
        token: tk,
      })) as ListResponse;

      setGestiones(resp.data || []);
    } catch (err: any) {
      setErrorGlobal(err.message || "No se pudieron cargar las gestiones.");
    } finally {
      setLoadingPage(false);
    }
  }

  function resetModalCrear() {
    setCrearTitulo("");
    setCrearInicio("");
    setCrearFin("");
  }

  function resetModalEditar() {
    setEditarGestion(null);
    setEditarTitulo("");
    setEditarInicio("");
    setEditarFin("");
  }

  function abrirModalCrear() {
    resetModalCrear();
    setModalCrearAbierto(true);
  }

  function abrirModalEditar(gestion: GestionFases) {
    setEditarGestion(gestion.gestion);
    setEditarTitulo(gestion.descripcion ?? "");
    setEditarInicio(toDateTimeLocalValue(gestion.inicio));
    setEditarFin(toDateTimeLocalValue(gestion.fin));
    setModalEditarAbierto(true);
  }

  function validarRangoFechas(inicio: string, fin: string): string | null {
    if (!inicio || !fin) {
      return "Debe completar las fechas de inicio y fin.";
    }
    const dInicio = new Date(inicio);
    const dFin = new Date(fin);
    if (Number.isNaN(dInicio.getTime()) || Number.isNaN(dFin.getTime())) {
      return "Las fechas ingresadas no son válidas.";
    }
    if (dFin < dInicio) {
      return "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }
    return null;
  }

  async function handleCrearGestion() {
    if (!token) {
      setResultType("error");
      setResultTitle("Sesión no válida");
      setResultMessage("Debe iniciar sesión nuevamente.");
      setResultVisible(true);
      return;
    }

    if (!crearTitulo.trim()) {
      setResultType("error");
      setResultTitle("Datos incompletos");
      setResultMessage("El título de la gestión es obligatorio.");
      setResultVisible(true);
      return;
    }

    if (yaExisteGestionActual) {
      setResultType("error");
      setResultTitle("Gestión duplicada");
      setResultMessage(
        `Ya existe una gestión registrada para el año ${currentYear}.`
      );
      setResultVisible(true);
      return;
    }

    const errorFecha = validarRangoFechas(crearInicio, crearFin);
    if (errorFecha) {
      setResultType("error");
      setResultTitle("Fechas no válidas");
      setResultMessage(errorFecha);
      setResultVisible(true);
      return;
    }

    setCrearLoading(true);

    try {
      const dInicio = new Date(crearInicio);
      const dFin = new Date(crearFin);

      const resp = (await api("/gestion-fases", {
        method: "POST",
        token,
        body: {
          descripcion: crearTitulo.trim(),
          inicio: dInicio.toISOString(),
          fin: dFin.toISOString(),
        },
      })) as CrearGestionResponse;

      const nueva = resp.data;
      setGestiones((prev) =>
        [...prev, nueva].sort((a, b) => b.gestion - a.gestion)
      );
      setModalCrearAbierto(false);
      resetModalCrear();

      setResultType("success");
      setResultTitle("Gestión creada");
      setResultMessage(
        resp.message || "La gestión y sus fases se crearon correctamente."
      );
      setResultVisible(true);
    } catch (err: any) {
      setResultType("error");
      setResultTitle("No se pudo crear la gestión");
      setResultMessage(
        err.message || "Ocurrió un error al registrar la gestión y sus fases."
      );
      setResultVisible(true);
    } finally {
      setCrearLoading(false);
    }
  }

  async function handleEditarGestion() {
    if (!token || editarGestion == null) {
      setResultType("error");
      setResultTitle("Sesión no válida");
      setResultMessage("Debe iniciar sesión nuevamente.");
      setResultVisible(true);
      return;
    }

    if (!editarTitulo.trim() && !editarInicio && !editarFin) {
      setResultType("error");
      setResultTitle("Sin cambios");
      setResultMessage(
        "Debe modificar al menos un campo para actualizar la gestión."
      );
      setResultVisible(true);
      return;
    }

    if (editarInicio && editarFin) {
      const errorFecha = validarRangoFechas(editarInicio, editarFin);
      if (errorFecha) {
        setResultType("error");
        setResultTitle("Fechas no válidas");
        setResultMessage(errorFecha);
        setResultVisible(true);
        return;
      }
    }

    setEditarLoading(true);

    try {
      const body: any = {};
      if (editarTitulo.trim()) body.descripcion = editarTitulo.trim();
      if (editarInicio) body.inicio = new Date(editarInicio).toISOString();
      if (editarFin) body.fin = new Date(editarFin).toISOString();

      const resp = (await api(`/gestion-fases/${editarGestion}`, {
        method: "PATCH",
        token,
        body,
      })) as ActualizarGestionResponse;

      const gestionActualizada = resp.data;

      setGestiones((prev) =>
        prev
          .map((g) =>
            g.gestion === gestionActualizada.gestion ? gestionActualizada : g
          )
          .sort((a, b) => b.gestion - a.gestion)
      );

      setModalEditarAbierto(false);
      resetModalEditar();

      setResultType("success");
      setResultTitle("Gestión actualizada");
      setResultMessage(
        resp.message || "La gestión se actualizó correctamente."
      );
      setResultVisible(true);
    } catch (err: any) {
      setResultType("error");
      setResultTitle("No se pudo actualizar la gestión");
      setResultMessage(
        err.message ||
          "Ocurrió un error al actualizar la descripción o las fechas de la gestión."
      );
      setResultVisible(true);
    } finally {
      setEditarLoading(false);
    }
  }

  function abrirConfirmacion(fase: FaseResumen, accion: AccionFase) {
    setFaseSeleccionada(fase);
    setAccionSeleccionada(accion);
    setConfirmVisible(true);
  }

  async function confirmarAccionFase() {
    if (!token || !faseSeleccionada || !accionSeleccionada) return;

    setConfirmLoading(true);

    try {
      const resp = (await api(
        `/gestion-fases/fase/${faseSeleccionada.id}/accion`,
        {
          method: "PATCH",
          token,
          body: { accion: accionSeleccionada },
        }
      )) as FaseAccionResponse;

      const faseActualizada = resp.data;

      setGestiones((prev) =>
        prev.map((g) => ({
          ...g,
          fases: g.fases.map((f) =>
            f.id === faseActualizada.id ? faseActualizada : f
          ),
        }))
      );

      setResultType("success");
      setResultTitle("Fase actualizada");
      setResultMessage(
        resp.message || accionLabel(accionSeleccionada, faseSeleccionada)
      );
      setResultVisible(true);
      setConfirmVisible(false);
      setFaseSeleccionada(null);
      setAccionSeleccionada(null);
    } catch (err: any) {
      setResultType("error");
      setResultTitle("No se pudo actualizar la fase");
      setResultMessage(
        err.message || "Ocurrió un error al aplicar la acción seleccionada."
      );
      setResultVisible(true);
    } finally {
      setConfirmLoading(false);
    }
  }

  function puedeAbrir(fase: FaseResumen): boolean {
    if (fase.estado === "EN_EJECUCION" || fase.estado === "CANCELADA")
      return false;
    return true;
  }

  function puedeCerrar(fase: FaseResumen): boolean {
    if (fase.estado !== "EN_EJECUCION") return false;
    return true;
  }

  function puedePublicar(fase: FaseResumen): boolean {
    if (fase.resultados_publicados) return true; // permite quitar publicación
    return fase.estado === "FINALIZADA";
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {/* Encabezado */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
              <Layers className="h-4 w-4" />
              Gestión de fases de olimpiada
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Gestión de fases por año
            </h1>
            <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              Desde esta pantalla puede registrar la gestión anual con sus fases
              clasificatoria y final, actualizar fechas y controlar el estado de
              cada fase (apertura, cierre y publicación de resultados).
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300">
              <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Gestión actual del sistema:</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                {currentYear}
              </span>
            </div>

            <button
              type="button"
              disabled={!token || yaExisteGestionActual}
              onClick={abrirModalCrear}
              className={`inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md 
                hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 
                focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-950
                disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <Plus className="h-4 w-4" />
              {yaExisteGestionActual
                ? "Ya existe gestión actual"
                : "Registrar nueva gestión"}
            </button>
          </div>
        </header>

        {/* Errores globales / estado de carga */}
        {errorGlobal && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-900/30 dark:text-red-200">
            {errorGlobal}
          </div>
        )}

        {loadingPage && (
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
              <span>Cargando gestiones y fases...</span>
            </div>
          </div>
        )}

        {!loadingPage && gestiones.length === 0 && !errorGlobal && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <p className="mb-3 font-medium">
              No hay gestiones registradas entre 2025 y 2030.
            </p>
            <p>
              Puede crear la gestión del año actual y se generarán
              automáticamente las fases clasificatoria y final.
            </p>
          </div>
        )}

        {/* Listado de gestiones */}
        {!loadingPage &&
          gestiones.map((gestion) => {
            const expandida = gestionesExpand[gestion.gestion] ?? true;
            const fasesOrdenadas = [...gestion.fases].sort((a, b) =>
              a.tipo.localeCompare(b.tipo)
            );
            return (
              <section
                key={gestion.gestion}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-6"
              >
                <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        <Flag className="h-4 w-4 text-brand-500" />
                        Gestión {gestion.gestion}
                      </span>
                      {gestion.descripcion && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                          {gestion.descripcion}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-1 dark:bg-gray-800/80">
                        <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>
                          {formatFecha(gestion.inicio)} –{" "}
                          {formatFecha(gestion.fin)}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-1 text-gray-700 dark:bg-gray-800/80 dark:text-gray-300">
                        <Layers className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>Fases configuradas: {gestion.fases.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => abrirModalEditar(gestion)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-400"
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar gestión
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGestionesExpand((prev) => ({
                          ...prev,
                          [gestion.gestion]: !expandida,
                        }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandida ? "rotate-180" : ""
                        }`}
                      />
                      {expandida ? "Ocultar detalle" : "Ver detalle"}
                    </button>
                  </div>
                </header>

                {expandida && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {fasesOrdenadas.map((fase) => {
                      const puedePub = puedePublicar(fase);

                      return (
                        <article
                          key={fase.id}
                          className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60"
                        >
                          {/* ... resto del encabezado y fechas ... */}

                          <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {/* Abrir */}
                            <button
                              type="button"
                              onClick={() => abrirConfirmacion(fase, "ABRIR")}
                              disabled={!puedeAbrir(fase)}
                              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
            focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-950
            ${
              puedeAbrir(fase)
                ? "border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-gray-900 dark:text-emerald-300"
                : "cursor-not-allowed border-gray-200 bg-white text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500"
            }`}
                            >
                              <PlayCircle className="h-4 w-4" />
                              Abrir fase
                            </button>

                            {/* Cerrar */}
                            <button
                              type="button"
                              onClick={() => abrirConfirmacion(fase, "CERRAR")}
                              disabled={!puedeCerrar(fase)}
                              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
            focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-950
            ${
              puedeCerrar(fase)
                ? "border-blue-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/60 dark:bg-gray-900 dark:text-blue-300"
                : "cursor-not-allowed border-gray-200 bg-white text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500"
            }`}
                            >
                              <StopCircle className="h-4 w-4" />
                              Cerrar fase
                            </button>

                            {/* Publicar / Quitar publicación */}
                            <button
                              type="button"
                              onClick={() =>
                                abrirConfirmacion(
                                  fase,
                                  fase.resultados_publicados
                                    ? "QUITAR_PUBLICACION"
                                    : "PUBLICAR"
                                )
                              }
                              disabled={!puedePub}
                              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2
            focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-950
            ${
              puedePub
                ? fase.resultados_publicados
                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200"
                  : "border-amber-200 bg-white text-amber-700 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-gray-900 dark:text-amber-300"
                : "cursor-not-allowed border-gray-200 bg-white text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500"
            }`}
                            >
                              <UploadCloud className="h-4 w-4" />
                              {fase.resultados_publicados
                                ? "Quitar publicación"
                                : "Publicar resultados"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

        {/* MODAL CREAR GESTIÓN */}
        {modalCrearAbierto && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Registrar nueva gestión
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Se crearán automáticamente las fases clasificatoria y final
                    para la gestión seleccionada. Solo se permite una gestión
                    por año.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Año de gestión
                  </label>
                  <input
                    type="text"
                    value={currentYear}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Título de la olimpiada
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Olimpiada Científica Estudiantil Plurinacional de Bolivia"
                    value={crearTitulo}
                    onChange={(e) => setCrearTitulo(e.target.value)}
                    className={fieldBase}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Fecha y hora de inicio
                    </label>
                    <input
                      type="datetime-local"
                      value={crearInicio}
                      onChange={(e) => setCrearInicio(e.target.value)}
                      className={fieldBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Fecha y hora de fin
                    </label>
                    <input
                      type="datetime-local"
                      value={crearFin}
                      onChange={(e) => setCrearFin(e.target.value)}
                      className={fieldBase}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalCrearAbierto(false);
                    resetModalCrear();
                  }}
                  disabled={crearLoading}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCrearGestion}
                  disabled={crearLoading}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {crearLoading ? "Guardando..." : "Crear gestión"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDITAR GESTIÓN */}
        {modalEditarAbierto && editarGestion != null && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Editar gestión {editarGestion}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Los cambios en el título o en las fechas se aplican a ambas
                    fases de la gestión seleccionada.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Título de la olimpiada
                  </label>
                  <input
                    type="text"
                    value={editarTitulo}
                    onChange={(e) => setEditarTitulo(e.target.value)}
                    className={fieldBase}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Si deja este campo vacío, se mantendrá el título actual.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Fecha y hora de inicio
                    </label>
                    <input
                      type="datetime-local"
                      value={editarInicio}
                      onChange={(e) => setEditarInicio(e.target.value)}
                      className={fieldBase}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Fecha y hora de fin
                    </label>
                    <input
                      type="datetime-local"
                      value={editarFin}
                      onChange={(e) => setEditarFin(e.target.value)}
                      className={fieldBase}
                    />
                  </div>
                </div>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Si deja las fechas vacías, se mantendrán las fechas actuales
                  de la gestión.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditarAbierto(false);
                    resetModalEditar();
                  }}
                  disabled={editarLoading}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEditarGestion}
                  disabled={editarLoading}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {editarLoading ? "Guardando cambios..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMACIÓN ACCIÓN FASE */}
        <ConfirmModal
          visible={confirmVisible && !!faseSeleccionada && !!accionSeleccionada}
          title={
            faseSeleccionada && accionSeleccionada
              ? accionLabel(accionSeleccionada, faseSeleccionada)
              : "Confirmar acción"
          }
          message={
            faseSeleccionada && accionSeleccionada
              ? `Esta acción actualizará el estado de la fase ${
                  faseSeleccionada.tipo === "CLASIFICATORIA"
                    ? "clasificatoria"
                    : "final"
                } de la gestión ${faseSeleccionada.gestion}.`
              : "¿Confirma que desea aplicar esta acción?"
          }
          onCancel={() => {
            if (confirmLoading) return;
            setConfirmVisible(false);
            setFaseSeleccionada(null);
            setAccionSeleccionada(null);
          }}
          onConfirm={confirmarAccionFase}
          confirmText="Aplicar"
          cancelText="Cancelar"
          danger={
            accionSeleccionada === "CERRAR" ||
            accionSeleccionada === "QUITAR_PUBLICACION"
          }
          loading={confirmLoading}
        />

        {/* MODAL RESULTADO */}
        <ResultModal
          visible={resultVisible}
          type={resultType}
          title={resultTitle}
          message={resultMessage}
          onClose={() => setResultVisible(false)}
          buttonText="Aceptar"
        />
      </div>
    </div>
  );
};

export default GestionDeFases;
