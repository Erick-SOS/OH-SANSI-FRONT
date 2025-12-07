// src/pages/CantidadDeMedallas.tsx
import { useMemo, useState } from "react";
import { FiSave } from "react-icons/fi";
import { FileDown, FileText } from "lucide-react";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";

interface MedallaItem {
  id: number; // id interno solo para el front
  areaId: number;
  nivelId: number;
  areaCompetencia: string;
  nivel: string;
  medallasOro: string;
  medallasPlata: string;
  medallasBronce: string;
  notaMinimaAprobacion: string;
}

/* ---- Datos estáticos de ejemplo ---- */
const DATOS_INICIALES: MedallaItem[] = [
  {
    id: 1,
    areaId: 1,
    nivelId: 1,
    areaCompetencia: "Matemática",
    nivel: "Primaria",
    medallasOro: "2",
    medallasPlata: "2",
    medallasBronce: "2",
    notaMinimaAprobacion: "60",
  },
  {
    id: 2,
    areaId: 1,
    nivelId: 2,
    areaCompetencia: "Matemática",
    nivel: "Secundaria",
    medallasOro: "3",
    medallasPlata: "3",
    medallasBronce: "3",
    notaMinimaAprobacion: "65",
  },
  {
    id: 3,
    areaId: 2,
    nivelId: 1,
    areaCompetencia: "Física",
    nivel: "Primaria",
    medallasOro: "1",
    medallasPlata: "2",
    medallasBronce: "2",
    notaMinimaAprobacion: "55",
  },
  {
    id: 4,
    areaId: 2,
    nivelId: 2,
    areaCompetencia: "Física",
    nivel: "Secundaria",
    medallasOro: "2",
    medallasPlata: "2",
    medallasBronce: "3",
    notaMinimaAprobacion: "60",
  },
  {
    id: 5,
    areaId: 3,
    nivelId: 2,
    areaCompetencia: "Informática",
    nivel: "Secundaria",
    medallasOro: "3",
    medallasPlata: "3",
    medallasBronce: "3",
    notaMinimaAprobacion: "70",
  },
  {
    id: 6,
    areaId: 4,
    nivelId: 3,
    areaCompetencia: "Química",
    nivel: "Preuniversitario",
    medallasOro: "1",
    medallasPlata: "1",
    medallasBronce: "1",
    notaMinimaAprobacion: "75",
  },
];

const REGISTROS_POR_PAGINA = 8;

