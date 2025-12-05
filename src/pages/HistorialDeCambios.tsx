import React, { useState, useMemo } from 'react';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import { exportarComoPDF, ExportData } from '../utils/exportUtils';

type TipoCambio =
  | 'Calificación'
  | 'Parametrizacion'
  | 'Fase'
  | 'Asignacion'
  | 'Inscripcion'
  | 'Aprobacion';

interface HistorialItem {
  id: number;
  numero: number;
  usuario: string;
  rol: string;
  fecha: string;
  tipoCambio: TipoCambio;
  accion: string; 
}

type SortKey = keyof Pick<
  HistorialItem,
  'numero' | 'rol' | 'usuario' | 'fecha' | 'tipoCambio' | 'accion'
>;

const TIPOS_CAMBIO = [
  { value: 'TODOS', label: 'Todos los tipos' },
  { value: 'Calificación', label: 'Calificación' },
  { value: 'Parametrizacion', label: 'Parametrizacion' },
  { value: 'Fase', label: 'Fase' },
  { value: 'Asignacion', label: 'Asignación' },
  { value: 'Inscripcion', label: 'Inscripción' },
  { value: 'Aprobacion', label: 'Aprobación' },
];

const SortIcon: React.FC<{ dir: 'asc' | 'desc' | null }> = ({ dir }) => {
  if (!dir) return <span className="opacity-30">↕</span>;
  return <span>{dir === 'asc' ? '↑' : '↓'}</span>;
};

