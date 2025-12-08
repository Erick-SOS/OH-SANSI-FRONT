// src/pages/GanadoresCertificados.tsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { getToken, getUser, AuthUser } from "../components/auth/authStorage";

import BarraBusquedaOlimpias from "../components/tables/BarraBusquedaOlimpias";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";

import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";

import { FiFilter, FiMail, FiDownload, FiEye } from "react-icons/fi";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";

import {
  ModalidadCategoria,
  TipoMedalla,
  PersonaCert,
  generarHtmlCertificados,
  etiquetaMedalla,
} from "../components/certificados/DisenoCertificado";

type EstadoFase = "PENDIENTE" | "EN_EJECUCION" | "FINALIZADA" | "CANCELADA";

interface FiltroCategoria {
  area: string;
  niveles: string[];
}

interface IntegranteApi {
  ci: string;
  nombre_completo: string;
}

interface GanadorApi {
  modalidad: ModalidadCategoria;
  medalla: TipoMedalla;
  nota: number;
  ci: string | null;
  nombre_completo: string | null;
  unidad_educativa: string | null;
  nombre_equipo: string | null;
  integrantes: IntegranteApi[];
}

interface GanadoresResponse {
  categoria: {
    gestion: number;
    area: string;
    nivel: string;
    modalidad: ModalidadCategoria;
  };
  responsable: {
    nombre_completo: string;
  } | null;
  fase_final: {
    estado: EstadoFase;
    correos_enviados: boolean;
  };
  total_ganadores: number;
  totales_por_medalla: {
    oro: number;
    plata: number;
    bronce: number;
    mencion: number;
  };
  ganadores: GanadorApi[];
}

interface ResultadoEnvioCorreos {
  categoria: {
    gestion: number;
    area: string;
    nivel: string;
    modalidad: ModalidadCategoria;
  };
  fase_final: {
    estado: EstadoFase;
    correos_enviados: boolean;
    resultados_publicados: boolean;
  };
  total_destinatarios: number;
  enviados: number;
  fallidos: number;
}

type TipoTabla = "INDIVIDUAL" | "GRUPAL";

type TipoAlineacion = "izquierda" | "centro" | "derecha";

interface ColumnaConfig<T = any> {
  clave: string;
  titulo: string;
  alineacion?: TipoAlineacion;
  ancho?: string;
  ordenable?: boolean;
  formatearCelda?: (valor: any, fila: T) => React.ReactNode;
}

const fieldBase =
  "w-full px-3 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 " +
  "bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-brand-500/40 focus:border-brand-500 " +
  "dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:border-gray-700 dark:focus:border-brand-400";

const ITEMS_POR_PAGINA = 10;

function normalizarTexto(s?: string | null): string {
  if (!s) return "";
  return s.toString().toLowerCase();
}

function claseBadgeMedalla(m: TipoMedalla): string {
  switch (m) {
    case "ORO":
      return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700";
    case "PLATA":
      return "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-800/40 dark:text-gray-100 dark:border-gray-600";
    case "BRONCE":
      return "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700";
    case "MENCION":
    default:
      return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700";
  }
}

function claseBadgeEstadoFase(estado: EstadoFase): string {
  switch (estado) {
    case "PENDIENTE":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800/70 dark:text-gray-200";
    case "EN_EJECUCION":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "FINALIZADA":
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200";
    case "CANCELADA":
      return "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200";
    default:
      return "";
  }
}

// 👉 aquí solo se construyen las personas para el certificado;
// el diseño está en el archivo aparte
function construirPersonasCertDesdeGanador(g: GanadorApi): PersonaCert[] {
  if (g.modalidad === "INDIVIDUAL") {
    if (!g.ci || !g.nombre_completo) return [];
    return [
      {
        ci: g.ci,
        nombre: g.nombre_completo,
        unidadEducativa: g.unidad_educativa || "",
        medalla: g.medalla,
        nota: g.nota,
        modalidad: g.modalidad,
      },
    ];
  }

  // GRUPAL
  if (g.integrantes && g.integrantes.length > 0) {
    return g.integrantes.map((i) => ({
      ci: i.ci,
      nombre: i.nombre_completo,
      unidadEducativa: g.unidad_educativa || "",
      medalla: g.medalla,
      nota: g.nota,
      modalidad: g.modalidad,
    }));
  }

  // fallback por si no vinieron integrantes pero sí líder
  if (!g.ci || !g.nombre_completo) return [];
  return [
    {
      ci: g.ci,
      nombre: g.nombre_completo,
      unidadEducativa: g.unidad_educativa || "",
      medalla: g.medalla,
      nota: g.nota,
      modalidad: g.modalidad,
    },
  ];
}

