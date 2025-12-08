// src/pages/DesignarEvaluadores.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { Eye, FileDown, FileText } from "lucide-react";

import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";
import SelectConBusqueda from "../components/ui/select/SelectConBusqueda";

import { api } from "../api";
import { getToken } from "../components/auth/authStorage";

type Modalidad = "INDIVIDUAL" | "GRUPAL";

interface EvaluadorAsignado {
  idEvaluador: number;
  ci: string;
  nombreCompleto: string;
  apellidoIndiceInicialParticipacion: string | null;
  apellidoIndiceFinalParticipacion: string | null;
}

interface CategoriaAsignacionItem {
  idCategoria: number;
  area: string;
  nivel: string;
  modalidad: Modalidad;
  evaluadores: EvaluadorAsignado[];
}

interface EvaluadorDisponible {
  idEvaluador: number;
  nombreCompleto: string;
}

const REGISTROS_POR_PAGINA = 10;

const DesignarEvaluadores: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [gestion] = useState<number>(new Date().getFullYear());

  const [cargando, setCargando] = useState(false);

  const [categorias, setCategorias] = useState<CategoriaAsignacionItem[]>([]);

  // filtros / búsqueda / paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState<string>("TODAS");
  const [filtroNivel, setFiltroNivel] = useState<string>("TODOS");

  // Modal ver evaluadores
  const [modalEvaluadoresVisible, setModalEvaluadoresVisible] =
    useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaAsignacionItem | null>(null);

  // Modal agregar evaluador
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);

  // Evaluadores disponibles para select (se recicla entre modales)
  const [evaluadoresDisponibles, setEvaluadoresDisponibles] = useState<
    EvaluadorDisponible[]
  >([]);
  const [valorSelectEvaluador, setValorSelectEvaluador] = useState("");
  const [loadingEvaluadoresDisponibles, setLoadingEvaluadoresDisponibles] =
    useState(false);
  const [loadingAgregarEvaluador, setLoadingAgregarEvaluador] =
    useState(false);

  // Eliminar asignación
  const [asignacionAEliminar, setAsignacionAEliminar] = useState<{
    idCategoria: number;
    idEvaluador: number;
    nombreCompleto: string;
  } | null>(null);
  const [loadingEliminarAsignacion, setLoadingEliminarAsignacion] =
    useState(false);

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

  const labelModalidad = (m: Modalidad) =>
    m === "INDIVIDUAL" ? "Individual" : "Grupal";

  // =======================
  // Carga inicial
  // =======================
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
      await cargarCategorias(t);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapCategoriasResponse = (resp: any): CategoriaAsignacionItem[] => {
    return (resp.categorias ?? []).map((c: any) => ({
      idCategoria: c.idCategoria ?? c.id,
      area: c.area,
      nivel: c.nivel,
      modalidad: (c.modalidad ?? "INDIVIDUAL") as Modalidad,
      evaluadores: (c.evaluadores ?? []).map((e: any) => ({
        idEvaluador: e.idEvaluador ?? e.id,
        ci: e.ci,
        nombreCompleto: e.nombreCompleto,
        apellidoIndiceInicialParticipacion:
          e.apellidoIndiceInicialParticipacion ?? null,
        apellidoIndiceFinalParticipacion:
          e.apellidoIndiceFinalParticipacion ?? null,
      })),
    }));
  };

  const cargarCategorias = async (
    tok: string,
    opts?: {
      silent?: boolean;
      keepPage?: boolean;
      categoriaSeleccionadaId?: number;
    }
  ) => {
    const silent = opts?.silent ?? false;
    const keepPage = opts?.keepPage ?? false;

    if (!silent) setCargando(true);
    try {
      const resp = await api(`/designar/evaluadores?gestion=${gestion}`, {
        token: tok,
      });

      const items = mapCategoriasResponse(resp);

      setCategorias(items);

      if (!keepPage) {
        setPaginaActual(1);
      }

      if (opts?.categoriaSeleccionadaId) {
        const encontrada =
          items.find(
            (c) => c.idCategoria === opts.categoriaSeleccionadaId
          ) ?? null;
        setCategoriaSeleccionada(encontrada);
      }

      return items;
    } catch (error: any) {
      console.error("Error al cargar categorías para asignación", error);
      showResult(
        "error",
        "Error al cargar categorías",
        error?.message ||
          "No se pudieron obtener las categorías para asignar evaluadores."
      );
      return [];
    } finally {
      if (!silent) setCargando(false);
    }
  };

  const cargarEvaluadoresDisponibles = async (
    tok: string,
    idCategoria: number
  ) => {
    setLoadingEvaluadoresDisponibles(true);
    try {
      const resp = await api(
        `/designar/evaluadores/${idCategoria}/evaluadores-disponibles`,
        {
          token: tok,
        }
      );

      const lista: EvaluadorDisponible[] = (resp.evaluadores ?? []).map(
        (e: any) => ({
          idEvaluador: e.idEvaluador ?? e.id,
          nombreCompleto: e.nombreCompleto,
        })
      );

      setEvaluadoresDisponibles(lista);
    } catch (error: any) {
      console.error("Error al cargar evaluadores disponibles", error);
      showResult(
        "error",
        "Error al cargar evaluadores",
        error?.message ||
          "No se pudieron obtener los evaluadores disponibles."
      );
    } finally {
      setLoadingEvaluadoresDisponibles(false);
    }
  };

  // =======================
  // Filtros y búsqueda
  // =======================

  const areasDisponiblesFiltro = useMemo(
    () =>
      Array.from(new Set(categorias.map((c) => c.area)))
        .filter(Boolean)
        .sort(),
    [categorias]
  );

  const nivelesDisponiblesFiltro = useMemo(
    () =>
      Array.from(new Set(categorias.map((c) => c.nivel)))
        .filter(Boolean)
        .sort(),
    [categorias]
  );

  const categoriasFiltradas = useMemo(() => {
    let lista = [...categorias];

    if (filtroArea !== "TODAS") {
      lista = lista.filter((c) => c.area === filtroArea);
    }

    if (filtroNivel !== "TODOS") {
      lista = lista.filter((c) => c.nivel === filtroNivel);
    }

    if (terminoBusqueda.trim()) {
      const term = terminoBusqueda.toLowerCase();
      lista = lista.filter((c) => {
        const textoEval = c.evaluadores
          .map(
            (e) =>
              `${e.nombreCompleto} ${e.ci}`.toLocaleLowerCase("es-BO")
          )
          .join(" ");

        return (
          c.area.toLowerCase().includes(term) ||
          c.nivel.toLowerCase().includes(term) ||
          labelModalidad(c.modalidad).toLowerCase().includes(term) ||
          textoEval.includes(term)
        );
      });
    }

    return lista;
  }, [categorias, filtroArea, filtroNivel, terminoBusqueda]);

  const categoriasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    return categoriasFiltradas.slice(inicio, inicio + REGISTROS_POR_PAGINA);
  }, [categoriasFiltradas, paginaActual]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(categoriasFiltradas.length / REGISTROS_POR_PAGINA)
  );

  // =======================
  // Ordenamiento desde TablaBase
  // =======================

  const handleOrdenar = (columna: string, direccion: "asc" | "desc") => {
    setCategorias((prev) => {
      const copia = [...prev];
      copia.sort((a, b) => {
        const valA: any = (a as any)[columna];
        const valB: any = (b as any)[columna];

        if (typeof valA === "string" && typeof valB === "string") {
          return direccion === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return 0;
      });
      return copia;
    });
    setPaginaActual(1);
  };

  // =======================
  // Modal evaluadores
  // =======================

  const abrirModalEvaluadores = async (cat: CategoriaAsignacionItem) => {
    setCategoriaSeleccionada(cat);
    setModalEvaluadoresVisible(true);
    setValorSelectEvaluador("");

    if (!token) {
      showResult(
        "error",
        "Sin sesión",
        "No se pudo obtener el token de autenticación."
      );
      return;
    }

    await cargarEvaluadoresDisponibles(token, cat.idCategoria);
  };

  const cerrarModalEvaluadores = () => {
    if (loadingAgregarEvaluador || loadingEvaluadoresDisponibles) return;
    setModalEvaluadoresVisible(false);
    setCategoriaSeleccionada(null);
    setEvaluadoresDisponibles([]);
    setValorSelectEvaluador("");
  };

  // abrir modal de agregar: se cierra el de ver mientras tanto
  const abrirModalAgregarEvaluador = () => {
    if (!categoriaSeleccionada) return;

    if (categoriaSeleccionada.evaluadores.length >= 5) {
      showResult(
        "error",
        "Límite alcanzado",
        "Esta categoría ya tiene el máximo de 5 evaluadores."
      );
      return;
    }

    setValorSelectEvaluador("");
    setModalEvaluadoresVisible(false);
    setModalAgregarVisible(true);
  };

  const cerrarModalAgregarEvaluador = () => {
    if (loadingAgregarEvaluador) return;
    setModalAgregarVisible(false);
    // volver a ver el listado de evaluadores
    if (categoriaSeleccionada) {
      setModalEvaluadoresVisible(true);
    }
  };

  const handleAgregarEvaluador = async (): Promise<boolean> => {
    if (!token) {
      showResult(
        "error",
        "Sin sesión",
        "No se pudo obtener el token de autenticación."
      );
      return false;
    }

    if (!categoriaSeleccionada) {
      showResult(
        "error",
        "Sin categoría",
        "No se ha seleccionado una categoría."
      );
      return false;
    }

    if (!valorSelectEvaluador) {
      showResult(
        "error",
        "Evaluador no seleccionado",
        "Selecciona un evaluador de la lista para asignarlo."
      );
      return false;
    }

    const seleccionado = evaluadoresDisponibles.find(
      (e) => e.nombreCompleto === valorSelectEvaluador
    );

    if (!seleccionado) {
      showResult(
        "error",
        "Evaluador inválido",
        "El evaluador seleccionado no es válido."
      );
      return false;
    }

    try {
      setLoadingAgregarEvaluador(true);

      await api(
        `/designar/evaluadores/${categoriaSeleccionada.idCategoria}/evaluadores`,
        {
          method: "POST",
          token,
          body: {
            evaluador_id: seleccionado.idEvaluador,
          },
        }
      );

      showResult(
        "success",
        "Evaluador asignado",
        `Se asignó a ${seleccionado.nombreCompleto} como evaluador de ${categoriaSeleccionada.area} - ${categoriaSeleccionada.nivel} (${labelModalidad(
          categoriaSeleccionada.modalidad
        )}).`
      );

      await cargarCategorias(token, {
        silent: true,
        keepPage: true,
        categoriaSeleccionadaId: categoriaSeleccionada.idCategoria,
      });

      await cargarEvaluadoresDisponibles(
        token,
        categoriaSeleccionada.idCategoria
      );

      setValorSelectEvaluador("");
      return true;
    } catch (error: any) {
      console.error("Error al asignar evaluador", error);
      showResult(
        "error",
        "Error al asignar evaluador",
        error?.mensaje ||
          error?.message ||
          "No se pudo asignar el evaluador a la categoría."
      );
      return false;
    } finally {
      setLoadingAgregarEvaluador(false);
    }
  };

  const handleConfirmAgregarEvaluador = async () => {
    const ok = await handleAgregarEvaluador();
    if (ok) {
      setModalAgregarVisible(false);
      setModalEvaluadoresVisible(true);
    }
  };

  const solicitarEliminarAsignacion = (evalItem: EvaluadorAsignado) => {
    if (!categoriaSeleccionada) return;
    setAsignacionAEliminar({
      idCategoria: categoriaSeleccionada.idCategoria,
      idEvaluador: evalItem.idEvaluador,
      nombreCompleto: evalItem.nombreCompleto,
    });
  };

  const confirmarEliminarAsignacion = async () => {
    if (!token || !asignacionAEliminar) return;

    try {
      setLoadingEliminarAsignacion(true);

      await api(
        `/designar/evaluadores/${asignacionAEliminar.idCategoria}/evaluadores/${asignacionAEliminar.idEvaluador}`,
        {
          method: "DELETE",
          token,
        }
      );

      showResult(
        "success",
        "Asignación eliminada",
        `Se eliminó la asignación de ${asignacionAEliminar.nombreCompleto} de la categoría seleccionada.`
      );

      await cargarCategorias(token, {
        silent: true,
        keepPage: true,
        categoriaSeleccionadaId: asignacionAEliminar.idCategoria,
      });

      await cargarEvaluadoresDisponibles(
        token,
        asignacionAEliminar.idCategoria
      );
    } catch (error: any) {
      console.error("Error al eliminar asignación", error);
      showResult(
        "error",
        "Error al eliminar asignación",
        error?.mensaje ||
          error?.message ||
          "No se pudo eliminar la asignación del evaluador."
      );
    } finally {
      setLoadingEliminarAsignacion(false);
      setAsignacionAEliminar(null);
    }
  };

  // =======================
  // Exportar CSV / PDF
  // =======================

  const exportarCsv = () => {
    if (!categoriasFiltradas.length) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay categorías para exportar con los filtros actuales."
      );
      return;
    }

    const encabezados = [
      "N.º",
      "Área",
      "Nivel",
      "Modalidad",
      "Total evaluadores",
      "Detalle evaluadores",
    ];

    const filas = categoriasFiltradas.map((c, idx) => {
      const detalle = c.evaluadores
        .map(
          (e) =>
            `${e.ci} - ${e.nombreCompleto}` +
            (e.apellidoIndiceInicialParticipacion ||
            e.apellidoIndiceFinalParticipacion
              ? ` [${e.apellidoIndiceInicialParticipacion ?? "?"} - ${
                  e.apellidoIndiceFinalParticipacion ?? "?"
                }]`
              : "")
        )
        .join(" | ");

      return [
        idx + 1,
        c.area,
        c.nivel,
        labelModalidad(c.modalidad),
        c.evaluadores.length,
        detalle || "Sin evaluadores",
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
    enlace.download = "designacion_evaluadores_olimpiada.csv";
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  };

  const exportarPdf = () => {
    if (!categoriasFiltradas.length) {
      showResult(
        "error",
        "Sin datos para exportar",
        "No hay categorías para exportar con los filtros actuales."
      );
      return;
    }

    const encabezadoHtml = `
      <tr>
        <th style="border:1px solid #000;padding:4px;">N.º</th>
        <th style="border:1px solid #000;padding:4px;">Área</th>
        <th style="border:1px solid #000;padding:4px;">Nivel</th>
        <th style="border:1px solid #000;padding:4px;">Modalidad</th>
        <th style="border:1px solid #000;padding:4px;">Total evaluadores</th>
        <th style="border:1px solid #000;padding:4px;">Detalle evaluadores</th>
      </tr>
    `;

    const filasHtml = categoriasFiltradas
      .map((c, idx) => {
        const detalle = c.evaluadores
          .map(
            (e) =>
              `${e.ci} - ${e.nombreCompleto}` +
              (e.apellidoIndiceInicialParticipacion ||
              e.apellidoIndiceFinalParticipacion
                ? ` [${e.apellidoIndiceInicialParticipacion ?? "?"} - ${
                    e.apellidoIndiceFinalParticipacion ?? "?"
                  }]`
                : "")
          )
          .join(" | ");

        return `
          <tr>
            <td style="border:1px solid #000;padding:4px;text-align:center;">${
              idx + 1
            }</td>
            <td style="border:1px solid #000;padding:4px;">${c.area}</td>
            <td style="border:1px solid #000;padding:4px;">${c.nivel}</td>
            <td style="border:1px solid #000;padding:4px;text-align:center;">${labelModalidad(
              c.modalidad
            )}</td>
            <td style="border:1px solid #000;padding:4px;text-align:center;">${
              c.evaluadores.length
            }</td>
            <td style="border:1px solid #000;padding:4px;">${
              detalle || "Sin evaluadores"
            }</td>
          </tr>
        `;
      })
      .join("");

    const ventana = window.open("", "_blank");
    if (!ventana) return;

    ventana.document.write(`
      <html>
        <head>
          <title>Designación de evaluadores por categoría</title>
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
          <h1>Designación de evaluadores por categoría (gestión ${gestion})</h1>
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

  // =======================
  // Columnas tabla principal
  // =======================

  const columnas = [
    {
      clave: "area" as const,
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
      clave: "modalidad" as const,
      titulo: "Modalidad",
      alineacion: "centro" as const,
      ordenable: true,
      formatearCelda: (valor: Modalidad) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            valor === "INDIVIDUAL"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          }`}
        >
          {labelModalidad(valor)}
        </span>
      ),
    },
    {
      clave: "evaluadores" as const,
      titulo: "Evaluadores",
      alineacion: "izquierda" as const,
      ordenable: false,
      formatearCelda: (valor: EvaluadorAsignado[]) => {
        if (!valor.length) {
          return (
            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-200">
              Sin evaluadores asignados
            </span>
          );
        }

        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
            {valor.length} evaluador{valor.length > 1 ? "es" : ""}
          </span>
        );
      },
    },
  ];

  // =======================
  // Render
  // =======================

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-950 sm:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Designación de evaluadores
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Asigna y administra evaluadores por categoría (área, nivel y
              modalidad). Gestión {gestion}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {cargando && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Cargando datos…
              </span>
            )}
          </div>
        </div>

        {/* Filtros + exportaciones */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {/* Búsqueda + filtros */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="w-full max-w-xs">
                <BarraBusquedaAreas
                  terminoBusqueda={terminoBusqueda}
                  onBuscarChange={(t: string) => {
                    setTerminoBusqueda(t);
                    setPaginaActual(1);
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-end">
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
                    className="w-full min-w-[140px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="TODAS">Todas las áreas</option>
                    {areasDisponiblesFiltro.map((a) => (
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
                    className="w-full min-w-[140px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="TODOS">Todos los niveles</option>
                    {nivelesDisponiblesFiltro.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
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
            datos={categoriasPaginadas}
            columnas={columnas}
            conOrdenamiento
            onOrdenar={handleOrdenar}
            conAcciones
            renderAcciones={(fila: CategoriaAsignacionItem) => (
              <div className="flex items-center justify-center gap-2">
                {/* Ver evaluadores */}
                <button
                  type="button"
                  onClick={() => abrirModalEvaluadores(fila)}
                  className="inline-flex items-center justify-center rounded-full bg-gray-100 p-2 text-sm text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  aria-label="Ver evaluadores de la categoría"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            )}
          />
        </div>

        {/* Paginación */}
        <div className="flex justify-end">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalRegistros={categoriasFiltradas.length}
            registrosPorPagina={REGISTROS_POR_PAGINA}
            onPaginaChange={setPaginaActual}
          />
        </div>
      </div>

      {/* Modal resultado */}
      <ResultModal
        visible={resultModal.visible}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={closeResultModal}
      />

      {/* Modal ver evaluadores */}
      {modalEvaluadoresVisible && categoriaSeleccionada && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            {/* Header modal */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Evaluadores asignados
                </h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {categoriaSeleccionada.area} · {categoriaSeleccionada.nivel} ·{" "}
                  {labelModalidad(categoriaSeleccionada.modalidad)} — Gestión{" "}
                  {gestion}.
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModalEvaluadores}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <span className="sr-only">Cerrar</span>✕
              </button>
            </div>

            {/* Contenido modal */}
            <div className="space-y-5">
              {/* Tabla de evaluadores asignados */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/60">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Evaluadores asignados (
                  {categoriaSeleccionada.evaluadores.length}/5)
                </h3>

                {categoriaSeleccionada.evaluadores.length === 0 ? (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    No hay evaluadores asignados a esta categoría.
                  </p>
                ) : (
                  <div className="max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white text-xs dark:border-gray-700 dark:bg-gray-950">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            CI
                          </th>
                          <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Evaluador
                          </th>
                          <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Rango de participaciones
                          </th>
                          <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {categoriaSeleccionada.evaluadores.map((e) => (
                          <tr key={e.idEvaluador}>
                            <td className="px-3 py-2 text-[11px] text-gray-800 dark:text-gray-200">
                              {e.ci}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-gray-800 dark:text-gray-200">
                              {e.nombreCompleto}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-gray-700 dark:text-gray-300">
                              {e.apellidoIndiceInicialParticipacion ||
                              e.apellidoIndiceFinalParticipacion ? (
                                <span>
                                  Desde el apellido{" "}
                                  <strong>
                                    {e.apellidoIndiceInicialParticipacion ??
                                      "?"}
                                  </strong>{" "}
                                  hasta el apellido{" "}
                                  <strong>
                                    {e.apellidoIndiceFinalParticipacion ??
                                      "?"}
                                  </strong>
                                </span>
                              ) : (
                                <span className="text-gray-400">
                                  Rango aún no definido
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => solicitarEliminarAsignacion(e)}
                                className="inline-flex items-center justify-center rounded-full bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
                                aria-label="Eliminar asignación"
                              >
                                <FiTrash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* CTA para abrir modal de agregar */}
              <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-3 dark:border-brand-500/40 dark:bg-brand-500/5">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-200">
                      Agregar nuevo evaluador a esta categoría
                    </h3>
                    <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                      Máximo 5 evaluadores por categoría. El rango de
                      participaciones se redistribuye automáticamente cada vez
                      que agregues o elimines evaluadores.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={abrirModalAgregarEvaluador}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus-visible:ring-offset-gray-950"
                  >
                    + Agregar evaluador
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar evaluador */}
      {modalAgregarVisible && categoriaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            {/* Header modal */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Agregar evaluador
                </h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {categoriaSeleccionada.area} · {categoriaSeleccionada.nivel} ·{" "}
                  {labelModalidad(categoriaSeleccionada.modalidad)} — Gestión{" "}
                  {gestion}.
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModalAgregarEvaluador}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <span className="sr-only">Cerrar</span>✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Selecciona un evaluador activo
                </label>
                <SelectConBusqueda
                  opciones={evaluadoresDisponibles.map(
                    (e) => e.nombreCompleto
                  )}
                  value={valorSelectEvaluador}
                  placeholder={
                    loadingEvaluadoresDisponibles
                      ? "Cargando evaluadores..."
                      : "Buscar evaluador por nombre..."
                  }
                  onChange={(nuevo) => {
                    if (loadingEvaluadoresDisponibles || loadingAgregarEvaluador)
                      return;
                    setValorSelectEvaluador(nuevo);
                  }}
                />
                {!evaluadoresDisponibles.length &&
                  !loadingEvaluadoresDisponibles && (
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      No hay evaluadores disponibles que cumplan las
                      condiciones (rol, estado activo y límite de
                      asignaciones).
                    </p>
                  )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cerrarModalAgregarEvaluador}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  disabled={loadingAgregarEvaluador}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAgregarEvaluador}
                  disabled={
                    loadingAgregarEvaluador ||
                    loadingEvaluadoresDisponibles ||
                    !valorSelectEvaluador
                  }
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 ${
                    loadingAgregarEvaluador ||
                    loadingEvaluadoresDisponibles ||
                    !valorSelectEvaluador
                      ? "cursor-not-allowed bg-brand-300 dark:bg-brand-400/60"
                      : "bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400"
                  }`}
                >
                  {loadingAgregarEvaluador ? "Agregando..." : "Agregar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal para eliminar asignación */}
      <ConfirmModal
        visible={!!asignacionAEliminar}
        title="Eliminar asignación"
        message={
          asignacionAEliminar
            ? `¿Deseas eliminar la asignación de "${asignacionAEliminar.nombreCompleto}" de esta categoría? La distribución de participaciones se actualizará automáticamente.`
            : ""
        }
        onCancel={() => {
          if (!loadingEliminarAsignacion) setAsignacionAEliminar(null);
        }}
        onConfirm={confirmarEliminarAsignacion}
        confirmText="Eliminar asignación"
        cancelText="Cancelar"
        danger
        loading={loadingEliminarAsignacion}
      />
    </div>
  );
};

export default DesignarEvaluadores;
