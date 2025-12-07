// src/pages/Historial.tsx
import { useEffect, useMemo, useState } from "react";
import { FileDown, FileText } from "lucide-react";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ResultModal from "../components/modals/ResultModal";
import { api } from "../api";

/* ------------ Tipos ------------ */

export interface HistorialDto {
  rolUsuario: string;
  nombreUsuario: string;
  fechayhora: string; // viene como ISO string del backend
  tipodeCambio: string;
  accion: string;
}

const REGISTROS_PAGINA = 10;

/* ------------ Página Historial ------------ */

export default function HistorialPage() {
  const [historial, setHistorial] = useState<HistorialDto[]>([]);
  const [loadingListado, setLoadingListado] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<string>("TODOS");
  const [filtroTipoCambio, setFiltroTipoCambio] = useState<string>("TODOS");
  const [pagina, setPagina] = useState(1);
  const [, setOrdenColumna] = useState<string | null>(null);
  const [, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  // Modal de resultado (success / error)
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
    setResultModal({ visible: true, type, title, message });
  };

  const closeResult = () =>
    setResultModal((prev) => ({ ...prev, visible: false }));

  /* ---- Cargar historial desde el backend ---- */

  const cargarHistorial = async () => {
    setLoadingListado(true);
    try {
      const res = (await api(
        "/historial"
      )) as unknown as { ok: boolean; historial: HistorialDto[] };

      const data = Array.isArray((res as any).historial)
        ? (res as any).historial
        : (res as any);

      setHistorial(data as HistorialDto[]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo cargar el historial.";
      showResult("error", "Error al cargar", msg);
    } finally {
      setLoadingListado(false);
    }
  };

  useEffect(() => {
    void cargarHistorial();
  }, []);

  /* ---- Opciones de filtros (rol / tipo de cambio) ---- */

  const rolesDisponibles = useMemo(
    () =>
      Array.from(new Set(historial.map((h) => h.rolUsuario))).filter(Boolean),
    [historial]
  );

  const tiposCambioDisponibles = useMemo(
    () =>
      Array.from(new Set(historial.map((h) => h.tipodeCambio))).filter(Boolean),
    [historial]
  );

  /* ---- Filtros + búsqueda ---- */

  const historialFiltrado = useMemo(() => {
    let lista = [...historial];

    if (filtroRol !== "TODOS") {
      lista = lista.filter((h) => h.rolUsuario === filtroRol);
    }

    if (filtroTipoCambio !== "TODOS") {
      lista = lista.filter((h) => h.tipodeCambio === filtroTipoCambio);
    }

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      lista = lista.filter((h) => {
        const usuario = h.nombreUsuario?.toLowerCase() ?? "";
        const rol = h.rolUsuario?.toLowerCase() ?? "";
        const tipo = h.tipodeCambio?.toLowerCase() ?? "";
        const accion = h.accion?.toLowerCase() ?? "";
        const fecha = h.fechayhora?.toLowerCase() ?? "";
        return (
          usuario.includes(term) ||
          rol.includes(term) ||
          tipo.includes(term) ||
          accion.includes(term) ||
          fecha.includes(term)
        );
      });
    }

    return lista;
  }, [historial, filtroRol, filtroTipoCambio, busqueda]);

  /* ---- Paginación ---- */

  const historialPaginado: HistorialDto[] = useMemo(() => {
    const inicio = (pagina - 1) * REGISTROS_PAGINA;
    return historialFiltrado.slice(inicio, inicio + REGISTROS_PAGINA);
  }, [historialFiltrado, pagina]);

  /* ---- Ordenamiento ---- */

  const handleOrdenar = (columna: string, direccion: "asc" | "desc") => {
    setOrdenColumna(columna);
    setOrdenDireccion(direccion);
    setHistorial((prev) => {
      const copia = [...prev];
      copia.sort((a, b) => {
        const valA = (a as any)[columna];
        const valB = (b as any)[columna];

        // fecha
        if (columna === "fechayhora") {
          const dA = new Date(valA).getTime();
          const dB = new Date(valB).getTime();
          return direccion === "asc" ? dA - dB : dB - dA;
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return direccion === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return 0;
      });
      return copia;
    });
  };

  /* ---- Util: formatear fecha/hora ---- */

  const formatearFecha = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-BO", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  };

  /* ---- Definición de columnas ---- */

  const columnas = [
    {
      clave: "fechayhora" as const,
      titulo: "Fecha y hora",
      alineacion: "centro" as const,
      ordenable: true,
      formatearCelda: (valor: string) => (
        <span className="whitespace-nowrap text-xs sm:text-sm">
          {formatearFecha(valor)}
        </span>
      ),
    },
    {
      clave: "nombreUsuario" as const,
      titulo: "Usuario",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "rolUsuario" as const,
      titulo: "Rol",
      alineacion: "centro" as const,
      ordenable: true,
      formatearCelda: (valor: string) => (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {valor}
        </span>
      ),
    },
    {
      clave: "tipodeCambio" as const,
      titulo: "Tipo de cambio",
      alineacion: "centro" as const,
      ordenable: true,
    },
    {
      clave: "accion" as const,
      titulo: "Acción",
      alineacion: "izquierda" as const,
      ordenable: false,
    },
  ];

  /* ---- Exportar Excel (CSV) ---- */

  const exportarCsv = () => {
    if (!historialFiltrado.length) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay registros para exportar con los filtros actuales."
      );
      return;
    }

    const encabezados = [
      "N.º",
      "Fecha y hora",
      "Usuario",
      "Rol",
      "Tipo de cambio",
      "Acción",
    ];

    const filas = historialFiltrado.map((h, idx) => [
      idx + 1,
      formatearFecha(h.fechayhora),
      h.nombreUsuario,
      h.rolUsuario,
      h.tipodeCambio,
      h.accion,
    ]);

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
    enlace.download = "historial_cambios.csv";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  };

  /* ---- Exportar PDF (blanco y negro) ---- */

  const exportarPdf = () => {
    if (!historialFiltrado.length) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay registros para exportar con los filtros actuales."
      );
      return;
    }

    const encabezadoHtml = `
      <tr>
        <th style="border:1px solid #000;padding:4px;">N.º</th>
        <th style="border:1px solid #000;padding:4px;">Fecha y hora</th>
        <th style="border:1px solid #000;padding:4px;">Usuario</th>
        <th style="border:1px solid #000;padding:4px;">Rol</th>
        <th style="border:1px solid #000;padding:4px;">Tipo de cambio</th>
        <th style="border:1px solid #000;padding:4px;">Acción</th>
      </tr>
    `;

    const filasHtml = historialFiltrado
      .map(
        (h, idx) => `
      <tr>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${
          idx + 1
        }</td>
        <td style="border:1px solid #000;padding:4px;">${formatearFecha(
          h.fechayhora
        )}</td>
        <td style="border:1px solid #000;padding:4px;">${
          h.nombreUsuario
        }</td>
        <td style="border:1px solid #000;padding:4px;">${h.rolUsuario}</td>
        <td style="border:1px solid #000;padding:4px;">${h.tipodeCambio}</td>
        <td style="border:1px solid #000;padding:4px;">${h.accion}</td>
      </tr>
    `
      )
      .join("");

    const ventana = window.open("", "_blank");
    if (!ventana) return;

    ventana.document.write(`
      <html>
        <head>
          <title>Historial de cambios</title>
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
          <h1>Historial de cambios</h1>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Historial de cambios
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Registros de ediciones, creaciones y ajustes realizados en el
              sistema.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Filtros + exportación */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="w-full max-w-xs">
                  <BarraBusquedaAreas
                    terminoBusqueda={busqueda}
                    onBuscarChange={(t: string) => {
                      setBusqueda(t);
                      setPagina(1);
                    }}
                  />
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  {/* Filtro rol */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Rol
                    </label>
                    <select
                      value={filtroRol}
                      onChange={(e) => {
                        setFiltroRol(e.target.value);
                        setPagina(1);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="TODOS">Todos los roles</option>
                      {rolesDisponibles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro tipo de cambio */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Tipo de cambio
                    </label>
                    <select
                      value={filtroTipoCambio}
                      onChange={(e) => {
                        setFiltroTipoCambio(e.target.value);
                        setPagina(1);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="TODOS">Todos</option>
                      {tiposCambioDisponibles.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

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
            {loadingListado && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Cargando historial...
              </p>
            )}
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <TablaBase
              datos={historialPaginado}
              columnas={columnas}
              conOrdenamiento
              onOrdenar={handleOrdenar}
              conAcciones={false}
            />
          </div>

          {/* Paginación */}
          <div className="flex justify-end">
            <Paginacion
              paginaActual={pagina}
              totalPaginas={Math.max(
                1,
                Math.ceil(historialFiltrado.length / REGISTROS_PAGINA)
              )}
              totalRegistros={historialFiltrado.length}
              registrosPorPagina={REGISTROS_PAGINA}
              onPaginaChange={setPagina}
            />
          </div>
        </div>
      </div>

      {/* Modal de resultado */}
      <ResultModal
        visible={resultModal.visible}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={closeResult}
      />
    </div>
  );
}
