// src/pages/Responsables.tsx
import React, { useState, useMemo, useEffect } from "react";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ConfirmarModal from "../components/ui/modal/ConfirmarModal";
import SelectResponsableConBusqueda from "../components/ui/select/SelectConBusqueda";
import { FiTrash2, FiEdit3, FiSave } from "react-icons/fi";

interface Categoria {
  id: number;
  area: string;
  nivel: string;
  modalidad: "Individual" | "Grupal";
  responsable: string;
}

// Lista dummy de responsables (por ahora)
const responsablesDisponibles = [
  "Juan Pérez",
  "María Gómez",
  "Carlos Ruiz",
  "Ana López",
  "Luis Torres",
  "Sofía Martínez",
];

const GestionDeCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([
    {
      id: 1,
      area: "Biología",
      nivel: "Secundaria",
      modalidad: "Individual",
      responsable: "",
    },
    {
      id: 2,
      area: "Matemática",
      nivel: "Primaria",
      modalidad: "Grupal",
      responsable: "Juan Pérez",
    },
    {
      id: 3,
      area: "Física",
      nivel: "Secundaria",
      modalidad: "Individual",
      responsable: "",
    },
    {
      id: 4,
      area: "Química",
      nivel: "Secundaria",
      modalidad: "Individual",
      responsable: "",
    },
    {
      id: 5,
      area: "Historia",
      nivel: "Primaria",
      modalidad: "Grupal",
      responsable: "",
    },
    {
      id: 6,
      area: "Geografía",
      nivel: "Secundaria",
      modalidad: "Individual",
      responsable: "",
    },
  ]);

  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [modalEliminar, setModalEliminar] = useState<number | null>(null);

  // filas que están en modo edición de responsable
  const [editando, setEditando] = useState<Set<number>>(new Set());

  // ---- MODAL CREAR CATEGORÍA ----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmCrear, setShowConfirmCrear] = useState(false);
  const [nuevaArea, setNuevaArea] = useState("");
  const [nuevoNivel, setNuevoNivel] = useState("");
  const [nuevaModalidad, setNuevaModalidad] = useState<
    "" | "Individual" | "Grupal"
  >("");

  const registrosPorPagina = 10;

  const areasDisponibles = useMemo(
    () => Array.from(new Set(categorias.map((c) => c.area))),
    [categorias]
  );

  const nivelesDisponibles = useMemo(
    () => Array.from(new Set(categorias.map((c) => c.nivel))),
    [categorias]
  );

  const resetFormulario = () => {
    setNuevaArea("");
    setNuevoNivel("");
    setNuevaModalidad("");
  };

  // Modalidad automática según área + nivel
  useEffect(() => {
    if (!nuevaArea || !nuevoNivel) {
      setNuevaModalidad("");
      return;
    }
    const existente = categorias.find(
      (c) => c.area === nuevaArea && c.nivel === nuevoNivel
    );
    setNuevaModalidad(existente ? existente.modalidad : "Individual");
  }, [nuevaArea, nuevoNivel, categorias]);

  /* ========= Ordenamiento ========= */
  const handleOrdenar = (columna: string, direccion: "asc" | "desc") => {
    setCategorias((prev) => {
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
    setPaginaActual(1);
  };

  /* ========= Columnas ========= */
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
      formatearCelda: (valor: "Individual" | "Grupal") => (
        <span
          className={`px-4 py-1.5 text-xs font-bold rounded-full ${
            valor === "Individual"
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {valor}
        </span>
      ),
    },
    {
      clave: "responsable" as const,
      titulo: "Responsable",
      alineacion: "centro" as const,
      ordenable: true,
      formatearCelda: (valor: string, fila: Categoria) => {
        const estaEditando = editando.has(fila.id);

        if (estaEditando) {
          return (
            <SelectResponsableConBusqueda
              value={valor || ""}
              opciones={responsablesDisponibles}
              onChange={(nuevo) => {
                setCategorias((prev) =>
                  prev.map((c) =>
                    c.id === fila.id ? { ...c, responsable: nuevo } : c
                  )
                );
                setEditando((s) => {
                  const ns = new Set(s);
                  ns.add(fila.id);
                  return ns;
                });
              }}
            />
          );
        }

        const sinAsignar = !valor;

        return (
          <div className="flex items-center justify-center gap-2">
            <span
              className={
                "font-medium " +
                (sinAsignar ? "text-red-600" : "text-green-600")
              }
            >
              {valor || "Sin asignar"}
            </span>

            <button
              onClick={() =>
                setEditando((s) => {
                  const ns = new Set(s);
                  ns.add(fila.id);
                  return ns;
                })
              }
              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  /* ========= Filtros / búsqueda ========= */
  const datosProcesados = useMemo(() => {
    let datos = [...categorias];
    if (terminoBusqueda.trim()) {
      const t = terminoBusqueda.toLowerCase();
      datos = datos.filter((c) => {
        const responsable = c.responsable?.toLowerCase() ?? "";
        return (
          c.area.toLowerCase().includes(t) ||
          c.nivel.toLowerCase().includes(t) ||
          c.modalidad.toLowerCase().includes(t) ||
          responsable.includes(t)
        );
      });
    }
    return datos;
  }, [categorias, terminoBusqueda]);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return datosProcesados.slice(inicio, inicio + registrosPorPagina);
  }, [datosProcesados, paginaActual]);

  const totalPaginas = Math.ceil(datosProcesados.length / registrosPorPagina);

  /* ========= Eliminar ========= */
  const handleIniciarEliminacion = (id: number) => setModalEliminar(id);

  const confirmarEliminar = () => {
    if (modalEliminar !== null) {
      setCategorias((prev) => prev.filter((c) => c.id !== modalEliminar));
      setModalEliminar(null);
    }
  };

  /* ========= Guardar responsable (acción por fila) ========= */
  const handleGuardar = (id: number) => {
    setEditando((prev) => {
      const ns = new Set(prev);
      ns.delete(id);
      return ns;
    });
    // aquí podrías llamar al back para persistir el responsable
  };

  /* ========= Crear categoría ========= */
  const abrirModalCrear = () => {
    resetFormulario();
    setIsModalOpen(true);
  };

  const cerrarModalCrear = () => {
    setIsModalOpen(false);
    setShowConfirmCrear(false);
    resetFormulario();
  };

  const handleCrearCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaArea || !nuevoNivel || !nuevaModalidad) return;
    setShowConfirmCrear(true);
  };

  const confirmarCrearCategoria = () => {
    const nuevaCategoria: Categoria = {
      id: categorias.length + 1,
      area: nuevaArea,
      nivel: nuevoNivel,
      modalidad: nuevaModalidad as "Individual" | "Grupal",
      responsable: "",
    };

    setCategorias((prev) => [...prev, nuevaCategoria]);
    setShowConfirmCrear(false);
    setIsModalOpen(false);
    resetFormulario();
  };

  const cancelarConfirmCrear = () => setShowConfirmCrear(false);

  const botonCrearDeshabilitado =
    !nuevaArea || !nuevoNivel || !nuevaModalidad;

  /* ========= Render ========= */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías de competición</h1>
      </div>

      {/* BÚSQUEDA + BOTÓN */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <BarraBusquedaAreas
            terminoBusqueda={terminoBusqueda}
            onBuscarChange={setTerminoBusqueda}
          />
        </div>

        <button
          onClick={abrirModalCrear}
          className="self-end inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nueva categoría
        </button>
      </div>

      {/* TABLA */}
      <TablaBase
        datos={datosPaginados}
        columnas={columnas}
        conOrdenamiento
        onOrdenar={handleOrdenar}
        conAcciones
        renderAcciones={(fila: Categoria) => {
          const estaEditando = editando.has(fila.id);

          return (
            <div className="flex items-center justify-center gap-3">
              {estaEditando && (
                <button
                  onClick={() => handleGuardar(fila.id)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                >
                  <FiSave className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleIniciarEliminacion(fila.id)}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          );
        }}
      />

      {/* PAGINACIÓN */}
      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={datosProcesados.length}
        registrosPorPagina={registrosPorPagina}
        onPaginaChange={setPaginaActual}
      />

      {/* MODAL ELIMINAR */}
      <ConfirmarModal
        isOpen={!!modalEliminar}
        titulo="Eliminar categoría"
        mensaje="¿Deseas eliminar esta categoría?"
        onCancelar={() => setModalEliminar(null)}
        onConfirmar={confirmarEliminar}
      />

      {/* MODAL CREAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Nueva categoría</h2>
              <button onClick={cerrarModalCrear}>✕</button>
            </div>

            <form onSubmit={handleCrearCategoria} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Área</label>
                <select
                  value={nuevaArea}
                  onChange={(e) => setNuevaArea(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                >
                  <option value="">Seleccionar área</option>
                  {areasDisponibles.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Nivel</label>
                <select
                  value={nuevoNivel}
                  onChange={(e) => setNuevoNivel(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                >
                  <option value="">Seleccionar nivel</option>
                  {nivelesDisponibles.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Modalidad</label>
                <input
                  value={nuevaModalidad}
                  readOnly
                  className="w-full border px-3 py-2 rounded-lg bg-gray-100 mt-1"
                  placeholder="Automática"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalCrear}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={botonCrearDeshabilitado}
                  className={`px-4 py-2 rounded-lg text-white ${
                    botonCrearDeshabilitado
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN CREAR */}
      {showConfirmCrear && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold">Confirmar creación</h3>
            <p className="mt-2 text-gray-600">
              ¿Deseas crear esta categoría con los datos seleccionados?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelarConfirmCrear}
                className="px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCrearCategoria}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDeCategorias;
