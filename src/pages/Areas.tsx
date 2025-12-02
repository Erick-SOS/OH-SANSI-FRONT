// src/pages/Areas.tsx
import React, { useState, useEffect, useMemo } from "react";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import EliminarFilaModal from "../components/ui/modal/EliminarFilaModal";
import AgregarModal from "../components/ui/modal/AgregarModal";
import ResultModal from "../components/modals/ResultModal";
import { api } from "../api";

/* ================= Tipos ================= */

export interface AreaDto {
  id: number;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  estado: boolean;
  modalidad: "Individual" | "Grupal" | string;
}

const REGISTROS_POR_PAGINA = 7;

/* ================= Componente ================= */

const Areas: React.FC = () => {
  const [datosAreas, setDatosAreas] = useState<AreaDto[]>([]);
  const [busquedaAreas, setBusquedaAreas] = useState("");
  const [paginaAreas, setPaginaAreas] = useState(1);
  const [loadingListado, setLoadingListado] = useState(false);

  const [, setOrdenColumna] = useState<string | null>(null);
  const [, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    id: number | null;
    nombre: string;
  }>({ isOpen: false, id: null, nombre: "" });

  const [modalAgregar, setModalAgregar] = useState(false);
  const [areaEditando, setAreaEditando] = useState<AreaDto | null>(null);

  // Modal de resultado (éxito / error)
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

  /* ========= Cargar áreas desde el backend ========= */

  const cargarAreas = async () => {
    setLoadingListado(true);
    try {
      const resp = (await api("/areas")) as any;

      // Por si el back devuelve { items: [...] } o directamente el array
      const data: any[] = resp.items ?? resp.data ?? resp ?? [];

      const mapped: AreaDto[] = data.map((item: any) => ({
        id: item.id,
        nombre: item.nombre,
        codigo: item.codigo ?? null,
        descripcion: item.descripcion ?? null,
        estado: item.estado ?? true,
        // Normalizamos para mostrar siempre "Individual" / "Grupal"
        modalidad:
          item.modalidad === "GRUPAL" || item.modalidad === "Grupal"
            ? "Grupal"
            : item.modalidad === "INDIVIDUAL" || item.modalidad === "Individual"
            ? "Individual"
            : item.modalidad ?? "Individual",
      }));

      setDatosAreas(mapped);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las áreas.";
      showResult("error", "Error al cargar", msg);
    } finally {
      setLoadingListado(false);
    }
  };

  useEffect(() => {
    void cargarAreas();
  }, []);

  /* ========= Ordenamiento ========= */

  const handleOrdenar = (columna: string, direccion: "asc" | "desc") => {
    setOrdenColumna(columna);
    setOrdenDireccion(direccion);
    setDatosAreas((prev) => {
      const sorted = [...prev];
      sorted.sort((a, b) => {
        const valA = (a as any)[columna];
        const valB = (b as any)[columna];
        if (typeof valA === "string" && typeof valB === "string") {
          return direccion === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return 0;
      });
      return sorted;
    });
  };

  /* ========= Búsqueda y paginación ========= */

  const areasFiltradas = useMemo(() => {
    if (!busquedaAreas.trim()) return datosAreas;
    const term = busquedaAreas.toLowerCase();
    return datosAreas.filter((item) => {
      const area = item.nombre?.toLowerCase() ?? "";
      const codigo = item.codigo?.toLowerCase() ?? "";
      const descripcion = item.descripcion?.toLowerCase() ?? "";
      const modalidad = item.modalidad?.toString().toLowerCase() ?? "";
      return (
        area.includes(term) ||
        codigo.includes(term) ||
        descripcion.includes(term) ||
        modalidad.includes(term)
      );
    });
  }, [datosAreas, busquedaAreas]);

  const areasPaginadas = useMemo(() => {
    const inicio = (paginaAreas - 1) * REGISTROS_POR_PAGINA;
    return areasFiltradas.slice(inicio, inicio + REGISTROS_POR_PAGINA);
  }, [areasFiltradas, paginaAreas]);

  /* ========= Handlers de UI ========= */

  const handleEliminarArea = (id: number, nombre: string) => {
    setModalEliminar({ isOpen: true, id, nombre });
  };

  const confirmarEliminacion = async () => {
    if (modalEliminar.id === null) return;

    try {
      const resp = (await api(`/areas/${modalEliminar.id}`, {
        method: "DELETE",
      })) as { mensaje?: string };

      setDatosAreas((prev) =>
        prev.filter((item) => item.id !== modalEliminar.id)
      );

      showResult(
        "success",
        "Área eliminada",
        resp.mensaje ||
          `El área "${modalEliminar.nombre}" se eliminó correctamente.`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo eliminar el área.";
      showResult("error", "Error al eliminar", msg);
    } finally {
      setModalEliminar({ isOpen: false, id: null, nombre: "" });
    }
  };

  const cancelarEliminacion = () => {
    setModalEliminar({ isOpen: false, id: null, nombre: "" });
  };

  const abrirModal = () => {
    setAreaEditando(null); // modo agregar
    setModalAgregar(true);
  };

  const cerrarModal = () => {
    setModalAgregar(false);
    setAreaEditando(null);
  };

  const handleEditarArea = (fila: AreaDto) => {
    setAreaEditando(fila);
    setModalAgregar(true);
  };

  /* ========= Guardar (agregar / editar) ========= */

  const confirmarAgregar = async (formData: {
    nombre: string;
    codigo: string;
    descripcion: string;
    modalidad: "Individual" | "Grupal";
  }) => {
    try {
      if (areaEditando) {
        // EDITAR
        const actualizado = (await api(`/areas/${areaEditando.id}`, {
          method: "PUT",
          body: formData,
        })) as any;

        const normalizado: AreaDto = {
          id: actualizado.id,
          nombre: actualizado.nombre,
          codigo: actualizado.codigo ?? null,
          descripcion: actualizado.descripcion ?? null,
          estado: actualizado.estado ?? true,
          modalidad:
            actualizado.modalidad === "GRUPAL" ||
            actualizado.modalidad === "Grupal"
              ? "Grupal"
              : actualizado.modalidad === "INDIVIDUAL" ||
                actualizado.modalidad === "Individual"
              ? "Individual"
              : actualizado.modalidad ?? "Individual",
        };

        setDatosAreas((prev) =>
          prev.map((a) => (a.id === normalizado.id ? normalizado : a))
        );

        showResult(
          "success",
          "Área actualizada",
          `El área "${normalizado.nombre}" se actualizó correctamente.`
        );
      } else {
        // AGREGAR
        const creado = (await api("/areas", {
          method: "POST",
          body: formData,
        })) as any;

        const normalizado: AreaDto = {
          id: creado.id,
          nombre: creado.nombre,
          codigo: creado.codigo ?? null,
          descripcion: creado.descripcion ?? null,
          estado: creado.estado ?? true,
          modalidad:
            creado.modalidad === "GRUPAL" || creado.modalidad === "Grupal"
              ? "Grupal"
              : creado.modalidad === "INDIVIDUAL" ||
                creado.modalidad === "Individual"
              ? "Individual"
              : creado.modalidad ?? "Individual",
        };

        setDatosAreas((prev) => [...prev, normalizado]);

        showResult(
          "success",
          "Área creada",
          `El área "${normalizado.nombre}" se creó correctamente.`
        );
      }

      cerrarModal();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo guardar el área.";
      showResult("error", "Error al guardar", msg);
    }
  };

  /* ========= Columnas ========= */

  const columnas = [
    {
      clave: "nombre" as const,
      titulo: "Área",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "codigo" as const,
      titulo: "Código",
      alineacion: "centro" as const,
      ordenable: true,
    },
    {
      clave: "descripcion" as const,
      titulo: "Descripción",
      alineacion: "izquierda" as const,
      ordenable: true,
    },
    {
      clave: "modalidad" as const,
      titulo: "Modalidad",
      alineacion: "centro" as const,
      ordenable: true,
    },
  ];

  const renderAcciones = (fila: AreaDto) => (
    <div className="flex justify-center gap-2">
      <button
        onClick={() => handleEditarArea(fila)}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
      <button
        onClick={() => handleEliminarArea(fila.id, fila.nombre)}
        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );

  /* ========= Render ========= */

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-gray-900">
      <div className="mb-12">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:mb-0">
            Lista de Áreas
          </h1>
        </div>

        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <BarraBusquedaAreas
                terminoBusqueda={busquedaAreas}
                onBuscarChange={(t) => {
                  setBusquedaAreas(t);
                  setPaginaAreas(1);
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              {loadingListado && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cargando áreas...
                </p>
              )}
              <button
                onClick={abrirModal}
                className="inline-flex items-center rounded-lg bg-[#465FFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a4fe6]"
              >
                Agregar Área
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800 dark:shadow-gray-700">
          <TablaBase
            datos={areasPaginadas}
            columnas={columnas}
            conOrdenamiento
            onOrdenar={handleOrdenar}
            conAcciones
            renderAcciones={renderAcciones}
          />
        </div>

        <div className="mt-4">
          <Paginacion
            paginaActual={paginaAreas}
            totalPaginas={Math.max(
              1,
              Math.ceil(areasFiltradas.length / REGISTROS_POR_PAGINA)
            )}
            totalRegistros={areasFiltradas.length}
            registrosPorPagina={REGISTROS_POR_PAGINA}
            onPaginaChange={setPaginaAreas}
          />
        </div>
      </div>

      {/* Modal eliminar */}
      <EliminarFilaModal
        isOpen={modalEliminar.isOpen}
        onCancelar={cancelarEliminacion}
        onConfirmar={confirmarEliminacion}
        tipo="Area"
        nombre={modalEliminar.nombre}
      />

      {/* Modal agregar / editar */}
      <AgregarModal
        isOpen={modalAgregar}
        onClose={cerrarModal}
        onConfirm={confirmarAgregar}
        tipo="Área"
        modo={areaEditando ? "editar" : "agregar"}
        initialData={
          areaEditando
            ? {
                nombre: areaEditando.nombre,
                codigo: areaEditando.codigo ?? "",
                descripcion: areaEditando.descripcion ?? "",
                modalidad:
                  (areaEditando.modalidad as "Individual" | "Grupal") ??
                  "Individual",
              }
            : undefined
        }
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
};

export default Areas;
