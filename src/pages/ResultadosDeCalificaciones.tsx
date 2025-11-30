import React, { useState } from 'react';

// Interfaces para la nueva estructura de datos
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

const ResultadosDeCalificaciones: React.FC = () => {
  // Estados del formulario
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [nombreCompletoInput, setNombreCompletoInput] = useState('');

  // Estados de la búsqueda
  const [loading, setLoading] = useState(false);
  const [datosEncontrados, setDatosEncontrados] = useState<DatosEstudiante | null>(null);
  //const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const simularBusqueda = () => {
    if (!tipoDocumento || !numeroDocumento.trim() || !nombreCompletoInput.trim()) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    setLoading(true);
    setDatosEncontrados(null);
    //setBusquedaRealizada(true);

    // Simulación de petición de red
    setTimeout(() => {
      const mockData: DatosEstudiante = {
        nombreCompleto: nombreCompletoInput, // Usamos el nombre ingresado para el mock
        ci: numeroDocumento,
        unidadEducativa: 'Martin Cardenas',
        resultados: [
          {
            id: 1,
            area: 'Literatura',
            nivel: 'Primaria',
            modalidad: 'Individual',
            fase: 'Clasificacion',
            estado: 'Clasificado',
            nota: 80,
            notaTotal: 100,
            notaEvaluador: 'Buen desempeño academico',
            habilitadoSiguienteFase: true,
          },
          {
            id: 2,
            area: 'Historia',
            nivel: 'Primaria',
            modalidad: 'Grupal',
            fase: 'Clasificacion',
            estado: 'No clasificado',
            nota: 45,
            notaTotal: 100,
            notaEvaluador: 'Falta mejorar la cooperacion con su grupo',
            habilitadoSiguienteFase: false,
          },
        ],
      };

      setDatosEncontrados(mockData);
      setLoading(false);
    }, 1500);
  };

  const fieldBase =
    'w-full px-4 py-3 rounded-lg border transition focus:outline-none focus:ring-2 ' +
    'bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-blue-500/30 focus:border-blue-300 ' +
    'dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-blue-700';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Resultados de la consulta
          </h1>
        </header>

        {/* Formulario de Búsqueda */}
        <div className="rounded-2xl shadow-xl overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h2 className="text-2xl font-bold">Datos de la consulta</h2>
          </div>
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Nombre completo del olimpista
                </label>
                <input
                  type="text"
                  value={nombreCompletoInput}
                  onChange={(e) => setNombreCompletoInput(e.target.value)}
                  className={fieldBase}
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Tipo de Documento
                </label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className={fieldBase}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="CI">Cédula de Identidad (CI)</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Número de Documento
                </label>
                <input
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  className={fieldBase}
                  placeholder="Ej: 8429135"
                />
              </div>
            </div>

            <button
              onClick={simularBusqueda}
              disabled={loading}
              className={`mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.01] shadow-lg flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        {/* Resultados */}
        {datosEncontrados && !loading && (
          <div className="space-y-6 animate-fade-in">
            {/* Información del Estudiante */}
            <div className="bg-transparent p-4">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-y-2 gap-x-8 text-gray-700 dark:text-gray-300">
                <span className="font-bold text-gray-900 dark:text-white">Nombre del olimpista:</span>
                <span>{datosEncontrados.nombreCompleto}</span>

                <span className="font-bold text-gray-900 dark:text-white">CI :</span>
                <span>{datosEncontrados.ci}</span>

                <span className="font-bold text-gray-900 dark:text-white">Unidad Educativa :</span>
                <span>{datosEncontrados.unidadEducativa}</span>
              </div>
            </div>

            {/* Contenedor de Resultados */}
            <div className="border-2 border-blue-500 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-lg">
              <div className="bg-blue-600 text-white px-6 py-3 font-semibold">
                {datosEncontrados.resultados.length} resultados de busqueda encontrados
              </div>

              <div className="p-6 space-y-6">
                {datosEncontrados.resultados.map((resultado) => (
                  <div key={resultado.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                    {/* Encabezado de la tarjeta */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Area</div>
                        <div className="font-bold text-gray-800 dark:text-white text-lg">{resultado.area}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Nivel</div>
                        <div className="font-bold text-gray-800 dark:text-white text-lg">{resultado.nivel}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Modalidad</div>
                        <div className="font-bold text-gray-800 dark:text-white text-lg">{resultado.modalidad}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Fase</div>
                        <div className="font-bold text-gray-800 dark:text-white text-lg">{resultado.fase}</div>
                      </div>
                    </div>

                    {/* Cuerpo de la tarjeta (Estado y Nota) */}
                    <div
                      className={`rounded-lg p-4 border ${resultado.estado === 'Clasificado'
                        ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
                        : 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
                        }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">
                            Estado: {resultado.estado}
                          </h3>
                          <p className="text-sm opacity-90">
                            Nota del evaluador: {resultado.notaEvaluador}
                          </p>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-3xl font-bold">
                            {resultado.nota}<span className="text-lg opacity-70">/{resultado.notaTotal}</span>
                          </div>
                          <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Puntuación Total</div>
                          {resultado.habilitadoSiguienteFase && (
                            <div className="text-xs font-bold mt-1">
                              Habilitado para siguiente fase
                            </div>
                          )}
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