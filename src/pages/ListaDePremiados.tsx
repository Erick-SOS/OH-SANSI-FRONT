// src/pages/GanadoresCertificados.tsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { getToken, getUser, AuthUser } from "../components/auth/authStorage";
import TablaBase from "../components/tables/TablaBase";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";
import DisenoCertificado, {
  CertificadoProps,
  ModalidadCategoria,
  TipoMedalla,
} from "../components/certificados/DisenoCertificado";
import {
  FiFilter,
  FiMail,
  FiDownload,
  FiEye,
  FiSearch,
} from "react-icons/fi";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";

type EstadoFase = "PENDIENTE" | "EN_EJECUCION" | "FINALIZADA" | "CANCELADA";

interface FiltroCategoria {
  area: string;
  niveles: string[];
}

interface GanadorApi {
  modalidad: ModalidadCategoria;
  medalla: TipoMedalla;
  nota: number;
  ci: string | null;
  nombre_completo: string | null;
  unidad_educativa: string | null;
  nombre_equipo: string | null;
  integrantes: {
    ci: string;
    nombre_completo: string;
  }[];
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

const fieldBase =
  "w-full px-3 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 " +
  "bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-brand-500/40 focus:border-brand-500 " +
  "dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:border-gray-700 dark:focus:border-brand-400";

function normalizarTexto(s?: string | null): string {
  if (!s) return "";
  return s.toString().toLowerCase();
}

function etiquetaMedalla(m: TipoMedalla): string {
  switch (m) {
    case "ORO":
      return "Oro";
    case "PLATA":
      return "Plata";
    case "BRONCE":
      return "Bronce";
    case "MENCION":
    default:
      return "Mención";
  }
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

type ColumnaConfig<T = any> = React.ComponentProps<typeof TablaBase<T>> extends {
  columnas: infer C;
}
  ? C extends (infer K)[]
    ? K
    : never
  : never;

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
  const [filtroMedalla, setFiltroMedalla] = useState<"" | TipoMedalla>("");

  const [tablaActiva, setTablaActiva] = useState<TipoTabla>("INDIVIDUAL");

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
  }, []);

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
      const query = new URLSearchParams({
        area,
        nivel,
      }).toString();
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
    if (filtroMedalla) {
      resultado = resultado.filter((g) => g.medalla === filtroMedalla);
    }
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
    [ganadoresIndividuales, filtroMedalla, busqueda]
  );

  const datosTablaGrupal = useMemo(
    () => aplicarFiltros(ganadoresGrupales),
    [ganadoresGrupales, filtroMedalla, busqueda]
  );

  const columnasIndividual: ColumnaConfig<GanadorApi>[] = [
    {
      clave: "medalla",
      titulo: "Tipo de medalla",
      alineacion: "centro",
      formatearCelda: (valor: any, fila: GanadorApi) => (
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
      formatearCelda: (valor: any, fila: GanadorApi) =>
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
      formatearCelda: (valor: any, fila: GanadorApi) => (
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
      formatearCelda: (valor: any, fila: GanadorApi) =>
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

  function construirPersonasDesdeGanador(
    g: GanadorApi
  ): { ci: string; nombre: string; unidadEducativa: string }[] {
    if (g.modalidad === "INDIVIDUAL") {
      if (!g.ci || !g.nombre_completo) return [];
      return [
        {
          ci: g.ci,
          nombre: g.nombre_completo,
          unidadEducativa: g.unidad_educativa || "",
        },
      ];
    }
    if (!g.integrantes || g.integrantes.length === 0) {
      if (!g.ci || !g.nombre_completo) return [];
      return [
        {
          ci: g.ci,
          nombre: g.nombre_completo,
          unidadEducativa: g.unidad_educativa || "",
        },
      ];
    }
    return g.integrantes.map((i) => ({
      ci: i.ci,
      nombre: i.nombre_completo,
      unidadEducativa: g.unidad_educativa || "",
    }));
  }

  function generarHtmlCertificados(
    personas: { ci: string; nombre: string; unidadEducativa: string }[],
    base: {
      medalla: TipoMedalla;
      nota: number;
      area: string;
      nivel: string;
      modalidad: ModalidadCategoria;
      gestion: number;
      responsable?: string | null;
    }
  ): string {
    const medallaLabel = etiquetaMedalla(base.medalla);
    const css = `
      * { box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 32px; background: #f3f4f6; }
      .page { width: 100%; max-width: 900px; margin: 0 auto 32px auto; padding: 32px 40px; background: white; border-radius: 24px; border: 1px solid #fbbf24; position: relative; }
      .title { text-align: center; margin-bottom: 12px; }
      .title h1 { font-size: 26px; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
      .subtitle { text-align: center; font-size: 12px; color: #4b5563; margin-bottom: 24px; }
      .name { text-align: center; font-size: 20px; font-weight: 600; margin-bottom: 4px; }
      .ci { text-align: center; font-size: 11px; color: #4b5563; margin-bottom: 4px; }
      .ue { text-align: center; font-size: 11px; color: #4b5563; margin-bottom: 12px; }
      .badge-row { text-align: center; margin-bottom: 16px; }
      .badge { display: inline-block; border-radius: 999px; border: 1px solid #fbbf24; background: #fffbeb; padding: 4px 14px; font-size: 11px; font-weight: 600; color: #92400e; margin-right: 8px; }
      .badge-secondary { display: inline-block; border-radius: 999px; border: 1px solid #d1d5db; background: #f9fafb; padding: 4px 14px; font-size: 11px; font-weight: 500; color: #374151; }
      .text { font-size: 11px; color: #374151; text-align: center; max-width: 600px; margin: 0 auto 20px auto; }
      .footer { margin-top: 32px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #4b5563; }
      .firma { text-align: center; }
      .firma-line { height: 1px; width: 220px; background: #6b7280; margin: 0 auto 6px auto; }
      .firma-nombre { font-weight: 600; color: #111827; }
      .firma-cargo { text-transform: uppercase; letter-spacing: 1px; }
      @media print {
        body { background: white; padding: 0; }
        .page { page-break-after: always; margin: 0; border-radius: 0; }
      }
    `;

    const paginas = personas
      .map((p) => {
        const textoModalidad =
          base.modalidad === "INDIVIDUAL" ? "participación individual" : "participación en equipo";
        return `
        <div class="page">
          <div class="title">
            <h1>Certificado de Reconocimiento</h1>
          </div>
          <div class="subtitle">
            Olimpiada Científica – Área ${base.area} – Nivel ${base.nivel} – Gestión ${
          base.gestion
        }
          </div>
          <div class="name">${p.nombre}</div>
          <div class="ci">Documento de identidad: <strong>${p.ci}</strong></div>
          <div class="ue">Unidad educativa: <strong>${p.unidadEducativa}</strong></div>
          <div class="badge-row">
            <span class="badge">${medallaLabel}</span>
            <span class="badge-secondary">Nota final: ${base.nota.toFixed(
              2
            )}</span>
            <span class="badge-secondary">${textoModalidad}</span>
          </div>
          <p class="text">
            En reconocimiento a su destacado desempeño académico en la Olimpiada Científica,
            obteniendo la distinción indicada y demostrando compromiso, esfuerzo y excelencia.
          </p>
          <div class="footer">
            <div></div>
            <div class="firma">
              <div class="firma-line"></div>
              <div class="firma-nombre">${
                base.responsable || "Responsable de área"
              }</div>
              <div class="firma-cargo">Responsable de la categoría</div>
            </div>
            <div>
              Sistema de Gestión de Olimpiadas<br/>
              Gestión ${base.gestion}
            </div>
          </div>
        </div>`;
      })
      .join("");

    return `<!DOCTYPE html>
<html>
<head>
<meta charSet="utf-8" />
<title>Certificados</title>
<style>${css}</style>
</head>
<body>${paginas}</body>
</html>`;
  }

  function abrirVentanaCertificadosParaGanador(g: GanadorApi) {
    if (!ganadoresData) return;
    const personas = construirPersonasDesdeGanador(g);
    if (personas.length === 0) return;

    const html = generarHtmlCertificados(personas, {
      medalla: g.medalla,
      nota: g.nota,
      area: ganadoresData.categoria.area,
      nivel: ganadoresData.categoria.nivel,
      modalidad: g.modalidad,
      gestion: ganadoresData.categoria.gestion,
      responsable: ganadoresData.responsable?.nombre_completo,
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

    const personas: {
      ci: string;
      nombre: string;
      unidadEducativa: string;
      medalla: TipoMedalla;
      nota: number;
      modalidad: ModalidadCategoria;
    }[] = [];

    ganadoresData.ganadores.forEach((g) => {
      const ps = construirPersonasDesdeGanador(g);
      ps.forEach((p) =>
        personas.push({
          ...p,
          medalla: g.medalla,
          nota: g.nota,
          modalidad: g.modalidad,
        })
      );
    });

    if (personas.length === 0) return;

    const html = generarHtmlCertificados(
      personas.map((p) => ({
        ci: p.ci,
        nombre: p.nombre,
        unidadEducativa: p.unidadEducativa,
      })),
      {
        medalla: personas[0].medalla,
        nota: personas[0].nota,
        area: ganadoresData.categoria.area,
        nivel: ganadoresData.categoria.nivel,
        modalidad: ganadoresData.categoria.modalidad,
        gestion: ganadoresData.categoria.gestion,
        responsable: ganadoresData.responsable?.nombre_completo,
      }
    );

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

  const ganadorEjemploParaCert = useMemo<CertificadoProps | null>(() => {
    if (!ganadoresData || ganadoresData.ganadores.length === 0) return null;
    const g = ganadoresData.ganadores[0];
    return {
      nombreGanador: g.nombre_completo || g.nombre_equipo || "Ganador",
      ci: g.ci,
      unidadEducativa: g.unidad_educativa || "",
      medalla: g.medalla,
      nota: g.nota,
      area: ganadoresData.categoria.area,
      nivel: ganadoresData.categoria.nivel,
      modalidad: g.modalidad,
      gestion: ganadoresData.categoria.gestion,
      nombreResponsable: ganadoresData.responsable?.nombre_completo ?? null,
    };
  }, [ganadoresData]);

  const estadoFaseFinal = ganadoresData?.fase_final.estado;
  const yaSeEnviaronCorreos = ganadoresData?.fase_final.correos_enviados;

  const hayDatosIndividuales = datosTablaIndividual.length > 0;
  const hayDatosGrupales = datosTablaGrupal.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
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

            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  Filtrar por medalla
                </label>
                <select
                  value={filtroMedalla}
                  onChange={(e) =>
                    setFiltroMedalla(e.target.value as "" | TipoMedalla)
                  }
                  className={fieldBase}
                  disabled={!ganadoresData}
                >
                  <option value="">Todas</option>
                  <option value="ORO">Oro</option>
                  <option value="PLATA">Plata</option>
                  <option value="BRONCE">Bronce</option>
                  <option value="MENCION">Mención</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  Búsqueda rápida
                </label>
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, CI, unidad educativa o equipo"
                    className={`${fieldBase} pl-9`}
                    disabled={!ganadoresData}
                  />
                </div>
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

        {!loadingGanadores && ganadoresData && (
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <div className="space-y-6 lg:col-span-2">
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
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Ganadores en modalidad individual
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Total: {datosTablaIndividual.length}
                    </p>
                  </div>
                  {hayDatosIndividuales ? (
                    <TablaBase<GanadorApi>
                      datos={datosTablaIndividual}
                      columnas={columnasIndividual}
                      conAcciones
                      renderAcciones={(fila) => (
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
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Ganadores en modalidad grupal
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Total de equipos: {datosTablaGrupal.length}
                    </p>
                  </div>
                  {hayDatosGrupales ? (
                    <TablaBase<GanadorApi>
                      datos={datosTablaGrupal}
                      columnas={columnasGrupal}
                      conAcciones
                      renderAcciones={(fila) => (
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
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                      No hay ganadores registrados en modalidad grupal para los
                      filtros actuales.
                    </div>
                  )}
                </section>
              )}
            </div>

            <aside className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Vista previa de certificado
              </h2>
              {ganadorEjemploParaCert ? (
                <div className="max-h-[520px] overflow-auto rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
                  <DisenoCertificado {...ganadorEjemploParaCert} />
                </div>
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  La vista previa se mostrará cuando existan ganadores para el
                  área y nivel seleccionados.
                </p>
              )}

              {ganadoresData && (
                <div className="mt-3 space-y-1 rounded-2xl bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <p className="font-semibold">Resumen de medallas</p>
                  <p>
                    Oro:{" "}
                    <span className="font-semibold">
                      {ganadoresData.totales_por_medalla.oro}
                    </span>
                  </p>
                  <p>
                    Plata:{" "}
                    <span className="font-semibold">
                      {ganadoresData.totales_por_medalla.plata}
                    </span>
                  </p>
                  <p>
                    Bronce:{" "}
                    <span className="font-semibold">
                      {ganadoresData.totales_por_medalla.bronce}
                    </span>
                  </p>
                  <p>
                    Mención:{" "}
                    <span className="font-semibold">
                      {ganadoresData.totales_por_medalla.mencion}
                    </span>
                  </p>
                  <p className="pt-1">
                    Total de ganadores:{" "}
                    <span className="font-semibold">
                      {ganadoresData.total_ganadores}
                    </span>
                  </p>
                </div>
              )}
            </aside>
          </div>
        )}

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

        <ResultModal
          visible={resultVisible}
          type={resultType}
          title={resultTitle}
          message={resultMessage}
          onClose={() => setResultVisible(false)}
          buttonText="Aceptar"
        />

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
                            <td className="px-4 py-2 text-[11px]">
                              {i.ci}
                            </td>
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