export default function CantidadDeMedallas() {
  const [datosCompletos, setDatosCompletos] =
    useState<MedallaItem[]>(DATOS_INICIALES);

  const [valoresEditados, setValoresEditados] = useState<
    Record<number, Partial<MedallaItem>>
  >({});
  const [valoresGuardados, setValoresGuardados] = useState<
    Record<number, Partial<MedallaItem>>
  >({});
  const [errores, setErrores] = useState<
    Record<number, Partial<Record<keyof MedallaItem, string>>>
  >({});

  // Modales
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [filaSeleccionada, setFilaSeleccionada] = useState<MedallaItem | null>(
    null
  );

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

  const mostrarResultado = (
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

  const cerrarResultModal = () =>
    setResultModal((prev) => ({ ...prev, visible: false }));

  /* ---- Validaciones de inputs ---- */
  const validarYActualizar = (
    id: number,
    campo: keyof MedallaItem,
    valor: string
  ) => {
    const num = parseInt(valor, 10);

    // medallas: mínimo 1
    if (
      (campo === "medallasOro" ||
        campo === "medallasPlata" ||
        campo === "medallasBronce") &&
      (isNaN(num) || num < 1)
    ) {
      setErrores((prev) => ({
        ...prev,
        [id]: { ...prev[id], [campo]: "Mínimo 1 medalla" },
      }));
      return;
    }

    // nota mínima: 1-100
    if (campo === "notaMinimaAprobacion") {
      if (isNaN(num) || num < 1 || num > 100) {
        setErrores((prev) => ({
          ...prev,
          [id]: { ...prev[id], [campo]: "Debe estar entre 1 y 100" },
        }));
        return;
      }
    }

    // general: máximo 100
    if (!isNaN(num) && num > 100) {
      setErrores((prev) => ({
        ...prev,
        [id]: { ...prev[id], [campo]: "Máximo 100" },
      }));
      return;
    }

    // limpia error
    setErrores((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: undefined },
    }));

    // set valores editados
    setValoresEditados((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));
  };

  /* ---- Abrir modal de confirmación ---- */
  const manejarClickGuardar = (fila: MedallaItem) => {
    const erroresFila = errores[fila.id];
    if (erroresFila && Object.values(erroresFila).some((msg) => msg)) return;
    if (!valoresEditados[fila.id]) return; // nada que guardar

    setFilaSeleccionada(fila);
    setMostrarConfirm(true);
  };

  /* ---- Confirmar guardado (solo local, sin backend) ---- */
  const confirmarGuardar = async () => {
    if (!filaSeleccionada) return;
    const fila = filaSeleccionada;

    const cambios = valoresEditados[fila.id] || {};
    const filaFinal: MedallaItem = {
      ...fila,
      ...cambios,
    };

    setGuardando(true);

    // simulamos "guardar" solo en el front
    setDatosCompletos((prev) =>
      prev.map((item) => (item.id === fila.id ? filaFinal : item))
    );

    setValoresGuardados((prev) => ({
      ...prev,
      [fila.id]: cambios,
    }));

    setValoresEditados((prev) => {
      const nuevo = { ...prev };
      delete nuevo[fila.id];
      return nuevo;
    });

    mostrarResultado(
      "success",
      "Cambios guardados",
      `Se guardó la configuración para ${filaFinal.areaCompetencia} - ${filaFinal.nivel} (datos de prueba, solo en el navegador).`
    );

    setGuardando(false);
    setMostrarConfirm(false);
    setFilaSeleccionada(null);
  };

  /* ---- Render de inputs en las celdas ---- */
  const renderInput = (
    fila: MedallaItem,
    campo: keyof MedallaItem,
    valorActual: string
  ) => {
    const valorMostrado = (valoresEditados[fila.id]?.[campo] ??
      valorActual) as string;
    const error = errores[fila.id]?.[campo];
    const editado = valoresEditados[fila.id]?.[campo] !== undefined;
    const guardado = valoresGuardados[fila.id]?.[campo] !== undefined;

    return (
      <div className="flex flex-col items-center">
        <input
          type="number"
          min={1}
          max={100}
          value={valorMostrado}
          onChange={(e) => validarYActualizar(fila.id, campo, e.target.value)}
          className={`
            w-20 text-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-all
            ${
              error
                ? "border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-900/20 dark:text-red-300"
                : editado
                ? "border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20"
                : guardado
                ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20"
                : "border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            }
          `}
        />
        {error && (
          <span className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </div>
    );
  };

  /* ---- Columnas de la tabla ---- */
  const columnas = [
    {
      clave: "areaCompetencia" as const,
      titulo: "Área",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "nivel" as const,
      titulo: "Nivel",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "medallasOro" as const,
      titulo: "Oro",
      alineacion: "centro" as const,
      ordenable: false,
      formatearCelda: (valor: string, fila: MedallaItem) =>
        renderInput(fila, "medallasOro", valor),
    },
    {
      clave: "medallasPlata" as const,
      titulo: "Plata",
      alineacion: "centro" as const,
      ordenable: false,
      formatearCelda: (valor: string, fila: MedallaItem) =>
        renderInput(fila, "medallasPlata", valor),
    },
    {
      clave: "medallasBronce" as const,
      titulo: "Bronce",
      alineacion: "centro" as const,
      ordenable: false,
      formatearCelda: (valor: string, fila: MedallaItem) =>
        renderInput(fila, "medallasBronce", valor),
    },
    {
      clave: "notaMinimaAprobacion" as const,
      titulo: "Nota mín. clasificación",
      alineacion: "centro" as const,
      ordenable: false,
      formatearCelda: (valor: string, fila: MedallaItem) =>
        renderInput(fila, "notaMinimaAprobacion", valor),
    },
    {
      clave: "accion" as const,
      titulo: "Guardar",
      alineacion: "centro" as const,
      ordenable: false,
      formatearCelda: (_: any, fila: MedallaItem) => {
        const tieneCambios = !!valoresEditados[fila.id];
        const tieneErrores =
          errores[fila.id] &&
          Object.values(errores[fila.id]).some((msg) => Boolean(msg));

        return (
          <button
            type="button"
            onClick={() => manejarClickGuardar(fila)}
            disabled={!tieneCambios || !!tieneErrores || guardando}
            className={`
              inline-flex items-center justify-center rounded-full p-2.5 text-sm transition-all
              ${
                tieneCambios && !tieneErrores
                  ? "bg-brand-500 text-white shadow-sm hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400"
                  : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
              }
            `}
            aria-label="Guardar configuración"
          >
            <FiSave className="h-4 w-4" />
          </button>
        );
      },
    },
  ];

  /* ---- Filtros, búsqueda y paginación ---- */
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState<string>("TODAS");
  const [filtroNivel, setFiltroNivel] = useState<string>("TODOS");

  const areasDisponibles = useMemo(
    () => Array.from(new Set(datosCompletos.map((d) => d.areaCompetencia))).sort(),
    [datosCompletos]
  );

  const nivelesDisponibles = useMemo(
    () => Array.from(new Set(datosCompletos.map((d) => d.nivel))).sort(),
    [datosCompletos]
  );

  const datosFiltrados = useMemo(() => {
    let lista = [...datosCompletos];

    if (filtroArea !== "TODAS") {
      lista = lista.filter((d) => d.areaCompetencia === filtroArea);
    }

    if (filtroNivel !== "TODOS") {
      lista = lista.filter((d) => d.nivel === filtroNivel);
    }

    if (terminoBusqueda.trim()) {
      const term = terminoBusqueda.toLowerCase();
      lista = lista.filter((item) => {
        const area = item.areaCompetencia.toLowerCase();
        const nivel = item.nivel.toLowerCase();
        return area.includes(term) || nivel.includes(term);
      });
    }

    return lista;
  }, [datosCompletos, filtroArea, filtroNivel, terminoBusqueda]);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    return datosFiltrados.slice(inicio, inicio + REGISTROS_POR_PAGINA);
  }, [datosFiltrados, paginaActual]);

  /* ---- Exportar CSV ---- */
  const exportarCsv = () => {
    if (!datosFiltrados.length) {
      mostrarResultado(
        "error",
        "Sin datos para exportar",
        "No hay registros para exportar con los filtros actuales."
      );
      return;
    }

    const encabezados = [
      "N.º",
      "Área",
      "Nivel",
      "Oro",
      "Plata",
      "Bronce",
      "Nota mínima clasificación",
    ];

    const filas = datosFiltrados.map((d, idx) => [
      idx + 1,
      d.areaCompetencia,
      d.nivel,
      d.medallasOro,
      d.medallasPlata,
      d.medallasBronce,
      d.notaMinimaAprobacion,
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
    enlace.download = "configuracion_medallas.csv";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  };

  /* ---- Exportar PDF (blanco y negro) ---- */
  const exportarPdf = () => {
    if (!datosFiltrados.length) {
      mostrarResultado(
        "error",
        "Sin datos para exportar",
        "No hay registros para exportar con los filtros actuales."
      );
      return;
    }

    const encabezadoHtml = `
      <tr>
        <th style="border:1px solid #000;padding:4px;">N.º</th>
        <th style="border:1px solid #000;padding:4px;">Área</th>
        <th style="border:1px solid #000;padding:4px;">Nivel</th>
        <th style="border:1px solid #000;padding:4px;">Oro</th>
        <th style="border:1px solid #000;padding:4px;">Plata</th>
        <th style="border:1px solid #000;padding:4px;">Bronce</th>
        <th style="border:1px solid #000;padding:4px;">Nota mín. clasificación</th>
      </tr>
    `;

    const filasHtml = datosFiltrados
      .map(
        (d, idx) => `
      <tr>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${
          idx + 1
        }</td>
        <td style="border:1px solid #000;padding:4px;">${d.areaCompetencia}</td>
        <td style="border:1px solid #000;padding:4px;">${d.nivel}</td>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${
          d.medallasOro
        }</td>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${
          d.medallasPlata
        }</td>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${
          d.medallasBronce
        }</td>
        <td style="border:1px solid #000;padding:4px;text-align:center;">${
          d.notaMinimaAprobacion
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
          <title>Configuración de medallas</title>
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
          <h1>Configuración de medallas por área y nivel</h1>
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
              Configuración de medallas y nota mínima
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Define cuántas medallas se entregan por área y nivel, y la nota
              mínima de clasificación.
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
                    terminoBusqueda={terminoBusqueda}
                    onBuscarChange={(t: string) => {
                      setTerminoBusqueda(t);
                      setPaginaActual(1);
                    }}
                  />
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  {/* Filtro área */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Área
                    </label>
                    <select
                      value={filtroArea}
                      onChange={(e) => {
                        setFiltroArea(e.target.value);
                        setPaginaActual(1);
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

                  {/* Filtro nivel */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Nivel
                    </label>
                    <select
                      value={filtroNivel}
                      onChange={(e) => {
                        setFiltroNivel(e.target.value);
                        setPaginaActual(1);
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
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <TablaBase
              datos={datosPaginados}
              columnas={columnas}
              conOrdenamiento
              onOrdenar={() => {
                // si tu TablaBase ya maneja ordenamiento interno,
                // puedes implementar lógica aquí más adelante
              }}
              conAcciones={false}
            />
          </div>

          {/* Paginación */}
          <div className="flex justify-end">
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={Math.max(
                1,
                Math.ceil(datosFiltrados.length / REGISTROS_POR_PAGINA)
              )}
              totalRegistros={datosFiltrados.length}
              registrosPorPagina={REGISTROS_POR_PAGINA}
              onPaginaChange={setPaginaActual}
            />
          </div>
        </div>
      </div>

      {/* Modal confirmar guardado */}
      <ConfirmModal
        visible={mostrarConfirm}
        title="Confirmar guardado"
        message={
          filaSeleccionada
            ? `¿Deseas guardar la configuración para "${filaSeleccionada.areaCompetencia}" - "${filaSeleccionada.nivel}"?`
            : ""
        }
        onCancel={() => {
          if (!guardando) {
            setMostrarConfirm(false);
            setFilaSeleccionada(null);
          }
        }}
        onConfirm={confirmarGuardar}
        confirmText="Guardar cambios"
        cancelText="Cancelar"
        loading={guardando}
      />

      {/* Modal resultado */}
      <ResultModal
        visible={resultModal.visible}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={cerrarResultModal}
      />
    </div>
  );
}
