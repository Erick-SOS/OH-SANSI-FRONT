// src/pages/Niveles.tsx
import React, { useState, useEffect, useMemo } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarModal from '../components/ui/modal/AgregarModal';
import { Nivel, getNiveles, createNivel, deleteNivel } from '../api/niveles';
import { Pencil, Trash2 } from 'lucide-react';

interface NivelEstado extends Nivel {
  nivel?: string;
}

const Niveles: React.FC = () => {
  const [datosNiveles, setDatosNiveles] = useState<NivelEstado[]>([]);
  const [busquedaNiveles, setBusquedaNiveles] = useState('');
  const [paginaNiveles, setPaginaNiveles] = useState(1);
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

  // CARGAR DATOS
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const niveles = await getNiveles();
        setDatosNiveles(niveles.map(nivel => ({ ...nivel, nivel: nivel.nombre })));
      } catch (error) {
        console.error("Error cargando niveles:", error);
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

  // FILTRADO
  const nivelesFiltrados = useMemo(() => {
    if (!busquedaNiveles.trim()) return datosNiveles;
    const termino = busquedaNiveles.toLowerCase();
    return datosNiveles.filter(item =>
      item.nombre.toLowerCase().includes(termino) ||
      item.codigo.toLowerCase().includes(termino)
    );
  }, [datosNiveles, busquedaNiveles]);

  // PAGINACIÓN
  const nivelesPaginados = useMemo(() => {
    const inicio = (paginaNiveles - 1) * registrosPorPagina;
    return nivelesFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [nivelesFiltrados, paginaNiveles]);

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
      console.error("Error al eliminar nivel:", error);
      alert("Error al eliminar el registro");
    } finally {
      setModalEliminar({ isOpen: false, id: null, nombre: '' });
    }
  };

  const handleAgregarNivel = () => setModalAgregar({ isOpen: true });

  const confirmarAgregar = async (formData: { nombre: string; codigo: string; descripcion: string }) => {
    try {
      const nuevoNivel = await createNivel({
        codigo: formData.codigo || 'AUTOGEN',
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      });
      setDatosNiveles(prev => [...prev, { ...nuevoNivel, nivel: nuevoNivel.nombre }]);
    } catch (error) {
      console.error("Error al agregar nivel:", error);
      alert("Error al agregar el registro");
    } finally {
      setModalAgregar({ isOpen: false });
    }
  };

  // COLUMNAS CON ORDENAMIENTO
  const columnas = [
    { clave: 'nombre', titulo: 'Nivel', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'codigo', titulo: 'Código de nivel', alineacion: 'centro' as const, ancho: 'w-32', ordenable: true },
    { clave: 'descripcion', titulo: 'Descripción', alineacion: 'izquierda' as const, ordenable: true },
  ];

  // ACCIONES
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderAcciones = (fila: any) => (
    <div className="flex justify-center gap-2">
      <button className="text-blue-600 hover:text-blue-800">
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleEliminarNivel(fila.id, fila.nombre)}
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

        {/* TABLA CON ORDENAMIENTO */}
        <TablaBase
          datos={nivelesPaginados}
          columnas={columnas}
          conAcciones={true}
          renderAcciones={renderAcciones}
          conOrdenamiento={true}
          onOrdenar={handleOrdenar}
          className="mt-4"
        />

        {/* PAGINACIÓN */}
        <Paginacion
          paginaActual={paginaNiveles}
          totalPaginas={Math.ceil(nivelesFiltrados.length / registrosPorPagina)}
          totalRegistros={nivelesFiltrados.length}
          registrosPorPagina={registrosPorPagina}
          onPaginaChange={setPaginaNiveles}
        />
      </div>

      {/* MODALES */}
      <EliminarFilaModal
        isOpen={modalEliminar.isOpen}
        onClose={() => setModalEliminar({ isOpen: false, id: null, nombre: '' })}
        onConfirm={confirmarEliminacion}
        tipo="Nivel"
        nombre={modalEliminar.nombre}
      />
      <AgregarModal
        isOpen={modalAgregar.isOpen}
        onClose={() => setModalAgregar({ isOpen: false })}
        onConfirm={confirmarAgregar}
        tipo="Nivel"
      />
    </div>
  );
};

export default Niveles;