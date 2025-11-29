import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import toast, { Toaster } from 'react-hot-toast';

const generarInicialesEquipo = (nombreEquipo: string): string => {
  const palabras = nombreEquipo.trim().split(/\s+/).filter(p => p.length > 0);
  if (palabras.length === 0) return '??';
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return palabras.slice(0, 2).map(p => p[0]).join('').toUpperCase();
};

interface EvaluacionItem {
  id: number;
  nombre: string;
  areaCompetencia: string;
  nivel: string;
  nota: number;
  observacion: string;
}

const FasesEvaluacionGrupal: React.FC = () => {
  const navigate = useNavigate();

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionItem[]>([
    { id: 1, nombre: "Equipo Alfa", areaCompetencia: "Ciencias", nivel: "Secundaria", nota: 78, observacion: "Buen trabajo en equipo" },
    { id: 2, nombre: "Los Genios", areaCompetencia: "Matemáticas", nivel: "Secundaria", nota: 95, observacion: "Excelente desempeño" },
    { id: 3, nombre: "Águilas del Saber", areaCompetencia: "Lenguaje", nivel: "Primaria", nota: 88, observacion: "Muy creativos" },
    { id: 4, nombre: "Fénix Dorado", areaCompetencia: "Ciencias", nivel: "Primaria", nota: 85, observacion: "Gran coordinación" },
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
      const notaActual = (edits[item.id]?.nota ?? item.nota) ?? 0;
      const obsActual = (edits[item.id]?.observacion ?? item.observacion) ?? '';
      if (notaActual < 1 || notaActual > 100) errores.push(`"${item.nombre}" tiene nota inválida`);
      if (obsActual.trim() === "") errores.push(`"${item.nombre}" falta observación`);
      if (obsActual.length > 100) errores.push(`Observación de "${item.nombre}" excede 100 caracteres`);
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

  const handleValueChange = (id: number, field: 'nota' | 'observacion', value: string | number) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const columns = [
    {
      clave: 'equipo',
      titulo: 'Nombre del Equipo',
      alineacion: 'izquierda' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: EvaluacionItem & { numero: number }) => {
        const iniciales = generarInicialesEquipo(fila.nombre);

        return (
          <div className="flex items-center gap-3 py-3 min-w-0">
            <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full overflow-hidden shadow-md">
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                {iniciales}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {fila.nombre}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {fila.areaCompetencia} • {fila.nivel}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      clave: 'codigo',
      titulo: 'Código',
      alineacion: 'centro' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: EvaluacionItem) => `EQ${fila.id.toString().padStart(3, '0')}`,
    },
    {
      clave: 'estado',
      titulo: 'Estado',
      alineacion: 'centro' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: EvaluacionItem) => {
        const nota = (edits[fila.id]?.nota ?? fila.nota) ?? 0;
        const clasificado = nota >= 60;
        return (
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${clasificado ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
            {clasificado ? 'Clasificado' : 'No clasificado'}
          </span>
        );
      },
    },
    {
      clave: 'nota',
      titulo: 'Nota',
      alineacion: 'centro' as const,
      formatearCelda: (_: number, fila: EvaluacionItem) => {
        const valor = (edits[fila.id]?.nota ?? fila.nota) ?? 0;
        const error = intentosFallidos && (valor < 1 || valor > 100);

        return (
          <input
            type="text"
            inputMode="numeric"
            value={valor || ''}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^\d+$/.test(v)) {
                const num = v === '' ? 0 : Number(v);
                if (num <= 100) handleValueChange(fila.id, 'nota', num);
              }
            }}
            className={`w-20 sm:w-24 px-3 py-2 text-center rounded-xl font-medium text-sm border ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'bg-gray-100 dark:bg-gray-700 border-transparent'}`}
            placeholder="0-100"
          />
        );
      },
    },
    {
      clave: 'observacion',
      titulo: 'Observación',
      alineacion: 'izquierda' as const,
      formatearCelda: (_: string, fila: EvaluacionItem) => {
        const texto = (edits[fila.id]?.observacion ?? fila.observacion) ?? '';
        const error = intentosFallidos && (texto.trim() === '' || texto.length > 100);

        return (
          <div className="relative">
            <textarea
              value={texto}
              onChange={(e) => handleValueChange(fila.id, 'observacion', e.target.value)}
              className={`w-full min-w-[200px] sm:min-w-[280px] p-3 rounded-xl text-sm resize-none border ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800 border-transparent'}`}
              rows={2}
              placeholder="Obligatorio (máx. 100 caracteres)"
            />
            <span className={`absolute bottom-2 right-3 text-xs ${texto.length > 100 ? 'text-red-600' : texto.length > 80 ? 'text-orange-600' : 'text-gray-500'}`}>
              {texto.length}/100
            </span>
          </div>
        );
      },
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Igual que el individual pero con título grupal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Calificación Participantes Grupales
            </h1>
            <nav className="text-sm text-gray-500 dark:text-gray-400">
              Inicio › Fases de Evaluación › Grupal
            </nav>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
              <div><span className="font-medium">Área:</span> <span className="ml-2 text-gray-700 dark:text-gray-300">Todas</span></div>
              <div><span className="font-medium">Nivel:</span> <span className="ml-2 text-gray-700 dark:text-gray-300">Mixto</span></div>
              <div><span className="font-medium">Modalidad:</span> <span className="ml-2 text-gray-700 dark:text-gray-300">Grupal</span></div>
              <div><span className="font-medium">Fase:</span> <span className="ml-2 text-gray-700 dark:text-gray-300">Clasificación</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              <div className="flex-1">
                <BarraBusquedaAreas terminoBusqueda={searchTerm} onBuscarChange={(t) => { setSearchTerm(t); setCurrentPage(1); }} />
              </div>
              <button onClick={handleEnviarLista} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition shadow-sm whitespace-nowrap">
                Enviar calificaciones
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <div className="min-w-[800px]">
              <TablaBase
                datos={paginatedData.map((item, i) => ({ ...item, numero: (currentPage - 1) * itemsPerPage + i + 1 }))}
                columnas={columns}
                conOrdenamiento={true}
                conAcciones={false}
              />
            </div>
          </div>

          <div className="mt-6">
            <Paginacion paginaActual={currentPage} totalPaginas={Math.ceil(filteredData.length / itemsPerPage)} totalRegistros={filteredData.length} registrosPorPagina={itemsPerPage} onPaginaChange={setCurrentPage} />
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">Confirmar envío grupal</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Una vez enviada la lista,<br /><strong>no podrá modificarla nuevamente</strong>.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirmModal(false)} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancelar</button>
              <button onClick={confirmarEnvio} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">Sí, enviar</button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </>
  );
};

export default FasesEvaluacionGrupal;