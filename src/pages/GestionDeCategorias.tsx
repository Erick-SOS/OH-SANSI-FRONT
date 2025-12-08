// src/pages/GestionDeCategorias.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiEdit3, FiSave } from "react-icons/fi";
import { FileDown, FileText, PlusCircle } from "lucide-react";

import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";
import SelectConBusqueda from "../components/ui/select/SelectConBusqueda";

import { api } from "../api";
import { getToken } from "../components/auth/authStorage";

type Modalidad = "INDIVIDUAL" | "GRUPAL";

interface CategoriaItem {
  idCategoria: number;
  area: string;
  nivel: string;
  modalidad: Modalidad;
  responsable: string | null;
}

interface AreaOption {
  id: number;
  nombre: string;
}

interface NivelOption {
  id: number;
  nombre: string;
}

interface ResponsableDisponible {
  idUsuario: number;
  nombreCompleto: string;
}

const REGISTROS_POR_PAGINA = 10;

const GestionDeCategorias: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [gestion] = useState<number>(new Date().getFullYear());

  const [cargando, setCargando] = useState(false);

  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [niveles, setNiveles] = useState<NivelOption[]>([]);
  const [responsablesDisponibles, setResponsablesDisponibles] = useState<
    ResponsableDisponible[]
  >([]);

  // filtros / búsqueda / paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState<string>("TODAS");
  const [filtroNivel, setFiltroNivel] = useState<string>("TODOS");
  const [filtroModalidad, setFiltroModalidad] = useState<string>("TODAS");

  // edición de responsable
  const [filaEditando, setFilaEditando] = useState<number | null>(null);
  const [responsablesFila, setResponsablesFila] = useState<
    Record<number, string>
  >({});
  const [savingResponsableId, setSavingResponsableId] = useState<number | null>(
    null
  );

  // creación de categoría
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [confirmCrearVisible, setConfirmCrearVisible] = useState(false);
  const [loadingCrear, setLoadingCrear] = useState(false);
  const [nuevaAreaId, setNuevaAreaId] = useState<string>("");
  const [nuevoNivelId, setNuevoNivelId] = useState<string>("");
  const [nuevaModalidad, setNuevaModalidad] = useState<Modalidad | "">("");

  // eliminar categoría
  const [deleteTarget, setDeleteTarget] = useState<CategoriaItem | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

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

  // =======================
  // Carga inicial (token + datos)
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
      await cargarTodo(t);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarTodo = async (tok: string) => {
    setCargando(true);
    try {
      await Promise.all([
        cargarCategorias(tok),
        cargarAreas(tok),
        cargarNiveles(tok),
        cargarResponsablesDisponibles(tok),
      ]);
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async (tok: string) => {
    try {
      const resp = await api(`/categorias?gestion=${gestion}`, { token: tok });

      const items: CategoriaItem[] = (resp.categorias ?? []).map((c: any) => ({
        idCategoria: c.idCategoria ?? c.id,
        area: c.area,
        nivel: c.nivel,
        modalidad: (c.modalidad ?? "INDIVIDUAL") as Modalidad,
        responsable: c.responsable ?? null,
      }));

      setCategorias(items);
      setPaginaActual(1);
    } catch (error: any) {
      console.error("Error al cargar categorías", error);
      showResult(
        "error",
        "Error al cargar categorías",
        error?.message || "No se pudieron obtener las categorías."
      );
    }
  };

  const cargarAreas = async (tok: string) => {
    try {
      const resp = await api("/categorias/areas", { token: tok });
      const items: AreaOption[] = (resp.areas ?? []).map((a: any) => ({
        id: a.id,
        nombre: a.area ?? a.nombre,
      }));
      setAreas(items);
    } catch (error: any) {
      console.error("Error al cargar áreas", error);
      showResult(
        "error",
        "Error al cargar áreas",
        error?.message || "No se pudieron obtener las áreas."
      );
    }
  };

  const cargarNiveles = async (tok: string) => {
    try {
      const resp = await api("/categorias/niveles", { token: tok });
      const items: NivelOption[] = (resp.niveles ?? []).map((n: any) => ({
        id: n.id,
        nombre: n.nivel ?? n.nombre,
      }));
      setNiveles(items);
    } catch (error: any) {
      console.error("Error al cargar niveles", error);
      showResult(
        "error",
        "Error al cargar niveles",
        error?.message || "No se pudieron obtener los niveles."
      );
    }
  };

  const cargarResponsablesDisponibles = async (tok: string) => {
    try {
      const resp = await api(
        `/categorias/responsables/disponibles?gestion=${gestion}`,
        { token: tok }
      );
      const items: ResponsableDisponible[] = (resp.usuarios ?? []).map(
        (u: any) => ({
          idUsuario: u.idUsuario ?? u.id,
          nombreCompleto: u.nombreCompleto,
        })
      );
      setResponsablesDisponibles(items);
    } catch (error: any) {
      console.error("Error al cargar responsables disponibles", error);
      showResult(
        "error",
        "Error al cargar responsables",
        error?.message || "No se pudieron obtener los responsables disponibles."
      );
    }
  };

  // =======================
  // Helpers UI
  // =======================

  const labelModalidad = (m: Modalidad) =>
    m === "INDIVIDUAL" ? "Individual" : "Grupal";

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

  const modalidadesDisponiblesFiltro: Modalidad[] = ["INDIVIDUAL", "GRUPAL"];

  // =======================
  // Filtros / búsqueda / paginación
  // =======================

  const categoriasFiltradas = useMemo(() => {
    let lista = [...categorias];

    if (filtroArea !== "TODAS") {
      lista = lista.filter((c) => c.area === filtroArea);
    }

    if (filtroNivel !== "TODOS") {
      lista = lista.filter((c) => c.nivel === filtroNivel);
    }

    if (filtroModalidad !== "TODAS") {
      lista = lista.filter((c) => c.modalidad === filtroModalidad);
    }

    if (terminoBusqueda.trim()) {
      const term = terminoBusqueda.toLowerCase();
      lista = lista.filter((c) => {
        const resp = c.responsable?.toLowerCase() ?? "";
        return (
          c.area.toLowerCase().includes(term) ||
          c.nivel.toLowerCase().includes(term) ||
          labelModalidad(c.modalidad).toLowerCase().includes(term) ||
          resp.includes(term)
        );
      });
    }

    return lista;
  }, [
    categorias,
    filtroArea,
    filtroNivel,
    filtroModalidad,
    terminoBusqueda,
  ]);

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
  // CRUD: responsables
  // =======================

  const iniciarEdicionResponsable = (categoria: CategoriaItem) => {
    setFilaEditando(categoria.idCategoria);
    setResponsablesFila((prev) => ({
      ...prev,
      [categoria.idCategoria]: categoria.responsable ?? "",
    }));
  };

  const handleCambiarResponsableEnFila = (
    idCategoria: number,
    nombre: string
  ) => {
    setResponsablesFila((prev) => ({
      ...prev,
      [idCategoria]: nombre,
    }));

    // Actualizar visualmente en la tabla
    setCategorias((prev) =>
      prev.map((c) =>
        c.idCategoria === idCategoria ? { ...c, responsable: nombre } : c
      )
    );
  };

  const guardarResponsable = async (categoria: CategoriaItem) => {
    if (!token) {
      showResult(
        "error",
        "Sin sesión",
        "No se pudo obtener el token de autenticación."
      );
      return;
    }

    const nombreSeleccionado = responsablesFila[categoria.idCategoria];
    if (!nombreSeleccionado) {
      showResult(
        "error",
        "Responsable no seleccionado",
        "Selecciona un responsable de la lista para esta categoría."
      );
      return;
    }

    const responsable = responsablesDisponibles.find(
      (r) => r.nombreCompleto === nombreSeleccionado
    );

    if (!responsable) {
      showResult(
        "error",
        "Responsable inválido",
        "El responsable seleccionado ya no está disponible."
      );
      return;
    }

    try {
      setSavingResponsableId(categoria.idCategoria);

      await api(`/categorias/${categoria.idCategoria}/responsable`, {
        method: "PUT",
        token,
        body: {
          usuario_id: responsable.idUsuario,
        },
      });

      showResult(
        "success",
        "Responsable asignado",
        `Se asignó a ${nombreSeleccionado} como responsable de ${categoria.area} - ${categoria.nivel} (${labelModalidad(
          categoria.modalidad
        )}).`
      );

      await Promise.all([
        cargarCategorias(token),
        cargarResponsablesDisponibles(token),
      ]);

      setFilaEditando(null);
      setResponsablesFila((prev) => {
        const nuevo = { ...prev };
        delete nuevo[categoria.idCategoria];
        return nuevo;
      });
    } catch (error: any) {
      console.error("Error al asignar responsable", error);
      showResult(
        "error",
        "Error al asignar responsable",
        error?.message || "No se pudo asignar el responsable."
      );
    } finally {
      setSavingResponsableId(null);
    }
  };

  // =======================
  // CRUD: eliminar categoría (soft delete)
  // =======================

  const iniciarEliminarCategoria = (categoria: CategoriaItem) => {
    setDeleteTarget(categoria);
  };

  const confirmarEliminarCategoria = async () => {
    if (!deleteTarget || !token) return;

    try {
      setLoadingDelete(true);

      await api(`/categorias/${deleteTarget.idCategoria}`, {
        method: "DELETE",
        token,
      });

      showResult(
        "success",
        "Categoría eliminada",
        `Se eliminó la categoría ${deleteTarget.area} - ${deleteTarget.nivel} (${labelModalidad(
          deleteTarget.modalidad
        )}).`
      );

      await Promise.all([
        cargarCategorias(token),
        cargarResponsablesDisponibles(token),
      ]);
    } catch (error: any) {
      console.error("Error al eliminar categoría", error);
      showResult(
        "error",
        "Error al eliminar categoría",
        error?.message ||
          "No se pudo eliminar la categoría. Verifica que no tenga participaciones."
      );
    } finally {
      setLoadingDelete(false);
      setDeleteTarget(null);
    }
  };

  // =======================
  // CRUD: crear categoría
  // =======================

  const resetFormularioCrear = () => {
    setNuevaAreaId("");
    setNuevoNivelId("");
    setNuevaModalidad("");
  };

  const abrirModalCrear = () => {
    resetFormularioCrear();
    setModalCrearVisible(true);
  };

  const cerrarModalCrear = () => {
    if (loadingCrear) return;
    setModalCrearVisible(false);
    setConfirmCrearVisible(false);
    resetFormularioCrear();
  };

  const handleSubmitCrearForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaAreaId || !nuevoNivelId || !nuevaModalidad) return;
    setConfirmCrearVisible(true);
  };

  const confirmarCrearCategoria = async () => {
    if (!token) {
      showResult(
        "error",
        "Sin sesión",
        "No se pudo obtener el token de autenticación."
      );
      return;
    }

    try {
      setLoadingCrear(true);

      await api("/categorias", {
        method: "POST",
        token,
        body: {
          area_id: Number(nuevaAreaId),
          nivel_id: Number(nuevoNivelId),
          modalidad: nuevaModalidad,
          // gestion se pone por defecto en el back como año actual
        },
      });

      showResult(
        "success",
        "Categoría creada",
        "La categoría se creó correctamente."
      );

      await cargarCategorias(token);
      await cargarResponsablesDisponibles(token);

      setModalCrearVisible(false);
      setConfirmCrearVisible(false);
      resetFormularioCrear();
    } catch (error: any) {
      console.error("Error al crear categoría", error);
      showResult(
        "error",
        "Error al crear categoría",
        error?.message ||
          "No se pudo crear la categoría. Verifica que no esté duplicada."
      );
    } finally {
      setLoadingCrear(false);
    }
  };

  const botonCrearDeshabilitado =
    !nuevaAreaId || !nuevoNivelId || !nuevaModalidad;

  // =======================
  // Exportar CSV / PDF (solo datos visibles)
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
      "Responsable",
    ];

    const filas = categoriasFiltradas.map((c, idx) => [
      idx + 1,
      c.area,
      c.nivel,
      labelModalidad(c.modalidad),
      c.responsable || "Sin responsable",
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
    enlace.download = "categorias_olimpiada.csv";
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
        <th style="border:1px solid #000;padding:4px;">Responsable</th>
      </tr>
    `;

    const filasHtml = categoriasFiltradas
      .map(
        (c, idx) => `
        <tr>
          <td style="border:1px solid #000;padding:4px;text-align:center;">${
            idx + 1
          }</td>
          <td style="border:1px solid #000;padding:4px;">${c.area}</td>
          <td style="border:1px solid #000;padding:4px;">${c.nivel}</td>
          <td style="border:1px solid #000;padding:4px;text-align:center;">${labelModalidad(
            c.modalidad
          )}</td>
          <td style="border:1px solid #000;padding:4px;">${
            c.responsable || "Sin responsable"
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
          <title>Categorías por área y nivel</title>
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
          <h1>Categorías por área y nivel (gestión ${gestion})</h1>
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
  // Columnas tabla
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
      clave: "responsable" as const,
      titulo: "Responsable",
      alineacion: "izquierda" as const,
      ordenable: true,
      formatearCelda: (valor: string | null, fila: CategoriaItem) => {
        const estaEditando = filaEditando === fila.idCategoria;

        if (estaEditando) {
          const opciones = responsablesDisponibles.map(
            (r) => r.nombreCompleto
          );
          return (
            <div className="flex flex-col items-start gap-1">
              <SelectConBusqueda
                opciones={opciones}
                value={responsablesFila[fila.idCategoria] || ""}
                placeholder="Seleccionar responsable..."
                onChange={(nuevo) =>
                  handleCambiarResponsableEnFila(fila.idCategoria, nuevo)
                }
              />
              {!opciones.length && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  No hay usuarios disponibles sin asignación.
                </span>
              )}
            </div>
          );
        }

        const sinAsignar = !valor;

        return (
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                sinAsignar
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {valor || "Sin responsable"}
            </span>
          </div>
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
              Gestión de categorías
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Administra las categorías por área, nivel y modalidad, y asigna un
              responsable único a cada una. Gestión {gestion}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {cargando && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Cargando datos…
              </span>
            )}
            <button
              type="button"
              onClick={abrirModalCrear}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus-visible:ring-offset-gray-950"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva categoría
            </button>
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

                {/* Filtro modalidad */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Modalidad
                  </label>
                  <select
                    value={filtroModalidad}
                    onChange={(e) => {
                      setFiltroModalidad(e.target.value);
                      setPaginaActual(1);
                    }}
                    className="w-full min-w-[130px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="TODAS">Todas</option>
                    {modalidadesDisponiblesFiltro.map((m) => (
                      <option key={m} value={m}>
                        {labelModalidad(m)}
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
            renderAcciones={(fila: CategoriaItem) => {
              const estaEditando = filaEditando === fila.idCategoria;
              const loadingThisRow =
                savingResponsableId === fila.idCategoria;

              return (
                <div className="flex items-center justify-center gap-2">
                  {/* Guardar responsable */}
                  <button
                    type="button"
                    onClick={() =>
                      estaEditando
                        ? guardarResponsable(fila)
                        : iniciarEdicionResponsable(fila)
                    }
                    className={`inline-flex items-center justify-center rounded-full p-2 text-sm transition ${
                      estaEditando
                        ? "bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    } ${
                      loadingThisRow
                        ? "cursor-not-allowed opacity-70"
                        : ""
                    }`}
                    disabled={loadingThisRow}
                    aria-label={
                      estaEditando
                        ? "Guardar responsable"
                        : "Editar responsable"
                    }
                  >
                    {estaEditando ? (
                      <FiSave className="h-4 w-4" />
                    ) : (
                      <FiEdit3 className="h-4 w-4" />
                    )}
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => iniciarEliminarCategoria(fila)}
                    className="inline-flex items-center justify-center rounded-full bg-red-50 p-2 text-sm text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
                    aria-label="Eliminar categoría"
                  >
                    <FiTrash2 className="h-4 w-4" />
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
            totalRegistros={categoriasFiltradas.length}
            registrosPorPagina={REGISTROS_POR_PAGINA}
            onPaginaChange={setPaginaActual}
          />
        </div>
      </div>

      {/* Modal eliminar categoría */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Eliminar categoría"
        message={
          deleteTarget
            ? `¿Deseas eliminar la categoría "${deleteTarget.area}" - "${deleteTarget.nivel}" (${labelModalidad(
                deleteTarget.modalidad
              )})? Esta acción la desactiva lógicamente.`
            : ""
        }
        onCancel={() => {
          if (!loadingDelete) setDeleteTarget(null);
        }}
        onConfirm={confirmarEliminarCategoria}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
        loading={loadingDelete}
      />

      {/* Modal resultado */}
      <ResultModal
        visible={resultModal.visible}
        type={resultModal.type}
        title={resultModal.title}
        message={resultModal.message}
        onClose={closeResultModal}
      />

      {/* Modal crear categoría (formulario) */}
      {modalCrearVisible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Nueva categoría
                </h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Gestión {gestion}. Los valores de medallas y nota mínima se
                  crean con valores por defecto.
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModalCrear}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <span className="sr-only">Cerrar</span>✕
              </button>
            </div>

            <form onSubmit={handleSubmitCrearForm} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Área
                </label>
                <select
                  value={nuevaAreaId}
                  onChange={(e) => setNuevaAreaId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Seleccionar área</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Nivel
                </label>
                <select
                  value={nuevoNivelId}
                  onChange={(e) => setNuevoNivelId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Seleccionar nivel</option>
                  {niveles.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Modalidad
                </label>
                <select
                  value={nuevaModalidad}
                  onChange={(e) =>
                    setNuevaModalidad(e.target.value as Modalidad | "")
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Seleccionar modalidad</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="GRUPAL">Grupal</option>
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cerrarModalCrear}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={botonCrearDeshabilitado}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 ${
                    botonCrearDeshabilitado
                      ? "cursor-not-allowed bg-brand-300 dark:bg-brand-400/60"
                      : "bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400"
                  }`}
                >
                  Crear categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm modal para crear categoría */}
      <ConfirmModal
        visible={confirmCrearVisible}
        title="Confirmar creación"
        message="¿Deseas crear esta categoría con los datos seleccionados? Se aplicarán los valores por defecto de medallas y nota mínima."
        onCancel={() => {
          if (!loadingCrear) setConfirmCrearVisible(false);
        }}
        onConfirm={confirmarCrearCategoria}
        confirmText="Crear categoría"
        cancelText="Cancelar"
        loading={loadingCrear}
      />
    </div>
  );
};

export default GestionDeCategorias;
