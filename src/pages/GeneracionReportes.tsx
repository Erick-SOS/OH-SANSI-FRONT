// src/pages/GeneracionReportes.tsx
import React, { useState, useMemo } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';
import BarraBusquedaAreas from '../components/tables/BarraBusqueda';
import { exportarComoPDF, exportarComoXLSX, type ExportData } from '../utils/exportUtils';

type ReporteKey = 'historial' | 'inscritos' | 'resultados' | 'premiacion';

const configuraciones = {
  historial: {
    titulo: 'Historial de Cambios',
    columnas: [
      { clave: 'nombre', titulo: 'Nombre', alineacion: 'izquierda' as const },
      { clave: 'fecha', titulo: 'Fecha y Hora', alineacion: 'izquierda' as const },
      { clave: 'olimpistaOGrupo', titulo: 'Olimpiada/Grupo Afectado', alineacion: 'izquierda' as const },
      { clave: 'notaAnterior', titulo: 'Nota Anterior', alineacion: 'centro' as const },
      { clave: 'notaNueva', titulo: 'Nueva Nota', alineacion: 'centro' as const },
    ],
    datos: Array.from({ length: 57 }, (_, i): ExportData => ({
      nombre: i % 2 === 0 ? 'Umad Wilson' : 'Juan Pérez',
      fecha: `20/03/2025 - 18:0${(i % 5) + 1} hrs`,
      olimpistaOGrupo: 'Abraham Espinoza',
      notaAnterior: String(20 - (i % 5)),
      notaNueva: '20',
    })),
  },
  inscritos: {
    titulo: 'Inscritos por Área',
    columnas: [
      { clave: 'estudiante', titulo: 'Estudiante', alineacion: 'izquierda' as const },
      { clave: 'area', titulo: 'Área', alineacion: 'izquierda' as const },
      { clave: 'institucion', titulo: 'Institución', alineacion: 'izquierda' as const },
      { clave: 'fecha', titulo: 'Fecha Inscripción', alineacion: 'centro' as const },
    ],
    datos: Array.from({ length: 57 }, (_, i): ExportData => ({
      estudiante: `Estudiante ${i + 1}`,
      area: ['Matemáticas', 'Física', 'Química'][i % 3],
      institucion: 'Colegio Nacional',
      fecha: '01/03/2025',
    })),
  },
  resultados: {
    titulo: 'Resultados Clasificación',
    columnas: [
      { clave: 'estudiante', titulo: 'Estudiante', alineacion: 'izquierda' as const },
      { clave: 'puntaje', titulo: 'Puntaje', alineacion: 'centro' as const },
      { clave: 'posicion', titulo: 'Posición', alineacion: 'centro' as const },
      { clave: 'area', titulo: 'Área', alineacion: 'izquierda' as const },
    ],
    datos: Array.from({ length: 57 }, (_, i): ExportData => ({
      estudiante: `Estudiante ${i + 1}`,
      puntaje: String(95 - i),
      posicion: String(i + 1),
      area: 'Física',
    })),
  },
  premiacion: {
    titulo: 'Premiación Final',
    columnas: [
      { clave: 'estudiante', titulo: 'Estudiante', alineacion: 'izquierda' as const },
      { clave: 'premio', titulo: 'Premio', alineacion: 'centro' as const },
      { clave: 'area', titulo: 'Área', alineacion: 'izquierda' as const },
      { clave: 'institucion', titulo: 'Institución', alineacion: 'izquierda' as const },
    ],
    datos: Array.from({ length: 57 }, (_, i): ExportData => ({
      estudiante: `Ganador ${i + 1}`,
      premio: ['Oro', 'Plata', 'Bronce'][i % 3],
      area: 'Química',
      institucion: 'IEP San José',
    })),
  },
};

const GeneracionReportes: React.FC = () => {
  const [tipo, setTipo] = useState<ReporteKey>('historial');
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [exportando, setExportando] = useState(false);

  const config = configuraciones[tipo];
  const registrosPorPagina = 7;

  const datosFiltrados = useMemo((): ExportData[] => {
    if (!terminoBusqueda.trim()) return config.datos;
    const termino = terminoBusqueda.toLowerCase();
    return config.datos.filter((item) =>
      Object.values(item).some((val) => typeof val === 'string' && val.toLowerCase().includes(termino))
    );
  }, [config.datos, terminoBusqueda]);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    return datosFiltrados.slice(inicio, fin);
  }, [datosFiltrados, paginaActual]);

  const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);

  const handleCambioPagina = (pagina: number) => setPaginaActual(pagina);
  
  const handleBuscarChange = (termino: string) => {
    setTerminoBusqueda(termino);
    setPaginaActual(1);
  };

  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await exportarComoPDF(datosFiltrados, terminoBusqueda, tipo);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setExportando(false);
    }
  };

  const handleExportarXLSX = async () => {
    setExportando(true);
    try {
      await exportarComoXLSX(datosFiltrados, tipo);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="p-1">
      {/* TÍTULO + BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
          Generación de reportes
        </h1>
        <nav className="text-sm text-gray-600 dark:text-gray-400">
          <span>Inicio</span>
          <span className="mx-2">›</span>
          <span className="text-gray-800 dark:text-white">Generación de reportes</span>
        </nav>
      </div>

      {/* SELECTOR + BOTONES */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de reporte:
            </span>
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as ReporteKey);
                setPaginaActual(1);
                setTerminoBusqueda('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#465FFF] bg-white dark:bg-gray-700"
            >
              <option value="historial">Historial de Cambios</option>
              <option value="inscritos">Inscritos por Área</option>
              <option value="resultados">Resultados Clasificación</option>
              <option value="premiacion">Premiación Final</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleExportarPDF}
              disabled={exportando}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportando ? 'Exportando...' : 'Exportar como PDF'}
            </button>
            <button
              onClick={handleExportarXLSX}
              disabled={exportando}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#465FFF] rounded-lg hover:bg-[#3a4fe6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportando ? 'Exportando...' : 'Exportar como XLSX'}
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm mb-1">
        <BarraBusquedaAreas
          terminoBusqueda={terminoBusqueda}
          onBuscarChange={handleBuscarChange}
        />
      </div>

      {/* RESULTADOS */}
      {terminoBusqueda && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {datosFiltrados.length} resultados encontrados para "{terminoBusqueda}"
        </div>
      )}

      {/* TABLA */}
      <div className="mb-1">
        <TablaBase
          datos={datosPaginados}
          columnas={config.columnas}
          conOrdenamiento={false}
          conAcciones={false}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* PAGINACIÓN */}
      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={datosFiltrados.length}
        registrosPorPagina={registrosPorPagina}
        onPaginaChange={handleCambioPagina}
      />
    </div>
  );
};

export default GeneracionReportes;