const GanadoresCertificados: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [filtros, setFiltros] = useState<FiltroCategoria[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState(false);

  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");

  const [ganadoresData, setGanadoresData] = useState<GanadoresResponse | null>(
    null
  );
  const [loadingGanadores, setLoadingGanadores] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [tablaActiva, setTablaActiva] = useState<TipoTabla>("INDIVIDUAL");

  const [paginaIndividual, setPaginaIndividual] = useState(1);
  const [paginaGrupal, setPaginaGrupal] = useState(1);

  const [grupoSeleccionado, setGrupoSeleccionado] =
    useState<GanadorApi | null>(null);
  const [integrantesModalVisible, setIntegrantesModalVisible] =
    useState(false);

  const [confirmEnvioVisible, setConfirmEnvioVisible] = useState(false);
  const [confirmEnvioLoading, setConfirmEnvioLoading] = useState(false);

  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    (async () => {
      const t = await getToken();
      const u = await getUser();
      setToken(t);
      setUser(u);
    })();
  }, []);

  useEffect(() => {
    cargarFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (areaSeleccionada && nivelSeleccionado) {
      cargarGanadores(areaSeleccionada, nivelSeleccionado);
    } else {
      setGanadoresData(null);
    }
  }, [areaSeleccionada, nivelSeleccionado]);

  useEffect(() => {
    setPaginaIndividual(1);
    setPaginaGrupal(1);
  }, [busqueda, areaSeleccionada, nivelSeleccionado]);

  async function cargarFiltros() {
    setLoadingFiltros(true);
    try {
      const resp = await api("/filtros/categorias");
      setFiltros(resp.data || []);
    } catch (err: any) {
      setResultType("error");
      setResultTitle("No se pudieron cargar los filtros");
      setResultMessage(err.message || "Error al cargar áreas y niveles.");
      setResultVisible(true);
    } finally {
      setLoadingFiltros(false);
    }
  }

  async function cargarGanadores(area: string, nivel: string) {
    setLoadingGanadores(true);
    try {
      const query = new URLSearchParams({ area, nivel }).toString();
      const resp = (await api(`/ganadores-certificados?${query}`)) as {
        success: boolean;
        data: GanadoresResponse;
      };
      setGanadoresData(resp.data);
    } catch (err: any) {
      setGanadoresData(null);
      setResultType("error");
      setResultTitle("No se pudo obtener la información");
      setResultMessage(
        err.message || "Ocurrió un error al consultar los ganadores."
      );
      setResultVisible(true);
    } finally {
      setLoadingGanadores(false);
    }
  }

  const nivelesDisponibles = useMemo(() => {
    if (!areaSeleccionada) return [];
    const f = filtros.find((x) => x.area === areaSeleccionada);
    return f?.niveles ?? [];
  }, [filtros, areaSeleccionada]);

  const ganadoresIndividuales = useMemo(
    () =>
      ganadoresData?.ganadores.filter(
        (g) => g.modalidad === "INDIVIDUAL"
      ) || [],
    [ganadoresData]
  );

  const ganadoresGrupales = useMemo(
    () =>
      ganadoresData?.ganadores.filter(
        (g) => g.modalidad === "GRUPAL"
      ) || [],
    [ganadoresData]
  );

  function aplicarFiltros(lista: GanadorApi[]): GanadorApi[] {
    let resultado = [...lista];

    if (busqueda.trim()) {
      const q = normalizarTexto(busqueda.trim());
      resultado = resultado.filter((g) => {
        return (
          normalizarTexto(g.nombre_completo).includes(q) ||
          normalizarTexto(g.ci).includes(q) ||
          normalizarTexto(g.unidad_educativa).includes(q) ||
          normalizarTexto(g.nombre_equipo).includes(q)
        );
      });
    }
    return resultado;
  }

  const datosTablaIndividual = useMemo(
    () => aplicarFiltros(ganadoresIndividuales),
    [ganadoresIndividuales, busqueda]
  );

  const datosTablaGrupal = useMemo(
    () => aplicarFiltros(ganadoresGrupales),
    [ganadoresGrupales, busqueda]
  );

  const totalPaginasIndividual = Math.max(
    1,
    Math.ceil(datosTablaIndividual.length / ITEMS_POR_PAGINA)
  );
  const totalPaginasGrupal = Math.max(
    1,
    Math.ceil(datosTablaGrupal.length / ITEMS_POR_PAGINA)
  );

  const datosIndividualPaginados = useMemo(() => {
    const inicio = (paginaIndividual - 1) * ITEMS_POR_PAGINA;
    return datosTablaIndividual.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [datosTablaIndividual, paginaIndividual]);

  const datosGrupalPaginados = useMemo(() => {
    const inicio = (paginaGrupal - 1) * ITEMS_POR_PAGINA;
    return datosTablaGrupal.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [datosTablaGrupal, paginaGrupal]);

  const columnasIndividual: ColumnaConfig<GanadorApi>[] = [
    {
      clave: "medalla",
      titulo: "Tipo de medalla",
      alineacion: "centro",
      formatearCelda: (_valor: any, fila: GanadorApi) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${claseBadgeMedalla(
            fila.medalla
          )}`}
        >
          {etiquetaMedalla(fila.medalla)}
        </span>
      ),
    },
    {
      clave: "nota",
      titulo: "Calificación final",
      alineacion: "centro",
      formatearCelda: (_valor: any, fila: GanadorApi) =>
        fila.nota.toFixed(2),
    },
    {
      clave: "ci",
      titulo: "Documento de identidad",
      alineacion: "centro",
    },
    {
      clave: "nombre_completo",
      titulo: "Nombre completo del participante",
    },
    {
      clave: "unidad_educativa",
      titulo: "Unidad educativa",
    },
  ];

  const columnasGrupal: ColumnaConfig<GanadorApi>[] = [
    {
      clave: "medalla",
      titulo: "Tipo de medalla",
      alineacion: "centro",
      formatearCelda: (_valor: any, fila: GanadorApi) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${claseBadgeMedalla(
            fila.medalla
          )}`}
        >
          {etiquetaMedalla(fila.medalla)}
        </span>
      ),
    },
    {
      clave: "nota",
      titulo: "Calificación final",
      alineacion: "centro",
      formatearCelda: (_valor: any, fila: GanadorApi) =>
        fila.nota.toFixed(2),
    },
    {
      clave: "nombre_equipo",
      titulo: "Nombre del equipo",
    },
    {
      clave: "unidad_educativa",
      titulo: "Unidad educativa de referencia",
    },
  ];

  function abrirModalIntegrantes(fila: GanadorApi) {
    setGrupoSeleccionado(fila);
    setIntegrantesModalVisible(true);
  }

  function abrirVentanaCertificadosParaGanador(g: GanadorApi) {
    if (!ganadoresData) return;
    const personas = construirPersonasCertDesdeGanador(g);
    if (personas.length === 0) return;

    const html = generarHtmlCertificados(personas, {
      area: ganadoresData.categoria.area,
      nivel: ganadoresData.categoria.nivel,
      gestion: ganadoresData.categoria.gestion,
      responsable: ganadoresData.responsable?.nombre_completo ?? null,
    });

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function abrirVentanaCertificadosTodos() {
    if (!ganadoresData) return;

    const personas: PersonaCert[] = [];
    ganadoresData.ganadores.forEach((g) => {
      personas.push(...construirPersonasCertDesdeGanador(g));
    });

    if (personas.length === 0) return;

    const html = generarHtmlCertificados(personas, {
      area: ganadoresData.categoria.area,
      nivel: ganadoresData.categoria.nivel,
      gestion: ganadoresData.categoria.gestion,
      responsable: ganadoresData.responsable?.nombre_completo ?? null,
    });

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function exportarExcelCsv() {
    if (!ganadoresData) return;

    const encabezados = [
      "Modalidad",
      "Tipo de medalla",
      "Nota final",
      "Documento de identidad",
      "Nombre completo",
      "Unidad educativa",
      "Nombre de equipo",
    ];

    const filas = ganadoresData.ganadores.map((g) => [
      g.modalidad,
      etiquetaMedalla(g.medalla),
      g.nota.toFixed(2),
      g.ci ?? "",
      g.nombre_completo ?? "",
      g.unidad_educativa ?? "",
      g.nombre_equipo ?? "",
    ]);

    const csv = [encabezados, ...filas]
      .map((fila) =>
        fila
          .map((campo) => {
            const val = String(campo ?? "").replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(";")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const nombreArchivo = `ganadores_${ganadoresData.categoria.area}_${ganadoresData.categoria.nivel}_gestion_${ganadoresData.categoria.gestion}.csv`;
    link.href = url;
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function solicitarEnvioCorreos() {
    if (!ganadoresData) return;
    if (!token || !user) {
      setResultType("error");
      setResultTitle("Sesión no válida");
      setResultMessage(
        "Debe iniciar sesión como usuario autorizado para enviar correos."
      );
      setResultVisible(true);
      return;
    }
    setConfirmEnvioVisible(true);
  }

  async function confirmarEnvioCorreos() {
    if (!ganadoresData || !token) return;
    setConfirmEnvioLoading(true);
    try {
      const resp = (await api("/ganadores-certificados/enviar-correos", {
        method: "POST",
        token,
        body: {
          area: ganadoresData.categoria.area,
          nivel: ganadoresData.categoria.nivel,
        },
      })) as {
        success: boolean;
        data: ResultadoEnvioCorreos;
        message?: string;
      };

      setResultType("success");
      setResultTitle("Correos procesados");
      setResultMessage(
        resp.message ||
          `Se procesaron los correos. Enviados: ${resp.data.enviados}, fallidos: ${resp.data.fallidos}.`
      );
      setResultVisible(true);

      await cargarGanadores(
        ganadoresData.categoria.area,
        ganadoresData.categoria.nivel
      );
    } catch (err: any) {
      setResultType("error");
      setResultTitle("No se pudieron enviar los correos");
      setResultMessage(
        err.message || "Ocurrió un error al procesar el envío de correos."
      );
      setResultVisible(true);
    } finally {
      setConfirmEnvioLoading(false);
      setConfirmEnvioVisible(false);
    }
  }

  const estadoFaseFinal = ganadoresData?.fase_final.estado;
  const yaSeEnviaronCorreos = ganadoresData?.fase_final.correos_enviados;
  const hayDatosIndividuales = datosTablaIndividual.length > 0;
  const hayDatosGrupales = datosTablaGrupal.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {/* HEADER */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
              <FiFilter className="h-4 w-4" />
              Consulta de ganadores y certificados
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Ganadores por categoría y emisión de certificados
            </h1>
            <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              Seleccione el área y el nivel para visualizar los ganadores de la
              fase final, descargar certificados, exportar los datos y, si
              corresponde, enviar o reenviar correos de notificación.
            </p>
          </div>

          {ganadoresData && (
            <div className="flex flex-col items-start gap-2 rounded-2xl bg-white px-4 py-3 text-xs shadow-sm dark:bg-gray-900 md:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-100">
                  Gestión {ganadoresData.categoria.gestion}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                  {ganadoresData.categoria.area} –{" "}
                  {ganadoresData.categoria.nivel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${claseBadgeEstadoFase(
                    estadoFaseFinal || "PENDIENTE"
                  )}`}
                >
                  Fase final: {estadoFaseFinal || "PENDIENTE"}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  Correos a ganadores:{" "}
                  {yaSeEnviaronCorreos ? "Enviados" : "No enviados"}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* FILTROS PRINCIPALES */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  Área
                </label>
                <select
                  value={areaSeleccionada}
                  onChange={(e) => {
                    setAreaSeleccionada(e.target.value);
                    setNivelSeleccionado("");
                  }}
                  className={fieldBase}
                  disabled={loadingFiltros}
                >
                  <option value="">Seleccione un área</option>
                  {filtros.map((f) => (
                    <option key={f.area} value={f.area}>
                      {f.area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  Nivel
                </label>
                <select
                  value={nivelSeleccionado}
                  onChange={(e) => setNivelSeleccionado(e.target.value)}
                  className={fieldBase}
                  disabled={!areaSeleccionada || loadingFiltros}
                >
                  <option value="">Seleccione un nivel</option>
                  {nivelesDisponibles.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <div className="w-full md:w-72">
                <BarraBusquedaOlimpias
                  valorBusqueda={busqueda}
                  onCambioBusqueda={setBusqueda}
                  placeholder="Buscar por nombre, CI, unidad educativa o equipo"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={abrirVentanaCertificadosTodos}
              disabled={!ganadoresData || !ganadoresData.ganadores.length}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-red-500 dark:hover:bg-red-400 dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaFilePdf className="h-4 w-4" />
              Descargar certificados (PDF)
            </button>

            <button
              type="button"
              onClick={exportarExcelCsv}
              disabled={!ganadoresData || !ganadoresData.ganadores.length}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaFileExcel className="h-4 w-4" />
              Exportar datos (Excel/CSV)
            </button>

            <button
              type="button"
              onClick={solicitarEnvioCorreos}
              disabled={
                !ganadoresData ||
                !ganadoresData.ganadores.length ||
                !estadoFaseFinal ||
                estadoFaseFinal !== "FINALIZADA"
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiMail className="h-4 w-4" />
              {yaSeEnviaronCorreos
                ? "Reenviar correos a ganadores"
                : "Enviar correos a ganadores"}
            </button>
          </div>
        </section>

        {/* ESTADOS VACÍOS / CARGANDO */}
        {loadingGanadores && (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            Cargando ganadores de la categoría seleccionada…
          </div>
        )}

        {!loadingGanadores &&
          !ganadoresData &&
          areaSeleccionada &&
          nivelSeleccionado && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              No se encontraron ganadores para el área y nivel seleccionados.
            </div>
          )}

        {!loadingGanadores && !ganadoresData && !areaSeleccionada && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            Seleccione un área y un nivel para consultar los ganadores de la
            fase final.
          </div>
        )}

        {/* TABLAS PRINCIPALES */}
        {!loadingGanadores && ganadoresData && (
          <section className="space-y-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Resultados de la categoría seleccionada
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Total de ganadores:{" "}
                  <span className="font-semibold">
                    {ganadoresData.total_ganadores}
                  </span>
                  {" · "}
                  Oro: {ganadoresData.totales_por_medalla.oro} · Plata:{" "}
                  {ganadoresData.totales_por_medalla.plata} · Bronce:{" "}
                  {ganadoresData.totales_por_medalla.bronce} · Mención:{" "}
                  {ganadoresData.totales_por_medalla.mencion}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-gray-100 p-1 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <button
                type="button"
                onClick={() => setTablaActiva("INDIVIDUAL")}
                className={`flex-1 rounded-xl px-3 py-2 text-center ${
                  tablaActiva === "INDIVIDUAL"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                Ganadores individuales
              </button>
              <button
                type="button"
                onClick={() => setTablaActiva("GRUPAL")}
                className={`flex-1 rounded-xl px-3 py-2 text-center ${
                  tablaActiva === "GRUPAL"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                Ganadores por equipo
              </button>
            </div>

            {tablaActiva === "INDIVIDUAL" && (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Ganadores en modalidad individual
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Total: {datosTablaIndividual.length}
                  </p>
                </div>
                {hayDatosIndividuales ? (
                  <>
                    <TablaBase
                      datos={datosIndividualPaginados}
                      columnas={columnasIndividual}
                      conAcciones
                      renderAcciones={(fila: GanadorApi) => (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              abrirVentanaCertificadosParaGanador(fila)
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-400"
                            title="Descargar certificado de este participante"
                          >
                            <FiDownload className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    />
                    {totalPaginasIndividual > 1 && (
                      <div className="mt-3 flex justify-end">
                        <Paginacion
                          paginaActual={paginaIndividual}
                          totalPaginas={totalPaginasIndividual}
                          totalRegistros={datosTablaIndividual.length}
                          registrosPorPagina={ITEMS_POR_PAGINA}
                          onPaginaChange={setPaginaIndividual}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    No hay ganadores registrados en modalidad individual para
                    los filtros actuales.
                  </div>
                )}
              </section>
            )}

            {tablaActiva === "GRUPAL" && (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Ganadores en modalidad grupal
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Total de equipos: {datosTablaGrupal.length}
                  </p>
                </div>
                {hayDatosGrupales ? (
                  <>
                    <TablaBase
                      datos={datosGrupalPaginados}
                      columnas={columnasGrupal}
                      conAcciones
                      renderAcciones={(fila: GanadorApi) => (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => abrirModalIntegrantes(fila)}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-400"
                            title="Ver integrantes del equipo"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              abrirVentanaCertificadosParaGanador(fila)
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-400"
                            title="Descargar certificados de este equipo"
                          >
                            <FiDownload className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    />
                    {totalPaginasGrupal > 1 && (
                      <div className="mt-3 flex justify-end">
                        <Paginacion
                          paginaActual={paginaGrupal}
                          totalPaginas={totalPaginasGrupal}
                          totalRegistros={datosTablaGrupal.length}
                          registrosPorPagina={ITEMS_POR_PAGINA}
                          onPaginaChange={setPaginaGrupal}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    No hay ganadores registrados en modalidad grupal para los
                    filtros actuales.
                  </div>
                )}
              </section>
            )}
          </section>
        )}

        {/* MODAL CONFIRMAR ENVÍO CORREOS */}
        <ConfirmModal
          visible={confirmEnvioVisible && !!ganadoresData}
          title={
            yaSeEnviaronCorreos
              ? "Reenviar correos a ganadores"
              : "Enviar correos a ganadores"
          }
          message={
            ganadoresData
              ? `Se ${
                  yaSeEnviaronCorreos ? "reenviarán" : "enviarán"
                } correos a los ganadores del área ${
                  ganadoresData.categoria.area
                } y nivel ${ganadoresData.categoria.nivel}.`
              : ""
          }
          onCancel={() => {
            if (confirmEnvioLoading) return;
            setConfirmEnvioVisible(false);
          }}
          onConfirm={confirmarEnvioCorreos}
          confirmText={yaSeEnviaronCorreos ? "Reenviar correos" : "Enviar correos"}
          cancelText="Cancelar"
          danger={false}
          loading={confirmEnvioLoading}
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

        {/* MODAL INTEGRANTES EQUIPO */}
        {integrantesModalVisible && grupoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Integrantes del equipo
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Equipo:{" "}
                    <span className="font-semibold">
                      {grupoSeleccionado.nombre_equipo || "-"}
                    </span>{" "}
                    · Unidad educativa:{" "}
                    <span className="font-semibold">
                      {grupoSeleccionado.unidad_educativa || "-"}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIntegrantesModalVisible(false);
                    setGrupoSeleccionado(null);
                  }}
                  className="rounded-full border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  Cerrar
                </button>
              </div>

              {grupoSeleccionado.integrantes &&
              grupoSeleccionado.integrantes.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950">
                  <div className="max-w-full overflow-x-auto text-xs">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            N°
                          </th>
                          <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Documento de identidad
                          </th>
                          <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Nombre completo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {grupoSeleccionado.integrantes.map((i, idx) => (
                          <tr
                            key={i.ci + idx}
                            className="bg-white text-gray-800 dark:bg-gray-950 dark:text-gray-100"
                          >
                            <td className="px-4 py-2 text-center text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-2 text-[11px]">{i.ci}</td>
                            <td className="px-4 py-2 text-[11px]">
                              {i.nombre_completo}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  No se registraron integrantes para este equipo.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanadoresCertificados;
