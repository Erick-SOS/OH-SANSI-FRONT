import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import toast, { Toaster } from 'react-hot-toast';

interface EvaluacionItem {
  id: number;
  nombre: string;
  areaCompetencia: string;
  modalidad: string;
  nivel: string;
  nota: number;
  observacion: string;
}

const FasesEvaluacionGrupal: React.FC = () => {
  const navigate = useNavigate();
//Datos de ejemplo
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionItem[]>([
    { id: 1, nombre: "Equipo Alfa", areaCompetencia: "Ciencias", modalidad: "Grupal", nivel: "Secundaria", nota: 0, observacion: "" },
    { id: 2, nombre: "Grupo Beta", areaCompetencia: "Lenguaje", modalidad: "Grupal", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 3, nombre: "Equipo Gamma", areaCompetencia: "Matemáticas", modalidad: "Grupal", nivel: "Secundaria", nota: 0, observacion: "" },
  ]);

  const [edits, setEdits] = useState<Record<number, Partial<EvaluacionItem>>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(false);
  const itemsPerPage = 7;

  const validarListaCompleta = (): { esValida: boolean; errores: string[] } => {
    const errores: string[] = [];

    evaluaciones.forEach(item => {
      const notaActual = (edits[item.id]?.nota ?? item.nota) as number;
      const obsActual = (edits[item.id]?.observacion ?? item.observacion) as string || '';

      if (!notaActual || notaActual < 1 || notaActual > 100) {
        errores.push(`"${item.nombre}" tiene una nota inválida o vacía`);
      }
      if (obsActual.trim() === "") {
        errores.push(`"${item.nombre}" no tiene observación`);
      }
      if (obsActual.length > 100) {
        errores.push(`La observación de "${item.nombre}" excede los 100 caracteres`);
      }
    });

    return { esValida: errores.length === 0, errores };
  };

  const handleEnviarLista = () => {
    const { esValida, errores } = validarListaCompleta();
    if (!esValida) {
      setIntentosFallidos(true);
      errores.forEach(err => toast.error(err));
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmarEnvio = () => {
    const finalData = evaluaciones.map(item => ({ ...item, ...edits[item.id] }));
    setEvaluaciones(finalData);
    setEdits({});
    setIntentosFallidos(false);
    toast.success("¡Calificaciones grupales enviadas con éxito!");
    setShowConfirmModal(false);
    setTimeout(() => navigate('/evaluador/dashboard'), 1500);
  };

  const handleValueChange = (id: number, field: keyof EvaluacionItem, value: string | number) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    const sorted = [...evaluaciones].sort((a, b) => {
      const aVal = a[column as keyof EvaluacionItem];
      const bVal = b[column as keyof EvaluacionItem];
      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    setEvaluaciones(sorted);
  };

  const columns = [
    { clave: 'nombre', titulo: 'Nombre del Equipo', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'areaCompetencia', titulo: 'Área de Competencia', alineacion: 'izquierda' as const, ordenable: true },
    { clave: 'nivel', titulo: 'Nivel', alineacion: 'izquierda' as const, ordenable: true },
    {
      clave: 'nota',
      titulo: 'Nota',
      alineacion: 'centro' as const,
      formatearCelda: (_: number, fila: EvaluacionItem) => {
        const valorActual = edits[fila.id]?.nota ?? fila.nota;
        const esValido = valorActual >= 1 && valorActual <= 100;
        const tieneError = intentosFallidos && (!esValido || valorActual === 0);

        return (
          <input
            type="text"
            inputMode="numeric"
            value={valorActual}
            onChange={(e) => {
              const input = e.target.value;
              if (input === '' || /^\d+$/.test(input)) {
                const num = input === '' ? 0 : Number(input);
                if (num <= 100) handleValueChange(fila.id, 'nota', num);
              }
            }}
            className={`w-20 text-center border rounded-xl px-2 py-1 transition-all font-medium ${
              tieneError
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : esValido && intentosFallidos
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Obligatorio"
          />
        );
      }
    },
    {
      clave: 'observacion',
      titulo: 'Observación',
      alineacion: 'izquierda' as const,
      formatearCelda: (_: string, fila: EvaluacionItem) => {
        const texto = (edits[fila.id]?.observacion ?? fila.observacion) || '';
        const esValido = texto.trim() !== '' && texto.length <= 100;
        const tieneError = intentosFallidos && (!esValido || texto.trim() === '');

        return (
          <div className="relative">
            <textarea
              value={texto}
              onChange={(e) => handleValueChange(fila.id, 'observacion', e.target.value)}
              className={`w-full p-2 border rounded-xl resize-none transition-all font-medium ${
                tieneError
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : esValido && intentosFallidos
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              rows={2}
              placeholder="Obligatorio (máx. 100 caracteres)"
            />
            <span className={`absolute bottom-1 right-2 text-xs font-medium ${
              texto.length > 100 ? 'text-red-600' : texto.length > 80 ? 'text-orange-600' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {texto.length}/100
            </span>
          </div>
        );
      }
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
    <>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Calificación Participantes Grupales
            </h1>
            <nav className="text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-0">
              Inicio › Fases de Evaluación › Grupal
            </nav>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <BarraBusquedaAreas
                terminoBusqueda={searchTerm}
                onBuscarChange={(t) => {
                  setSearchTerm(t);
                  setCurrentPage(1);
                }}
              />
              <button
                onClick={handleEnviarLista}
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar calificaciones
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <TablaBase
              datos={paginatedData.map((item, i) => ({ ...item, numero: (currentPage - 1) * itemsPerPage + i + 1 }))}
              columnas={columns}
              conOrdenamiento={true}
              onOrdenar={handleSort}
              conAcciones={false}
            />
          </div>

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

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">
              Confirmar envío de calificaciones grupales
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Una vez enviada la lista de calificaciones grupales,<br />
              <strong className="text-gray-900 dark:text-white">no podrá modificarlas nuevamente</strong>.
              <br /><br />
              ¿Está completamente seguro de que desea enviar la lista final?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEnvio}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition shadow-md"
              >
                Sí, enviar lista
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </>
  );
};

export default FasesEvaluacionGrupal;