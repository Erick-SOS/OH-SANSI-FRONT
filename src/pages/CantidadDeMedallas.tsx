import React, { useState, useMemo } from 'react';
import { FiSave } from "react-icons/fi";
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';

interface MedallaItem {
  id: number;
  areaCompetencia: string;
  nivel: string;
  medallasOro: string;
  medallasPlata: string;
  medallasBronce: string;
  notaMinimaAprobacion: string; // Nueva columna
}

const CantidadDeMedallas: React.FC = () => {
  const [datosCompletos, setDatosCompletos] = useState<MedallaItem[]>([
    { id: 1, areaCompetencia: "Matemáticas", nivel: "Secundaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20", notaMinimaAprobacion: "60" },
    { id: 2, areaCompetencia: "Ciencias Sociales", nivel: "Secundaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20", notaMinimaAprobacion: "60" },
    { id: 3, areaCompetencia: "Física", nivel: "Secundaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20", notaMinimaAprobacion: "65" },
    { id: 4, areaCompetencia: "Química", nivel: "Secundaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20", notaMinimaAprobacion: "60" },
    { id: 5, areaCompetencia: "Matemáticas", nivel: "Primaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20", notaMinimaAprobacion: "55" },
  ]);

  const [valoresEditados, setValoresEditados] = useState<Record<number, Partial<MedallaItem>>>({});
  const [valoresGuardados, setValoresGuardados] = useState<Record<number, Partial<MedallaItem>>>({});
  const [errores, setErrores] = useState<Record<number, Partial<Record<keyof MedallaItem, string>>>>({});

  const validarYActualizar = (id: number, campo: keyof MedallaItem, valor: string) => {
    const num = parseInt(valor, 10);

    // Validación común para medallas: mínimo 1
    if (campo.startsWith('medallas') && (isNaN(num) || num < 1)) {
      setErrores(prev => ({
        ...prev,
        [id]: { ...prev[id], [campo]: 'Mínimo 1 medalla' }
      }));
      return;
    }

    // Validación para nota mínima
    if (campo === 'notaMinimaAprobacion') {
      if (isNaN(num) || num < 1 || num > 100) {
        setErrores(prev => ({
          ...prev,
          [id]: { ...prev[id], [campo]: 'Debe estar entre 1 y 100' }
        }));
        return;
      }
    }

    // Validación general: máximo 100 (para todos los campos numéricos)
    if (!isNaN(num) && num > 100) {
      setErrores(prev => ({
        ...prev,
        [id]: { ...prev[id], [campo]: 'Máximo 100' }
      }));
      return;
    }

    // Si pasa todas las validaciones
    setErrores(prev => ({
      ...prev,
      [id]: { ...prev[id], [campo]: undefined }
    }));

    setValoresEditados(prev => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor }
    }));
  };

  const manejarGuardar = (id: number) => {
    const erroresFila = errores[id];
    if (erroresFila && Object.values(erroresFila).some(msg => msg)) return;

    if (valoresEditados[id]) {
      setDatosCompletos(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...valoresEditados[id] } : item
        )
      );

      setValoresGuardados(prev => ({
        ...prev,
        [id]: valoresEditados[id]
      }));

      setValoresEditados(prev => {
        const nuevo = { ...prev };
        delete nuevo[id];
        return nuevo;
      });
    }
    1
  };

  const renderInput = (fila: MedallaItem, campo: keyof MedallaItem, valorActual: string) => {
    const valorMostrado = valoresEditados[fila.id]?.[campo] ?? valorActual;
    const error = errores[fila.id]?.[campo];
    const editado = valoresEditados[fila.id]?.[campo] !== undefined;
    const guardado = valoresGuardados[fila.id]?.[campo] !== undefined;

    return (
      <div className="flex flex-col items-center">
        <input
          type="number"
          min={campo === 'notaMinimaAprobacion' ? 1 : 1}
          max={100}
          value={valorMostrado}
          onChange={(e) => validarYActualizar(fila.id, campo, e.target.value)}
          className={`
            w-20 text-center rounded-lg border px-3 py-2 font-medium transition-all
            ${error
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              : editado
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : guardado
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
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
    { clave: 'areaCompetencia', titulo: 'Área', alineacion: 'izquierda' as const },
    { clave: 'nivel', titulo: 'Nivel', alineacion: 'izquierda' as const },
    {
      clave: 'medallasOro',
      titulo: 'Oro',
      alineacion: 'centro' as const,
      formatearCelda: (valor: string, fila: MedallaItem) => renderInput(fila, 'medallasOro', valor)
    },
    {
      clave: 'medallasPlata',
      titulo: 'Plata',
      alineacion: 'centro' as const,
      formatearCelda: (valor: string, fila: MedallaItem) => renderInput(fila, 'medallasPlata', valor)
    },
    {
      clave: 'medallasBronce',
      titulo: 'Bronce',
      alineacion: 'centro' as const,
      formatearCelda: (valor: string, fila: MedallaItem) => renderInput(fila, 'medallasBronce', valor)
    },
    {
      clave: 'notaMinimaAprobacion',
      titulo: 'Nota Mín. Aprobación',
      alineacion: 'centro' as const,
      formatearCelda: (valor: string, fila: MedallaItem) => renderInput(fila, 'notaMinimaAprobacion', valor)
    },
    {
      clave: 'accion',
      titulo: 'Guardar',
      alineacion: 'centro' as const,
      formatearCelda: (_: any, fila: MedallaItem) => {
        const tieneCambios = !!valoresEditados[fila.id];
        const tieneErrores = errores[fila.id] && Object.values(errores[fila.id]).some(Boolean);

        return (
          <button
            onClick={() => manejarGuardar(fila.id)}
            disabled={!tieneCambios || tieneErrores}
            className={`
              p-3 rounded-full transition-all transform hover:scale-110
              ${tieneCambios && !tieneErrores
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <FiSave className="w-5 h-5" />
          </button>
        );
      }
    }
  ];

  // Búsqueda y paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const registrosPorPagina = 8;

  const datosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return datosCompletos;
    const term = terminoBusqueda.toLowerCase();
    return datosCompletos.filter(item =>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configuración de Medallas y Nota Mínima
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Define cuántas medallas se entregan por área/nivel y la nota mínima para aprobar
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-5 mb-6">
          <BarraBusquedaAreas terminoBusqueda={terminoBusqueda} onBuscarChange={setTerminoBusqueda} />
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
            totalPaginas={Math.ceil(datosFiltrados.length / registrosPorPagina)}
            totalRegistros={datosFiltrados.length}
            registrosPorPagina={registrosPorPagina}
            onPaginaChange={setPaginaActual}
          />
        </div>
      </div>
    </div>
  );
};

export default CantidadDeMedallas;