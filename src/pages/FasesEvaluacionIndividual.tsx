import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import toast from 'react-hot-toast';


interface EvaluacionItem {
  id: number;
  nombre: string;
  ci: number;
  codigo: number;
  areaCompetencia: string;
  nivel: string;
  nota: number;
  observacion: string;
  desclasificado?: boolean;
  motivo?: string;
}

const formatearCI = (ci: number): string => {
  const str = ci.toString();
  if (str.length <= 3) return str;
  if (str.length <= 6) return `${str.slice(0, -3)}.${str.slice(-3)}`;
  return `${str.slice(0, -6)}.${str.slice(-6, -3)}.${str.slice(-3)}`;
};

const generarIniciales = (nombre: string): string => {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 0) return '??';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

const FiltrosInfoCard: React.FC<{ area: string; nivel: string; modalidad: string; fase: string }> = ({
  area, nivel, modalidad, fase,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-none border border-gray-200 dark:border-gray-700 p-4 mb-6">
    <div className="flex flex-wrap justify-between items-center gap-4 text-left">
      <div className="flex items-center space-x-2">
        <span className="text-gray-900 dark:text-gray-300 font-bold text-base">Área:</span>
        <span className="text-gray-700 dark:text-gray-300 font-normal text-base">{area}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-900 dark:text-gray-300 font-bold text-base">Nivel:</span>
        <span className="text-gray-700 dark:text-gray-300 font-normal text-base">{nivel}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-900 dark:text-gray-300 font-bold text-base">Modalidad:</span>
        <span className="text-gray-700 dark:text-gray-300 font-normal text-base">{modalidad}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-900 dark:text-gray-300 font-bold text-base">Fase:</span>
        <span className="text-gray-700 dark:text-gray-300 font-normal text-base">{fase}</span>
      </div>
    </div>
  </div>
);


const FasesEvaluacionIndividual: React.FC = () => {
  const navigate = useNavigate();

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionItem[]>([]);

  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('ohsansi/auth/token');
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch('http://localhost:3000/api/evaluacion-individual/assigned', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = result.data;

        // Filtrar solo individuales
        const individuales = data.filter(d => d.tipo === 'INDIVIDUAL').map(d => ({
          ...d,
          // Asegurar tipos
          nota: Number(d.nota),
          observacion: d.observacion || '',
          // ci y codigo vienen del back
          ci: d.ci || 0,
          codigo: d.codigo
        }));
        setEvaluaciones(individuales);
      } catch (error) {
        console.error("Error fetching data", error);
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [edits, setEdits] = useState<Record<number, Partial<EvaluacionItem>>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(false);
  const [showDesclasificar, setShowDesclasificar] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<EvaluacionItem | null>(null);
  const [motivo, setMotivo] = useState('');

  const itemsPerPage = 7;

  const infoArea = "Matemáticas";
  const infoNivel = "Primaria";
  const infoModalidad = "Individual";
  const infoFase = "Clasificación";

  const getEstado = (item: EvaluacionItem): string => {
    if (item.desclasificado) return 'DESCLASIFICADO';
    const nota = (edits[item.id]?.nota ?? item.nota) as number;
    return nota >= 60 ? 'CLASIFICADO' : 'NO CLASIFICADO';
  };

  const abrirDesclasificar = (item: EvaluacionItem) => {
    setItemSeleccionado(item);
    setMotivo(item.motivo || '');
    setShowDesclasificar(true);
  };

  const confirmarDesclasificar = () => {
    if (!motivo.trim()) {
      toast.error('El motivo es obligatorio');
      return;
    }
    setEvaluaciones(prev =>
      prev.map(i =>
        i.id === itemSeleccionado?.id
          ? { ...i, desclasificado: true, motivo: motivo.trim() }
          : i
      )
    );
    toast.success('Participante desclasificado');
    setShowDesclasificar(false);
    setMotivo('');
    setItemSeleccionado(null);
  };

  const validarListaCompleta = (): boolean => {
    return evaluaciones.every(item => {
      if (item.desclasificado) return true;
      const notaActual = (edits[item.id]?.nota ?? item.nota) as number;
      const obsActual = (edits[item.id]?.observacion ?? item.observacion) || '';
      return notaActual >= 1 && notaActual <= 100 && obsActual.trim().length > 0;
    });
  };

  const handleEnviarLista = () => {
    if (!validarListaCompleta()) {
      setIntentosFallidos(true);
      toast.error('Complete nota y observación para todos los participantes');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmarEnvio = () => {
    const finalData = evaluaciones.map(item => ({ ...item, ...edits[item.id] }));
    setEvaluaciones(finalData);
    setEdits({});
    setIntentosFallidos(false);
    toast.success('Calificaciones enviadas correctamente');
    setShowConfirmModal(false);
    setTimeout(() => navigate('/evaluador/dashboard'), 1500);
  };

  const handleValueChange = (id: number, field: keyof EvaluacionItem, value: string | number) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = [...evaluaciones].sort((a: any, b: any) => {
      const aVal = a[column];
      const bVal = b[column];
      if (typeof aVal === 'string' && typeof bVal === 'string')
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      if (typeof aVal === 'number' && typeof bVal === 'number')
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      return 0;
    });
    setEvaluaciones(sorted);
  };


  const columns = [
    {
      clave: 'participante',
      titulo: 'Participante',
      alineacion: 'izquierda' as const,
      ordenable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: EvaluacionItem & { numero: number }) => {
        const iniciales = generarIniciales(fila.nombre);
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
                CI: {formatearCI(fila.ci)} • Código: {fila.codigo}
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
      formatearCelda: (_: any, fila: EvaluacionItem) => (
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {fila.codigo}
        </span>
      ),
    },
    {
      clave: 'nota',
      titulo: 'Nota',
      alineacion: 'centro' as const,
      ordenable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: EvaluacionItem) => {
        const valorActual = (edits[fila.id]?.nota ?? fila.nota) as number;
        const tieneError = intentosFallidos && !fila.desclasificado && (valorActual < 1 || valorActual > 100);

        if (fila.desclasificado) {
          return <span className="text-xl font-bold text-gray-400">—</span>;
        }

        return (
          <input
            type="text"
            inputMode="numeric"
            value={valorActual === 100 ? '' : valorActual}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || /^\d+$/.test(val)) {
                const num = val === '' ? 100 : parseInt(val, 10);
                if (num <= 100) handleValueChange(fila.id, 'nota', num);
              }
            }}
            className={`w-16 h-10 text-center font-bold text-sm rounded-full border-2 outline-none transition-all ${tieneError
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-300 bg-white hover:border-indigo-400 focus:border-indigo-500'
              }`}
            placeholder="-"
          />
        );
      },
    },
    {
      clave: 'observacion',
      titulo: 'Observación',
      alineacion: 'izquierda' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: EvaluacionItem) => {
        const texto = (edits[fila.id]?.observacion ?? fila.observacion) || '';
        const tieneError = intentosFallidos && !fila.desclasificado && !texto.trim();

        return (
          <div className="space-y-1">
            <textarea
              value={texto}
              onChange={(e) => handleValueChange(fila.id, 'observacion', e.target.value)}
              className={`w-full p-2 text-sm border rounded-lg resize-none ${tieneError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              rows={2}
              placeholder="Obligatorio (máx. 100 caracteres)"
              maxLength={100}
            />
            <div className={`text-xs text-right font-medium ${texto.length > 100 ? 'text-red-600' : 'text-gray-500'}`}>
              {texto.length}/100
            </div>
          </div>
        );
      },
    },
    {
      clave: 'estado',
      titulo: 'Estado',
      alineacion: 'centro' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatearCelda: (_: any, fila: EvaluacionItem) => {
        const estado = getEstado(fila);

        if (fila.desclasificado) {
          return (
            <div onDoubleClick={() => abrirDesclasificar(fila)} className="cursor-pointer" title="Doble clic para ver/editar motivo">
              <span className="inline-block px-5 py-2 rounded-full text-sm font-bold bg-red-100 text-red-700 border border-red-300">
                DESCLASIFICADO
              </span>
            </div>
          );
        }

        return (
          <div onDoubleClick={() => abrirDesclasificar(fila)} className="cursor-pointer" title="Doble clic para desclasificar">
            <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${estado === 'CLASIFICADO'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
              }`}>
              {estado === 'CLASIFICADO' ? 'Clasificado' : 'No Clasificado'}
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
      item.ci.toString().includes(term) ||
      item.codigo.toString().includes(term)
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
              Calificación de Participantes Individuales
            </h1>
            <nav className="text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-0">
              Inicio › Fases de Evaluación › Individual
            </nav>
          </div>

          <FiltrosInfoCard area={infoArea} nivel={infoNivel} modalidad={infoModalidad} fase={infoFase} />

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <BarraBusquedaAreas
                terminoBusqueda={searchTerm}
                onBuscarChange={(t) => { setSearchTerm(t); setCurrentPage(1); }}
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
            <div className="min-w-[900px] overflow-x-auto">
              <TablaBase
                datos={paginatedData.map((item, i) => ({ ...item, numero: (currentPage - 1) * itemsPerPage + i + 1 }))}
                columnas={columns}
                conOrdenamiento={true}
                onOrdenar={handleSort}
                conAcciones={false}
              />
            </div>
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

      { }
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">
              Confirmar envío de calificaciones
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Una vez enviada la lista, <strong>no podrá modificarla nuevamente</strong>.
              <br /><br />¿Está seguro?
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirmModal(false)} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
                Cancelar
              </button>
              <button onClick={confirmarEnvio} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                Sí, enviar lista
              </button>
            </div>
          </div>
        </div>
      )}

      { }
      {showDesclasificar && itemSeleccionado && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Desclasificar participante</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>{itemSeleccionado.nombre}</strong>
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo obligatorio (copia, celular, indisciplina...)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowDesclasificar(false); setMotivo(''); setItemSeleccionado(null); }} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100">
                Cancelar
              </button>
              <button onClick={confirmarDesclasificar} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
                Desclasificar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FasesEvaluacionIndividual;