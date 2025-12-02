import React, { useState, useMemo } from 'react';
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
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionItem[]>([
    { id: 1, nombre: "Julian Daniel Alvarez", ci: 7329643, codigo: 100, areaCompetencia: "Matemáticas", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 2, nombre: "Maria Rojas Lopez", ci: 7458213, codigo: 107, areaCompetencia: "Matemáticas", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 3, nombre: "Luis Gamboa Torrez", ci: 8321975, codigo: 120, areaCompetencia: "Matemáticas", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 4, nombre: "Ana Perez Vargas", ci: 7194650, codigo: 56, areaCompetencia: "Matemáticas", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 5, nombre: "Jorge Mendoza Arce", ci: 7953174, codigo: 94, areaCompetencia: "Matemáticas", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 6, nombre: "Carla Quispe Condori", ci: 7842156, codigo: 78, areaCompetencia: "Matemáticas", nivel: "Primaria", nota: 0, observacion: "" },
    { id: 7, nombre: "Soledad Ramos Guzman", ci: 7710339, codigo: 81, areaCompetencia: "Matemáticas", nivel: "Primaria", nota: 0, observacion: "" },
  ]);

  const [edits, setEdits] = useState<Record<number, Partial<EvaluacionItem>>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(false);
  const [showDesclasificar, setShowDesclasificar] = useState(false);
  const [showReclasificar, setShowReclasificar] = useState(false);
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
    
    if (nota === 0 || nota === null || nota === undefined) {
      return 'PENDIENTE';
    }
    
    return nota >= 60 ? 'CLASIFICADO' : 'NO CLASIFICADO';
  };

  const abrirDesclasificar = (item: EvaluacionItem) => {
    setItemSeleccionado(item);
    
    // Si ya está desclasificado, abro modal para re-clasificar
    if (item.desclasificado) {
      setShowReclasificar(true);
    } else {
      // Si no está desclasificado, abro modal para desclasificar
      setMotivo(item.motivo || '');
      setShowDesclasificar(true);
    }
  };

  const confirmarDesclasificar = () => {
    if (!motivo.trim()) {
      toast.error('El motivo es obligatorio');
      return;
    }
    
    if (itemSeleccionado) {
      // Actualizar en evaluaciones
      setEvaluaciones(prev =>
        prev.map(item =>
          item.id === itemSeleccionado.id
            ? { 
                ...item, 
                desclasificado: true, 
                motivo: motivo.trim(),
                observacion: `DESCLASIFICADO: ${motivo.trim()}` 
              }
            : item
        )
      );
      
      // Actualizar en edits también
      setEdits(prev => ({
        ...prev,
        [itemSeleccionado.id]: {
          ...prev[itemSeleccionado.id],
          desclasificado: true,
          motivo: motivo.trim(),
          observacion: `DESCLASIFICADO: ${motivo.trim()}`
        }
      }));
      
      toast.success('Participante desclasificado');
    }
    
    setShowDesclasificar(false);
    setMotivo('');
    setItemSeleccionado(null);
  };

  const confirmarReclasificar = () => {
    if (itemSeleccionado) {
      // Actualizar en evaluaciones
      setEvaluaciones(prev =>
        prev.map(item =>
          item.id === itemSeleccionado.id
            ? { 
                ...item, 
                desclasificado: false, 
                motivo: '',
                observacion: '' // Limpiar observación al re-clasificar
              }
            : item
        )
      );
      
      // Actualizar en edits también
      setEdits(prev => ({
        ...prev,
        [itemSeleccionado.id]: {
          ...prev[itemSeleccionado.id],
          desclasificado: false,
          motivo: '',
          observacion: ''
        }
      }));
      
      toast.success('Participante re-clasificado');
    }
    
    setShowReclasificar(false);
    setItemSeleccionado(null);
  };

  const validarListaCompleta = (): boolean => {
    return evaluaciones.every(item => {
      if (item.desclasificado) return true;
      
      const notaActual = (edits[item.id]?.nota ?? item.nota) as number;
      const obsActual = (edits[item.id]?.observacion ?? item.observacion) || '';
      
      return notaActual >= 0.1 && notaActual <= 100 && obsActual.trim().length > 0;
    });
  };

  const handleEnviarLista = () => {
    if (!validarListaCompleta()) {
      setIntentosFallidos(true);
      toast.error('Complete nota (0.1-100) y observación para todos los participantes');
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
    // SE ELIMINÓ LA REDIRECCIÓN
  };

  const handleValueChange = (id: number, field: keyof EvaluacionItem, value: string | number) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  // Función para validar y formatear nota decimal
  const validarYFormatearNota = (valor: string): number | null => {
    if (valor === '') return 0;
    
    // Permitir números con un solo punto decimal
    if (!/^\d*\.?\d*$/.test(valor)) {
      return null;
    }
    
    const num = parseFloat(valor);
    
    // Validar que sea un número válido
    if (isNaN(num)) {
      return null;
    }
    
    // Validar rango 0-100
    if (num < 0) return 0;
    if (num > 100) return 100;
    
    // Redondear a 1 decimal
    return Math.round(num * 10) / 10;
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
        const tieneError = intentosFallidos && !fila.desclasificado && 
          (valorActual < 0.1 || valorActual > 100);

        if (fila.desclasificado) {
          // Nota normal, sin negrita para desclasificados
          return <span className="text-base text-gray-700 dark:text-gray-300">
            {valorActual.toFixed(1)}
          </span>;
        }

        return (
          <input
            type="text"
            value={valorActual === 0 ? '' : valorActual.toString()}
            onChange={(e) => {
              const valor = e.target.value;
              const notaValidada = validarYFormatearNota(valor);
              
              if (notaValidada !== null) {
                handleValueChange(fila.id, 'nota', notaValidada);
              }
            }}
            onBlur={(e) => {
              // Formatear a 1 decimal al perder foco
              const valor = e.target.value;
              if (valor !== '') {
                const notaValidada = validarYFormatearNota(valor);
                if (notaValidada !== null && notaValidada !== 0) {
                  // Formatear a 1 decimal
                  const formateada = Math.round(notaValidada * 10) / 10;
                  handleValueChange(fila.id, 'nota', formateada);
                }
              }
            }}
            className={`w-24 h-10 text-center text-base rounded-full border-2 outline-none transition-all ${
              tieneError
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 bg-white hover:border-indigo-400 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600'
            }`}
            placeholder="0.0-100"
            title="Ingrese nota de 0 a 100 (se permiten decimales, ej: 50.5, 60.1, 90.8)"
            pattern="[0-9]*\.?[0-9]*"
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
              className={`w-full p-2 text-sm border rounded-lg resize-none ${
                tieneError 
                  ? 'border-red-500 bg-red-50' 
                  : fila.desclasificado 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-300 dark:border-gray-600'
              }`}
              rows={2}
              placeholder={fila.desclasificado ? "Motivo de desclasificación" : "Ingrese observación..."}
              maxLength={100}
              readOnly={false}
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
            <div onDoubleClick={() => abrirDesclasificar(fila)} className="cursor-pointer" title="Doble clic para re-clasificar">
              <span className="inline-block px-5 py-2 rounded-full text-sm font-bold bg-red-100 text-red-700 border border-red-300">
                DESCLASIFICADO
              </span>
            </div>
          );
        }

        return (
          <div onDoubleClick={() => abrirDesclasificar(fila)} className="cursor-pointer" title="Doble clic para desclasificar">
            <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
              estado === 'CLASIFICADO'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : estado === 'PENDIENTE'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
            }`}>
              {estado === 'CLASIFICADO' ? 'Clasificado' : 
               estado === 'PENDIENTE' ? 'Pendiente' : 
               'No Clasificado'}
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

      {/* Modal de confirmación de envío */}
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

      {/* Modal de desclasificar */}
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

      {/* Modal de re-clasificar */}
      {showReclasificar && itemSeleccionado && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-green-600 mb-4">Re-clasificar participante</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>{itemSeleccionado.nombre}</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Desea re-clasificar a este participante?
              <br />
              <span className="text-sm text-gray-500 dark:text-gray-500">
                La observación actual se limpiará.
              </span>
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => { 
                  setShowReclasificar(false); 
                  setItemSeleccionado(null); 
                }} 
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarReclasificar} 
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                Sí, re-clasificar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FasesEvaluacionIndividual;