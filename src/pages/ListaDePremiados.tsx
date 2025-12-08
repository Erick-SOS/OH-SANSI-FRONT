// src/pages/GanadoresCertificados.tsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { getToken, getUser, AuthUser } from "../components/auth/authStorage";

import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
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

// ✅ Ganador plano (INDIVIDUAL o GRUPAL) – campos opcionales según modalidad
interface GanadorIntegranteApi {
  ci: string;
  nombre_completo: string;
  unidad_educativa: string;
}

interface GanadorApi {
  tipo_medalla: TipoMedalla;
  nota: number;
  // Individual
  ci?: string;
  nombre_completo?: string;
  unidad_educativa?: string;
  // Grupal
  nombre_equipo?: string;
  integrantes?: GanadorIntegranteApi[];
}

// ✅ Respuesta plano del backend (GanadoresCertificadoPlanoResponseDTO)
interface GanadoresPlanoResponse {
  total: number;
  gestion: number;
  modalidad: ModalidadCategoria;
  responsable_nombre_completo: string | null;
  correos_enviados: boolean;
  resultados_publicados: boolean;
  totales_por_medalla: {
    oro: number;
    plata: number;
    bronce: number;
    mencion: number;
  };
  ganadores: GanadorApi[];
}

// ✅ ResultadoEnvioCorreosDTO (solo para mensaje)
interface ResultadoEnvioCorreos {
  categoria: {
    id: number;
    gestion: number;
    modalidad: ModalidadCategoria;
    area_id: number;
    nivel_id: number;
    nombre_area: string;
    nombre_nivel: string;
  };
  fase_final: {
    id: number;
    estado: EstadoFase;
    correos_enviados: boolean;
    resultados_publicados: boolean;
  };
  total_destinatarios: number;
  enviados: number;
  fallidos: number;
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

function claseBadgeBoolean(valor: boolean): string {
  return valor
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
    : "bg-gray-100 text-gray-700 dark:bg-gray-800/70 dark:text-gray-200";
}

// 👉 Construir personas para certificado según modalidad global
function construirPersonasCertDesdeGanador(
  g: GanadorApi,
  modalidad: ModalidadCategoria
): PersonaCert[] {
  if (modalidad === "INDIVIDUAL") {
    if (!g.ci || !g.nombre_completo) return [];
    return [
      {
        ci: g.ci,
        nombre: g.nombre_completo,
        unidadEducativa: g.unidad_educativa || "",
        medalla: g.tipo_medalla,
        nota: g.nota,
        modalidad,
      },
    ];
  }

  // GRUPAL
  if (g.integrantes && g.integrantes.length > 0) {
    return g.integrantes.map((i) => ({
      ci: i.ci,
      nombre: i.nombre_completo,
      unidadEducativa: g.unidad_educativa || "",
      medalla: g.tipo_medalla,
      nota: g.nota,
      modalidad,
    }));
  }

  // Fallback: sin integrantes pero con líder
  if (!g.ci || !g.nombre_completo) return [];
  return [
    {
      ci: g.ci,
      nombre: g.nombre_completo,
      unidadEducativa: g.unidad_educativa || "",
      medalla: g.tipo_medalla,
      nota: g.nota,
      modalidad,
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

  const [ganadoresData, setGanadoresData] =
    useState<GanadoresPlanoResponse | null>(null);
  const [loadingGanadores, setLoadingGanadores] = useState(false);

  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const [grupoSeleccionado, setGrupoSeleccionado] =
    useState<GanadorApi | null>(null);
  const [integrantesModalVisible, setIntegrantesModalVisible] =
    useState(false);

  const [confirmEnvioVisible, setConfirmEnvioVisible] = useState(false);
  const [confirmEnvioLoading, setConfirmEnvioLoading] = useState(false);

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

  // Cargar token/usuario
  useEffect(() => {
    (async () => {
      const t = await getToken();
      const u = await getUser();
      setToken(t);
      setUser(u);
    })();
  }, []);

  // Cargar filtros y preseleccionar primer área/nivel
  useEffect(() => {
    cargarFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando hay área y nivel, consultar ganadores
  useEffect(() => {
    if (areaSeleccionada && nivelSeleccionado) {
      cargarGanadores(areaSeleccionada, nivelSeleccionado);
    } else {
      setGanadoresData(null);
    }
  }, [areaSeleccionada, nivelSeleccionado]);

  async function cargarFiltros() {
    setLoadingFiltros(true);
    try {
      const resp = await api("/filtros/categorias");
      const lista: FiltroCategoria[] = resp.data || [];
      setFiltros(lista);

      // ✅ Preseleccionar primer área/nivel automáticamente
      if (lista.length > 0) {
        const primeraArea = lista[0].area;
        const primerNivel = lista[0].niveles[0] || "";
        setAreaSeleccionada(primeraArea);
        setNivelSeleccionado(primerNivel);
      }
    } catch (err: any) {
      showResult(
        "error",
        "No se pudieron cargar los filtros",
        err?.message || "Error al cargar áreas y niveles."
      );
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
        data: GanadoresPlanoResponse;
      };
      setGanadoresData(resp.data);
      setPaginaActual(1);
    } catch (err: any) {
      setGanadoresData(null);
      showResult(
        "error",
        "No se pudo obtener la información",
        err?.message || "Ocurrió un error al consultar los ganadores."
      );
    } finally {
      setLoadingGanadores(false);
    }
  }

  const nivelesDisponibles = useMemo(() => {
    if (!areaSeleccionada) return [];
    const f = filtros.find((x) => x.area === areaSeleccionada);
    return f?.niveles ?? [];
  }, [filtros, areaSeleccionada]);

  function aplicarFiltros(lista: GanadorApi[]): GanadorApi[] {
    let resultado = [...lista];

    if (terminoBusqueda.trim()) {
      const q = normalizarTexto(terminoBusqueda.trim());
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

  const ganadoresFiltrados = useMemo(() => {
    if (!ganadoresData) return [];
    return aplicarFiltros(ganadoresData.ganadores);
  }, [ganadoresData, terminoBusqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(ganadoresFiltrados.length / ITEMS_POR_PAGINA)
  );

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return ganadoresFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [ganadoresFiltrados, paginaActual]);

  const hayDatos = ganadoresFiltrados.length > 0;

  // ✅ Columnas dinámicas según modalidad
  const columnasTabla: ColumnaConfig<GanadorApi>[] = useMemo(() => {
    if (!ganadoresData) return [];

    const colsBase: ColumnaConfig<GanadorApi>[] = [
      {
        clave: "tipo_medalla",
        titulo: "Tipo de medalla",
        alineacion: "centro",
        ordenable: true,
        formatearCelda: (_valor: any, fila: GanadorApi) => (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${claseBadgeMedalla(
              fila.tipo_medalla
            )}`}
          >
            {etiquetaMedalla(fila.tipo_medalla)}
          </span>
        ),
      },
      {
        clave: "nota",
        titulo: "Calificación final",
        alineacion: "centro",
        ordenable: true,
        formatearCelda: (_valor: any, fila: GanadorApi) =>
          fila.nota.toFixed(2),
      },
    ];

    if (ganadoresData.modalidad === "INDIVIDUAL") {
      return [
        ...colsBase,
        {
          clave: "ci",
          titulo: "Documento de identidad",
          alineacion: "centro",
          ordenable: true,
        },
        {
          clave: "nombre_completo",
          titulo: "Nombre completo del participante",
          ordenable: true,
        },
        {
          clave: "unidad_educativa",
          titulo: "Unidad educativa",
          ordenable: true,
        },
      ];
    }

    // GRUPAL
    return [
      ...colsBase,
      {
        clave: "nombre_equipo",
        titulo: "Nombre del equipo",
        ordenable: true,
      },
      {
        clave: "unidad_educativa",
        titulo: "Unidad educativa de referencia",
        ordenable: true,
      },
    ];
  }, [ganadoresData]);

  function abrirModalIntegrantes(fila: GanadorApi) {
    setGrupoSeleccionado(fila);
    setIntegrantesModalVisible(true);
  }

  function abrirVentanaCertificadosParaGanador(g: GanadorApi) {
    if (!ganadoresData) return;
    const personas = construirPersonasCertDesdeGanador(
      g,
      ganadoresData.modalidad
    );
    if (personas.length === 0) return;

    const html = generarHtmlCertificados(personas, {
      area: areaSeleccionada || "",
      nivel: nivelSeleccionado || "",
      gestion: ganadoresData.gestion,
      responsable: ganadoresData.responsable_nombre_completo,
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
    ganadoresFiltrados.forEach((g) => {
      personas.push(
        ...construirPersonasCertDesdeGanador(g, ganadoresData.modalidad)
      );
    });

    if (personas.length === 0) return;

    const html = generarHtmlCertificados(personas, {
      area: areaSeleccionada || "",
      nivel: nivelSeleccionado || "",
      gestion: ganadoresData.gestion,
      responsable: ganadoresData.responsable_nombre_completo,
    });

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function exportarExcelCsv() {
    if (!ganadoresData || ganadoresFiltrados.length === 0) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay ganadores para exportar con los filtros actuales."
      );
      return;
    }

    const esIndividual = ganadoresData.modalidad === "INDIVIDUAL";

    const encabezados = esIndividual
      ? [
          "Modalidad",
          "Tipo de medalla",
          "Nota final",
          "Documento de identidad",
          "Nombre completo",
          "Unidad educativa",
        ]
      : [
          "Modalidad",
          "Tipo de medalla",
          "Nota final",
          "Nombre del equipo",
          "Unidad educativa",
        ];

    const filas = ganadoresFiltrados.map((g) => {
      if (esIndividual) {
        return [
          ganadoresData.modalidad,
          etiquetaMedalla(g.tipo_medalla),
          g.nota.toFixed(2),
          g.ci ?? "",
          g.nombre_completo ?? "",
          g.unidad_educativa ?? "",
        ];
      }
      // GRUPAL
      return [
        ganadoresData.modalidad,
        etiquetaMedalla(g.tipo_medalla),
        g.nota.toFixed(2),
        g.nombre_equipo ?? "",
        g.unidad_educativa ?? "",
      ];
    });

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
    const nombreArchivo = `ganadores_${areaSeleccionada}_${nivelSeleccionado}_gestion_${ganadoresData.gestion}.csv`;
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
      showResult(
        "error",
        "Sesión no válida",
        "Debe iniciar sesión como usuario autorizado para enviar correos."
      );
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
          area: areaSeleccionada,
          nivel: nivelSeleccionado,
        },
      })) as {
        success: boolean;
        data: ResultadoEnvioCorreos;
        message?: string;
      };

      showResult(
        "success",
        "Correos procesados",
        resp.message ||
          `Se procesaron los correos. Enviados: ${resp.data.enviados}, fallidos: ${resp.data.fallidos}.`
      );

      await cargarGanadores(areaSeleccionada, nivelSeleccionado);
    } catch (err: any) {
      showResult(
        "error",
        "No se pudieron enviar los correos",
        err?.message || "Ocurrió un error al procesar el envío de correos."
      );
    } finally {
      setConfirmEnvioLoading(false);
      setConfirmEnvioVisible(false);
    }
  }

  const yaSeEnviaronCorreos = !!ganadoresData?.correos_enviados;
  const resultadosPublicados = !!ganadoresData?.resultados_publicados;

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
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
                  Gestión {ganadoresData.gestion}
                </span>
                {areaSeleccionada && nivelSeleccionado && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                    {areaSeleccionada} – {nivelSeleccionado}
                  </span>
                )}
                <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                  Modalidad: {ganadoresData.modalidad}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${claseBadgeBoolean(
                    resultadosPublicados
                  )}`}
                >
                  Resultados publicados:{" "}
                  {resultadosPublicados ? "Sí" : "No"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${claseBadgeBoolean(
                    yaSeEnviaronCorreos
                  )}`}
                >
                  Correos a ganadores:{" "}
                  {yaSeEnviaronCorreos ? "Enviados" : "No enviados"}
                </span>
                {ganadoresData.responsable_nombre_completo && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    Responsable: {ganadoresData.responsable_nombre_completo}
                  </span>
                )}
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
                <BarraBusquedaAreas
                  terminoBusqueda={terminoBusqueda}
                  onBuscarChange={(t: string) => {
                    setTerminoBusqueda(t);
                    setPaginaActual(1);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={abrirVentanaCertificadosTodos}
              disabled={!ganadoresData || !ganadoresFiltrados.length}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-red-500 dark:hover:bg-red-400 dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaFilePdf className="h-4 w-4" />
              Descargar certificados (PDF)
            </button>

            <button
              type="button"
              onClick={exportarExcelCsv}
              disabled={!ganadoresData || !ganadoresFiltrados.length}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaFileExcel className="h-4 w-4" />
              Exportar datos (Excel/CSV)
            </button>

            <button
              type="button"
              onClick={solicitarEnvioCorreos}
              disabled={!ganadoresData || !ganadoresFiltrados.length}
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

        {/* TABLA PRINCIPAL – UNA SOLA TABLA */}
        {!loadingGanadores && ganadoresData && (
          <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Resultados de la categoría seleccionada
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Total de ganadores:{" "}
                  <span className="font-semibold">
                    {ganadoresData.total}
                  </span>
                  {" · "}
                  Oro: {ganadoresData.totales_por_medalla.oro} · Plata:{" "}
                  {ganadoresData.totales_por_medalla.plata} · Bronce:{" "}
                  {ganadoresData.totales_por_medalla.bronce} · Mención:{" "}
                  {ganadoresData.totales_por_medalla.mencion}
                </p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Vista actual:{" "}
                <span className="font-semibold">
                  {ganadoresData.modalidad === "INDIVIDUAL"
                    ? "Ganadores individuales"
                    : "Ganadores por equipo"}
                </span>
              </div>
            </div>

            {hayDatos ? (
              <>
                <TablaBase
                  datos={datosPaginados}
                  columnas={columnasTabla}
                  conAcciones
                  renderAcciones={(fila: GanadorApi) => (
                    <div className="flex items-center justify-center gap-2">
                      {ganadoresData.modalidad === "GRUPAL" && (
                        <button
                          type="button"
                          onClick={() => abrirModalIntegrantes(fila)}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:border-blue-500 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-400"
                          title="Ver integrantes del equipo"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          abrirVentanaCertificadosParaGanador(fila)
                        }
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-400"
                        title="Descargar certificado(s)"
                      >
                        <FiDownload className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                />
                {totalPaginas > 1 && (
                  <div className="mt-3 flex justify-end">
                    <Paginacion
                      paginaActual={paginaActual}
                      totalPaginas={totalPaginas}
                      totalRegistros={ganadoresFiltrados.length}
                      registrosPorPagina={ITEMS_POR_PAGINA}
                      onPaginaChange={setPaginaActual}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                No hay ganadores registrados para los filtros actuales.
              </div>
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
                } correos a los ganadores del área "${areaSeleccionada}" y nivel "${nivelSeleccionado}".`
              : ""
          }
          onCancel={() => {
            if (confirmEnvioLoading) return;
            setConfirmEnvioVisible(false);
          }}
          onConfirm={confirmarEnvioCorreos}
          confirmText={
            yaSeEnviaronCorreos ? "Reenviar correos" : "Enviar correos"
          }
          cancelText="Cancelar"
          danger={false}
          loading={confirmEnvioLoading}
        />

        {/* MODAL RESULTADO */}
        <ResultModal
          visible={resultModal.visible}
          type={resultModal.type}
          title={resultModal.title}
          message={resultModal.message}
          onClose={closeResultModal}
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
