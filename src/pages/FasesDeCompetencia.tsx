import React, { useState } from 'react';
import Paginacion from '../components/ui/Paginacion';

// Estados (mockups)
const estadosOlimpiada = [
  { id: 1, nombre: 'No Iniciada' },
  { id: 2, nombre: 'Fase de Clasificación' },
  { id: 3, nombre: 'Fase Final' },
  { id: 4, nombre: 'Concluida' },
];

// Historial simulado (secuencia de mockups)
const historialInicial = [
  { id: 1, numero: 1, accion: 'Iniciada', fechaHora: '14/03/2025 - 16:20 hrs', administrador: 'Juan Daniel Aves', fase: 'Clasificación', estado: 'Completado' },
  { id: 2, numero: 2, accion: 'Abierta', fechaHora: '15/03/2025 - 08:30 hrs', administrador: 'Ana García', fase: 'Clasificación', estado: 'Completado' },
  { id: 3, numero: 3, accion: 'Cerrada', fechaHora: '16/03/2025 - 17:45 hrs', administrador: 'Luis Torres', fase: 'Clasificación', estado: 'Completado' },
  { id: 4, numero: 4, accion: 'Publicada', fechaHora: '17/03/2025 - 09:00 hrs', administrador: 'Sofía Vargas', fase: 'Clasificación', estado: 'Completado' },
  { id: 5, numero: 5, accion: 'Abierta', fechaHora: '18/03/2025 - 12:15 hrs', administrador: 'Diego Morales', fase: 'Final', estado: 'Completado' },
];

const FasesDeCompetencia: React.FC = () => {
  const [estadoActualId, setEstadoActualId] = useState(2); // Ejemplo: Fase de Clasificación
  const [historial, setHistorial] = useState(historialInicial);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const estadoActual = estadosOlimpiada.find(e => e.id === estadoActualId)!;

  // Cambiar estado
  const handleEstadoChange = (nuevoId: number) => {
    setEstadoActualId(nuevoId);
    // Simular cambio en historial
    const acciones = ['Iniciada', 'Abierta', 'Cerrada', 'Publicada'];
    const accion = acciones[Math.floor(Math.random() * acciones.length)];
    const nuevaEntrada = {
      id: historial.length + 1,
      numero: historial.length + 1,
      accion,
      fechaHora: new Date().toLocaleString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' hrs',
      administrador: 'Juan Daniel Aves',
      fase: estadoActual.nombre,
      estado: 'Completado',
    };
    setHistorial([nuevaEntrada, ...historial]);
  };

  // Botones dinámicos
  const handleAbrirFase = () => alert('Fase abierta (simulado)');
  const handleCerrarFase = () => alert('Fase cerrada (simulado)');
  const handlePublicarResultados = () => alert('Resultados publicados (simulado)');

  // Paginación
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const historialPaginado = historial.slice(inicio, inicio + registrosPorPagina);
  const totalRegistros = historial.length;

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

      {/* Card: Estado de la olimpiada */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Estado de la olimpiada
        </h2>

        <div className="flex flex-wrap gap-6 mb-6">
          {estadosOlimpiada.map((estado) => (
            <label key={estado.id} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="estado-olimpiada"
                value={estado.id}
                checked={estadoActualId === estado.id}
                onChange={() => handleEstadoChange(estado.id)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                estadoActualId === estado.id ? 'border-green-500' : 'border-gray-300'
              }`}>
                {estadoActualId === estado.id && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
              <span className={`text-sm ${estadoActualId === estado.id ? 'font-medium text-green-600' : 'text-gray-600'}`}>
                {estado.nombre}
              </span>
            </label>
          ))}
        </div>

        {/* Botones dinámicos */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleAbrirFase}
            className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-colors bg-green-500 hover:bg-green-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Abrir fase
          </button>

          <button
            onClick={handleCerrarFase}
            className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-colors bg-red-500 hover:bg-red-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Cerrar fase
          </button>

          <button
            onClick={handlePublicarResultados}
            className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg transition-colors bg-blue-500 hover:bg-blue-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Publicar resultados
          </button>
        </div>
      </div>

      {/* Card: Historial */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historial de Cambios de Fase
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N°</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">FASE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">FECHA Y HORA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ADMINISTRADOR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">FASE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ESTADO</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {historialPaginado.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.accion === 'Iniciada' ? 'bg-blue-100 text-blue-800' :
                      item.accion === 'Abierta' ? 'bg-green-100 text-green-800' :
                      item.accion === 'Cerrada' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.accion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.fechaHora}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.administrador}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.fase}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Mostrando {inicio + 1} de {Math.min(inicio + registrosPorPagina, totalRegistros)} de {totalRegistros}
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