const HistorialDeCambios: React.FC = () => {
  // Datos estáticos de ejemplo
  const [rows] = useState<HistorialItem[]>([
    {
      id: 1,
      numero: 1,
      usuario: 'Unad Wilson',
      rol: 'Evaluador',
      fecha: '20/03/2025 - 18:00 hrs',
      tipoCambio: 'Calificación',
      accion: 'Lista enviada',
    },
    {
      id: 2,
      numero: 2,
      usuario: 'María Rodríguez',
      rol: 'Administrador',
      fecha: '21/03/2025 - 14:30 hrs',
      tipoCambio: 'Parametrizacion',
      accion: 'Medallero/nota mínima actualizados',
    },
    {
      id: 3,
      numero: 3,
      usuario: 'Juan Pérez',
      rol: 'Administrador',
      fecha: '22/03/2025 - 10:15 hrs',
      tipoCambio: 'Fase',
      accion: 'Apertura',
    },
    {
      id: 4,
      numero: 4,
      usuario: 'Juan Pérez',
      rol: 'Administrador',
      fecha: '25/03/2025 - 18:30 hrs',
      tipoCambio: 'Fase',
      accion: 'Cierre',
    },
    {
      id: 5,
      numero: 5,
      usuario: 'Ana Gutiérrez',
      rol: 'Responsable de área',
      fecha: '22/03/2025 - 11:00 hrs',
      tipoCambio: 'Asignacion',
      accion: 'Asignación de responsable de área',
    },
    {
      id: 6,
      numero: 6,
      usuario: 'Carlos Mendoza',
      rol: 'Administrador',
      fecha: '23/03/2025 - 09:10 hrs',
      tipoCambio: 'Inscripcion',
      accion: 'Importación de olimpistas (CSV)',
    },
    {
      id: 7,
      numero: 7,
      usuario: 'Unad Wilson',
      rol: 'Administrador',
      fecha: '23/03/2025 - 16:45 hrs',
      tipoCambio: 'Aprobacion',
      accion: 'Lista aprobada',
    },
  ]);

  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [exportando, setExportando] = useState(false);
  const [tipoCambioFiltro, setTipoCambioFiltro] =
    useState<'TODOS' | TipoCambio>('TODOS');
  const [sortBy, setSortBy] = useState<SortKey>('numero');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const registrosPorPagina = 7;

  // Filtro general (texto + tipo de cambio)
  const filtrados = useMemo(() => {
    const termino = terminoBusqueda.trim().toLowerCase();

    return rows.filter((item) => {
      const coincideTipo =
        tipoCambioFiltro === 'TODOS' || item.tipoCambio === tipoCambioFiltro;
      if (!coincideTipo) return false;

      if (!termino) return true;

      const campos = [
        item.numero,
        item.rol,
        item.usuario,
        item.fecha,
        item.tipoCambio,
        item.accion,
      ];

      return campos
        .map((campo) => String(campo).toLowerCase())
        .some((campo) => campo.includes(termino));
    });
  }, [rows, terminoBusqueda, tipoCambioFiltro]);

  // Ordenamiento
  const ordenados = useMemo(() => {
    const copia = [...filtrados];
    copia.sort((a, b) => {
      const va = a[sortBy];
      const vb = b[sortBy];

      const A = typeof va === 'number' ? va : String(va).toLowerCase();
      const B = typeof vb === 'number' ? vb : String(vb).toLowerCase();

      if (A < B) return sortDir === 'asc' ? -1 : 1;
      if (A > B) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copia;
  }, [filtrados, sortBy, sortDir]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / registrosPorPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * registrosPorPagina;
  const pageRows = ordenados.slice(inicio, inicio + registrosPorPagina);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const handleExportarComoPDF = async () => {
    setExportando(true);
    try {
      const datosExport: ExportData[] = ordenados.map((item) => {
        const { id, ...rest } = item;
        return rest as unknown as ExportData;
      });

      await exportarComoPDF(
        datosExport,
        terminoBusqueda,
        'historial-cambios'
      );
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="p-1">
      {/* Título */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Historial de Cambios
        </h1>
      </div>

      {/* Filtros y exportación */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <BarraBusquedaAreas
              terminoBusqueda={terminoBusqueda}
              onBuscarChange={(t) => {
                setTerminoBusqueda(t);
                setPaginaActual(1);
              }}
            />
          </div>

          {/* Select tipo + exportar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                Filtrar por tipo de cambio
              </span>
              <select
                value={tipoCambioFiltro}
                onChange={(e) => {
                  setTipoCambioFiltro(e.target.value as 'TODOS' | TipoCambio);
                  setPaginaActual(1);
                }}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#465FFF]"
              >
                {TIPOS_CAMBIO.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportarComoPDF}
              disabled={exportando}
              className="px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#465FFF] focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50"
            >
              {exportando ? 'Exportando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla con ordenamiento */}
      <div className="overflow-hidden rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 mb-1">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200">
            <tr>
              {(
                [
                  ['numero', 'N°'],
                  ['rol', 'Rol'],
                  ['usuario', 'Nombre'],
                  ['fecha', 'Fecha y Hora'],
                  ['tipoCambio', 'Tipo de Cambio'],
                  ['accion', 'Acción / Detalle'],
                ] as [SortKey, string][]
              ).map(([key, label]) => {
                const dir = sortBy === key ? sortDir : null;
                return (
                  <th
                    key={key}
                    className="cursor-pointer select-none px-4 py-3"
                    onClick={() => toggleSort(key)}
                    title="Ordenar"
                  >
                    <div className="flex items-center gap-1">
                      <span>{label}</span>
                      <SortIcon dir={dir} />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No hay resultados.
                </td>
              </tr>
            )}

            {pageRows.map((item) => (
              <tr
                key={item.id}
                className="border-t last:border-b border-gray-100 dark:border-gray-700"
              >
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {item.numero}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {item.rol}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {item.usuario}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {item.fecha}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {item.tipoCambio}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {item.accion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <Paginacion
        paginaActual={paginaSegura}
        totalPaginas={totalPaginas}
        totalRegistros={ordenados.length}
        registrosPorPagina={registrosPorPagina}
        onPaginaChange={setPaginaActual}
      />
    </div>
  );
};

export default HistorialDeCambios;
