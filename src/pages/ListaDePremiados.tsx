import React, { useState, useMemo } from 'react';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';

interface InscritosItem {
  id: number;
  nombre: string;
  unidadEducativa: string;
}

const ListaDePremiados: React.FC = () => {
  const [datosCompletos] = useState<InscritosItem[]>([
    //agrega datos ficticios 
  ]);


  // 🔎 Busqueda + Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const registrosPorPagina = 7;

  const datosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return datosCompletos;
    const termino = terminoBusqueda.toLowerCase();
    return datosCompletos.filter(item =>
      item.nombre.toLowerCase().includes(termino) ||
      item.unidadEducativa.toLowerCase().includes(termino)
    );
  }, [datosCompletos, terminoBusqueda]);

  return (
    <div className="p-1">
      {/* Título y Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Lista de Premiados</h1>
        <nav className="text-sm text-gray-600">
          <span>Inicio</span> <span className="mx-2">›</span> <span className="text-gray-800">Premiados</span>
        </nav>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-1">
        <BarraBusquedaAreas terminoBusqueda={terminoBusqueda} onBuscarChange={setTerminoBusqueda} />
      </div>

      {/* Aquí iría el contenido de la tabla */}

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

export default ListaDePremiados;