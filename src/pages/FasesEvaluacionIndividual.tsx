import React, { useState, useMemo, useEffect } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import toast from 'react-hot-toast';
import SelectorListasEvaluador from '../components/modals/SelectorListasEvaluador';


interface EvaluacionItem {
  id: number;
  nombre: string;
  ci: number;
  codigo: number;
  areaCompetencia: string;
  nivel: string;
  modalidad: string;
  fase: string;
  nota: number;
  observacion: string;
  desclasificado?: boolean;
  motivo?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
  // const navigate = useNavigate(); // Comentado para evitar error de linter

  // Todos los datos crudos del backend
  const [allEvaluaciones, setAllEvaluaciones] = useState<EvaluacionItem[]>([]);
  // Grupos únicos detectados: "Area - Nivel - Modalidad - Fase"
  const [availableGroups, setAvailableGroups] = useState<{ area: string; nivel: string; modalidad: string; fase: string; count: number }[]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0);
  const [showListSelectionModal, setShowListSelectionModal] = useState(false);

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

        const response = await fetch('https://back-oh-sansi.vercel.app/api/evaluacion-individual/assigned', {
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

        // Filtrar solo individuales y normalizar
        const individuales = data.filter(d => d.tipo === 'INDIVIDUAL').map(d => ({
          ...d,
          nota: Number(d.nota),
          observacion: d.observacion || '',
          ci: d.ci || 0,
          codigo: d.codigo,
          areaCompetencia: d.areaCompetencia || 'Desconocida',
          nivel: d.nivel || 'Desconocido',
          modalidad: d.modalidad || 'INDIVIDUAL',
          // Si el back no trae fase, asumimos 'Clasificación' por defecto o lo que corresponda según la lógica de negocio.
          // Si quisiéramos ser robustos, si no viene, ponemos "Clasificación" como string.
          fase: d.fase || 'Clasificación',
        }));

        setAllEvaluaciones(individuales);

        // Extraer grupos únicos considerando 4 factores
        const groupsMap = new Map<string, { area: string; nivel: string; modalidad: string; fase: string; count: number }>();

        individuales.forEach((item: EvaluacionItem) => {
          const key = `${item.areaCompetencia}|${item.nivel}|${item.modalidad}|${item.fase}`;
          if (!groupsMap.has(key)) {
            groupsMap.set(key, {
              area: item.areaCompetencia,
              nivel: item.nivel,
              modalidad: item.modalidad,
              fase: item.fase,
              count: 0
            });
          }
          const group = groupsMap.get(key);
          if (group) group.count++;
        });

        const groups = Array.from(groupsMap.values());
        setAvailableGroups(groups);
        if (groups.length > 0) {
          // Por defecto seleccionamos el primero si no hay selección previa
          setSelectedGroupIndex(0);
        }

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

  // Derivar datos según el grupo seleccionado
  const currentGroup = availableGroups[selectedGroupIndex];

  // Filtrar evaluaciones que pertenecen al grupo activo
  const evaluacionesDelGrupo = useMemo(() => {
    if (!currentGroup) return [];
    return allEvaluaciones.filter(e =>
      e.areaCompetencia === currentGroup.area &&
      e.nivel === currentGroup.nivel &&
      e.modalidad === currentGroup.modalidad &&
      e.fase === currentGroup.fase
    );
  }, [allEvaluaciones, currentGroup]);

  // Valores dinámicos para el header
  const infoArea = currentGroup?.area || "Cargando...";
  const infoNivel = currentGroup?.nivel || "Cargando...";
  const infoModalidad = currentGroup?.modalidad || "Cargando...";
  const infoFase = currentGroup?.fase || "Cargando...";

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
    // Actualizamos allEvaluaciones, ya que es la fuente de verdad
    setAllEvaluaciones(prev =>
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
    // Validamos solo las del grupo actual
    return evaluacionesDelGrupo.every(item => {
      if (item.desclasificado) return true;
      const notaActual = (edits[item.id]?.nota ?? item.nota) as number;
      const obsActual = (edits[item.id]?.observacion ?? item.observacion) || '';
      return notaActual >= 1 && notaActual <= 100 && obsActual.trim().length > 0;
    });
  };

  const handleEnviarLista = () => {
    if (!validarListaCompleta()) {
      setIntentosFallidos(true);
      toast.error('Complete nota y observación para todos los participantes de esta lista');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmarEnvio = () => {
    // Aplicamos los edits a allEvaluaciones
    const finalData = allEvaluaciones.map(item => {
      if (edits[item.id]) {
        return { ...item, ...edits[item.id] }
      }
      return item;
    });

    // Aquí idealmente filtraríamos o enviaríamos SOLO las del grupo actual al backend si la API lo requiere por separado.
    // O si la API recibe todo el lote, enviamos todo.
    // Asumiremos que actualizamos el estado local por ahora, simulando el "envío" exitoso de este lote.
    // Si la API espera un envío parcial, habría que ajustar la lógica de fetch/post.

    setAllEvaluaciones(finalData);

    // Limpiamos edits de los items procesados
    const newEdits = { ...edits };
    evaluacionesDelGrupo.forEach(item => {
      delete newEdits[item.id];
    });
    setEdits(newEdits);

    setIntentosFallidos(false);
    toast.success('Calificaciones guardadas localmente (simulado)');
    setShowConfirmModal(false);
    // setTimeout(() => navigate('/evaluador/dashboard'), 1500); // Comentado para no salir y poder editar otra lista
  };

  const handleValueChange = (id: number, field: keyof EvaluacionItem, value: string | number) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    // Reemplazaremos la lógica de handleSort para que actualice un estado de 'sortConfig' y usaremos eso en 'filteredData'.
    setSortConfig({ column, direction });
  };

  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);

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
    let data = [...evaluacionesDelGrupo];

    // 1. Filtro de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.nombre.toLowerCase().includes(term) ||
        item.ci.toString().includes(term) ||
        item.codigo.toString().includes(term)
      );
    }

    // 2. Ordenamiento
    if (sortConfig) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.sort((a: any, b: any) => {
        const aVal = a[sortConfig.column];
        const bVal = b[sortConfig.column];
        if (typeof aVal === 'string' && typeof bVal === 'string')
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        if (typeof aVal === 'number' && typeof bVal === 'number')
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        return 0;
      });
    }

    return data;
  }, [evaluacionesDelGrupo, searchTerm, sortConfig]);

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
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              {availableGroups.length > 1 && (
                <button
                  onClick={() => setShowListSelectionModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition"
                >
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Cambiar de lista
                </button>
              )}
              <nav className="text-sm text-gray-600 dark:text-gray-400">
                Inicio › Fases de Evaluación › Individual
              </nav>
            </div>
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
                Enviar calificaciones ({filteredData.length})
              </button>
            </div>
          </div>

          {availableGroups.length === 0 && !allEvaluaciones.length ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Aún no tienes listas asignadas
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm text-center">
                Ponte en contacto con el administrador si crees que esto es un error.
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}

        </div>
      </div>

      <SelectorListasEvaluador
        isOpen={showListSelectionModal}
        onClose={() => setShowListSelectionModal(false)}
        groups={availableGroups}
        selectedGroupIndex={selectedGroupIndex}
        onSelect={(idx) => {
          setSelectedGroupIndex(idx);
          setCurrentPage(1);
          setSearchTerm('');
        }}
      />

      { }
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">
              Confirmar envío de calificaciones
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Está a punto de enviar las calificaciones para el grupo <strong>{infoArea} - {infoNivel}</strong>.
              <br />
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
