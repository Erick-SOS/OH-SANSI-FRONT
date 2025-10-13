import React, { useState, useEffect, useMemo } from 'react';
import TablaAreas from '../components/tables/TablaAreas';
import TablaNiveles from '../components/tables/TablaNiveles';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarModal from '../components/ui/modal/AgregarModal';
import { Area, getAreas, createArea, deleteArea } from '../api/areas';
import { Nivel, getNiveles, createNivel, deleteNivel } from '../api/niveles';

// Interfaces extendidas para incluir propiedades de los componentes
interface AreaEstado extends Area {
  area?: string;
}

interface NivelEstado extends Nivel {
  nivel?: string;
}

const AreasYNiveles: React.FC = () => {
  const [datosAreas, setDatosAreas] = useState<AreaEstado[]>([]);
  const [datosNiveles, setDatosNiveles] = useState<NivelEstado[]>([]);

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

        const niveles = await getNiveles();
        setDatosNiveles(
          niveles.map(nivel => ({
            ...nivel,
            nivel: nivel.nombre,
          }))
        );
      } catch (error) {
        console.error("Error cargando datos:", error);
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

  const nivelesFiltrados = useMemo(() => {
    if (!busquedaNiveles.trim()) return datosNiveles;
    const termino = busquedaNiveles.toLowerCase();
    return datosNiveles.filter(item =>
      (item.nivel || item.nombre).toLowerCase().includes(termino)
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

  const handleEliminarArea = (id: number, nombre: string) => {
    setModalEliminar({ isOpen: true, tipo: 'Area', id, nombre });
  };

  const handleEliminarNivel = (id: number, nombre: string) => {
    setModalEliminar({ isOpen: true, tipo: 'Nivel', id, nombre });
  };

  const confirmarEliminacion = async () => {
    try {
      if (modalEliminar.tipo === 'Area' && modalEliminar.id) {
        await deleteArea(modalEliminar.id);
        setDatosAreas(datosAreas.filter(item => item.id !== modalEliminar.id));
      } else if (modalEliminar.tipo === 'Nivel' && modalEliminar.id) {
        await deleteNivel(modalEliminar.id);
        setDatosNiveles(datosNiveles.filter(item => item.id !== modalEliminar.id));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el registro");
    } finally {
      setModalEliminar({ isOpen: false, tipo: '', id: null, nombre: '' });
    }
  };

  const cancelarEliminacion = () => {
    setModalEliminar({ isOpen: false, tipo: '', id: null, nombre: '' });
  };

  const handleAgregarArea = () => setModalAgregar({ isOpen: true, tipo: 'Area' });
  const handleAgregarNivel = () => setModalAgregar({ isOpen: true, tipo: 'Nivel' });

  const confirmarAgregar = async (formData: { nombre: string; codigo: string; descripcion: string }) => {
    try {
      if (modalAgregar.tipo === 'Area') {
        const nuevaArea = await createArea({
          codigo: formData.codigo || 'AUTOGEN', // Usa 'AUTOGEN' si no se proporciona código
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
      } else if (modalAgregar.tipo === 'Nivel') {
        const nuevoNivel = await createNivel({
          codigo: formData.codigo || 'AUTOGEN', // Usa 'AUTOGEN' si no se proporciona código
          nombre: formData.nombre,
          descripcion: formData.descripcion,
        });
        setDatosNiveles([
          ...datosNiveles,
          {
            ...nuevoNivel,
            nivel: nuevoNivel.nombre,
          },
        ]);
      }
    } catch (error) {
      console.error("Error al agregar:", error);
      alert("Error al agregar el registro");
    } finally {
      setModalAgregar({ isOpen: false, tipo: '' });
    }
  };

  const cerrarModalAgregar = () => setModalAgregar({ isOpen: false, tipo: '' });

  return (
    <div className="p-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* SECCIÓN DE AREAS */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Lista de Areas
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
              Agregar Area
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

      {/* SECCIÓN DE NIVELES */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Lista de Niveles
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <BarraBusquedaAreas
                terminoBusqueda={busquedaNiveles}
                onBuscarChange={(termino) => { setBusquedaNiveles(termino); setPaginaNiveles(1); }}
              />
            </div>
            <button
              onClick={handleAgregarNivel}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6]"
            >
              Agregar Nivel
            </button>
          </div>
        </div>

        <TablaNiveles
          datos={nivelesPaginados}
          onEliminarFila={handleEliminarNivel}
          paginaActual={paginaNiveles}
          registrosPorPagina={registrosPorPagina}
        />
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