// src/pages/DesignarEvaluadorPage.tsx
import React, { useState, useMemo } from "react";
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';


type AreaNivel = {
  id: number;
  area: string;
  nivel: string; 
  evaluadorId: number | null;
  evaluadorNombre: string | null;
  modalidad: string; 
};


type Evaluador = {
  id: number;
  nombreCompleto: string;
  profesion: string | null;
  institucion: string | null;
  habilitado: boolean;
};


const AREAS_NIVELES_MOCK: AreaNivel[] = [
  { id: 1, area: "Biología", nivel: "Secundaria", evaluadorId: null, evaluadorNombre: null, modalidad: "Individual" },
  { id: 2, area: "Matemática", nivel: "Primaria", evaluadorId: 5, evaluadorNombre: "Juan Pérez", modalidad: "Grupal" },
  { id: 3, area: "Física", nivel: "Secundaria", evaluadorId: null, evaluadorNombre: null, modalidad: "Individual" },
  { id: 4, area: "Química", nivel: "Secundaria", evaluadorId: null, evaluadorNombre: null, modalidad: "Individual" },
  { id: 5, area: "Historia", nivel: "Primaria", evaluadorId: null, evaluadorNombre: null, modalidad: "Grupal" },
  { id: 6, area: "Lenguaje", nivel: "Secundaria", evaluadorId: 8, evaluadorNombre: "María García", modalidad: "Individual" },
  { id: 7, area: "Educación Física", nivel: "Primaria", evaluadorId: 3, evaluadorNombre: "Carlos López", modalidad: "Grupal" },
  { id: 8, area: "Arte", nivel: "Secundaria", evaluadorId: 7, evaluadorNombre: "Ana Martínez", modalidad: "Individual" },
  { id: 9, area: "Inglés", nivel: "Primaria", evaluadorId: null, evaluadorNombre: null, modalidad: "Individual" },
  { id: 10, area: "Computación", nivel: "Secundaria", evaluadorId: 6, evaluadorNombre: "Roberto Sánchez", modalidad: "Grupal" },
  { id: 11, area: "Geografía", nivel: "Secundaria", evaluadorId: 9, evaluadorNombre: "Sofía Díaz", modalidad: "Individual" },
  { id: 12, area: "Música", nivel: "Primaria", evaluadorId: null, evaluadorNombre: null, modalidad: "Individual" },
  { id: 13, area: "Filosofía", nivel: "Secundaria", evaluadorId: 2, evaluadorNombre: "María García", modalidad: "Individual" },
  { id: 14, area: "Tecnología", nivel: "Secundaria", evaluadorId: 6, evaluadorNombre: "Roberto Sánchez", modalidad: "Grupal" },
  { id: 15, area: "Economía", nivel: "Secundaria", evaluadorId: null, evaluadorNombre: null, modalidad: "Individual" },
];

// Datos mockeados para evaluadores
const EVALUADORES_MOCK: Evaluador[] = [
  { id: 1, nombreCompleto: "Juan Pérez", profesion: "Matemático", institucion: "Universidad Nacional", habilitado: true },
  { id: 2, nombreCompleto: "María García", profesion: "Lic. en Lengua", institucion: "Colegio Modelo", habilitado: true },
  { id: 3, nombreCompleto: "Carlos López", profesion: "Prof. Educación Física", institucion: "Instituto Deportivo", habilitado: true },
  { id: 4, nombreCompleto: "Lucía Ramírez", profesion: "Bióloga", institucion: "Laboratorio Central", habilitado: false },
  { id: 5, nombreCompleto: "Pedro Martínez", profesion: "Físico", institucion: "Centro de Investigación", habilitado: true },
  { id: 6, nombreCompleto: "Roberto Sánchez", profesion: "Ing. en Sistemas", institucion: "Tecnología Avanzada", habilitado: true },
  { id: 7, nombreCompleto: "Ana Martínez", profesion: "Artista Plástica", institucion: "Escuela de Bellas Artes", habilitado: true },
  { id: 8, nombreCompleto: "Miguel Torres", profesion: "Químico", institucion: "Laboratorio Químico", habilitado: true },
  { id: 9, nombreCompleto: "Sofía Díaz", profesion: "Historiadora", institucion: "Museo Nacional", habilitado: true },
  { id: 10, nombreCompleto: "David Ruiz", profesion: "Prof. de Inglés", institucion: "Academia de Idiomas", habilitado: false },
];

