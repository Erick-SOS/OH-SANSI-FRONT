import React, { useState, useMemo } from 'react';
import TablaAreas from '../components/tables/TablaAreas';
import TablaNiveles from '../components/tables/TablaNiveles';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarModal from '../components/ui/modal/AgregarModal';

interface Area {
  id: number;
  area: string;
  responsable: string;
  modalidad: string;
}

interface Nivel {
  id: number;
  nivel: string;
  responsable: string;
  modalidad: string;
}

const AreasYNiveles: React.FC = () => {
  const [datosAreas, setDatosAreas] = useState<Area[]>([
    { id: 1, area: "Matematicas", responsable: "Ivan Espinoza Vargas", modalidad: "Grupal" },
    { id: 2, area: "Matematicas", responsable: "Lucas Gamboas", modalidad: "Individual" },
    { id: 3, area: "Matematicas", responsable: "Ivan Espinoza Vargas", modalidad: "Grupal" },
    { id: 4, area: "Ciencias", responsable: "Maria Rodriguez", modalidad: "Grupal" },
    { id: 5, area: "Lenguaje", responsable: "Carlos Mendoza", modalidad: "Individual" },
    { id: 6, area: "Historia", responsable: "Ana Gutierrez", modalidad: "Grupal" },
    { id: 7, area: "Geografia", responsable: "Pedro Lopez", modalidad: "Individual" },
    { id: 8, area: "Educación Física", responsable: "Laura Martinez", modalidad: "Grupal" },
    { id: 9, area: "Física", responsable: "Martinez", modalidad: "Individual" }
  ]);

  const [datosNiveles, setDatosNiveles] = useState<Nivel[]>([
    { id: 1, nivel: "Secundaria", responsable: "Ivan Espinoza Vargas", modalidad: "Grupal" },
    { id: 2, nivel: "Secundaria", responsable: "Lucas Gamboas", modalidad: "Individual" },
    { id: 3, nivel: "Secundaria", responsable: "Ivan Espinoza Vargas", modalidad: "Grupal" },
    { id: 4, nivel: "Secundaria", responsable: "Maria Rodriguez", modalidad: "Grupal" },
    { id: 5, nivel: "Primaria", responsable: "Carlos Mendoza", modalidad: "Individual" },
    { id: 6, nivel: "Secundaria", responsable: "Ana Gutierrez", modalidad: "Grupal" },
    { id: 7, nivel: "Secundaria", responsable: "Pedro Lopez", modalidad: "Individual" }
  ]);

  const [busquedaAreas, setBusquedaAreas] = useState('');
  const [busquedaNiveles, setBusquedaNiveles] = useState('');
  const [paginaAreas, setPaginaAreas] = useState(1);
  const [paginaNiveles, setPaginaNiveles] = useState(1);

  const registrosPorPagina = 7;

  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    tipo: 'Area' | 'Nivel' | '';
    id: number | null;
    nombre: string;
  }>({ isOpen: false, tipo: '', id: null, nombre: '' });

  const [modalAgregar, setModalAgregar] = useState<{
    isOpen: boolean;
    tipo: 'Area' | 'Nivel' | '';
  }>({ isOpen: false, tipo: '' });

  const areasFiltradas = useMemo(() => {
    if (!busquedaAreas.trim()) return datosAreas;
    const termino = busquedaAreas.toLowerCase();
    return datosAreas.filter(item =>
      item.area.toLowerCase().includes(termino) ||
      item.responsable.toLowerCase().includes(termino) ||
      item.modalidad.toLowerCase().includes(termino)
    );
  }, [datosAreas, busquedaAreas]);

  const nivelesFiltrados = useMemo(() => {
    if (!busquedaNiveles.trim()) return datosNiveles;
    const termino = busquedaNiveles.toLowerCase();
    return datosNiveles.filter(item =>
      item.nivel.toLowerCase().includes(termino) ||
      item.responsable.toLowerCase().includes(termino) ||
      item.modalidad.toLowerCase().includes(termino)
    );
  }, [datosNiveles, busquedaNiveles]);

  const areasPaginadas = useMemo(() => {
    const inicio = (paginaAreas - 1) * registrosPorPagina;
    return areasFiltradas.slice(inicio, inicio + registrosPorPagina);
  }, [areasFiltradas, paginaAreas]);

  const nivelesPaginados = useMemo(() => {
    const inicio = (paginaNiveles - 1) * registrosPorPagina;
    return nivelesFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [nivelesFiltrados, paginaNiveles]);

  const handleEliminarArea = (id: number) => {
    const area = datosAreas.find(item => item.id === id);
    if (area) {
      setModalEliminar({ isOpen: true, tipo: 'Area', id, nombre: area.area });
    }
  };

  const handleEliminarNivel = (id: number) => {
    const nivel = datosNiveles.find(item => item.id === id);
    if (nivel) {
      setModalEliminar({ isOpen: true, tipo: 'Nivel', id, nombre: nivel.nivel });
    }
  };

  const confirmarEliminacion = () => {
    if (modalEliminar.tipo === 'Area' && modalEliminar.id) {
      const nuevosDatos = datosAreas.filter(item => item.id !== modalEliminar.id);
      setDatosAreas(nuevosDatos);
      
      if (paginaAreas > Math.ceil(nuevosDatos.length / registrosPorPagina)) {
        setPaginaAreas(Math.ceil(nuevosDatos.length / registrosPorPagina) || 1);
      }
    } else if (modalEliminar.tipo === 'Nivel' && modalEliminar.id) {
      const nuevosDatos = datosNiveles.filter(item => item.id !== modalEliminar.id);
      setDatosNiveles(nuevosDatos);
      
      if (paginaNiveles > Math.ceil(nuevosDatos.length / registrosPorPagina)) {
        setPaginaNiveles(Math.ceil(nuevosDatos.length / registrosPorPagina) || 1);
      }
    }
    
    setModalEliminar({ isOpen: false, tipo: '', id: null, nombre: '' });
  };

  const cancelarEliminacion = () => {
    setModalEliminar({ isOpen: false, tipo: '', id: null, nombre: '' });
  };

  const handleAgregarArea = () => {
    setModalAgregar({ isOpen: true, tipo: 'Area' });
  };

  const handleAgregarNivel = () => {
    setModalAgregar({ isOpen: true, tipo: 'Nivel' });
  };

  const confirmarAgregar = (formData: { nombre: string; responsable: string; modalidad: string }) => {
    if (modalAgregar.tipo === 'Area') {
      const nuevoId = Math.max(...datosAreas.map(item => item.id)) + 1;
      const nuevaArea: Area = {
        id: nuevoId,
        area: formData.nombre,
        responsable: formData.responsable,
        modalidad: formData.modalidad
      };
      setDatosAreas([...datosAreas, nuevaArea]);
      
      const nuevaPagina = Math.ceil((datosAreas.length + 1) / registrosPorPagina);
      setPaginaAreas(nuevaPagina);
    } else if (modalAgregar.tipo === 'Nivel') {
      const nuevoId = Math.max(...datosNiveles.map(item => item.id)) + 1;
      const nuevoNivel: Nivel = {
        id: nuevoId,
        nivel: formData.nombre,
        responsable: formData.responsable,
        modalidad: formData.modalidad
      };
      setDatosNiveles([...datosNiveles, nuevoNivel]);
      
      const nuevaPagina = Math.ceil((datosNiveles.length + 1) / registrosPorPagina);
      setPaginaNiveles(nuevaPagina);
    }
    
    setModalAgregar({ isOpen: false, tipo: '' });
  };

  const cerrarModalAgregar = () => {
    setModalAgregar({ isOpen: false, tipo: '' });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* SECCIÓN DE AREAS */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Lista de Areas
          </h1>
          <nav className="text-sm text-gray-600 dark:text-gray-400">
            <span>Home</span>
            <span className="mx-2">›</span>
            <span className="text-gray-800 dark:text-white">Areas y niveles</span>
          </nav>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <BarraBusquedaAreas 
                terminoBusqueda={busquedaAreas}
                onBuscarChange={(termino) => {
                  setBusquedaAreas(termino);
                  setPaginaAreas(1);
                }}
              />
            </div>
            
            <button
              onClick={handleAgregarArea}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#465FFF] focus:ring-offset-2 dark:focus:ring-offset-gray-900 whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo
            </button>
          </div>
        </div>

        {busquedaAreas && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {areasFiltradas.length} resultados encontrados para "{busquedaAreas}"
          </div>
        )}

        <div className="mb-4">
          <TablaAreas 
            datos={areasPaginadas}
            onEliminarFila={handleEliminarArea}
            paginaActual={paginaAreas}
            registrosPorPagina={registrosPorPagina}
          />
        </div>

        <Paginacion
          paginaActual={paginaAreas}
          totalPaginas={Math.ceil(areasFiltradas.length / registrosPorPagina)}
          totalRegistros={areasFiltradas.length}
          registrosPorPagina={registrosPorPagina}
          onPaginaChange={setPaginaAreas}
        />
      </div>

      {/* SECCIÓN DE NIVELES */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Lista de Niveles
          </h1>
          <nav className="text-sm text-gray-600 dark:text-gray-400">
            <span>Home</span>
            <span className="mx-2">›</span>
            <span className="text-gray-800 dark:text-white">Areas y niveles</span>
          </nav>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <BarraBusquedaAreas 
                terminoBusqueda={busquedaNiveles}
                onBuscarChange={(termino) => {
                  setBusquedaNiveles(termino);
                  setPaginaNiveles(1);
                }}
              />
            </div>
            
            <button
              onClick={handleAgregarNivel}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#465FFF] focus:ring-offset-2 dark:focus:ring-offset-gray-900 whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo
            </button>
          </div>
        </div>

        {busquedaNiveles && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {nivelesFiltrados.length} resultados encontrados para "{busquedaNiveles}"
          </div>
        )}

        <div className="mb-4">
          <TablaNiveles 
            datos={nivelesPaginados}
            onEliminarFila={handleEliminarNivel}
            paginaActual={paginaNiveles}
            registrosPorPagina={registrosPorPagina}
          />
        </div>

        <Paginacion
          paginaActual={paginaNiveles}
          totalPaginas={Math.ceil(nivelesFiltrados.length / registrosPorPagina)}
          totalRegistros={nivelesFiltrados.length}
          registrosPorPagina={registrosPorPagina}
          onPaginaChange={setPaginaNiveles}
        />
      </div>

      <EliminarFilaModal
        isOpen={modalEliminar.isOpen}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        tipo={modalEliminar.tipo}
        nombre={modalEliminar.nombre}
      />

      <AgregarModal
        isOpen={modalAgregar.isOpen}
        onClose={cerrarModalAgregar}
        onConfirm={confirmarAgregar}
        tipo={modalAgregar.tipo}
      />
    </div>
  );
};

export default AreasYNiveles;