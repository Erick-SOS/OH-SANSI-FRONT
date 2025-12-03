// src/pages/CantidadDeMedallas.tsx
import React, { useState, useMemo, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import TablaBase from "../components/tables/TablaBase";
import Paginacion from "../components/ui/Paginacion";
import BarraBusquedaAreas from "../components/tables/BarraBusqueda";
import ConfirmModal from "../components/modals/ConfirmModal";
import ResultModal from "../components/modals/ResultModal";
import { api } from "../api";

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

const CantidadDeMedallas: React.FC = () => {
  const [datosCompletos, setDatosCompletos] = useState<MedallaItem[]>([]);
  const [cargando, setCargando] = useState(false);

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

  const cerrarResultModal = () =>
    setResultModal((prev) => ({ ...prev, visible: false }));

  // 🔹 Cargar datos desde el backend
  const cargarDatos = async () => {
    try {
      setCargando(true);
      const resp = await api("/parametrizacion-medallas");
      // resp: { ok, total, data: FilaParametrizacionMedallasDTO[] }
      const items: MedallaItem[] = (resp.data ?? []).map(
        (fila: any, index: number) => ({
          id: index + 1,
          areaId: fila.areaId,
          nivelId: fila.nivelId,
          areaCompetencia: fila.areaNombre,
          nivel: fila.nivelNombre,
          medallasOro: String(fila.oros ?? 0),
          medallasPlata: String(fila.platas ?? 0),
          medallasBronce: String(fila.bronces ?? 0),
          notaMinimaAprobacion: String(fila.notaMinAprobacion ?? 0),
        })
      );
      setDatosCompletos(items);
      setValoresEditados({});
      setValoresGuardados({});
      setErrores({});
    } catch (error: any) {
      console.error(error);
      setResultModal({
        visible: true,
        type: "error",
        title: "Error al cargar",
        message: error?.message || "No se pudo obtener la configuración.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🔹 Validaciones de inputs
  const validarYActualizar = (
    id: number,
    campo: keyof MedallaItem,
    valor: string
  ) => {
    const num = parseInt(valor, 10);

    // Validación común para medallas: mínimo 1
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

    // Validación para nota mínima
    if (campo === "notaMinimaAprobacion") {
      if (isNaN(num) || num < 1 || num > 100) {
        setErrores((prev) => ({
          ...prev,
          [id]: { ...prev[id], [campo]: "Debe estar entre 1 y 100" },
        }));
        return;
      }
    }

    // Validación general: máximo 100 (para todos los campos numéricos)
    if (!isNaN(num) && num > 100) {
      setErrores((prev) => ({
        ...prev,
        [id]: { ...prev[id], [campo]: "Máximo 100" },
      }));
      return;
    }

    // Si pasa todas las validaciones
    setErrores((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: undefined },
    }));

    setValoresEditados((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));
  };

  // 🔹 Abrir modal de confirmación al intentar guardar
  const manejarClickGuardar = (fila: MedallaItem) => {
    const erroresFila = errores[fila.id];
    if (erroresFila && Object.values(erroresFila).some((msg) => msg)) return;
    if (!valoresEditados[fila.id]) return; // nada que guardar

    setFilaSeleccionada(fila);
    setMostrarConfirm(true);
  };

  // 🔹 Confirmar y llamar al backend (PUT)
  const confirmarGuardar = async () => {
    if (!filaSeleccionada) return;
    const fila = filaSeleccionada;

    const cambios = valoresEditados[fila.id] || {};
    const filaFinal: MedallaItem = {
      ...fila,
      ...cambios,
    };

    const oros = Number(filaFinal.medallasOro);
    const platas = Number(filaFinal.medallasPlata);
    const bronces = Number(filaFinal.medallasBronce);
    const notaMinAprobacion = Number(filaFinal.notaMinimaAprobacion);

    try {
      setGuardando(true);

      await api(`/parametrizacion-medallas/${fila.areaId}/${fila.nivelId}`, {
        method: "PUT",
        body: {
          oros,
          platas,
          bronces,
          menciones: 0, // por ahora fijo en 0, luego puedes parametrizarlo
          notaMinAprobacion,
        },
      });

      // Actualizar estado local
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

      setResultModal({
        visible: true,
        type: "success",
        title: "Cambios guardados",
        message: `Se guardó la configuración para ${filaFinal.areaCompetencia} - ${filaFinal.nivel}.`,
      });
    } catch (error: any) {
      console.error(error);
      setResultModal({
        visible: true,
        type: "error",
        title: "Error al guardar",
        message: error?.message || "No se pudo guardar la configuración.",
      });
    } finally {
      setGuardando(false);
      setMostrarConfirm(false);
      setFilaSeleccionada(null);
    }
  };

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
            w-20 text-center rounded-lg border px-3 py-2 font-medium transition-all
            ${
              error
                ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                : editado
                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                : guardado
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            }
          `}
        />
        {error && (
          <span className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  };

  const columnas = [
    { clave: "areaCompetencia", titulo: "Área", alineacion: "izquierda" as const },
    { clave: "nivel", titulo: "Nivel", alineacion: "izquierda" as const },
    {
      clave: "medallasOro",
      titulo: "Oro",
      alineacion: "centro" as const,
      formatearCelda: (valor: string, fila: MedallaItem) =>
        renderInput(fila, "medallasOro", valor),
    },
    {
      clave: "medallasPlata",
      titulo: "Plata",
      alineacion: "centro" as const,
      formatearCelda: (valor: string, fila: MedallaItem) =>
        renderInput(fila, "medallasPlata", valor),
    },
    {
      clave: "medallasBronce",
      titulo: "Bronce",
      alineacion: "centro" as const,
      formatearCelda: (valor: string, fila: MedallaItem) =>
        renderInput(fila, "medallasBronce", valor),
    },
    {
      clave: "notaMinimaAprobacion",
      titulo: "Nota Mín. Aprobación",
      alineacion: "centro" as const,
      formatearCelda: (valor: string, fila: MedallaItem) =>
        renderInput(fila, "notaMinimaAprobacion", valor),
    },
    {
      clave: "accion",
      titulo: "Guardar",
      alineacion: "centro" as const,
      formatearCelda: (_: any, fila: MedallaItem) => {
        const tieneCambios = !!valoresEditados[fila.id];
        const tieneErrores =
          errores[fila.id] &&
          Object.values(errores[fila.id]).some((msg) => Boolean(msg));

        return (
          <button
            onClick={() => manejarClickGuardar(fila)}
            disabled={!tieneCambios || !!tieneErrores || cargando}
            className={`
              p-3 rounded-full transition-all transform hover:scale-110
              ${
                tieneCambios && !tieneErrores
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            <FiSave className="w-5 h-5" />
          </button>
        );
      },
    },
  ];

  // Búsqueda y paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const registrosPorPagina = 8;

  const datosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return datosCompletos;
    const term = terminoBusqueda.toLowerCase();
    return datosCompletos.filter(
      (item) =>
        item.areaCompetencia.toLowerCase().includes(term) ||
        item.nivel.toLowerCase().includes(term)
    );
  }, [datosCompletos, terminoBusqueda]);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return datosFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [datosFiltrados, paginaActual]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Configuración de Medallas y Nota Mínima
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Define cuántas medallas se entregan por área/nivel y la nota mínima para aprobar.
            </p>
          </div>
          {cargando && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Cargando...
            </span>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-5 mb-6">
          <BarraBusquedaAreas
            terminoBusqueda={terminoBusqueda}
            onBuscarChange={setTerminoBusqueda}
          />
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <TablaBase
            datos={datosPaginados}
            columnas={columnas}
            conOrdenamiento={false}
            conAcciones={false}
            className="text-sm"
          />
        </div>

        {/* Paginación */}
        <div className="mt-6 flex justify-center">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={Math.ceil(
              datosFiltrados.length / registrosPorPagina
            )}
            totalRegistros={datosFiltrados.length}
            registrosPorPagina={registrosPorPagina}
            onPaginaChange={setPaginaActual}
          />
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
};

export default CantidadDeMedallas;
