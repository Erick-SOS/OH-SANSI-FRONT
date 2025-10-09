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

  const manejarCambioValor = (id: number, campo: keyof MedallaItem, valor: string) => {
    setValoresEditados(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor
      }
    }));
  };

  const manejarGuardar = (id: number) => {
    if (valoresEditados[id]) {
        // 🔹 Actualizar la fila dentro de datosCompletos
        setDatosCompletos(prev =>
        prev.map(item =>
            item.id === id ? { ...item, ...valoresEditados[id] } : item
        )
        );
        // 🔹 Marcar como guardado
        setValoresGuardados(prev => ({
        ...prev,
        [id]: valoresEditados[id]
        }));
        // 🔹 Limpiar edición
        setValoresEditados(prev => {
        const nuevos = { ...prev };
        delete nuevos[id];
        return nuevos;
        });
    }
    };

  const columnas = [
    { 
        clave: 'areaCompetencia', 
        titulo: 'Área de Competencia', 
        alineacion: 'izquierda' as const 
    },
    { 
        clave: 'nivel', 
        titulo: 'Nivel', 
        alineacion: 'izquierda' as const 
    },
    {
    clave: 'medallasOro',
    titulo: 'Medallas de Oro',
    alineacion: 'centro' as const,
    formatearCelda: (valor: string, fila: MedallaItem) => (
        <input
        type="text"
        value={valoresEditados[fila.id]?.medallasOro ?? valor}
        onChange={(e) => {
            const nuevoValor = e.target.value;
            if (/^\d*$/.test(nuevoValor)) { // ✅ solo números
            manejarCambioValor(fila.id, 'medallasOro', nuevoValor);
            }
        }}
        className={`w-20 text-center border rounded px-2 py-1
            ${valoresEditados[fila.id]?.medallasOro !== undefined && valoresEditados[fila.id]?.medallasOro !== valor
            ? 'border-red-500 bg-red-50'
            : valoresGuardados[fila.id]?.medallasOro !== undefined
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300'}
        `}
        />
    )
    },
    {
    clave: 'medallasPlata',
    titulo: 'Medallas de Plata',
    alineacion: 'centro' as const,
    formatearCelda: (valor: string, fila: MedallaItem) => (
        <input
        type="text"
        value={valoresEditados[fila.id]?.medallasPlata ?? valor}
        onChange={(e) => {
            const nuevoValor = e.target.value;
            if (/^\d*$/.test(nuevoValor)) { // ✅ solo números
            manejarCambioValor(fila.id, 'medallasPlata', nuevoValor);
            }
        }}
        className={`w-20 text-center border rounded px-2 py-1
            ${valoresEditados[fila.id]?.medallasPlata !== undefined && valoresEditados[fila.id]?.medallasPlata !== valor
            ? 'border-red-500 bg-red-50'
            : valoresGuardados[fila.id]?.medallasPlata !== undefined
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300'}
        `}
        />
    )
    },
    {
    clave: 'medallasBronce',
    titulo: 'Medallas de Bronce',
    alineacion: 'centro' as const,
    formatearCelda: (valor: string, fila: MedallaItem) => (
        <input
        type="text"
        value={valoresEditados[fila.id]?.medallasBronce ?? valor}
        onChange={(e) => {
            const nuevoValor = e.target.value;
            if (/^\d*$/.test(nuevoValor)) { // ✅ solo números
            manejarCambioValor(fila.id, 'medallasBronce', nuevoValor);
            }
        }}
        className={`w-20 text-center border rounded px-2 py-1
            ${valoresEditados[fila.id]?.medallasBronce !== undefined && valoresEditados[fila.id]?.medallasBronce !== valor
            ? 'border-red-500 bg-red-50'
            : valoresGuardados[fila.id]?.medallasBronce !== undefined
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300'}
        `}
        />
    )
    },
    {
        clave: 'accion',
        titulo: 'Acción',
        alineacion: 'centro' as const,
        formatearCelda: (_: any, fila: MedallaItem) => (
        <button
            onClick={() => manejarGuardar(fila.id)}
            disabled={!valoresEditados[fila.id]}
            className={`p-2 rounded-md border 
            ${valoresEditados[fila.id] 
                ? 'bg-blue-50 border-blue-400 hover:bg-blue-100' 
                : 'bg-gray-100 border-gray-300 cursor-not-allowed'}
            `}
        >
            <FiSave className={`w-5 h-5 ${valoresEditados[fila.id] ? 'text-blue-600' : 'text-gray-400'}`} />
        </button>
        )
    }
    ];

  // 🔎 Busqueda + Paginación
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
        <h1 className="text-2xl font-bold text-gray-900">Configuración de la cantidad de Medallas Permitidas por Área y Nivel</h1>
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
