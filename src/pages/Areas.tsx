import React, { useState, useEffect, useMemo } from 'react';
import TablaAreas from '../components/tables/TablaAreas';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import EliminarFilaModal from '../components/ui/modal/EliminarFilaModal';
import AgregarModal from '../components/ui/modal/AgregarModal';

// MOCK: Datos falsos en memoria
let mockAreas: { id: number; codigo: string; nombre: string; descripcion: string; estado?: boolean }[] = [
  { id: 1, codigo: "A001", nombre: "Matemáticas", descripcion: "Área de matemáticas", estado: true },
  { id: 2, codigo: "A002", nombre: "Ciencias", descripcion: "Área de ciencias naturales", estado: true },
  { id: 3, codigo: "A003", nombre: "Lenguaje", descripcion: "Área de lenguaje", estado: true },
];

const Areas: React.FC = () => {
  const [datosAreas, setDatosAreas] = useState(mockAreas);
  const [busquedaAreas, setBusquedaAreas] = useState('');
  const [paginaAreas, setPaginaAreas] = useState(1);
  const registrosPorPagina = 7;

  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    id: number | null;
    nombre: string;
  }>({ isOpen: false, id: null, nombre: '' });

  const [modalAgregar, setModalAgregar] = useState(false);

  // CARGAR DATOS (MOCK)
  const cargarAreas = () => {
    setDatosAreas([...mockAreas]);
  };

  useEffect(() => {
    cargarAreas();
  }, []);

  // FILTROS
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

  // ELIMINAR (MOCK)
  const confirmarEliminacion = async () => {
    if (!modalEliminar.id) return;

    mockAreas = mockAreas.filter(area => area.id !== modalEliminar.id);
    cargarAreas();
    setPaginaAreas(1);
    setModalEliminar({ isOpen: false, id: null, nombre: '' });
  };

  // AGREGAR (MOCK)
  const confirmarAgregar = async (formData: { nombre: string; codigo: string; descripcion: string }) => {
    const nuevoId = Math.max(...mockAreas.map(a => a.id), 0) + 1;
    const nuevoArea = {
      id: nuevoId,
      nombre: formData.nombre,
      codigo: formData.codigo.trim() || "SIN_CODIGO",
      descripcion: formData.descripcion.trim() || "Sin descripción",
      estado: true
    };

    mockAreas.push(nuevoArea);
    cargarAreas();
    setPaginaAreas(1);
    setModalAgregar(false);
  };

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
                onBuscarChange={(termino) => {
                  setBusquedaAreas(termino);
                  setPaginaAreas(1);
                }}
              />
            </div>
            <button
              onClick={() => setModalAgregar(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6]"
            >
              Agregar Área
            </button>
          </div>
        </div>

        <TablaAreas
          datos={areasPaginadas}
          onEliminarFila={(id, nombre) => setModalEliminar({ isOpen: true, id, nombre })}
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
        onClose={() => setModalEliminar({ isOpen: false, id: null, nombre: '' })}
        onConfirm={confirmarEliminacion}
        tipo="Area"
        nombre={modalEliminar.nombre}
      />

      <AgregarModal
        isOpen={modalAgregar}
        onClose={() => setModalAgregar(false)}
        onConfirm={confirmarAgregar}
        tipo="Area"
      />
    </div>
  );
};

export default Areas;