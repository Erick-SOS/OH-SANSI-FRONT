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

const FasesDeEvaluacion: React.FC = () => {
  // Datos para Participantes Grupales
  const [evaluacionesGrupales, setEvaluacionesGrupales] = useState<EvaluacionItem[]>([
    { id: 1, nombre: "Equipo Alfa", areaCompetencia: "Ciencias", modalidad: "Grupal", nivel: "Secundaria", nota: 85, observacion: "Buen desempeño" },
    { id: 2, nombre: "Grupo Beta", areaCompetencia: "Lenguaje", modalidad: "Grupal", nivel: "Primaria", nota: 92, observacion: "Excelente trabajo" },
    { id: 3, nombre: "Equipo Gamma", areaCompetencia: "Matemáticas", modalidad: "Grupal", nivel: "Secundaria", nota: 78, observacion: "Mejorar ritmo" },
    { id: 4, nombre: "Grupo Delta", areaCompetencia: "Historia", modalidad: "Grupal", nivel: "Primaria", nota: 88, observacion: "Progreso notable" },
    { id: 5, nombre: "Equipo Epsilon", areaCompetencia: "Física", modalidad: "Grupal", nivel: "Secundaria", nota: 75, observacion: "Revisar conceptos" },
    { id: 6, nombre: "Grupo Zeta", areaCompetencia: "Geografía", modalidad: "Grupal", nivel: "Primaria", nota: 90, observacion: "Gran esfuerzo" },
    { id: 7, nombre: "Equipo Eta", areaCompetencia: "Química", modalidad: "Grupal", nivel: "Secundaria", nota: 82, observacion: "Buen inicio" },
  ]);

  // Datos para Participantes Individuales (con observaciones en blanco)
  const [evaluacionesIndividuales, setEvaluacionesIndividuales] = useState<EvaluacionItem[]>([
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

  // Estados para ediciones
  const [editsGrupales, setEditsGrupales] = useState<Record<number, Partial<EvaluacionItem>>>({});
  const [editsIndividuales, setEditsIndividuales] = useState<Record<number, Partial<EvaluacionItem>>>({});
  const [savedEditsGrupales, setSavedEditsGrupales] = useState<Record<number, Partial<EvaluacionItem>>>({});
  const [savedEditsIndividuales, setSavedEditsIndividuales] = useState<Record<number, Partial<EvaluacionItem>>>({});

  // Handlers para Grupales
  const handleValueChangeGrupales = (id: number, field: keyof EvaluacionItem, value: string | number) => {
    setEditsGrupales(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSaveChangesGrupales = () => {
    const updatedData = evaluacionesGrupales.map(item => {
      const changes = editsGrupales[item.id] || {};
      return {
        ...item,
        ...changes
      };
    });
    setEvaluacionesGrupales(updatedData);
    setSavedEditsGrupales(prev => ({ ...prev, ...editsGrupales }));
    setEditsGrupales({});
  };

  // Handlers para Individuales
  const handleValueChangeIndividuales = (id: number, field: keyof EvaluacionItem, value: string | number) => {
    setEditsIndividuales(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSaveChangesIndividuales = () => {
    const updatedData = evaluacionesIndividuales.map(item => {
      const changes = editsIndividuales[item.id] || {};
      return {
        ...item,
        ...changes
      };
    });
    setEvaluacionesIndividuales(updatedData);
    setSavedEditsIndividuales(prev => ({ ...prev, ...editsIndividuales }));
    setEditsIndividuales({});
  };

  // Handlers para ordenamiento
  const handleSortGrupales = (column: string, direction: 'asc' | 'desc') => {
    const sortedData = [...evaluacionesGrupales].sort((a, b) => {
      if (direction === 'asc') {
        return a[column as keyof EvaluacionItem] > b[column as keyof EvaluacionItem] ? 1 : -1;
      }
      return a[column as keyof EvaluacionItem] < b[column as keyof EvaluacionItem] ? 1 : -1;
    });
    setEvaluacionesGrupales(sortedData);
  };

  const handleSortIndividuales = (column: string, direction: 'asc' | 'desc') => {
    const sortedData = [...evaluacionesIndividuales].sort((a, b) => {
      if (direction === 'asc') {
        return a[column as keyof EvaluacionItem] > b[column as keyof EvaluacionItem] ? 1 : -1;
      }
      return a[column as keyof EvaluacionItem] < b[column as keyof EvaluacionItem] ? 1 : -1;
    });
    setEvaluacionesIndividuales(sortedData);
  };

  // Columnas comunes para ambas tablas
  const columns = [
    { 
      clave: 'nombre', 
      titulo: 'Nombre', 
      alineacion: 'izquierda' as const, 
      ordenable: true 
    },
    { 
      clave: 'areaCompetencia', 
      titulo: 'Área de Competencia', 
      alineacion: 'izquierda' as const, 
      ordenable: true 
    },
    { 
      clave: 'nivel', 
      titulo: 'Nivel', 
      alineacion: 'izquierda' as const, 
      ordenable: true 
    },
    { 
      clave: 'nota', 
      titulo: 'Nota', 
      alineacion: 'centro' as const,
      formatearCelda: (valor: number, fila: EvaluacionItem, esIndividual?: boolean) => (
        <input
          type="text"
          value={esIndividual 
            ? (editsIndividuales[fila.id]?.nota ?? valor)
            : (editsGrupales[fila.id]?.nota ?? valor)
          }
          onChange={(e) => {
            const nuevoValor = e.target.value;
            if (/^\d*$/.test(nuevoValor)) {
              if (esIndividual) {
                handleValueChangeIndividuales(fila.id, 'nota', nuevoValor === '' ? 0 : Number(nuevoValor));
              } else {
                handleValueChangeGrupales(fila.id, 'nota', nuevoValor === '' ? 0 : Number(nuevoValor));
              }
            }
          }}
          className={`w-20 text-center border rounded-xl px-2 py-1
            ${esIndividual
              ? (editsIndividuales[fila.id]?.nota !== undefined && editsIndividuales[fila.id]?.nota !== valor
                ? 'border-red-500 bg-red-50'
                : savedEditsIndividuales[fila.id]?.nota !== undefined
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300')
              : (editsGrupales[fila.id]?.nota !== undefined && editsGrupales[fila.id]?.nota !== valor
                ? 'border-red-500 bg-red-50'
                : savedEditsGrupales[fila.id]?.nota !== undefined
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300')
            }
          `}
        />
      )
    },
    { 
      clave: 'observacion', 
      titulo: 'Observación', 
      alineacion: 'izquierda' as const, 
      formatearCelda: (valor: string, fila: EvaluacionItem, esIndividual?: boolean) => (
        <textarea
          value={esIndividual
            ? (editsIndividuales[fila.id]?.observacion ?? valor)
            : (editsGrupales[fila.id]?.observacion ?? valor)
          }
          onChange={(e) => {
            if (esIndividual) {
              handleValueChangeIndividuales(fila.id, 'observacion', e.target.value);
            } else {
              handleValueChangeGrupales(fila.id, 'observacion', e.target.value);
            }
          }}
          placeholder="Ingrese observación..."
          className={`w-full p-1 border rounded-xl ${
            esIndividual
              ? (editsIndividuales[fila.id]?.observacion !== undefined && editsIndividuales[fila.id]?.observacion !== valor
                ? 'border-red-500 bg-red-50'
                : savedEditsIndividuales[fila.id]?.observacion !== undefined
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300')
              : (editsGrupales[fila.id]?.observacion !== undefined && editsGrupales[fila.id]?.observacion !== valor
                ? 'border-red-500 bg-red-50'
                : savedEditsGrupales[fila.id]?.observacion !== undefined
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300')
          }`}
        />
      )
    },
  ];

  // Estados de paginación y búsqueda para ambas tablas
  const [currentPageGrupales, setCurrentPageGrupales] = useState(1);
  const [currentPageIndividuales, setCurrentPageIndividuales] = useState(1);
  const [searchTermGrupales, setSearchTermGrupales] = useState('');
  const [searchTermIndividuales, setSearchTermIndividuales] = useState('');
  const itemsPerPage = 7;

  // Filtrado y paginación para Grupales
  const filteredDataGrupales = useMemo(() => {
    if (!searchTermGrupales.trim()) return evaluacionesGrupales;
    const term = searchTermGrupales.toLowerCase();
    return evaluacionesGrupales.filter(item =>
      item.nombre.toLowerCase().includes(term) ||
      item.areaCompetencia.toLowerCase().includes(term) ||
      item.nivel.toLowerCase().includes(term)
    );
  }, [evaluacionesGrupales, searchTermGrupales]);

  const paginatedDataGrupales = useMemo(() => {
    const start = (currentPageGrupales - 1) * itemsPerPage;
    return filteredDataGrupales.slice(start, start + itemsPerPage);
  }, [filteredDataGrupales, currentPageGrupales]);

  // Filtrado y paginación para Individuales
  const filteredDataIndividuales = useMemo(() => {
    if (!searchTermIndividuales.trim()) return evaluacionesIndividuales;
    const term = searchTermIndividuales.toLowerCase();
    return evaluacionesIndividuales.filter(item =>
      item.nombre.toLowerCase().includes(term) ||
      item.areaCompetencia.toLowerCase().includes(term) ||
      item.nivel.toLowerCase().includes(term)
    );
  }, [evaluacionesIndividuales, searchTermIndividuales]);

  const paginatedDataIndividuales = useMemo(() => {
    const start = (currentPageIndividuales - 1) * itemsPerPage;
    return filteredDataIndividuales.slice(start, start + itemsPerPage);
  }, [filteredDataIndividuales, currentPageIndividuales]);

  return (
    <div className="p-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Primera tabla: Calificación Participantes Individuales */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Calificación Participantes Individuales
          </h1>
          <nav className="text-sm text-gray-600 dark:text-gray-400">
            <span>Inicio</span> <span className="mx-2">›</span> <span className="text-gray-800 dark:text-white">Participantes</span>
          </nav>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <BarraBusquedaAreas 
                terminoBusqueda={searchTermIndividuales}
                onBuscarChange={(termino) => {
                  setSearchTermIndividuales(termino);
                  setCurrentPageIndividuales(1);
                }}
              />
            </div>
            <button
              onClick={handleSaveChangesIndividuales}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#465FFF] focus:ring-offset-2 dark:focus:ring-offset-gray-900 whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar cambios
            </button>
          </div>
        </div>

        {searchTermIndividuales && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredDataIndividuales.length} resultados encontrados para "{searchTermIndividuales}"
          </div>
        )}

        <div className="mb-1">
          <TablaBase
            datos={paginatedDataIndividuales.map((item, index) => ({ ...item, numero: (currentPageIndividuales - 1) * itemsPerPage + index + 1 }))}
            columnas={columns.map(col => ({
              ...col,
              formatearCelda: col.formatearCelda ? 
                (valor: any, fila: EvaluacionItem) => (col.formatearCelda as any)(valor, fila, true) 
                : undefined
            }))}
            conOrdenamiento={true}
            onOrdenar={handleSortIndividuales}
            conAcciones={false}
            className="w-full"
          />
        </div>

        <Paginacion
          paginaActual={currentPageIndividuales}
          totalPaginas={Math.ceil(filteredDataIndividuales.length / itemsPerPage)}
          totalRegistros={filteredDataIndividuales.length}
          registrosPorPagina={itemsPerPage}
          onPaginaChange={setCurrentPageIndividuales}
        />
      </div>

      {/* Segunda tabla: Calificación Participantes Grupales */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Calificación Participantes Grupales
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <BarraBusquedaAreas 
                terminoBusqueda={searchTermGrupales}
                onBuscarChange={(termino) => {
                  setSearchTermGrupales(termino);
                  setCurrentPageGrupales(1);
                }}
              />
            </div>
            <button
              onClick={handleSaveChangesGrupales}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#465FFF] focus:ring-offset-2 dark:focus:ring-offset-gray-900 whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar cambios
            </button>
          </div>
        </div>

        {searchTermGrupales && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredDataGrupales.length} resultados encontrados para "{searchTermGrupales}"
          </div>
        )}

        <div className="mb-1">
          <TablaBase
            datos={paginatedDataGrupales.map((item, index) => ({ ...item, numero: (currentPageGrupales - 1) * itemsPerPage + index + 1 }))}
            columnas={columns.map(col => ({
              ...col,
              formatearCelda: col.formatearCelda ? 
                (valor: any, fila: EvaluacionItem) => (col.formatearCelda as any)(valor, fila, false) 
                : undefined
            }))}
            conOrdenamiento={true}
            onOrdenar={handleSortGrupales}
            conAcciones={false}
            className="w-full"
          />
        </div>

        <Paginacion
          paginaActual={currentPageGrupales}
          totalPaginas={Math.ceil(filteredDataGrupales.length / itemsPerPage)}
          totalRegistros={filteredDataGrupales.length}
          registrosPorPagina={itemsPerPage}
          onPaginaChange={setCurrentPageGrupales}
        />
      </div>
    </div>
  );
};

export default FasesDeEvaluacion;