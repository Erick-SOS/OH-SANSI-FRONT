import React, { useState, useEffect, useMemo } from 'react';
import TablaNiveles from '../components/tables/TablaNiveles';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarModal from '../components/ui/modal/AgregarModal';

// MOCK: Datos falsos en memoria
let mockNiveles: { id: number; codigo: string; nombre: string; descripcion: string; estado?: boolean }[] = [
  { id: 1, codigo: "N001", nombre: "Primaria", descripcion: "Nivel 1", estado: true },
  { id: 2, codigo: "N002", nombre: "Secundaria", descripcion: "Nivel 2", estado: true },
];

const Niveles: React.FC = () => {
  const [datosNiveles, setDatosNiveles] = useState(mockNiveles);
  const [busquedaNiveles, setBusquedaNiveles] = useState('');
  const [paginaNiveles, setPaginaNiveles] = useState(1);
  const registrosPorPagina = 7;

  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    id: number | null;
    nombre: string;
  }>({ isOpen: false, id: null, nombre: '' });

  const [modalAgregar, setModalAgregar] = useState(false);

  const cargarNiveles = () => {
    setDatosNiveles([...mockNiveles]);
  };

  useEffect(() => {
    cargarNiveles();
  }, []);

  const nivelesFiltrados = useMemo(() => {
    if (!busquedaNiveles.trim()) return datosNiveles;
    const termino = busquedaNiveles.toLowerCase();
    return datosNiveles.filter(item =>
      item.nombre.toLowerCase().includes(termino) ||
      item.codigo.toLowerCase().includes(termino)
    );
  }, [datosNiveles, busquedaNiveles]);

  const nivelesPaginados = useMemo(() => {
    const inicio = (paginaNiveles - 1) * registrosPorPagina;
    return nivelesFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [nivelesFiltrados, paginaNiveles]);

  const confirmarEliminacion = async () => {
    if (!modalEliminar.id) return;

    mockNiveles = mockNiveles.filter(nivel => nivel.id !== modalEliminar.id);
    cargarNiveles();
    setPaginaNiveles(1);
    setModalEliminar({ isOpen: false, id: null, nombre: '' });
  };

  const confirmarAgregar = async (formData: { nombre: string; codigo: string; descripcion: string }) => {
    const nuevoId = Math.max(...mockNiveles.map(n => n.id), 0) + 1;
    const nuevoNivel = {
      id: nuevoId,
      nombre: formData.nombre,
      codigo: formData.codigo.trim() || "SIN_CODIGO",
      descripcion: formData.descripcion.trim() || "Sin descripción",
      estado: true
    };

    mockNiveles.push(nuevoNivel);
    cargarNiveles();
    setPaginaNiveles(1);
    setModalAgregar(false);
  };

  return (
    <div className="p-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
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
                onBuscarChange={(termino) => {
                  setBusquedaNiveles(termino);
                  setPaginaNiveles(1);
                }}
              />
            </div>
            <button
              onClick={() => setModalAgregar(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6]"
            >
              Agregar Nivel
            </button>
          </div>
        </div>

        <TablaNiveles
          datos={nivelesPaginados}
          onEliminarFila={(id, nombre) => setModalEliminar({ isOpen: true, id, nombre })}
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
        onClose={() => setModalEliminar({ isOpen: false, id: null, nombre: '' })}
        onConfirm={confirmarEliminacion}
        tipo="Nivel"
        nombre={modalEliminar.nombre}
      />

      <AgregarModal
        isOpen={modalAgregar}
        onClose={() => setModalAgregar(false)}
        onConfirm={confirmarAgregar}
        tipo="Nivel"
      />
    </div>
  );
};

export default Niveles;