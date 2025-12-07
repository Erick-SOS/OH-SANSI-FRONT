// src/pages/GestionDeEvaluadores.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FileDown, FileText, ShieldCheck, ShieldOff, Eye } from "lucide-react";

import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";

import { api } from "../api";
import { getToken } from "../components/auth/authStorage";

type Modalidad = "INDIVIDUAL" | "GRUPAL";

interface CategoriaAsignada {
  area: string;
  nivel: string;
  modalidad: Modalidad;
}

interface EvaluadorItem {
  idUsuario: number;
  documento: string;
  nombreCompleto: string;
  profesion: string | null;
  institucion: string | null;
  estado: boolean;
  categoriasAsignadas: CategoriaAsignada[];
}

const REGISTROS_POR_PAGINA = 10;

const GestionDeEvaluadores: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const [evaluadores, setEvaluadores] = useState<EvaluadorItem[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  // Filtro por estado: TODOS | ACTIVOS | INACTIVOS
  const [filtroEstado, setFiltroEstado] = useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");

  // target para habilitar/inhabilitar
  const [estadoTarget, setEstadoTarget] = useState<{
    evaluador: EvaluadorItem;
    nuevoEstado: boolean;
  } | null>(null);
  const [loadingEstado, setLoadingEstado] = useState(false);

  // Modal para ver categorías asignadas
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [catModalEvaluador, setCatModalEvaluador] =
    useState<EvaluadorItem | null>(null);

  // Result modal
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

  const labelEstado = (estado: boolean) => (estado ? "Activo" : "Inactivo");

  const labelModalidad = (m: Modalidad) =>
    m === "INDIVIDUAL" ? "Individual" : "Grupal";

  // =========================
  // Carga inicial
  // =========================
  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (!t) {
        showResult(
          "error",
          "Sesión no encontrada",
          "No se encontró un token de autenticación. Inicia sesión nuevamente."
        );
        return;
      }
      setToken(t);
      await cargarEvaluadores(t);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarEvaluadores = async (tok: string) => {
    setCargando(true);
    try {
      const resp = await api("/evaluadores", { token: tok });
      const items: EvaluadorItem[] = (resp.evaluadores ?? []).map(
        (ev: any) => ({
          idUsuario: ev.idUsuario,
          documento: ev.documento,
          nombreCompleto: ev.nombreCompleto,
          profesion: ev.profesion ?? null,
          institucion: ev.institucion ?? null,
          estado: !!ev.estado,
          categoriasAsignadas: (ev.categoriasAsignadas ?? []).map(
            (c: any) => ({
              area: c.area,
              nivel: c.nivel,
              modalidad: c.modalidad as Modalidad,
            })
          ),
        })
      );
      setEvaluadores(items);
      setPaginaActual(1);
    } catch (error: any) {
      console.error("Error al cargar evaluadores", error);
      showResult(
        "error",
        "Error al cargar evaluadores",
        error?.message || "No se pudieron obtener los evaluadores."
      );
    } finally {
      setCargando(false);
    }
  };

  // =========================
  // Filtros / búsqueda / paginación
  // =========================

  const evaluadoresFiltrados = useMemo(() => {
    let lista = [...evaluadores];

    // Filtro por estado
    if (filtroEstado === "ACTIVOS") {
      lista = lista.filter((e) => e.estado);
    } else if (filtroEstado === "INACTIVOS") {
      lista = lista.filter((e) => !e.estado);
    }

    // Búsqueda libre
    if (terminoBusqueda.trim()) {
      const t = terminoBusqueda.toLowerCase();
      lista = lista.filter((e) => {
        const doc = e.documento.toLowerCase();
        const nom = e.nombreCompleto.toLowerCase();
        const prof = e.profesion?.toLowerCase() ?? "";
        const inst = e.institucion?.toLowerCase() ?? "";
        const cats = e.categoriasAsignadas
          .map(
            (c) =>
              `${c.area} ${c.nivel} ${labelModalidad(c.modalidad)}`.toLowerCase()
          )
          .join(" ");
        return (
          doc.includes(t) ||
          nom.includes(t) ||
          prof.includes(t) ||
          inst.includes(t) ||
          cats.includes(t)
        );
      });
    }

    return lista;
  }, [evaluadores, filtroEstado, terminoBusqueda]);

  const evaluadoresPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    return evaluadoresFiltrados.slice(inicio, inicio + REGISTROS_POR_PAGINA);
  }, [evaluadoresFiltrados, paginaActual]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(evaluadoresFiltrados.length / REGISTROS_POR_PAGINA)
  );

  // =========================
  // Ordenamiento desde TablaBase
  // =========================

  const handleOrdenar = (columna: string, direccion: "asc" | "desc") => {
    setEvaluadores((prev) => {
      const copia = [...prev];
      copia.sort((a, b) => {
        const valA: any = (a as any)[columna];
        const valB: any = (b as any)[columna];

        if (typeof valA === "string" && typeof valB === "string") {
          return direccion === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        if (typeof valA === "boolean" && typeof valB === "boolean") {
          const numA = valA ? 1 : 0;
          const numB = valB ? 1 : 0;
          return direccion === "asc" ? numA - numB : numB - numA;
        }

        return 0;
      });
      return copia;
    });
    setPaginaActual(1);
  };

  // =========================
  // Cambiar estado (habilitar / inhabilitar)
  // =========================

  const iniciarCambioEstado = (evaluador: EvaluadorItem) => {
    setEstadoTarget({
      evaluador,
      nuevoEstado: !evaluador.estado,
    });
  };

  const confirmarCambioEstado = async () => {
    if (!estadoTarget || !token) return;

    try {
      setLoadingEstado(true);
      const { evaluador, nuevoEstado } = estadoTarget;

      await api(`/evaluadores/${evaluador.idUsuario}/estado`, {
        method: "PATCH",
        token,
        body: {
          estado: nuevoEstado,
        },
      });

      showResult(
        "success",
        "Estado actualizado",
        `Se ha ${
          nuevoEstado ? "habilitado" : "inhabilitado"
        } al evaluador ${evaluador.nombreCompleto}.`
      );

      await cargarEvaluadores(token);
    } catch (error: any) {
      console.error("Error al cambiar estado del evaluador", error);
      showResult(
        "error",
        "Error al actualizar estado",
        error?.message || "No se pudo actualizar el estado del evaluador."
      );
    } finally {
      setLoadingEstado(false);
      setEstadoTarget(null);
    }
  };

  // =========================
  // Modal categorías asignadas
  // =========================

  const abrirModalCategorias = (evaluador: EvaluadorItem) => {
    setCatModalEvaluador(evaluador);
    setCatModalVisible(true);
  };

  const cerrarModalCategorias = () => {
    setCatModalVisible(false);
    setCatModalEvaluador(null);
  };

  // =========================
  // Exportar Excel (CSV) / PDF
  // =========================

  const exportarCsv = () => {
    if (!evaluadoresFiltrados.length) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay evaluadores para exportar con los filtros actuales."
      );
      return;
    }

    const encabezados = [
      "N.º",
      "Documento",
      "Nombre completo",
      "Profesión",
      "Institución",
      "Estado",
      "Categorías asignadas",
    ];

    const filas = evaluadoresFiltrados.map((e, idx) => {
      const categoriasStr = e.categoriasAsignadas
        .map(
          (c) =>
            `${c.area} - ${c.nivel} (${labelModalidad(c.modalidad)})`
        )
        .join(" / ");

      return [
        idx + 1,
        e.documento,
        e.nombreCompleto,
        e.profesion || "",
        e.institucion || "",
        labelEstado(e.estado),
        categoriasStr,
      ];
    });

    const csvContenido = [
      encabezados.join(";"),
      ...filas.map((f) =>
        f
          .map((valor) => {
            const str = String(valor ?? "").replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob([csvContenido], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "evaluadores_olimpiada.csv";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  };

  const exportarPdf = () => {
    if (!evaluadoresFiltrados.length) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay evaluadores para exportar con los filtros actuales."
      );
      return;
    }

    const encabezadoHtml = `
      <tr>
        <th style="border:1px solid #000;padding:4px;">N.º</th>
        <th style="border:1px solid #000;padding:4px;">Documento</th>
        <th style="border:1px solid #000;padding:4px;">Nombre completo</th>
        <th style="border:1px solid #000;padding:4px;">Profesión</th>
        <th style="border:1px solid #000;padding:4px;">Institución</th>
        <th style="border:1px solid #000;padding:4px;">Estado</th>
        <th style="border:1px solid #000;padding:4px;">Categorías asignadas</th>
      </tr>
    `;

    const filasHtml = evaluadoresFiltrados
      .map((e, idx) => {
        const categoriasStr = e.categoriasAsignadas
          .map(
            (c) =>
              `${c.area} - ${c.nivel} (${labelModalidad(c.modalidad)})`
          )
          .join(" / ");

        return `
          <tr>
            <td style="border:1px solid #000;padding:4px;text-align:center;">${
              idx + 1
            }</td>
            <td style="border:1px solid #000;padding:4px;">${e.documento}</td>
            <td style="border:1px solid #000;padding:4px;">${
              e.nombreCompleto
            }</td>
            <td style="border:1px solid #000;padding:4px;">${
              e.profesion || ""
            }</td>
            <td style="border:1px solid #000;padding:4px;">${
              e.institucion || ""
            }</td>
            <td style="border:1px solid #000;padding:4px;text-align:center;">${labelEstado(
              e.estado
            )}</td>
            <td style="border:1px solid #000;padding:4px;">${categoriasStr}</td>
          </tr>
        `;
      })
      .join("");

    const ventana = window.open("", "_blank");
    if (!ventana) return;

    ventana.document.write(`
      <html>
        <head>
          <title>Listado de evaluadores</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              font-size: 12px;
              color: #000;
              background: #fff;
            }
            h1 {
              font-size: 18px;
              margin-bottom: 12px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th {
              background: #f3f3f3;
            }
          </style>
        </head>
        <body>
          <h1>Evaluadores de la Olimpiada</h1>
          <table>
            <thead>${encabezadoHtml}</thead>
            <tbody>${filasHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  };

  // =========================
  // Columnas tabla
  // =========================

  const columnas = [
    {
      clave: "documento" as const,
      titulo: "Documento",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "nombreCompleto" as const,
      titulo: "Nombre completo",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "profesion" as const,
      titulo: "Profesión",
      alineacion: "izquierda" as const,
      ordenable: true,
      formatearCelda: (valor: string | null) => valor || "—",
    },
    {
      clave: "institucion" as const,
      titulo: "Institución",
      alineacion: "izquierda" as const,
      ordenable: true,
      formatearCelda: (valor: string | null) => valor || "—",
    },
    {
      clave: "estado" as const,
      titulo: "Estado",
      alineacion: "centro" as const,
      ordenable: true,
      formatearCelda: (valor: boolean) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            valor
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {labelEstado(valor)}
        </span>
      ),
    },
    // columna de categorías eliminada de la tabla principal;
    // ahora se visualiza solo mediante el icono de ojo (modal)
  ];

  // =========================
  // Render
  // =========================

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Gestión de evaluadores
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Consulta los evaluadores registrados en el sistema, su estado y
              las categorías que tienen asignadas.
            </p>
          </div>
          {cargando && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Cargando datos…
            </span>
          )}
        </div>

        {/* Búsqueda + filtro estado + exportaciones */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {/* Búsqueda + filtro estado */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="w-full max-w-md">
                <BarraBusquedaAreas
                  terminoBusqueda={terminoBusqueda}
                  onBuscarChange={(t: string) => {
                    setTerminoBusqueda(t);
                    setPaginaActual(1);
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    const val = e.target.value as
                      | "TODOS"
                      | "ACTIVOS"
                      | "INACTIVOS";
                    setFiltroEstado(val);
                    setPaginaActual(1);
                  }}
                  className="w-full min-w-[150px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="TODOS">Todos</option>
                  <option value="ACTIVOS">Solo activos</option>
                  <option value="INACTIVOS">Solo inactivos</option>
                </select>
              </div>
            </div>

            {/* Exportar */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <button
                type="button"
                onClick={exportarCsv}
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus-visible:ring-offset-gray-950"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Descargar Excel (CSV)
              </button>
              <button
                type="button"
                onClick={exportarPdf}
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-950"
              >
                <FileText className="mr-2 h-4 w-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <TablaBase
            datos={evaluadoresPaginados}
            columnas={columnas}
            conOrdenamiento
            onOrdenar={handleOrdenar}
            conAcciones
            renderAcciones={(fila: EvaluadorItem) => {
              const esActivo = fila.estado;
              const IconoEstado = esActivo ? ShieldOff : ShieldCheck;
              const labelBoton = esActivo ? "Inhabilitar" : "Habilitar";

              const isLoading =
                !!estadoTarget &&
                loadingEstado &&
                estadoTarget.evaluador.idUsuario === fila.idUsuario;

              return (
                <div className="flex items-center justify-center gap-2">
                  {/* Ver categorías (solo icono de ojo) */}
                  <button
                    type="button"
                    onClick={() => abrirModalCategorias(fila)}
                    className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2 text-xs text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label="Ver categorías asignadas"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {/* Cambiar estado */}
                  <button
                    type="button"
                    onClick={() => iniciarCambioEstado(fila)}
                    disabled={loadingEstado}
                    className={`inline-flex items-center justify-center rounded-full px-2.5 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950 ${
                      esActivo
                        ? "bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-500 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                    } ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <IconoEstado className="mr-1.5 h-4 w-4" />
                    {isLoading ? "Aplicando…" : labelBoton}
                  </button>
                </div>
              );
            }}
          />
        </div>

        {/* Paginación */}
        <div className="flex justify-end">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalRegistros={evaluadoresFiltrados.length}
            registrosPorPagina={REGISTROS_POR_PAGINA}
            onPaginaChange={setPaginaActual}
          />
        </div>
      </div>

      {/* Modal cambiar estado */}
      <ConfirmModal
        visible={!!estadoTarget}
        title={
          estadoTarget?.nuevoEstado
            ? "Habilitar evaluador"
            : "Inhabilitar evaluador"
        }
        message={
          estadoTarget
            ? `¿Deseas ${
                estadoTarget.nuevoEstado ? "habilitar" : "inhabilitar"
              } al evaluador "${estadoTarget.evaluador.nombreCompleto}"?`
            : ""
        }
        onCancel={() => {
          if (!loadingEstado) setEstadoTarget(null);
        }}
        onConfirm={confirmarCambioEstado}
        confirmText={
          estadoTarget?.nuevoEstado
            ? "Habilitar evaluador"
            : "Inhabilitar evaluador"
        }
        cancelText="Cancelar"
        danger={estadoTarget ? !estadoTarget.nuevoEstado : false}
        loading={loadingEstado}
      />

      {/* Modal categorías asignadas (solo ojo) */}
      {catModalVisible && catModalEvaluador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Categorías asignadas
                </h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Evaluador:{" "}
                  <span className="font-medium">
                    {catModalEvaluador.nombreCompleto}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModalCategorias}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <span className="sr-only">Cerrar</span>✕
              </button>
            </div>

            {catModalEvaluador.categoriasAsignadas.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Este evaluador no tiene categorías asignadas.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/60">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        Área
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        Nivel
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        Modalidad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-sm dark:divide-gray-800 dark:bg-gray-900">
                    {catModalEvaluador.categoriasAsignadas.map((c, idx) => (
                      <tr key={`${c.area}-${c.nivel}-${c.modalidad}-${idx}`}>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {c.area}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {c.nivel}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {labelModalidad(c.modalidad)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={cerrarModalCategorias}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-950"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal resultado */}
      <ResultModal
        visible={resultModal.visible}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={closeResultModal}
      />
    </div>
  );
};

export default GestionDeEvaluadores;
