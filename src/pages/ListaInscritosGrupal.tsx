// src/pages/InscritosGrupales.tsx
import { useEffect, useMemo, useState } from "react";
import { Eye, Trash2, FileDown, FileText } from "lucide-react";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";
import { api } from "../api";

export interface IntegranteGrupoDto {
  idOlimpista: number;
  ci: string;
  nombreCompleto: string;
  rol: "LIDER" | "PARTICIPANTE";
}

export interface InscritoGrupalDto {
  idParticipacion: number;
  idGrupo: number;
  nombreGrupo: string;
  unidadEducativa: string | null;
  departamento: string | null;
  area: string;
  nivel: string;
  integrantes: IntegranteGrupoDto[];
}

type InscritoGrupalRow = InscritoGrupalDto & {
  cantidadIntegrantes: number;
};

const REGISTROS_PAGINA = 10;
type ConfirmMode = "bajaGrupo" | "removerIntegrante";

export default function InscritosGrupalesPage() {
  const [grupos, setGrupos] = useState<InscritoGrupalDto[]>([]);
  const [loadingListado, setLoadingListado] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState<string>("TODAS");
  const [filtroNivel, setFiltroNivel] = useState<string>("TODOS");
  const [pagina, setPagina] = useState(1);
  const [, setOrdenColumna] = useState<string | null>(null);
  const [, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  // Modal de integrantes
  const [integrantesVisible, setIntegrantesVisible] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] =
    useState<InscritoGrupalDto | null>(null);

  // Confirmaciones
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>("bajaGrupo");
  const [confirmGrupoId, setConfirmGrupoId] = useState<number | null>(null);
  const [confirmOlimpistaId, setConfirmOlimpistaId] = useState<number | null>(
    null
  );
  const [confirmNombre, setConfirmNombre] = useState<string>("");
  const [processingConfirm, setProcessingConfirm] = useState(false);

  // Modal de resultado
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

  /* ---- Cargar grupos desde el backend ---- */

  const cargarGrupos = async () => {
    setLoadingListado(true);
    try {
      const res = (await api(
        "/inscritos/grupales"
      )) as unknown as { ok: boolean; data: InscritoGrupalDto[] };

      const data = Array.isArray((res as any).data)
        ? (res as any).data
        : (res as any);

      setGrupos(data as InscritoGrupalDto[]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los inscritos grupales.";
      showResult("error", "Error al cargar", msg);
    } finally {
      setLoadingListado(false);
    }
  };

  useEffect(() => {
    void cargarGrupos();
  }, []);

  /* ---- Opciones de filtros (áreas / niveles) ---- */

  const areasDisponibles = useMemo(
    () => Array.from(new Set(grupos.map((g) => g.area))).sort(),
    [grupos]
  );

  const nivelesDisponibles = useMemo(
    () => Array.from(new Set(grupos.map((g) => g.nivel))).sort(),
    [grupos]
  );

  /* ---- Filtros + búsqueda ---- */

  const gruposFiltrados = useMemo(() => {
    let lista = [...grupos];

    if (filtroArea !== "TODAS") {
      lista = lista.filter((g) => g.area === filtroArea);
    }

    if (filtroNivel !== "TODOS") {
      lista = lista.filter((g) => g.nivel === filtroNivel);
    }

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      lista = lista.filter((g) => {
        const nombreGrupo = g.nombreGrupo?.toLowerCase() ?? "";
        const ue = g.unidadEducativa?.toLowerCase() ?? "";
        const dep = g.departamento?.toLowerCase() ?? "";
        const area = g.area?.toLowerCase() ?? "";
        const nivel = g.nivel?.toLowerCase() ?? "";
        const integrantesTexto = g.integrantes
          .map(
            (i) =>
              `${i.ci ?? ""} ${i.nombreCompleto ?? ""}`.toLowerCase().trim()
          )
          .join(" ");
        return (
          nombreGrupo.includes(term) ||
          ue.includes(term) ||
          dep.includes(term) ||
          area.includes(term) ||
          nivel.includes(term) ||
          integrantesTexto.includes(term)
        );
      });
    }

    return lista;
  }, [grupos, filtroArea, filtroNivel, busqueda]);

  /* ---- Paginación ---- */

  const gruposPaginadosConCantidad: InscritoGrupalRow[] = useMemo(() => {
    const inicio = (pagina - 1) * REGISTROS_PAGINA;
    return gruposFiltrados.slice(inicio, inicio + REGISTROS_PAGINA).map(
      (g) =>
        ({
          ...g,
          cantidadIntegrantes: g.integrantes.length,
        } satisfies InscritoGrupalRow)
    );
  }, [gruposFiltrados, pagina]);

  /* ---- Ordenamiento ---- */

  const handleOrdenar = (columna: string, direccion: "asc" | "desc") => {
    setOrdenColumna(columna);
    setOrdenDireccion(direccion);
    setGrupos((prev) => {
      const copia = [...prev];
      copia.sort((a, b) => {
        const valA = (a as any)[columna];
        const valB = (b as any)[columna];

        if (typeof valA === "string" && typeof valB === "string") {
          return direccion === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        if (typeof valA === "number" && typeof valB === "number") {
          return direccion === "asc" ? valA - valB : valB - valA;
        }

        return 0;
      });
      return copia;
    });
  };

  /* ---- Modal de integrantes ---- */

  const abrirModalIntegrantes = (grupo: InscritoGrupalDto) => {
    setGrupoSeleccionado(grupo);
    setIntegrantesVisible(true);
  };

  const cerrarModalIntegrantes = () => {
    setIntegrantesVisible(false);
    setGrupoSeleccionado(null);
  };

  /* ---- Confirmaciones (baja grupo / remover integrante) ---- */

  const abrirConfirmacionBajaGrupo = (grupo: InscritoGrupalDto) => {
    setConfirmMode("bajaGrupo");
    setConfirmGrupoId(grupo.idGrupo);
    setConfirmOlimpistaId(null);
    setConfirmNombre(grupo.nombreGrupo);
    setConfirmVisible(true);
  };

  const abrirConfirmacionRemoverIntegrante = (
    grupoId: number,
    olimpistaId: number,
    nombre: string
  ) => {
    setConfirmMode("removerIntegrante");
    setConfirmGrupoId(grupoId);
    setConfirmOlimpistaId(olimpistaId);
    setConfirmNombre(nombre);
    setConfirmVisible(true);
  };

  const ejecutarAccionConfirmada = async () => {
    if (!confirmGrupoId) return;

    setProcessingConfirm(true);
    try {
      if (confirmMode === "bajaGrupo") {
        const res = (await api(
          `/inscritos/grupales/grupo/${confirmGrupoId}/baja-participacion`,
          { method: "PATCH" }
        )) as { ok: boolean; message?: string; affected?: number };

        showResult(
          "success",
          "Participación grupal actualizada",
          res.message ||
            "La participación grupal del equipo se actualizó correctamente."
        );
      } else if (confirmMode === "removerIntegrante" && confirmOlimpistaId) {
        const res = (await api(
          `/inscritos/grupales/grupo/${confirmGrupoId}/integrante/${confirmOlimpistaId}`,
          { method: "DELETE" }
        )) as { ok: boolean; message?: string };

        showResult(
          "success",
          "Integrante removido",
          res.message || "El integrante fue removido del grupo correctamente."
        );
      }

      await cargarGrupos();
      cerrarModalIntegrantes();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo completar la operación solicitada.";
      showResult("error", "Error en la operación", msg);
    } finally {
      setProcessingConfirm(false);
      setConfirmVisible(false);
      setConfirmGrupoId(null);
      setConfirmOlimpistaId(null);
      setConfirmNombre("");
    }
  };

  /* ---- Definición de columnas (sin N.º, TablaBase ya enumera) ---- */

  const columnas = [
    {
      clave: "nombreGrupo" as const,
      titulo: "Nombre del grupo",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "unidadEducativa" as const,
      titulo: "Unidad educativa",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "departamento" as const,
      titulo: "Departamento",
      alineacion: "centro" as const,
      ordenable: true,
    },
    {
      clave: "area" as const,
      titulo: "Área",
      alineacion: "centro" as const,
      ordenable: true,
    },
    {
      clave: "nivel" as const,
      titulo: "Nivel",
      alineacion: "centro" as const,
      ordenable: true,
    },
    {
      clave: "cantidadIntegrantes" as const,
      titulo: "Integrantes",
      alineacion: "centro" as const,
      ordenable: true,
      formatearCelda: (valor: number) => (
        <span className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
          {valor} integrante{valor === 1 ? "" : "s"}
        </span>
      ),
    },
  ];

  /* ---- Acciones con íconos ---- */

  const renderAcciones = (fila: InscritoGrupalRow) => (
    <div className="flex justify-center gap-2">
      {/* Ver integrantes (modal) */}
      <button
        type="button"
        onClick={() =>
          abrirModalIntegrantes({
            idParticipacion: fila.idParticipacion,
            idGrupo: fila.idGrupo,
            nombreGrupo: fila.nombreGrupo,
            unidadEducativa: fila.unidadEducativa,
            departamento: fila.departamento,
            area: fila.area,
            nivel: fila.nivel,
            integrantes: fila.integrantes,
          })
        }
        className="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-50 p-1.5 text-blue-600 shadow-sm transition hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        aria-label="Ver integrantes del grupo"
      >
        <Eye className="h-4 w-4" />
      </button>

      {/* Baja de participación grupal */}
      <button
        type="button"
        onClick={() =>
          abrirConfirmacionBajaGrupo({
            idParticipacion: fila.idParticipacion,
            idGrupo: fila.idGrupo,
            nombreGrupo: fila.nombreGrupo,
            unidadEducativa: fila.unidadEducativa,
            departamento: fila.departamento,
            area: fila.area,
            nivel: fila.nivel,
            integrantes: fila.integrantes,
          })
        }
        className="inline-flex items-center justify-center rounded-full border border-transparent bg-red-50 p-1.5 text-red-600 shadow-sm transition hover:bg-red-100 hover:text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
        aria-label="Dar de baja la participación grupal"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  /* ---- Exportar (incluyendo integrantes) ---- */

  const exportarCsv = () => {
    if (!gruposFiltrados.length) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay registros para exportar con los filtros actuales."
      );
      return;
    }

    const encabezados = [
      "N.º",
      "Nombre del grupo",
      "Unidad educativa",
      "Departamento",
      "Área",
      "Nivel",
      "C.I. integrante",
      "Nombre integrante",
      "Rol",
    ];

    const filas: (string | number)[][] = [];
    gruposFiltrados.forEach((g, idxGrupo) => {
      if (!g.integrantes.length) {
        filas.push([
          idxGrupo + 1,
          g.nombreGrupo,
          g.unidadEducativa ?? "",
          g.departamento ?? "",
          g.area,
          g.nivel,
          "",
          "",
          "",
        ]);
      } else {
        g.integrantes.forEach((integ) => {
          filas.push([
            idxGrupo + 1,
            g.nombreGrupo,
            g.unidadEducativa ?? "",
            g.departamento ?? "",
            g.area,
            g.nivel,
            integ.ci,
            integ.nombreCompleto,
            integ.rol === "LIDER" ? "Líder" : "Participante",
          ]);
        });
      }
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
    enlace.download = "inscritos_grupales.csv";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  };

  const exportarPdf = () => {
    if (!gruposFiltrados.length) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay registros para exportar con los filtros actuales."
      );
      return;
    }

    const encabezadoHtml = `
      <tr>
        <th style="border:1px solid #ccc;padding:4px;">N.º</th>
        <th style="border:1px solid #ccc;padding:4px;">Nombre del grupo</th>
        <th style="border:1px solid #ccc;padding:4px;">Unidad educativa</th>
        <th style="border:1px solid #ccc;padding:4px;">Departamento</th>
        <th style="border:1px solid #ccc;padding:4px;">Área</th>
        <th style="border:1px solid #ccc;padding:4px;">Nivel</th>
        <th style="border:1px solid #ccc;padding:4px;">C.I. integrante</th>
        <th style="border:1px solid #ccc;padding:4px;">Nombre integrante</th>
        <th style="border:1px solid #ccc;padding:4px;">Rol</th>
      </tr>
    `;

    const filasHtml = gruposFiltrados
      .map((g, idxGrupo) => {
        if (!g.integrantes.length) {
          return `
            <tr>
              <td style="border:1px solid #ccc;padding:4px;text-align:center;">${
                idxGrupo + 1
              }</td>
              <td style="border:1px solid #ccc;padding:4px;">${
                g.nombreGrupo
              }</td>
              <td style="border:1px solid #ccc;padding:4px;">${
                g.unidadEducativa ?? ""
              }</td>
              <td style="border:1px solid #ccc;padding:4px;">${
                g.departamento ?? ""
              }</td>
              <td style="border:1px solid #ccc;padding:4px;">${g.area}</td>
              <td style="border:1px solid #ccc;padding:4px;">${g.nivel}</td>
              <td style="border:1px solid #ccc;padding:4px;"></td>
              <td style="border:1px solid #ccc;padding:4px;"></td>
              <td style="border:1px solid #ccc;padding:4px;"></td>
            </tr>
          `;
        }

        return g.integrantes
          .map(
            (integ) => `
          <tr>
            <td style="border:1px solid #ccc;padding:4px;text-align:center;">${
              idxGrupo + 1
            }</td>
            <td style="border:1px solid #ccc;padding:4px;">${
              g.nombreGrupo
            }</td>
            <td style="border:1px solid #ccc;padding:4px;">${
              g.unidadEducativa ?? ""
            }</td>
            <td style="border:1px solid #ccc;padding:4px;">${
              g.departamento ?? ""
            }</td>
            <td style="border:1px solid #ccc;padding:4px;">${g.area}</td>
            <td style="border:1px solid #ccc;padding:4px;">${g.nivel}</td>
            <td style="border:1px solid #ccc;padding:4px;">${integ.ci}</td>
            <td style="border:1px solid #ccc;padding:4px;">${
              integ.nombreCompleto
            }</td>
            <td style="border:1px solid #ccc;padding:4px;">${
              integ.rol === "LIDER" ? "Líder" : "Participante"
            }</td>
          </tr>
        `
          )
          .join("");
      })
      .join("");

    const ventana = window.open("", "_blank");
    if (!ventana) return;

    ventana.document.write(`
      <html>
        <head>
          <title>Inscritos grupales</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; }
            h1 { font-size: 18px; margin-bottom: 12px; }
            table { border-collapse: collapse; width: 100%; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Listado de inscritos grupales</h1>
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

  /* ---- Render ---- */

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Inscritos grupales
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Listado de equipos inscritos en modalidad grupal.
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
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Área
                    </label>
                    <select
                      value={filtroArea}
                      onChange={(e) => {
                        setFiltroArea(e.target.value);
                        setPagina(1);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="TODAS">Todas las áreas</option>
                      {areasDisponibles.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Nivel
                    </label>
                    <select
                      value={filtroNivel}
                      onChange={(e) => {
                        setFiltroNivel(e.target.value);
                        setPagina(1);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="TODOS">Todos los niveles</option>
                      {nivelesDisponibles.map((n) => (
                        <option key={n} value={n}>
                          {n}
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
                Cargando inscritos...
              </p>
            )}
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <TablaBase
              datos={gruposPaginadosConCantidad}
              columnas={columnas}
              conOrdenamiento
              onOrdenar={handleOrdenar}
              conAcciones
              renderAcciones={renderAcciones}
            />
          </div>

          {/* Paginación */}
          <div className="flex justify-end">
            <Paginacion
              paginaActual={pagina}
              totalPaginas={Math.max(
                1,
                Math.ceil(gruposFiltrados.length / REGISTROS_PAGINA)
              )}
              totalRegistros={gruposFiltrados.length}
              registrosPorPagina={REGISTROS_PAGINA}
              onPaginaChange={setPagina}
            />
          </div>
        </div>
      </div>

      {/* Modal integrantes */}
      {integrantesVisible && grupoSeleccionado && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-5 shadow-xl ring-1 ring-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:ring-gray-800 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Integrantes del grupo
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Grupo:{" "}
                  <span className="font-semibold">
                    {grupoSeleccionado.nombreGrupo}
                  </span>
                  {grupoSeleccionado.unidadEducativa && (
                    <>
                      {" "}
                      · Unidad educativa:{" "}
                      <span className="font-semibold">
                        {grupoSeleccionado.unidadEducativa}
                      </span>
                    </>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                  Área: {grupoSeleccionado.area} · Nivel:{" "}
                  {grupoSeleccionado.nivel}
                </p>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-950/40">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-center">N.º</th>
                    <th className="px-3 py-2 text-center">C.I.</th>
                    <th className="px-3 py-2">Nombre completo</th>
                    <th className="px-3 py-2 text-center">Rol</th>
                    <th className="px-3 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {grupoSeleccionado.integrantes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400"
                      >
                        No se registran integrantes activos en este grupo.
                      </td>
                    </tr>
                  ) : (
                    grupoSeleccionado.integrantes.map((integ, idx) => (
                      <tr
                        key={`${integ.idOlimpista}-${idx}`}
                        className="border-t border-gray-200 bg-white text-gray-800 last:border-b dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                      >
                        <td className="px-3 py-2 text-center align-middle">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 text-center align-middle">
                          {integ.ci}
                        </td>
                        <td className="px-3 py-2 align-middle">
                          {integ.nombreCompleto}
                        </td>
                        <td className="px-3 py-2 text-center align-middle">
                          <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                            {integ.rol === "LIDER" ? "Líder" : "Participante"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center align-middle">
                          <button
                            type="button"
                            onClick={() =>
                              abrirConfirmacionRemoverIntegrante(
                                grupoSeleccionado.idGrupo,
                                integ.idOlimpista,
                                integ.nombreCompleto
                              )
                            }
                            className="inline-flex items-center justify-center rounded-full border border-transparent bg-red-50 p-1.5 text-red-600 shadow-sm transition hover:bg-red-100 hover:text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            aria-label="Remover integrante del grupo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={cerrarModalIntegrantes}
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900 sm:w-auto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar acción */}
      <ConfirmModal
        visible={confirmVisible}
        title={
          confirmMode === "bajaGrupo"
            ? "Dar de baja participación grupal"
            : "Remover integrante del grupo"
        }
        message={
          confirmMode === "bajaGrupo"
            ? `Se dará de baja la participación grupal del equipo "${confirmNombre}" en las categorías activas. ¿Deseas continuar?`
            : `Se removerá al integrante "${confirmNombre}" del grupo. Esta acción no se puede deshacer. ¿Deseas continuar?`
        }
        onCancel={() => {
          if (!processingConfirm) {
            setConfirmVisible(false);
            setConfirmGrupoId(null);
            setConfirmOlimpistaId(null);
            setConfirmNombre("");
          }
        }}
        onConfirm={ejecutarAccionConfirmada}
        confirmText="Confirmar"
        cancelText="Cancelar"
        danger={confirmMode === "removerIntegrante"}
        loading={processingConfirm}
      />

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
