// src/pages/Niveles.tsx
import React, { useState, useEffect, useMemo } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarModal from '../components/ui/modal/AgregarModal';

interface NivelEstado {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  nivel?: string;
}

const datosIniciales: NivelEstado[] = [
  { id: 1, nombre: 'Primaria', codigo: 'P1', descripcion: 'Primer año de educación básica', nivel: 'Primaria' },
  { id: 2, nombre: 'Secundaria', codigo: 'P2', descripcion: 'Segundo año de educación básica', nivel: 'Secundaria' },
  { id: 3, nombre: 'Primaria', codigo: 'P3', descripcion: 'Tercer año de educación básica', nivel: 'Primaria' },
  { id: 4, nombre: 'Primaria', codigo: 'P4', descripcion: 'Cuarto año de educación básica', nivel: 'Primaria' },
  { id: 5, nombre: 'Secundaria', codigo: 'P5', descripcion: 'Quinto año de educación básica', nivel: 'Secundaria' },
  { id: 6, nombre: 'Secundaria', codigo: 'P6', descripcion: 'Sexto año de educación básica', nivel: 'Secundaria' },
  { id: 7, nombre: 'Secundaria', codigo: 'P7', descripcion: 'Séptimo año de educación básica', nivel: 'Secundaria' },
];

const Niveles: React.FC = () => {
  const [datosNiveles, setDatosNiveles] = useState<NivelEstado[]>([]);
  const [busquedaNiveles, setBusquedaNiveles] = useState('');
  const [paginaNiveles, setPaginaNiveles] = useState(1);
  const registrosPorPagina = 7;

  const [, setOrdenColumna] = useState<string | null>(null);
  const [, setOrdenDireccion] = useState<'asc' | 'desc'>('asc');

  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    id: number | null;
    nombre: string;
  }>({ isOpen: false, id: null, nombre: '' });

  const [modalAgregar, setModalAgregar] = useState(false);

  useEffect(() => {
    setDatosNiveles(datosIniciales);
  }, []);

  const handleOrdenar = (columna: string, direccion: 'asc' | 'desc') => {
    setOrdenColumna(columna);
    setOrdenDireccion(direccion);
    const sorted = [...datosNiveles].sort((a, b) => {
      const valA = a[columna as keyof NivelEstado];
      const valB = b[columna as keyof NivelEstado];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return direccion === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });
    setDatosNiveles(sorted);
  };

  const nivelesFiltrados = useMemo(() => {
    if (!busquedaNiveles.trim()) return datosNiveles;
    const term = busquedaNiveles.toLowerCase();
    return datosNiveles.filter(item =>
      (item.nivel ?? '').toLowerCase().includes(term) ||
      (item.codigo ?? '').toLowerCase().includes(term) ||
      (item.descripcion ?? '').toLowerCase().includes(term)
    );
  }, [datosNiveles, busquedaNiveles]);

  const nivelesPaginados = useMemo(() => {
    const inicio = (paginaNiveles - 1) * registrosPorPagina;
    return nivelesFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [nivelesFiltrados, paginaNiveles]);

  const handleEliminarNivel = (id: number, nombre: string) => {
    setModalEliminar({ isOpen: true, id, nombre });
  };

  const confirmarEliminacion = () => {
    if (modalEliminar.id !== null) {
      setDatosNiveles(prev => prev.filter(item => item.id !== modalEliminar.id));
    }
    setModalEliminar({ isOpen: false, id: null, nombre: '' });
  };

  const cancelarEliminacion = () => {
    setModalEliminar({ isOpen: false, id: null, nombre: '' });
  };

  const abrirModal = () => setModalAgregar(true);
  const cerrarModal = () => setModalAgregar(false);

  const confirmarAgregar = (formData: { nombre: string; codigo: string; descripcion: string }) => {
    const nuevoId = Math.max(...datosNiveles.map(n => n.id), 0) + 1;
    const nuevoNivel: NivelEstado = {
      id: nuevoId,
      nombre: formData.nombre,
      codigo: formData.codigo,
      descripcion: formData.descripcion,
      nivel: formData.nombre,
    };
    setDatosNiveles(prev => [...prev, nuevoNivel]);
    cerrarModal();
  };

  const columnas = [
    { clave: 'nivel' as const, titulo: 'Nivel', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'codigo' as const, titulo: 'Código', alineacion: 'centro' as const, ordenable: true },
    { clave: 'descripcion' as const, titulo: 'Descripción', alineacion: 'izquierda' as const, ordenable: true },
  ];

  const renderAcciones = (fila: NivelEstado) => (
    <div className="flex justify-center gap-2">
      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
      <button onClick={() => handleEliminarNivel(fila.id, fila.nombre)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  );

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Lista de Niveles
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm dark:shadow-gray-700 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <BarraBusquedaAreas
                terminoBusqueda={busquedaNiveles}
                onBuscarChange={(t) => { setBusquedaNiveles(t); setPaginaNiveles(1); }}
              />
            </div>
            <button
              onClick={abrirModal}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors"
            >
              Agregar Nivel
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700 overflow-hidden">
          <TablaBase
            datos={nivelesPaginados}
            columnas={columnas}
            conOrdenamiento
            onOrdenar={handleOrdenar}
            conAcciones
            renderAcciones={renderAcciones}
          />
        </div>

        <div className="mt-4">
          <Paginacion
            paginaActual={paginaNiveles}
            totalPaginas={Math.ceil(nivelesFiltrados.length / registrosPorPagina)}
            totalRegistros={nivelesFiltrados.length}
            registrosPorPagina={registrosPorPagina}
            onPaginaChange={setPaginaNiveles}
          />
        </div>
      </div>

      {/* MODAL ELIMINAR */}
      <EliminarFilaModal
        isOpen={modalEliminar.isOpen}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        tipo="Nivel"
        nombre={modalEliminar.nombre}
      />

      {/* MODAL AGREGAR */}
      <AgregarModal
        isOpen={modalAgregar}
        onClose={cerrarModal}
        onConfirm={confirmarAgregar}
        tipo="Nivel"
      />
    </div>
  );
};

export default Niveles;