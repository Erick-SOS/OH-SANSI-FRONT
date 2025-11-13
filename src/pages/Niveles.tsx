import React, { useState, useEffect, useMemo } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarModal from '../components/ui/modal/AgregarModal';
import { Nivel, getNiveles, createNivel, deleteNivel } from '../api/niveles';

interface NivelEstado extends Nivel {
  nivel?: string;
}

const Niveles: React.FC = () => {
  const [datosNiveles, setDatosNiveles] = useState<NivelEstado[]>([]);
  const [busquedaNiveles, setBusquedaNiveles] = useState('');
  const [paginaNiveles, setPaginaNiveles] = useState(1);
  const registrosPorPagina = 7;

  // ORDENAMIENTO
  const [, setOrdenColumna] = useState<string | null>(null);
  const [, setOrdenDireccion] = useState<'asc' | 'desc'>('asc');

  // MODALES
  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    id: number | null;
    nombre: string;
  }>({ isOpen: false, id: null, nombre: '' });

  const [modalAgregar, setModalAgregar] = useState<{ isOpen: boolean }>({ isOpen: false });

  // CARGAR DATOS
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const niveles = await getNiveles();
        setDatosNiveles(
          niveles.map(nivel => ({
            ...nivel,
            nivel: nivel.nombre,
          }))
        );
      } catch (error) {
        console.error('Error cargando niveles:', error);
      }
    };
    fetchDatos();
  }, []);

  // ORDENAMIENTO
  const handleOrdenar = (columna: string, direccion: 'asc' | 'desc') => {
    setOrdenColumna(columna);
    setOrdenDireccion(direccion);

    const sorted = [...datosNiveles].sort((a, b) => {
      const valA = a[columna as keyof typeof a];
      const valB = b[columna as keyof typeof b];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direccion === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return 0;
    });

    setDatosNiveles(sorted);
  };

  // FILTROS
  const nivelesFiltrados = useMemo(() => {
    if (!busquedaNiveles.trim()) return datosNiveles;
    const term = busquedaNiveles.toLowerCase();
    return datosNiveles.filter(item =>
      (item.nivel || item.nombre).toLowerCase().includes(term)
    );
  }, [datosNiveles, busquedaNiveles]);

  const nivelesPaginados = useMemo(() => {
    const inicio = (paginaNiveles - 1) * registrosPorPagina;
    return nivelesFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [nivelesFiltrados, paginaNiveles]);

  // ELIMINAR
  const handleEliminarNivel = (id: number, nombre: string) => {
    setModalEliminar({ isOpen: true, id, nombre });
  };

  const confirmarEliminacion = async () => {
    try {
      if (modalEliminar.id) {
        await deleteNivel(modalEliminar.id);
        setDatosNiveles(prev => prev.filter(item => item.id !== modalEliminar.id));
      }
    } catch (error) {
      console.error('Error al eliminar nivel:', error);
      alert('Error al eliminar el registro');
    } finally {
      setModalEliminar({ isOpen: false, id: null, nombre: '' });
    }
  };

  const cancelarEliminacion = () => {
    setModalEliminar({ isOpen: false, id: null, nombre: '' });
  };

  // AGREGAR
  const handleAgregarNivel = () => setModalAgregar({ isOpen: true });

  const confirmarAgregar = async (formData: {
    nombre: string;
    codigo: string;
    descripcion: string;
  }) => {
    try {
      const nuevoNivel = await createNivel({
        codigo: formData.codigo || 'AUTOGEN',
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      });
      setDatosNiveles(prev => [
        ...prev,
        { ...nuevoNivel, nivel: nuevoNivel.nombre },
      ]);
    } catch (error) {
      console.error('Error al agregar nivel:', error);
      alert('Error al agregar el registro');
    } finally {
      setModalAgregar({ isOpen: false });
    }
  };

  const cerrarModalAgregar = () => setModalAgregar({ isOpen: false });

  // COLUMNAS
  const columnas = [
    { clave: 'nivel', titulo: 'Nivel', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'codigo', titulo: 'Código', alineacion: 'centro' as const, ordenable: true },
    { clave: 'descripcion', titulo: 'Descripción', alineacion: 'izquierda' as const, ordenable: true },
  ];

  // ACCIONES
  const renderAcciones = (fila: NivelEstado) => (
    <div className="flex justify-center gap-2">
      <button className="text-blue-600 hover:text-blue-800">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
      <button
        onClick={() => handleEliminarNivel(fila.id!, fila.nombre)}
        className="text-red-600 hover:text-red-800"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  );

  return (
    <div className="p-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-12">
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
                onBuscarChange={(t) => {
                  setBusquedaNiveles(t);
                  setPaginaNiveles(1);
                }}
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

        <TablaBase
          datos={nivelesPaginados}
          columnas={columnas}
          conOrdenamiento
          onOrdenar={handleOrdenar}
          conAcciones
          renderAcciones={renderAcciones}
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
        tipo="Nivel"
        nombre={modalEliminar.nombre}
      />
      <AgregarModal
        isOpen={modalAgregar.isOpen}
        onClose={cerrarModalAgregar}
        onConfirm={confirmarAgregar}
        tipo="Nivel"
      />
    </div>
  );
};

export default Niveles;
