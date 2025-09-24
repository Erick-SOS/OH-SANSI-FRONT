import React, { useState, useMemo } from 'react';
import TablaAreasNiveles from '../components/tables/TablaAreasNiveles';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusquedaAreas';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarAreaYNivelModal from '../components/ui/modal/AgregarAreaYNivelModal';


interface AreaNivel {
  id: number;
  area: string;
  nivel: string;
  responsable: string;
  modalidad: string;
  seleccionado: boolean;
}

const AreasYNiveles: React.FC = () => {
  const [datosCompletos, setDatosCompletos] = useState<AreaNivel[]>([
    {
      id: 1,
      area: "Matematicas",
      nivel: "Secundaria",
      responsable: "Ivan Espinoza Vargas",
      modalidad: "Grupal",
      seleccionado: false
    },
    {
      id: 2,
      area: "Matematicas",
      nivel: "Secundaria", 
      responsable: "Lucas Gamboas",
      modalidad: "Individual",
      seleccionado: false
    },
    {
      id: 3,
      area: "Matematicas",
      nivel: "Secundaria",
      responsable: "Ivan Espinoza Vargas",
      modalidad: "Grupal",
      seleccionado: false
    },
    {
      id: 4,
      area: "Ciencias",
      nivel: "Secundaria",
      responsable: "Maria Rodriguez",
      modalidad: "Grupal",
      seleccionado: false
    },
    {
      id: 5,
      area: "Lenguaje",
      nivel: "Primaria",
      responsable: "Carlos Mendoza",
      modalidad: "Individual",
      seleccionado: false
    },
    {
      id: 6,
      area: "Historia",
      nivel: "Secundaria",
      responsable: "Ana Gutierrez",
      modalidad: "Grupal",
      seleccionado: false
    },
    {
      id: 7,
      area: "Geografia",
      nivel: "Secundaria",
      responsable: "Pedro Lopez",
      modalidad: "Individual",
      seleccionado: false
    },
    {
      id: 8,
      area: "Educación Física",
      nivel: "Primaria",
      responsable: "Laura Martinez",
      modalidad: "Grupal",
      seleccionado: false
    },
    {
      id: 9,
      area: "Física",
      nivel: "Primaria",
      responsable: "Martinez",
      modalidad: "Individual",
      seleccionado: false
    }
  ]);

  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const registrosPorPagina = 7;
  const [ordenamiento, setOrdenamiento] = useState<{
    columna: string;
    direccion: 'asc' | 'desc';
  }>({ columna: 'id', direccion: 'asc' });

  // Estados para los modales
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [filaAEliminar, setFilaAEliminar] = useState<AreaNivel | null>(null);

  // Filtrar datos basados en la búsqueda
  const datosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return datosCompletos;
    }

    const termino = terminoBusqueda.toLowerCase();
    return datosCompletos.filter(item =>
      item.area.toLowerCase().includes(termino) ||
      item.nivel.toLowerCase().includes(termino) ||
      item.responsable.toLowerCase().includes(termino) ||
      item.modalidad.toLowerCase().includes(termino)
    );
  }, [datosCompletos, terminoBusqueda]);

  // Calcular datos paginados
  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    
    const datosOrdenados = [...datosFiltrados].sort((a, b) => {
      let aValor = a[ordenamiento.columna as keyof AreaNivel];
      let bValor = b[ordenamiento.columna as keyof AreaNivel];
      
      if (typeof aValor === 'string' && typeof bValor === 'string') {
        aValor = aValor.toLowerCase();
        bValor = bValor.toLowerCase();
      }
      
      if (ordenamiento.direccion === 'asc') {
        return aValor < bValor ? -1 : aValor > bValor ? 1 : 0;
      } else {
        return aValor > bValor ? -1 : aValor < bValor ? 1 : 0;
      }
    });
    
    return datosOrdenados.slice(inicio, fin);
  }, [datosFiltrados, paginaActual, ordenamiento, registrosPorPagina]);

  const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);

  const handleSeleccionChange = (id: number, seleccionado: boolean) => {
    setDatosCompletos(datosCompletos.map(item => 
      item.id === id ? { ...item, seleccionado } : item
    ));
  };

  const handleEliminarFila = (id: number) => {
    const fila = datosCompletos.find(item => item.id === id);
    if (fila) {
      setFilaAEliminar(fila);
      setModalEliminarAbierto(true);
    }
  };

  const confirmarEliminacion = () => {
    if (filaAEliminar) {
      const nuevosDatos = datosCompletos.filter(item => item.id !== filaAEliminar.id);
      setDatosCompletos(nuevosDatos);
      
      // Ajustar la página actual si es necesario
      if (paginaActual > Math.ceil(nuevosDatos.length / registrosPorPagina)) {
        setPaginaActual(Math.ceil(nuevosDatos.length / registrosPorPagina) || 1);
      }
      
      setModalEliminarAbierto(false);
      setFilaAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    setModalEliminarAbierto(false);
    setFilaAEliminar(null);
  };

  const handleAgregarRegistro = (nuevoRegistro: Omit<AreaNivel, 'id' | 'seleccionado'>) => {
    const nuevoId = Math.max(...datosCompletos.map(item => item.id)) + 1;
    const nuevoAreaNivel: AreaNivel = {
      id: nuevoId,
      ...nuevoRegistro,
      seleccionado: false
    };
    
    setDatosCompletos([...datosCompletos, nuevoAreaNivel]);
    setModalAgregarAbierto(false);
    
    // Redirigir a la última página donde estará el nuevo registro
    const nuevaPagina = Math.ceil((datosCompletos.length + 1) / registrosPorPagina);
    setPaginaActual(nuevaPagina);
  };

  const handleOrdenar = (columna: string, direccion: 'asc' | 'desc') => {
    setOrdenamiento({ columna, direccion });
    setPaginaActual(1);
  };

  const handleCambioPagina = (pagina: number) => {
    setPaginaActual(pagina);
  };

  const handleBuscarChange = (termino: string) => {
    setTerminoBusqueda(termino);
    setPaginaActual(1);
  };

  const handleNuevoRegistro = () => {
    setModalAgregarAbierto(true);
  };

  const cerrarModalAgregar = () => {
    setModalAgregarAbierto(false);
  };

  return (
    <div className="p-1">
      {/* Primera fila: Título a la izquierda, Breadcrumb a la derecha */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
          Lista de Areas y Niveles
        </h1>
        <nav className="text-sm text-gray-600 dark:text-gray-400">
          <span>Home</span>
          <span className="mx-2">›</span>
          <span className="text-gray-800 dark:text-white">Areas y niveles</span>
        </nav>
      </div>

      {/* Segunda fila: Barra de búsqueda a la izquierda, Botón +Nuevo a la derecha EN RECUADRO */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-md">
            <BarraBusquedaAreas 
              terminoBusqueda={terminoBusqueda}
              onBuscarChange={handleBuscarChange}
            />
          </div>
          
          {/* Botón +Nuevo */}
          <button
            onClick={handleNuevoRegistro}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#465FFF] focus:ring-offset-2 dark:focus:ring-offset-gray-900 whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo
          </button>
        </div>
      </div>

      {/* Indicador de resultados de búsqueda */}
      {terminoBusqueda && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {datosFiltrados.length} resultados encontrados para "{terminoBusqueda}"
        </div>
      )}

      {/* Tabla */}
      <div className="mb-1">
        <TablaAreasNiveles 
          datos={datosPaginados}
          onSeleccionChange={handleSeleccionChange}
          onEliminarFila={handleEliminarFila}
          onOrdenar={handleOrdenar}
        />
      </div>

      {/* Paginación */}
      <div>
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={datosFiltrados.length}
          registrosPorPagina={registrosPorPagina}
          onPaginaChange={handleCambioPagina}
        />
      </div>

      {/* Modal de Eliminar Fila */}
      <EliminarFilaModal
        isOpen={modalEliminarAbierto}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        area={filaAEliminar?.area || ''}
        nivel={filaAEliminar?.nivel || ''}
      />

      {/* Modal de Agregar Área y Nivel */}
      <AgregarAreaYNivelModal
        isOpen={modalAgregarAbierto}
        onClose={cerrarModalAgregar}
        onConfirm={handleAgregarRegistro}
      />
    </div>
  );
};

export default AreasYNiveles;