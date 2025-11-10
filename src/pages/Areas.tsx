// src/pages/Areas.tsx
import React, { useState, useEffect, useMemo } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarModal from '../components/ui/modal/AgregarModal';
import { Area, getAreas, createArea, deleteArea } from '../api/areas';
import { Pencil, Trash2 } from 'lucide-react';

interface AreaEstado extends Area {
  area?: string;
}

const Areas: React.FC = () => {
  const [datosAreas, setDatosAreas] = useState<AreaEstado[]>([]);
  const [busquedaAreas, setBusquedaAreas] = useState('');
  const [paginaAreas, setPaginaAreas] = useState(1);
  const registrosPorPagina = 7;

  // ESTADOS PARA ORDENAMIENTO
  const [, setOrdenColumna] = useState<string | null>(null);
  const [, setOrdenDireccion] = useState<'asc' | 'desc'>('asc');

  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    id: number | null;
    nombre: string;
  }>({ isOpen: false, id: null, nombre: '' });

  const [modalAgregar, setModalAgregar] = useState<{ isOpen: boolean }>({ isOpen: false });

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const areas = await getAreas();
        setDatosAreas(areas.map(area => ({ ...area, area: area.nombre })));
      } catch (error) {
        console.error("Error cargando áreas:", error);
      }
    };
    fetchDatos();
  }, []);

  // ORDENAMIENTO
  const handleOrdenar = (columna: string, direccion: 'asc' | 'desc') => {
    setOrdenColumna(columna);
    setOrdenDireccion(direccion);

    const sorted = [...datosAreas].sort((a, b) => {
      const valA = a[columna as keyof typeof a];
      const valB = b[columna as keyof typeof b];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direccion === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return 0;
    });

    setDatosAreas(sorted);
  };

  const areasFiltradas = useMemo(() => {
    if (!busquedaAreas.trim()) return datosAreas;
    const termino = busquedaAreas.toLowerCase();
    return datosAreas.filter(item =>
      item.nombre.toLowerCase().includes(termino) ||
      item.codigo.toLowerCase().includes(termino)
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
        setDatosAreas(prev => prev.filter(item => item.id !== modalEliminar.id));
      }
    } catch (error) {
      console.error("Error al eliminar área:", error);
      alert("Error al eliminar el registro");
    } finally {
      setModalEliminar({ isOpen: false, id: null, nombre: '' });
    }
  };

  const handleAgregarArea = () => setModalAgregar({ isOpen: true });

  const confirmarAgregar = async (formData: { nombre: string; codigo: string; descripcion: string }) => {
    try {
      const nuevaArea = await createArea({
        codigo: formData.codigo || 'AUTOGEN',
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      });
      setDatosAreas(prev => [...prev, { ...nuevaArea, area: nuevaArea.nombre }]);
    } catch (error) {
      console.error("Error al agregar área:", error);
      alert("Error al agregar el registro");
    } finally {
      setModalAgregar({ isOpen: false });
    }
  };

  const columnas = [
    { clave: 'nombre', titulo: 'Área', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'codigo', titulo: 'Código de área', alineacion: 'centro' as const, ancho: 'w-32', ordenable: true },
    { clave: 'descripcion', titulo: 'Descripción', alineacion: 'izquierda' as const, ordenable: true },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderAcciones = (fila: any) => (
    <div className="flex justify-cenAter gap-2">
      <button className="text-blue-600 hover:text-blue-800">
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleEliminarArea(fila.id, fila.nombre)}
        className="text-red-600 hover:text-red-800"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

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

        <TablaBase
          datos={areasPaginadas}
          columnas={columnas}
          conAcciones={true}
          renderAcciones={renderAcciones}
          conOrdenamiento={true}
          onOrdenar={handleOrdenar}
          className="mt-4"
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
        onClose={() => setModalEliminar({ isOpen: false, id: null, nombre: '' })}
        onConfirm={confirmarEliminacion}
        tipo="Area"
        nombre={modalEliminar.nombre}
      />
      <AgregarModal
        isOpen={modalAgregar.isOpen}
        onClose={() => setModalAgregar({ isOpen: false })}
        onConfirm={confirmarAgregar}
        tipo="Area"
      />
    </div>
  );
};

export default Areas;