// src/pages/FasesEvaluacionIndividual.tsx
import React, { useState, useMemo } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';

interface EvaluacionItem {
  id: number;
  nombre: string;
  areaCompetencia: string;
  modalidad: string;
  nivel: string;
  nota: number;
  observacion: string;
}

const FasesEvaluacionIndividual: React.FC = () => {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionItem[]>([
    { id: 1, nombre: "Juan Pérez", areaCompetencia: "Ciencias", modalidad: "Individual", nivel: "Secundaria", nota: 0, observacion: "" },
    { id: 2, nombre: "María García", areaCompetencia: "Lenguaje", modalidad: "Individual", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 3, nombre: "Carlos López", areaCompetencia: "Matemáticas", modalidad: "Individual", nivel: "Secundaria", nota: 0, observacion: "" },
    { id: 4, nombre: "Ana Martínez", areaCompetencia: "Historia", modalidad: "Individual", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 5, nombre: "Luis Rodríguez", areaCompetencia: "Física", modalidad: "Individual", nivel: "Secundaria", nota: 0, observacion: "" },
    { id: 6, nombre: "Sofia Hernández", areaCompetencia: "Geografía", modalidad: "Individual", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 7, nombre: "Diego González", areaCompetencia: "Química", modalidad: "Individual", nivel: "Secundaria", nota: 0, observacion: "" },
    { id: 8, nombre: "Elena Sánchez", areaCompetencia: "Biología", modalidad: "Individual", nivel: "Secundaria", nota: 0, observacion: "" },
    { id: 9, nombre: "Pedro Ramírez", areaCompetencia: "Arte", modalidad: "Individual", nivel: "Primaria", nota: 0, observacion: "" },
  ]);

  const [edits, setEdits] = useState<Record<number, Partial<EvaluacionItem>>>({});
  const [savedEdits, setSavedEdits] = useState<Record<number, Partial<EvaluacionItem>>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 7;

  const handleValueChange = (id: number, field: keyof EvaluacionItem, value: string | number) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSaveChanges = () => {
    const updatedData = evaluaciones.map(item => {
      const changes = edits[item.id] || {};
      return { ...item, ...changes };
    });
    setEvaluaciones(updatedData);
    setSavedEdits(prev => ({ ...prev, ...edits }));
    setEdits({});
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    const sortedData = [...evaluaciones].sort((a, b) => {
      if (direction === 'asc') {
        return a[column as keyof EvaluacionItem] > b[column as keyof EvaluacionItem] ? 1 : -1;
      }
      return a[column as keyof EvaluacionItem] < b[column as keyof EvaluacionItem] ? 1 : -1;
    });
    setEvaluaciones(sortedData);
  };

  const columns = [
    { clave: 'nombre', titulo: 'Nombre', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'areaCompetencia', titulo: 'Área de Competencia', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'nivel', titulo: 'Nivel', alineacion: 'izquierda' as const, ordenable: true },
    {
      clave: 'nota',
      titulo: 'Nota',
      alineacion: 'centro' as const,
      formatearCelda: (valor: number, fila: EvaluacionItem) => (
        <input
          type="text"
          value={edits[fila.id]?.nota ?? valor}
          onChange={(e) => {
            const nuevoValor = e.target.value;
            if (/^\d*$/.test(nuevoValor)) {
              handleValueChange(fila.id, 'nota', nuevoValor === '' ? 0 : Number(nuevoValor));
            }
          }}
          className={`w-20 text-center border rounded-xl px-2 py-1
            ${edits[fila.id]?.nota !== undefined && edits[fila.id]?.nota !== valor
              ? 'border-red-500 bg-red-50'
              : savedEdits[fila.id]?.nota !== undefined
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300'
            }`}
        />
      )
    },
    {
      clave: 'observacion',
      titulo: 'Observación',
      alineacion: 'izquierda' as const,
      formatearCelda: (valor: string, fila: EvaluacionItem) => (
        <textarea
          value={edits[fila.id]?.observacion ?? valor}
          onChange={(e) => handleValueChange(fila.id, 'observacion', e.target.value)}
          placeholder="Ingrese observación..."
          className={`w-full p-1 border rounded-xl ${
            edits[fila.id]?.observacion !== undefined && edits[fila.id]?.observacion !== valor
              ? 'border-red-500 bg-red-50'
              : savedEdits[fila.id]?.observacion !== undefined
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300'
          }`}
        />
      )
    },
  ];

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return evaluaciones;
    const term = searchTerm.toLowerCase();
    return evaluaciones.filter(item =>
      item.nombre.toLowerCase().includes(term) ||
      item.areaCompetencia.toLowerCase().includes(term) ||
      item.nivel.toLowerCase().includes(term)
    );
  }, [evaluaciones, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
    <div className="p-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
          Calificación Participantes Individuales
        </h1>
        <nav className="text-sm text-gray-600 dark:text-gray-400">
          <span>Inicio</span> <span className="mx-2">›</span> <span className="text-gray-800 dark:text-white">Fases de Evaluación</span> <span className="mx-2">›</span> <span className="text-gray-800 dark:text-white">Individual</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <BarraBusquedaAreas
              terminoBusqueda={searchTerm}
              onBuscarChange={(termino) => {
                setSearchTerm(termino);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            onClick={handleSaveChanges}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#465FFF] focus:ring-offset-2 dark:focus:ring-offset-gray-900 whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Guardar cambios
          </button>
        </div>
      </div>

      {searchTerm && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {filteredData.length} resultados encontrados para "{searchTerm}"
        </div>
      )}

      <div className="mb-1">
        <TablaBase
          datos={paginatedData.map((item, index) => ({ ...item, numero: (currentPage - 1) * itemsPerPage + index + 1 }))}
          columnas={columns}
          conOrdenamiento={true}
          onOrdenar={handleSort}
          conAcciones={false}
          className="w-full"
        />
      </div>

      <Paginacion
        paginaActual={currentPage}
        totalPaginas={Math.ceil(filteredData.length / itemsPerPage)}
        totalRegistros={filteredData.length}
        registrosPorPagina={itemsPerPage}
        onPaginaChange={setCurrentPage}
      />
    </div>
  );
};

export default FasesEvaluacionIndividual;