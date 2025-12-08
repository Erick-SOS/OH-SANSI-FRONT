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
} from "react-icons/fi";

type TipoFase = "CLASIFICATORIA" | "FINAL";
type ModalidadCategoria = "INDIVIDUAL" | "GRUPAL";

type EstadoNota = "CLASIFICADO" | "NO_CLASIFICADO" | "DESCALIFICADO";

interface ParticipanteAsignadoDTO {
  idFase: number;
  idOlimpista: number | null;
  nombreCompleto: string;
  nota: number | null;
  estadoNota: EstadoNota;
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

// Fila con estado local
interface FilaNota extends ParticipanteAsignadoDTO {
  notaLocal: string; // input
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
        ok?: boolean;
        data?: ParticipanteAsignadoDTO[];
        message?: string;
      };

      const data = Array.isArray(resp.data) ? resp.data : [];
      const filasConEstado: FilaNota[] = data.map((p) => ({
        ...p,
        notaLocal: p.nota !== null ? String(p.nota) : "",
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
    } finally {
      setLoading(false);
    }
  }

  const filasFiltradas = useMemo(() => {
    if (!terminoBusqueda.trim()) return filas;

    const q = normalizarTexto(terminoBusqueda.trim());
    return filas.filter((f) =>
      normalizarTexto(f.nombreCompleto).includes(q)
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

  function mismaFila(a: FilaNota, b: FilaNota): boolean {
    return (
      a.idFase === b.idFase &&
      a.idOlimpista === b.idOlimpista &&
      a.nombreCompleto === b.nombreCompleto
    );
  }

  function handleNotaChange(filaRef: FilaNota, value: string) {
    setFilas((prev) =>
      prev.map((f) =>
        mismaFila(f, filaRef)
          ? {
              ...f,
              notaLocal: value,
              modificada: true,
            }
          : f
      )
    );
  }

  async function guardarFilaPorFila(filaRef: FilaNota) {
    const fila = filas.find((f) => mismaFila(f, filaRef));
    if (!fila) return;

    if (fila.idOlimpista == null) {
      showResult(
        "error",
        "No se puede guardar la nota",
        "No se encontró el olimpista asociado a esta participación (equipo sin líder). Contacte al administrador."
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

    setFilas((prev) =>
      prev.map((f) =>
        mismaFila(f, filaRef) ? { ...f, guardando: true } : f
      )
    );

    try {
      const resp = (await api("/evaluaciones/guardar", {
        method: "POST",
        token: token ?? undefined,
        body: {
          categoriaId: Number(categoriaIdParam),
          tipoFase: tipoFaseParam,
          idOlimpista: fila.idOlimpista,
          nota: notaNumber,
        },
      })) as {
        ok?: boolean;
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
                modificada: false,
                guardando: false,
              }
            : f
        )
      );

      showResult(
        "success",
        "Nota guardada",
        resp.message || "La nota se guardó correctamente."
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
    const filasModificadas = filas.filter((f) => f.modificada);

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
      if (valor === "" || isNaN(Number(valor)) || f.idOlimpista == null) {
        errores++;
        continue;
      }

      const notaNumber = Number(valor);

      setFilas((prev) =>
        prev.map((x) =>
          mismaFila(x, f) ? { ...x, guardando: true } : x
        )
      );

      try {
        // No necesitamos la respuesta aquí, solo que no lance error
        await api("/evaluaciones/guardar", {
          method: "POST",
          token: token ?? undefined,
          body: {
            categoriaId: Number(categoriaIdParam),
            tipoFase: tipoFaseParam,
            idOlimpista: f.idOlimpista,
            nota: notaNumber,
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
                  modificada: false,
                  guardando: false,
                }
              : x
          )
        );
      } catch {
        errores++;
        setFilas((prev) =>
          prev.map((x) =>
            mismaFila(x, f) ? { ...x, guardando: false } : x
          )
        );
      }
    }

    setGuardandoTodos(false);
    setConfirmGuardarTodosVisible(false);

    showResult(
      errores === 0 ? "success" : "error",
      "Resultado del guardado",
      `Notas guardadas correctamente: ${exitos}. Errores: ${errores}.`
    );
  }

  function abrirConfirmGuardarTodos() {
    const hayModificados = filas.some((f) => f.modificada);
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
          return (
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={fila.notaLocal}
              onChange={(e) =>
                handleNotaChange(fila, e.target.value)
              }
              className={fieldBase + " text-center"}
            />
          );
        },
      },
      {
        clave: "estadoNota",
        titulo: "Estado",
        alineacion: "centro",
        ordenable: false,
        formatearCelda: (_valor: any, fila: FilaNota) => (
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
        ),
      },
    ];
  }, []);

  function renderAcciones(fila: FilaNota) {
    return (
      <button
        type="button"
        onClick={() => guardarFilaPorFila(fila)}
        disabled={fila.guardando || !fila.modificada}
        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm hover:border-emerald-500 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        title="Guardar esta fila"
      >
        <FiSave className="mr-1 h-3.5 w-3.5" />
        Guardar
      </button>
    );
  }

  function volver() {
    navigate("/evaluaciones/categorias");
  }

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
                Evaluación de participantes
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                {areaParam || "Área"} – {nivelParam || "Nivel"}
              </h1>
              <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                Modalidad:{" "}
                <span className="font-semibold">
                  {modalidadParam === "INDIVIDUAL"
                    ? "Individual"
                    : "Grupal"}
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

        {/* CONTROLES SUPERIORES */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Participantes asignados
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Total en la categoría:{" "}
                <span className="font-semibold">
                  {filas.length}
                </span>
                {" · "}
                Mostrando:{" "}
                <span className="font-semibold">
                  {datosPaginados.length}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

          {/* ESTADOS */}
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

        {/* MODAL CONFIRMAR GUARDAR TODOS */}
        <ConfirmModal
          visible={confirmGuardarTodosVisible}
          title="Guardar todas las notas modificadas"
          message="Se guardarán en la base de datos todas las notas que hayan sido modificadas en esta categoría y fase. ¿Desea continuar?"
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

export default EvaluacionNotasCategoria;
