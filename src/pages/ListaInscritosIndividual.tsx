// src/pages/InscritosIndividuales.tsx
import { useEffect, useMemo, useState } from "react";
import { Edit3, Trash2, FileDown, FileText } from "lucide-react";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";
import { api } from "../api";

export interface InscritoIndividualDto {
  idParticipacion: number;
  idOlimpista: number;
  ci: string;
  nombreCompleto: string;
  unidadEducativa: string;
  modalidad: "INDIVIDUAL" | "GRUPAL";
  departamento: string;
  area: string;
  nivel: string;
  tutorLegal: string | null;
}

const REGISTROS_PAGINA = 10;
type ConfirmMode = "participacion" | "olimpista";

export default function InscritosIndividualesPage() {
  const [inscritos, setInscritos] = useState<InscritoIndividualDto[]>([]);
  const [loadingListado, setLoadingListado] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState<string>("TODAS");
  const [filtroNivel, setFiltroNivel] = useState<string>("TODOS");
  const [pagina, setPagina] = useState(1);
  const [, setOrdenColumna] = useState<string | null>(null);
  const [, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>("participacion");
  const [confirmOlimpistaId, setConfirmOlimpistaId] = useState<number | null>(
    null
  );
  const [confirmNombre, setConfirmNombre] = useState<string>("");
  const [processingConfirm, setProcessingConfirm] = useState(false);

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

  /* ---- Cargar inscritos desde el backend ---- */

  const cargarInscritos = async () => {
    setLoadingListado(true);
    try {
      const res = (await api(
        "/inscritos/individuales"
      )) as unknown as { ok: boolean; data: InscritoIndividualDto[] };

      const data = Array.isArray((res as any).data)
        ? (res as any).data
        : (res as any);

      setInscritos(data as InscritoIndividualDto[]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los inscritos individuales.";
      showResult("error", "Error al cargar", msg);
    } finally {
      setLoadingListado(false);
    }
  };

  useEffect(() => {
    void cargarInscritos();
  }, []);

  /* ---- Opciones de filtros (áreas / niveles) ---- */

  const areasDisponibles = useMemo(
    () => Array.from(new Set(inscritos.map((i) => i.area))).sort(),
    [inscritos]
  );

  const nivelesDisponibles = useMemo(
    () => Array.from(new Set(inscritos.map((i) => i.nivel))).sort(),
    [inscritos]
  );

  /* ---- Filtros + búsqueda ---- */

  const inscritosFiltrados = useMemo(() => {
    let lista = [...inscritos];

    if (filtroArea !== "TODAS") {
      lista = lista.filter((i) => i.area === filtroArea);
    }

    if (filtroNivel !== "TODOS") {
      lista = lista.filter((i) => i.nivel === filtroNivel);
    }

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      lista = lista.filter((i) => {
        const ci = i.ci?.toLowerCase() ?? "";
        const nombre = i.nombreCompleto?.toLowerCase() ?? "";
        const ue = i.unidadEducativa?.toLowerCase() ?? "";
        const dep = i.departamento?.toLowerCase() ?? "";
        const area = i.area?.toLowerCase() ?? "";
        const nivel = i.nivel?.toLowerCase() ?? "";
        const tutor = i.tutorLegal?.toLowerCase() ?? "";
        return (
          ci.includes(term) ||
          nombre.includes(term) ||
          ue.includes(term) ||
          dep.includes(term) ||
          area.includes(term) ||
          nivel.includes(term) ||
          tutor.includes(term)
        );
      });
    }

    return lista;
  }, [inscritos, filtroArea, filtroNivel, busqueda]);

  /* ---- Paginación ---- */

  const inscritosPaginados: InscritoIndividualDto[] = useMemo(() => {
    const inicio = (pagina - 1) * REGISTROS_PAGINA;
    return inscritosFiltrados.slice(inicio, inicio + REGISTROS_PAGINA);
  }, [inscritosFiltrados, pagina]);

  /* ---- Ordenamiento ---- */

  const handleOrdenar = (columna: string, direccion: "asc" | "desc") => {
    setOrdenColumna(columna);
    setOrdenDireccion(direccion);
    setInscritos((prev) => {
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

  /* ---- Confirmaciones (baja participación / baja olímpista) ---- */

  const abrirConfirmacion = (
    mode: ConfirmMode,
    olimpistaId: number,
    nombre: string
  ) => {
    setConfirmMode(mode);
    setConfirmOlimpistaId(olimpistaId);
    setConfirmNombre(nombre);
    setConfirmVisible(true);
  };

  const ejecutarAccionConfirmada = async () => {
    if (!confirmOlimpistaId) return;

    setProcessingConfirm(true);
    try {
      if (confirmMode === "participacion") {
        const res = (await api(
          `/inscritos/individuales/participacion/${confirmOlimpistaId}/baja`,
          { method: "PATCH" }
        )) as { ok: boolean; message?: string; affected?: number };

        showResult(
          "success",
          "Participación actualizada",
          res.message ||
            "La participación individual del olímpista se actualizó correctamente."
        );
      } else {
        const res = (await api(
          `/inscritos/individuales/olimpista/${confirmOlimpistaId}/baja`,
          { method: "PATCH" }
        )) as {
          ok: boolean;
          message?: string;
          data?: { nombreCompleto?: string };
        };

        showResult(
          "success",
          "Olimpista dado de baja",
          res.message ||
            "El olímpista ha sido dado de baja correctamente en el sistema."
        );
      }

      await cargarInscritos();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo completar la operación solicitada.";
      showResult("error", "Error en la operación", msg);
    } finally {
      setProcessingConfirm(false);
      setConfirmVisible(false);
      setConfirmOlimpistaId(null);
      setConfirmNombre("");
    }
  };

  /* ---- Definición de columnas (sin N.º, TablaBase ya enumera) ---- */

  const columnas = [
    {
      clave: "ci" as const,
      titulo: "C.I.",
      alineacion: "centro" as const,
      ordenable: true,
    },
    {
      clave: "nombreCompleto" as const,
      titulo: "Nombre completo",
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
      clave: "modalidad" as const,
      titulo: "Modalidad",
      alineacion: "centro" as const,
      ordenable: true,
      formatearCelda: (valor: string) => (
        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
          {valor === "INDIVIDUAL" ? "Individual" : valor}
        </span>
      ),
    },
    {
      clave: "tutorLegal" as const,
      titulo: "Tutor legal",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
  ];

  /* ---- Acciones con iconos (sin texto) ---- */

  const renderAcciones = (fila: InscritoIndividualDto) => (
    <div className="flex justify-center gap-2">
      {/* Baja de participación individual */}
      <button
        type="button"
        onClick={() =>
          abrirConfirmacion(
            "participacion",
            fila.idOlimpista,
            fila.nombreCompleto
          )
        }
        className="inline-flex items-center justify-center rounded-full border border-transparent bg-amber-50 p-1.5 text-amber-700 shadow-sm transition hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
        aria-label="Dar de baja participación individual del olímpista"
      >
        <Edit3 className="h-4 w-4" />
      </button>

      {/* Baja del olímpista (estado=false) */}
      <button
        type="button"
        onClick={() =>
          abrirConfirmacion("olimpista", fila.idOlimpista, fila.nombreCompleto)
        }
        className="inline-flex items-center justify-center rounded-full border border-transparent bg-red-50 p-1.5 text-red-600 shadow-sm transition hover:bg-red-100 hover:text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
        aria-label="Dar de baja al olímpista en el sistema"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  /* ---- Exportar (sin IDs) ---- */

  const exportarCsv = () => {
    if (!inscritosFiltrados.length) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay registros para exportar con los filtros actuales."
      );
      return;
    }

    const encabezados = [
      "N.º",
      "C.I.",
      "Nombre completo",
      "Unidad educativa",
      "Departamento",
      "Área",
      "Nivel",
      "Modalidad",
      "Tutor legal",
    ];

    const filas = inscritosFiltrados.map((i, idx) => [
      idx + 1,
      i.ci,
      i.nombreCompleto,
      i.unidadEducativa,
      i.departamento,
      i.area,
      i.nivel,
      i.modalidad === "INDIVIDUAL" ? "Individual" : i.modalidad,
      i.tutorLegal ?? "",
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
    enlace.download = "inscritos_individuales.csv";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  };

  const exportarPdf = () => {
    if (!inscritosFiltrados.length) {
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
        <th style="border:1px solid #ccc;padding:4px;">C.I.</th>
        <th style="border:1px solid #ccc;padding:4px;">Nombre completo</th>
        <th style="border:1px solid #ccc;padding:4px;">Unidad educativa</th>
        <th style="border:1px solid #ccc;padding:4px;">Departamento</th>
        <th style="border:1px solid #ccc;padding:4px;">Área</th>
        <th style="border:1px solid #ccc;padding:4px;">Nivel</th>
        <th style="border:1px solid #ccc;padding:4px;">Modalidad</th>
        <th style="border:1px solid #ccc;padding:4px;">Tutor legal</th>
      </tr>
    `;

    const filasHtml = inscritosFiltrados
      .map(
        (i, idx) => `
      <tr>
        <td style="border:1px solid #ccc;padding:4px;text-align:center;">${
          idx + 1
        }</td>
        <td style="border:1px solid #ccc;padding:4px;text-align:center;">${
          i.ci
        }</td>
        <td style="border:1px solid #ccc;padding:4px;">${
          i.nombreCompleto
        }</td>
        <td style="border:1px solid #ccc;padding:4px;">${
          i.unidadEducativa
        }</td>
        <td style="border:1px solid #ccc;padding:4px;">${
          i.departamento
        }</td>
        <td style="border:1px solid #ccc;padding:4px;">${i.area}</td>
        <td style="border:1px solid #ccc;padding:4px;">${i.nivel}</td>
        <td style="border:1px solid #ccc;padding:4px;">${
          i.modalidad === "INDIVIDUAL" ? "Individual" : i.modalidad
        }</td>
        <td style="border:1px solid #ccc;padding:4px;">${
          i.tutorLegal ?? ""
        }</td>
      </tr>
    `
      )
      .join("");

    const ventana = window.open("", "_blank");
    if (!ventana) return;

    ventana.document.write(`
      <html>
        <head>
          <title>Inscritos individuales</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; }
            h1 { font-size: 18px; margin-bottom: 12px; }
            table { border-collapse: collapse; width: 100%; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Listado de inscritos individuales</h1>
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
              Inscritos individuales
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Listado de olímpistas inscritos en modalidad individual.
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
              datos={inscritosPaginados}
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
                Math.ceil(inscritosFiltrados.length / REGISTROS_PAGINA)
              )}
              totalRegistros={inscritosFiltrados.length}
              registrosPorPagina={REGISTROS_PAGINA}
              onPaginaChange={setPagina}
            />
          </div>
        </div>
      </div>

      {/* Modal confirmar baja */}
      <ConfirmModal
        visible={confirmVisible}
        title={
          confirmMode === "participacion"
            ? "Dar de baja participación"
            : "Dar de baja olímpista"
        }
        message={
          confirmMode === "participacion"
            ? `Se dará de baja la participación individual de "${confirmNombre}" en las categorías activas. ¿Deseas continuar?`
            : `Se dará de baja al olímpista "${confirmNombre}" en el sistema. Esta acción impedirá que siga participando. ¿Deseas continuar?`
        }
        onCancel={() => {
          if (!processingConfirm) {
            setConfirmVisible(false);
            setConfirmOlimpistaId(null);
            setConfirmNombre("");
          }
        }}
        onConfirm={ejecutarAccionConfirmada}
        confirmText="Confirmar baja"
        cancelText="Cancelar"
        danger={confirmMode === "olimpista"}
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
