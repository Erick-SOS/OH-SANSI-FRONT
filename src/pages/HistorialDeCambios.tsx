import React, { useState, useMemo } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import { exportarComoPDF, exportarComoXLSX } from '../utils/exportUtils'; // Ajustada la ruta

interface HistorialItem {
  id: number;
  nombre: string;
  fecha: string;
  olimpistaOGrupo: string;
  notaAnterior: string;
  notaNueva: string;
}

const HistorialDeCambios: React.FC = () => {
  const [datosCompletos] = useState<HistorialItem[]>([
    {
      id: 1,
      nombre: 'Unad Wilson',
      fecha: '20/03/2025 - 18:00 hrs',
      olimpistaOGrupo: 'Abraham Espinosa',
      notaAnterior: '20',
      notaNueva: '20',
    },
    {
      id: 2,
      nombre: 'Unad Wilson',
      fecha: '20/03/2025 - 18:00 hrs',
      olimpistaOGrupo: 'Abraham Espinosa',
      notaAnterior: '20',
      notaNueva: '20',
    },
    {
      id: 3,
      nombre: 'Unad Wilson',
      fecha: '20/03/2025 - 18:00 hrs',
      olimpistaOGrupo: 'Abraham Espinosa',
      notaAnterior: '20',
      notaNueva: '20',
    },
    {
      id: 4,
      nombre: 'Unad Wilson',
      fecha: '20/03/2025 - 18:00 hrs',
      olimpistaOGrupo: 'Abraham Espinosa',
      notaAnterior: '20',
      notaNueva: '20',
    },
    {
      id: 5,
      nombre: 'Maria Rodriguez',
      fecha: '21/03/2025 - 14:30 hrs',
      olimpistaOGrupo: 'Carlos Mendoza',
      notaAnterior: '18',
      notaNueva: '22',
    },
    {
      id: 6,
      nombre: 'Juan Perez',
      fecha: '22/03/2025 - 10:15 hrs',
      olimpistaOGrupo: 'Ana Gutierrez',
      notaAnterior: '15',
      notaNueva: '19',
    },
  ]);

  // Configuración de columnas para TablaBase
  const columnas = [
    {
      clave: 'nombre',
      titulo: 'Nombre',
      alineacion: 'izquierda' as const,
    },
    {
      clave: 'fecha',
      titulo: 'Fecha y Hora',
      alineacion: 'izquierda' as const,
    },
    {
      clave: 'olimpistaOGrupo',
      titulo: 'Olimpista/Grupo Asignado',
      alineacion: 'izquierda' as const,
    },
    {
      clave: 'notaAnterior',
      titulo: 'Nota Anterior',
      alineacion: 'centro' as const,
    },
    {
      clave: 'notaNueva',
      titulo: 'Nueva Nota',
      alineacion: 'centro' as const,
    },
  ];

  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [exportando, setExportando] = useState(false);
  const registrosPorPagina = 7;

  // Filtrar datos basados en la búsqueda
  const datosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return datosCompletos;
    }

    const termino = terminoBusqueda.toLowerCase();
    return datosCompletos.filter(
      (item) =>
        item.nombre.toLowerCase().includes(termino) ||
        item.fecha.toLowerCase().includes(termino) ||
        item.olimpistaOGrupo.toLowerCase().includes(termino) ||
        item.notaAnterior.toLowerCase().includes(termino) ||
        item.notaNueva.toLowerCase().includes(termino)
    );
  }, [datosCompletos, terminoBusqueda]);

  // Calcular datos paginados
  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    return datosFiltrados.slice(inicio, fin);
  }, [datosFiltrados, paginaActual, registrosPorPagina]);

  const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);

  const handleCambioPagina = (pagina: number) => {
    setPaginaActual(pagina);
  };

  const handleBuscarChange = (termino: string) => {
    setTerminoBusqueda(termino);
    setPaginaActual(1);
  };

  const handleExportarComoPDF = async () => {
    setExportando(true);
    try {
      await exportarComoPDF(datosFiltrados, terminoBusqueda, 'historial-cambios');
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setExportando(false);
    }
  };

  const handleExportarComoXLSX = async () => {
    setExportando(true);
    try {
      await exportarComoXLSX(datosFiltrados, 'historial-cambios');
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="p-1">
      {/* Primera fila: Título a la izquierda, Breadcrumb a la derecha */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
          Historial de Cambios
        </h1>
        <nav className="text-sm text-gray-600 dark:text-gray-400">
          <span>Inicio</span>
          <span className="mx-2">›</span>
          <span className="text-gray-800 dark:text-white">Historial de Cambios</span>
        </nav>
      </div>

      {/* Segunda fila: Barra de búsqueda a la izquierda, Botones de exportación a la derecha */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-md">
            <BarraBusquedaAreas
              terminoBusqueda={terminoBusqueda}
              onBuscarChange={handleBuscarChange}
            />
          </div>

          {/* Botones de exportación */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleExportarComoPDF}
              disabled={exportando}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#465FFF] focus:ring-offset-2 dark:focus:ring-offset-gray-900 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportando ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Exportando...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Exportar historial como PDF
                </>
              )}
            </button>
            <button
              onClick={handleExportarComoXLSX}
              disabled={exportando}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] border border-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#465FFF] focus:ring-offset-2 dark:focus:ring-offset-gray-900 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportando ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Exportando...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Exportar historial como XLSX
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de resultados de búsqueda */}
      {terminoBusqueda && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {datosFiltrados.length} resultados encontrados para "{terminoBusqueda}"
        </div>
      )}

      {/* Tabla usando TablaBase */}
      <div className="mb-1">
        <TablaBase
          datos={datosPaginados}
          columnas={columnas}
          conOrdenamiento={false}
          conAcciones={false}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Paginación */}
      <div>
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={datosFiltrados.length}
          registrosPorPagina={registrosPorPagina}
          onPaginaChange={handleCambioPagina}
        />
      </div>
    </div>
  );
};

export default HistorialDeCambios;