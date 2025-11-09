import React, { useState, useEffect, useMemo } from 'react';
import TablaAreas from '../components/tables/TablaAreas';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarModal from '../components/ui/modal/AgregarModal';
import { Area, getAreas, createArea, deleteArea } from '../api/areas';

// Interfaz para el estado de las áreas
interface AreaEstado extends Area {
  area?: string;
}

const Areas: React.FC = () => {
  const [datosAreas, setDatosAreas] = useState<AreaEstado[]>([]);
  const [busquedaAreas, setBusquedaAreas] = useState('');
  const [paginaAreas, setPaginaAreas] = useState(1);
  const registrosPorPagina = 7;

  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    id: number | null;
    nombre: string;
  }>({ isOpen: false, id: null, nombre: '' });

  const [modalAgregar, setModalAgregar] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // Cargar datos desde API al iniciar
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const areas = await getAreas();
        setDatosAreas(
          areas.map(area => ({
            ...area,
            area: area.nombre,
          }))
        );
      } catch (error) {
        console.error("Error cargando áreas:", error);
      }
    };
    fetchDatos();
  }, []);

  const areasFiltradas = useMemo(() => {
    if (!busquedaAreas.trim()) return datosAreas;
    const termino = busquedaAreas.toLowerCase();
    return datosAreas.filter(item =>
      (item.area || item.nombre).toLowerCase().includes(termino)
    );
  }, [datosAreas, busquedaAreas]);

  const areasPaginadas = useMemo(() => {
    const inicio = (paginaAreas - 1) * registrosPorPagina;
    return areasFiltradas.slice(inicio, inicio + registrosPorPagina);
  }, [areasFiltradas, paginaAreas]);

  const handleEliminarArea = (id: number, nombre: string) => {
    setModalEliminar({ isOpen: true, id, nombre });
  };

  const confirmarEliminacion = async () => {
    try {
      if (modalEliminar.id) {
        await deleteArea(modalEliminar.id);
        setDatosAreas(datosAreas.filter(item => item.id !== modalEliminar.id));
      }
    } catch (error) {
      console.error("Error al eliminar área:", error);
      alert("Error al eliminar el registro");
    } finally {
      setModalEliminar({ isOpen: false, id: null, nombre: '' });
    }
  };

  const cancelarEliminacion = () => {
    setModalEliminar({ isOpen: false, id: null, nombre: '' });
  };

  const handleAgregarArea = () => setModalAgregar({ isOpen: true });

  const confirmarAgregar = async (formData: { nombre: string; codigo: string; descripcion: string }) => {
    try {
      const nuevaArea = await createArea({
        codigo: formData.codigo || 'AUTOGEN',
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      });
      setDatosAreas([
        ...datosAreas,
        {
          ...nuevaArea,
          area: nuevaArea.nombre,
        },
      ]);
    } catch (error) {
      console.error("Error al agregar área:", error);
      alert("Error al agregar el registro");
    } finally {
      setModalAgregar({ isOpen: false });
    }
  };

  const cerrarModalAgregar = () => setModalAgregar({ isOpen: false });

  return (
    <div className="p-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Lista de Áreas
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <BarraBusquedaAreas
                terminoBusqueda={busquedaAreas}
                onBuscarChange={(termino) => { setBusquedaAreas(termino); setPaginaAreas(1); }}
              />
            </div>
            <button
              onClick={handleAgregarArea}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6]"
            >
              Agregar Área
            </button>
          </div>
        </div>

        <TablaAreas
          datos={areasPaginadas}
          onEliminarFila={handleEliminarArea}
          paginaActual={paginaAreas}
          registrosPorPagina={registrosPorPagina}
        />
        <Paginacion
          paginaActual={paginaAreas}
          totalPaginas={Math.ceil(areasFiltradas.length / registrosPorPagina)}
          totalRegistros={areasFiltradas.length}
          registrosPorPagina={registrosPorPagina}
          onPaginaChange={setPaginaAreas}
        />
      </div>

      <EliminarFilaModal
        isOpen={modalEliminar.isOpen}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        tipo="Area" // Cambiado de "Área" a "Area"
        nombre={modalEliminar.nombre}
      />
      <AgregarModal
        isOpen={modalAgregar.isOpen}
        onClose={cerrarModalAgregar}
        onConfirm={confirmarAgregar}
        tipo="Area" // Cambiado de "Área" a "Area"
      />
    </div>
  );
};

export default Areas;