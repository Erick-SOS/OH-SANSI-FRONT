// src/pages/ResultadosDeCalificaciones.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← AÑADIDO

interface ResultadoExamen {
  id: number;
  area: string;
  nivel: string;
  modalidad: string;
  fase: string;
  estado: 'Clasificado' | 'No clasificado';
  nota: number;
  notaTotal: number;
  notaEvaluador: string;
  habilitadoSiguienteFase: boolean;
}

interface DatosEstudiante {
  nombreCompleto: string;
  ci: string;
  unidadEducativa: string;
  resultados: ResultadoExamen[];
}

const baseDeDatosOlimpistas: Record<string, DatosEstudiante> = {
  "8429135": {
    nombreCompleto: "Juan Daniel Álvarez",
    ci: "8429135",
    unidadEducativa: "Martín Cárdenas",
    resultados: [
      { id: 1, area: "Literatura", nivel: "Primaria", modalidad: "Individual", fase: "Clasificación", estado: "Clasificado", nota: 80, notaTotal: 100, notaEvaluador: "Buen desempeño académico", habilitadoSiguienteFase: true },
      { id: 2, area: "Historia", nivel: "Primaria", modalidad: "Grupal", fase: "Clasificación", estado: "No clasificado", nota: 45, notaTotal: 100, notaEvaluador: "Falta mejorar la cooperación con su grupo", habilitadoSiguienteFase: false },
    ],
  },
  "9876543": {
    nombreCompleto: "María Rojas López",
    ci: "9876543",
    unidadEducativa: "Adela Zamudio",
    resultados: [
      { id: 1, area: "Matemáticas", nivel: "Secundaria", modalidad: "Individual", fase: "Clasificación", estado: "Clasificado", nota: 92, notaTotal: 100, notaEvaluador: "Excelente resolución de problemas", habilitadoSiguienteFase: true },
    ],
  },
  "1234567": {
    nombreCompleto: "Luis Gamboa Torres",
    ci: "1234567",
    unidadEducativa: "6 de Agosto",
    resultados: [
      { id: 1, area: "Física", nivel: "Preuniversitario", modalidad: "Individual", fase: "Clasificación", estado: "No clasificado", nota: 38, notaTotal: 100, notaEvaluador: "Errores conceptuales graves en mecánica y termodinámica", habilitadoSiguienteFase: false },
    ],
  },
};

const ResultadosDeCalificaciones: React.FC = () => {
  const navigate = useNavigate(); // ← AÑADIDO para navegación

  const [ciInput, setCiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [datosEncontrados, setDatosEncontrados] = useState<DatosEstudiante | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buscarPorCI = () => {
    const ci = ciInput.trim();
    if (!ci) return setError("Por favor, ingrese el número de CI del olimpista.");
    if (!/^\d+$/.test(ci)) return setError("El CI solo debe contener números.");

    setLoading(true);
    setError(null);
    setDatosEncontrados(null);

    setTimeout(() => {
      const estudiante = baseDeDatosOlimpistas[ci];
      if (estudiante) setDatosEncontrados(estudiante);
      else setError("No se encontró ningún olimpista con el CI ingresado.");
      setLoading(false);
    }, 1400);
  };

  const fieldBase = 'w-full px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Título */}
        <h1 className="text-center text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-12">
          Resultados de la Competencia
        </h1>

        {/* BOTONES CON NAVEGACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Lista de Clasificados */}
          <button
            onClick={() => navigate('/lista-clasificados')} // ← Puedes cambiar esta ruta después
            className="group flex flex-col items-center justify-center p-10 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
          >
            <svg className="w-20 h-20 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Lista de Clasificados</h3>
            <p className="text-sm opacity-90 text-center">Ver estudiantes que pasaron a la siguiente fase</p>
          </button>

          {/* Lista de Premiados → REDIRIGE A LA PÁGINA QUE ME PASASTE */}
          <button
            onClick={() => navigate('/consulta-de-premiados')} // ← RUTA CORRECTA
            className="group flex flex-col items-center justify-center p-10 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
          >
            <svg className="w-20 h-20 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Lista de Premiados</h3>
            <p className="text-sm opacity-90 text-center">Ganadores de medallas y menciones de honor</p>
          </button>
        </div>

        {/* CONSULTA INDIVIDUAL - CENTRADA Y COMPACTA */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-5">
              <h2 className="text-2xl font-bold text-center">
                Realice la consulta de un Olimpista específico
              </h2>
            </div>
            <div className="p-8">
              <label className="block text-center text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                Ingrese el número de CI del olimpista
              </label>
              <input
                type="text"
                value={ciInput}
                onChange={(e) => setCiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarPorCI()}
                className={fieldBase}
                placeholder="Ej: 8429135"
                autoFocus
              />

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-center">
                  {error}
                </div>
              )}

              <button
                onClick={buscarPorCI}
                disabled={loading}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] shadow-lg flex justify-center items-center text-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Consultando...
                  </>
                ) : (
                  'Consultar Resultados'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RESULTADOS - SIN CAMBIOS */}
        {datosEncontrados && !loading && (
          <div className="mt-16 space-y-6 max-w-5xl mx-auto">
            {/* ... tu sección de resultados original ... */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
                <div><span className="font-bold text-gray-900 dark:text-white">Nombre del olimpista:</span> {datosEncontrados.nombreCompleto}</div>
                <div><span className="font-bold text-gray-900 dark:text-white">CI:</span> {datosEncontrados.ci}</div>
                <div><span className="font-bold text-gray-900 dark:text-white">Unidad Educativa:</span> {datosEncontrados.unidadEducativa}</div>
              </div>
            </div>

            <div className="border-2 border-blue-500 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-lg">
              <div className="bg-blue-600 text-white px-6 py-3 font-semibold">
                {datosEncontrados.resultados.length} resultado{datosEncontrados.resultados.length > 1 ? 's' : ''} de búsqueda encontrados
              </div>
              <div className="p-6 space-y-6">
                {datosEncontrados.resultados.map((resultado) => (
                  <div key={resultado.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                      <div><div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Área</div><div className="font-bold text-gray-800 dark:text-white text-lg">{resultado.area}</div></div>
                      <div><div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Nivel</div><div className="font-bold text-gray-800 dark:text-white text-lg">{resultado.nivel}</div></div>
                      <div><div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Modalidad</div><div className="font-bold text-gray-800 dark:text-white text-lg">{resultado.modalidad}</div></div>
                      <div><div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Fase</div><div className="font-bold text-gray-800 dark:text-white text-lg">{resultado.fase}</div></div>
                    </div>
                    <div className={`rounded-lg p-4 border ${resultado.estado === 'Clasificado' ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' : 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'}`}>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">Estado: {resultado.estado}</h3>
                          <p className="text-sm opacity-90">Nota del evaluador: {resultado.notaEvaluador}</p>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-3xl font-bold">{resultado.nota}<span className="text-lg opacity-70">/{resultado.notaTotal}</span></div>
                          <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Puntuación Total</div>
                          {resultado.habilitadoSiguienteFase && <div className="text-xs font-bold mt-1 text-green-600 dark:text-green-400">Habilitado para siguiente fase</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultadosDeCalificaciones;