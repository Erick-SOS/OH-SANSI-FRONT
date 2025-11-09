import React, { useState, useMemo } from 'react';
import { FiSave } from "react-icons/fi"; // 👈 icono de guardado
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
}

const CantidadDeMedallas: React.FC = () => {
  const [datosCompletos, setDatosCompletos] = useState<MedallaItem[]>([
    { id: 1, areaCompetencia: "Matemáticas", nivel: "Secundaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20" },
    { id: 2, areaCompetencia: "Ciencias Sociales", nivel: "Secundaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20" },
    { id: 3, areaCompetencia: "Física", nivel: "Secundaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20" },
    { id: 4, areaCompetencia: "Química", nivel: "Secundaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20" },
    { id: 5, areaCompetencia: "Matemáticas", nivel: "Primaria", medallasOro: "20", medallasPlata: "20", medallasBronce: "20" },
  ]);

  const [valoresEditados, setValoresEditados] = useState<Record<number, Partial<MedallaItem>>>({});
  const [valoresGuardados, setValoresGuardados] = useState<Record<number, Partial<MedallaItem>>>({});
  const [errores, setErrores] = useState<Record<number, Partial<Record<keyof MedallaItem, string>>>>({});

  const manejarCambioValor = (id: number, campo: keyof MedallaItem, valor: string) => {
    if (/^\d*$/.test(valor)) { // Solo números
      const numero = parseInt(valor, 10);

      // ⚠️ Validación con mensaje de error
      if (numero > 100) {
        setErrores(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            [campo]: 'El valor máximo permitido es 100.'
          }
        }));
        return; // Bloquea escribir más allá de 100
      }

      // Si está dentro del rango permitido
      setErrores(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [campo]: ''
        }
      }));

      setValoresEditados(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [campo]: valor
        }
      }));
    }
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
        const nuevos = { ...prev };
        delete nuevos[id];
        return nuevos;
      });
    }
  };

  const renderInput = (fila: MedallaItem, campo: keyof MedallaItem, valor: string) => {
    const errorCampo = errores[fila.id]?.[campo];
    const valorMostrado = valoresEditados[fila.id]?.[campo] ?? valor;

    const estaEditado = valoresEditados[fila.id]?.[campo] !== undefined &&
      valoresEditados[fila.id]?.[campo] !== valor;
    const estaGuardado = valoresGuardados[fila.id]?.[campo] !== undefined;

    return (
      <div className="flex flex-col items-center">
        <input
          type="number"
          min={0}
          max={100}
          value={valorMostrado}
          onChange={(e) => manejarCambioValor(fila.id, campo, e.target.value)}
          className={`w-20 text-center border rounded px-2 py-1
            ${errorCampo
              ? 'border-red-500 bg-red-50'
              : estaEditado
              ? 'border-red-500 bg-red-50'
              : estaGuardado
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300'}
          `}
        />
        {errorCampo && (
          <span className="text-xs text-red-600 mt-1 text-center">
            {errorCampo}
          </span>
        )}
      </div>
    );
  };

  const columnas = [
    { clave: 'areaCompetencia', titulo: 'Área de Competencia', alineacion: 'izquierda' as const },
    { clave: 'nivel', titulo: 'Nivel', alineacion: 'izquierda' as const },
    {
      clave: 'medallasOro',
      titulo: 'Medallas de Oro',
      alineacion: 'centro' as const,
      formatearCelda: (valor: string, fila: MedallaItem) => renderInput(fila, 'medallasOro', valor)
    },
    {
      clave: 'medallasPlata',
      titulo: 'Medallas de Plata',
      alineacion: 'centro' as const,
      formatearCelda: (valor: string, fila: MedallaItem) => renderInput(fila, 'medallasPlata', valor)
    },
    {
      clave: 'medallasBronce',
      titulo: 'Medallas de Bronce',
      alineacion: 'centro' as const,
      formatearCelda: (valor: string, fila: MedallaItem) => renderInput(fila, 'medallasBronce', valor)
    },
    {
      clave: 'accion',
      titulo: 'Acción',
      alineacion: 'centro' as const,
      formatearCelda: (_: any, fila: MedallaItem) => {
        const erroresFila = errores[fila.id];
        const tieneErrores = erroresFila && Object.values(erroresFila).some(msg => msg);
        const puedeGuardar = !!valoresEditados[fila.id] && !tieneErrores;

        return (
          <button
            onClick={() => manejarGuardar(fila.id)}
            disabled={!puedeGuardar}
            className={`p-2 rounded-md border 
              ${puedeGuardar
                ? 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                : 'bg-gray-100 border-gray-300 cursor-not-allowed'}
            `}
          >
            <FiSave className={`w-5 h-5 ${puedeGuardar ? 'text-blue-600' : 'text-gray-400'}`} />
          </button>
        );
      }
    }
  ];

  // 🔎 Búsqueda + Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const registrosPorPagina = 7;

  const datosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return datosCompletos;
    const termino = terminoBusqueda.toLowerCase();
    return datosCompletos.filter(item =>
      item.areaCompetencia.toLowerCase().includes(termino) ||
      item.nivel.toLowerCase().includes(termino)
    );
  }, [datosCompletos, terminoBusqueda]);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return datosFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [datosFiltrados, paginaActual]);

  return (
    <div className="p-1">
      {/* Título y Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Configuración de la cantidad de Medallas Permitidas por Área y Nivel
        </h1>
        <nav className="text-sm text-gray-600">
          <span>Inicio</span> <span className="mx-2">›</span> <span className="text-gray-800">Medallas</span>
        </nav>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-1">
        <BarraBusquedaAreas terminoBusqueda={terminoBusqueda} onBuscarChange={setTerminoBusqueda} />
      </div>

      {/* Tabla */}
      <TablaBase
        datos={datosPaginados}
        columnas={columnas}
        conOrdenamiento={false}
        conAcciones={false}
        className="bg-white border border-gray-200"
      />

      {/* Paginación */}
      <div className="mt-1">
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={Math.ceil(datosFiltrados.length / registrosPorPagina)}
          totalRegistros={datosFiltrados.length}
          registrosPorPagina={registrosPorPagina}
          onPaginaChange={setPaginaActual}
        />
      </div>
    </div>
  );
};

export default CantidadDeMedallas;