const DesignarEvaluadorPage: React.FC = () => {
  const [areasNiveles, setAreasNiveles] = useState<AreaNivel[]>(AREAS_NIVELES_MOCK);
  const [evaluadores] = useState<Evaluador[]>(EVALUADORES_MOCK);
  const [asignando, setAsignando] = useState<number | null>(null);
 

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

 
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [areaConfirmacion, setAreaConfirmacion] = useState<AreaNivel | null>(null);
  const [tipoAccion, setTipoAccion] = useState<'asignar' | 'cambiar' | 'quitar'>('asignar');

 
  const [modalSeleccionAbierto, setModalSeleccionAbierto] = useState(false);
  const [areaSeleccion, setAreaSeleccion] = useState<AreaNivel | null>(null);
  const [evaluadorSeleccionado, setEvaluadorSeleccionado] = useState<number | null>(null);

  
  const evaluadoresDisponibles = useMemo(() => {
    return evaluadores.filter(e => e.habilitado);
  }, [evaluadores]);

 
  const handleAsignarEvaluador = (areaId: number, evaluadorId: number | null) => {
    setAsignando(areaId);
   
    setTimeout(() => {
      const evaluador = evaluadores.find(e => e.id === evaluadorId);
     
      setAreasNiveles(prev =>
        prev.map(area =>
          area.id === areaId
            ? {
                ...area,
                evaluadorId: evaluadorId,
                evaluadorNombre: evaluador?.nombreCompleto || null,
              }
            : area
        )
      );
     
      setAsignando(null);
      setModalConfirmacionAbierto(false);
      setModalSeleccionAbierto(false);
      setAreaConfirmacion(null);
      setAreaSeleccion(null);
      setEvaluadorSeleccionado(null);
    }, 500);
  };

  
  const abrirModalConfirmacion = (area: AreaNivel, accion: 'asignar' | 'cambiar' | 'quitar') => {
    setAreaConfirmacion(area);
    setTipoAccion(accion);
    setModalConfirmacionAbierto(true);
  };

  
  const abrirModalSeleccion = (area: AreaNivel) => {
    setAreaSeleccion(area);
    setEvaluadorSeleccionado(area.evaluadorId);
    setModalSeleccionAbierto(true);
  };

 
  const confirmarAccion = () => {
    if (!areaConfirmacion) return;
   
    if (tipoAccion === 'quitar') {
      handleAsignarEvaluador(areaConfirmacion.id, null);
    } else {
      abrirModalSeleccion(areaConfirmacion);
      setModalConfirmacionAbierto(false);
    }
  };

  
  const confirmarSeleccion = () => {
    if (!areaSeleccion || evaluadorSeleccionado === null) return;
    handleAsignarEvaluador(areaSeleccion.id, evaluadorSeleccionado);
  };

 
  const CeldaEvaluadorEditable = ({ area }: { area: AreaNivel }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <div
        className="relative min-w-[120px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`${badgeClass} cursor-pointer transition-all duration-200 ${
            area.evaluadorId !== null
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
              : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
          } ${isHovered ? 'ring-2 ring-offset-1 ring-opacity-50 ' +
            (area.evaluadorId !== null ? 'ring-green-400' : 'ring-amber-400') : ''}`}
          onDoubleClick={() => abrirModalSeleccion(area)}
          title="Haz doble clic para asignar o cambiar evaluador"
        >
          {area.evaluadorNombre || "Sin asignar"}
          {isHovered && (
            <span className="ml-1 text-xs opacity-70">
              {}
            </span>
          )}
        </div>
      </div>
    );
  };

  
  const BotonAccionDesignar = ({ area }: { area: AreaNivel }) => {
    return (
      <button
        onClick={() => {
          if (area.evaluadorId) {
            abrirModalConfirmacion(area, 'cambiar');
          } else {
            abrirModalConfirmacion(area, 'asignar');
          }
        }}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 ${
          area.evaluadorId
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={asignando === area.id}
      >
        {asignando === area.id ? (
          <span className="flex items-center gap-1">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Procesando...
          </span>
        ) : (
          area.evaluadorId ? "Asignado" : "Asignar"
        )}
      </button>
    );
  };

  const badgeClass = "inline-flex items-center justify-center min-w-[100px] px-3 py-1.5 text-xs font-semibold rounded-full";

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    const sorted = [...areasNiveles].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aVal = (a as any)[column];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bVal = (b as any)[column];
     
      if (column === 'evaluadorNombre') {
        const nombreA = a.evaluadorNombre || '';
        const nombreB = b.evaluadorNombre || '';
        return direction === 'asc' ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA);
      }
     
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
    setAreasNiveles(sorted);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return areasNiveles;
    const term = searchTerm.toLowerCase();
    return areasNiveles.filter(item =>
      item.area.toLowerCase().includes(term) ||
      item.nivel.toLowerCase().includes(term) ||
      (item.evaluadorNombre?.toLowerCase() || '').includes(term) ||
      item.modalidad.toLowerCase().includes(term)
    );
  }, [areasNiveles, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const columns = [
    {
      clave: 'area',
      titulo: 'Área',
      alineacion: 'izquierda' as const,
      ordenable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: AreaNivel & { numero: number }) => (
        <div className="flex items-center">
          <span className="text-gray-700 dark:text-gray-300 font-medium mr-3">
            {fila.numero}
          </span>
          <div className="font-medium text-gray-900 dark:text-white">
            {fila.area}
          </div>
        </div>
      ),
    },
    {
      clave: 'nivel',
      titulo: 'Nivel',
      alineacion: 'centro' as const,
      ordenable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: AreaNivel) => (
        <span
          className={`${badgeClass} ${
            fila.nivel === "Primaria"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
          }`}
        >
          {fila.nivel}
        </span>
      ),
    },
    {
      clave: 'evaluadorNombre',
      titulo: 'Evaluador',
      alineacion: 'centro' as const,
      ordenable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: AreaNivel) => (
        <CeldaEvaluadorEditable area={fila} />
      ),
    },
    {
      clave: 'modalidad',
      titulo: 'Modalidad',
      alineacion: 'centro' as const,
      ordenable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: AreaNivel) => (
        <span
          className={`${badgeClass} ${
            fila.modalidad === "Individual"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
          }`}
        >
          {fila.modalidad}
        </span>
      ),
    },
    {
      clave: 'accion',
      titulo: 'Acción',
      alineacion: 'centro' as const,
      ordenable: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: AreaNivel) => (
        <BotonAccionDesignar area={fila} />
      ),
    },
  ];

  return (
    <>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Designar Evaluadores por Área y Nivel
            </h1>
            <nav className="text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-0">
              Inicio › Gestión de Evaluador › Designar
            </nav>
          </div>

          {/* Contadores */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-none border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-wrap justify-between items-center gap-4 text-left">
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 dark:text-gray-300 font-bold text-base">Total Áreas:</span>
                <span className="text-gray-700 dark:text-gray-300 font-normal text-base">{areasNiveles.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 dark:text-gray-300 font-bold text-base">Asignados:</span>
                <span className="text-green-600 dark:text-green-400 font-normal text-base">{areasNiveles.filter(a => a.evaluadorId).length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 dark:text-gray-300 font-bold text-base">Pendientes:</span>
                <span className="text-amber-600 dark:text-amber-400 font-normal text-base">{areasNiveles.filter(a => !a.evaluadorId).length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 dark:text-gray-300 font-bold text-base">Mostrando:</span>
                <span className="text-gray-700 dark:text-gray-300 font-normal text-base">{filteredData.length}</span>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <BarraBusquedaAreas
              terminoBusqueda={searchTerm}
              onBuscarChange={(t) => { setSearchTerm(t); setCurrentPage(1); }}
            />
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="min-w-[800px] overflow-x-auto">
              <TablaBase
                datos={paginatedData.map((item, i) => ({ ...item, numero: (currentPage - 1) * itemsPerPage + i + 1 }))}
                columnas={columns}
                conOrdenamiento={true}
                onOrdenar={handleSort}
                conAcciones={false}
              />
            </div>
          </div>

          {/* Paginación */}
          <div className="mt-6">
            <Paginacion
              paginaActual={currentPage}
              totalPaginas={Math.ceil(filteredData.length / itemsPerPage)}
              totalRegistros={filteredData.length}
              registrosPorPagina={itemsPerPage}
              onPaginaChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {}
      {modalConfirmacionAbierto && areaConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {tipoAccion === 'cambiar'
                    ? "Cambiar evaluador"
                    : tipoAccion === 'asignar'
                    ? "Asignar evaluador"
                    : "Quitar evaluador"}
                </h3>
                <button
                  onClick={() => {
                    setModalConfirmacionAbierto(false);
                    setAreaConfirmacion(null);
                  }}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {tipoAccion === 'cambiar'
                  ? "¿Estás seguro de que deseas cambiar el evaluador asignado?"
                  : tipoAccion === 'asignar'
                  ? "¿Estás seguro de que deseas asignar un evaluador a esta área?"
                  : "¿Estás seguro de que deseas quitar el evaluador asignado?"}
              </p>
            </div>

            {/* Contenido */}
            <div className="p-4">
              <div className="mb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Área:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{areaConfirmacion.area}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Nivel:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{areaConfirmacion.nivel}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Modalidad:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{areaConfirmacion.modalidad}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Evaluador actual:</span>
                  <span className={`text-sm font-semibold ${areaConfirmacion.evaluadorId ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {areaConfirmacion.evaluadorNombre || "Sin asignar"}
                  </span>
                </div>
              </div>

              {/* Botones PEQUEÑOS */}
              <div className="space-y-2">
                {/* Botón principal */}
                <button
                  onClick={confirmarAccion}
                  className={`w-full py-2 px-3 text-xs font-medium text-white rounded-lg transition-colors ${
                    tipoAccion === 'quitar'
                      ? "bg-red-600 hover:bg-red-700"
                      : tipoAccion === 'cambiar'
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {tipoAccion === 'quitar'
                    ? "Sí, quitar evaluador"
                    : tipoAccion === 'cambiar'
                    ? "Sí, cambiar evaluador"
                    : "Sí, asignar evaluador"}
                </button>

                {/* Botón secundario - solo para cambiar */}
                {tipoAccion === 'cambiar' && areaConfirmacion.evaluadorId && (
                  <>
                    <button
                      onClick={() => {
                        abrirModalSeleccion(areaConfirmacion);
                        setModalConfirmacionAbierto(false);
                      }}
                      className="w-full py-2 px-3 text-xs font-medium text-green-600 dark:text-green-400 border border-green-600 dark:border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    >
                      + Agregar otro evaluador
                    </button>
                    
                    <button
                      onClick={() => {
                        setTipoAccion('quitar');
                      }}
                      className="w-full py-2 px-3 text-xs font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Quitar asignación actual
                    </button>
                  </>
                )}

                {/* Botón cancelar */}
                <button
                  onClick={() => {
                    setModalConfirmacionAbierto(false);
                    setAreaConfirmacion(null);
                  }}
                  className="w-full py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {modalSeleccionAbierto && areaSeleccion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Seleccionar Evaluador
                </h3>
                <button
                  onClick={() => {
                    setModalSeleccionAbierto(false);
                    setAreaSeleccion(null);
                    setEvaluadorSeleccionado(null);
                  }}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Selecciona un evaluador para <span className="font-medium text-gray-900 dark:text-white">{areaSeleccion.area}</span> ({areaSeleccion.nivel})
              </p>
            </div>

            <div className="p-4">
              {/* Seleccionar un evaluador */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Selecciona un evaluador
                </label>
                <div className="relative">
                  <select
                    value={evaluadorSeleccionado || ""}
                    onChange={(e) => setEvaluadorSeleccionado(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                  >
                    <option value="">-- Selecciona un evaluador --</option>
                    {evaluadoresDisponibles.map((evaluador) => (
                      <option key={evaluador.id} value={evaluador.id}>
                        {evaluador.nombreCompleto}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Asignar otro evaluador */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Asignar otro evaluador (opcional)
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white cursor-not-allowed opacity-60"
                    disabled
                  >
                    <option>-- Selecciona otro evaluador --</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Útil para grupos grandes que requieren más de un evaluador
                </p>
              </div>

              {}
              {evaluadorSeleccionado && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="text-xs">
                    <div className="font-medium text-blue-800 dark:text-blue-300">
                      {evaluadoresDisponibles.find(e => e.id === evaluadorSeleccionado)?.nombreCompleto}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                      {evaluadoresDisponibles.find(e => e.id === evaluadorSeleccionado)?.profesion}
                      {evaluadoresDisponibles.find(e => e.id === evaluadorSeleccionado)?.institucion &&
                        ` • ${evaluadoresDisponibles.find(e => e.id === evaluadorSeleccionado)?.institucion}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Botones PEQUEÑOS */}
              <div className="space-y-1.5">
                <button
                  onClick={confirmarSeleccion}
                  disabled={!evaluadorSeleccionado}
                  className={`w-full py-2 px-3 text-xs font-medium text-white rounded-lg transition-colors ${
                    evaluadorSeleccionado
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  {areaSeleccion.evaluadorId ? "Confirmar Cambio" : "Confirmar Asignación"}
                </button>
               
                <button
                  onClick={() => {
                    setModalSeleccionAbierto(false);
                    setAreaSeleccion(null);
                    setEvaluadorSeleccionado(null);
                  }}
                  className="w-full py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesignarEvaluadorPage;