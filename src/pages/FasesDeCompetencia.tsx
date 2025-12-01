import React, { useState, useMemo } from 'react';
import TablaBase from '../components/tables/TablaBase';
import Paginacion from '../components/ui/Paginacion';

// SOLO las fases válidas (sin "No iniciada")
const estadosOlimpiada = [
  { id: 2, nombre: 'Fase de Clasificación' },
  { id: 3, nombre: 'Fase Final' },
  { id: 4, nombre: 'Concluida' },
];

// Historial simulado
const historialInicial = [
  { id: 1, numero: 1, accion: 'Iniciada', fechaHora: '14/03/2025 - 16:20 hrs', administrador: 'Juan Daniel Aves', fase: 'Fase de Clasificación', estado: 'Completado' },
  { id: 2, numero: 2, accion: 'Abierta', fechaHora: '15/03/2025 - 08:30 hrs', administrador: 'Ana García', fase: 'Fase de Clasificación', estado: 'Completado' },
  { id: 3, numero: 3, accion: 'Cerrada', fechaHora: '16/03/2025 - 17:45 hrs', administrador: 'Luis Torres', fase: 'Fase de Clasificación', estado: 'Completado' },
  { id: 4, numero: 4, accion: 'Publicada', fechaHora: '17/03/2025 - 09:00 hrs', administrador: 'Sofía Vargas', fase: 'Fase de Clasificación', estado: 'Completado' },
  { id: 5, numero: 5, accion: 'Abierta', fechaHora: '18/03/2025 - 12:15 hrs', administrador: 'Diego Morales', fase: 'Fase Final', estado: 'Completado' },
];

const FasesDeCompetencia: React.FC = () => {
  const [estadoActualId, setEstadoActualId] = useState(2);
  const [historial] = useState(historialInicial);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const estadoActual = estadosOlimpiada.find(e => e.id === estadoActualId)!;

  /** 🔍 FILTRO DE HISTORIAL POR FASE SELECCIONADA */
  const historialFiltrado = useMemo(
    () => historial.filter((h) => h.fase === estadoActual.nombre),
    [estadoActualId, historial]
  );

  // Configuración de columnas
  const columnas = [
    { clave: 'accion', titulo: 'Acción', alineacion: 'izquierda' as 'izquierda' },
    { clave: 'fechaHora', titulo: 'Fecha y Hora', alineacion: 'izquierda' as 'izquierda' },
    { clave: 'administrador', titulo: 'Administrador', alineacion: 'izquierda' as 'izquierda' },
    { clave: 'fase', titulo: 'Fase', alineacion: 'izquierda' as 'izquierda' },
    { clave: 'estado', titulo: 'Estado', alineacion: 'izquierda' as 'izquierda' },
  ];

  // Paginación basada en historial filtrado
  const totalRegistros = historialFiltrado.length;
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const historialPaginado = historialFiltrado.slice(inicio, inicio + registrosPorPagina);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Título */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestionar fases de competición
        </h1>

        <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
          </svg>
          Exportar PDF
        </button>
      </div>

      {/* Estado de la Olimpiada */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Estado de la olimpiada
        </h2>

        {/* Radios filtradores */}
        <div className="flex flex-wrap gap-6 mb-6">
          {estadosOlimpiada.map((estado) => (
            <label key={estado.id} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="estado-olimpiada"
                value={estado.id}
                checked={estadoActualId === estado.id}
                onChange={() => {
                  setEstadoActualId(estado.id);
                  setPaginaActual(1);
                }}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center 
                ${estadoActualId === estado.id ? 'border-green-500' : 'border-gray-300'}`}
              >
                {estadoActualId === estado.id && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
              <span
                className={`text-sm ${
                  estadoActualId === estado.id ? 'font-medium text-green-600' : 'text-gray-600'
                }`}
              >
                {estado.nombre}
              </span>
            </label>
          ))}
        </div>

        {/* Botones → SIN PUBLICAR RESULTADOS */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => alert('Fase abierta (simulado)')}
            className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-colors bg-green-500 hover:bg-green-600"
          >
            Abrir fase
          </button>

          <button
            onClick={() => alert('Fase cerrada (simulado)')}
            className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-colors bg-red-500 hover:bg-red-600"
          >
            Cerrar fase
          </button>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historial de Cambios (Filtrado)
        </h2>

        {/* Tabla */}
        <TablaBase
          datos={historialPaginado}
          columnas={columnas}
          conOrdenamiento={false}
          conAcciones={false}
          className="shadow-lg"
        />

        {/* Paginación */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Mostrando {inicio + 1} a {Math.min(inicio + registrosPorPagina, totalRegistros)} de {totalRegistros}
          </p>

          {totalRegistros > registrosPorPagina && (
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={Math.ceil(totalRegistros / registrosPorPagina)}
              totalRegistros={totalRegistros}
              registrosPorPagina={registrosPorPagina}
              onPaginaChange={setPaginaActual}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FasesDeCompetencia;
