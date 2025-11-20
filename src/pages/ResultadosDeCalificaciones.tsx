import React, { useState } from 'react';

interface Participante {
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  area: string;
  nivel: string;
}

// Participantes hardcodeados
const participantes: Participante[] = [
  {
    tipoDocumento: 'CI',
    numeroDocumento: '8429135 CB',
    nombreCompleto: 'Mariana Alejandra Rojas Quinteros',
    area: 'Matemáticas',
    nivel: 'Secundario',
  },
  {
    tipoDocumento: 'CI',
    numeroDocumento: '10329487 LP',
    nombreCompleto: 'Diego Sebastián Villca Mamani',
    area: 'Física',
    nivel: 'Primario',
  },
  {
    tipoDocumento: 'CI',
    numeroDocumento: '7692084 SC',
    nombreCompleto: 'Antonella Fernanda Cuéllar Ríos',
    area: 'Robótica',
    nivel: 'Secundario',
  },
];

type EstadoNotas = 'aprobado' | 'reprobado' | 'pendiente' | null;

const ResultadosDeCalificaciones: React.FC = () => {
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [participanteSeleccionado, setParticipanteSeleccionado] = useState<Participante | null>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntuacionTotal, setPuntuacionTotal] = useState(0);
  const [estadoNotas, setEstadoNotas] = useState<EstadoNotas>(null);

  const normalizarDoc = (doc: string) =>
    doc.replace(/\s+/g, ' ').trim().toUpperCase();

  const generarResultados = () => {
    if (!tipoDocumento || !numeroDocumento.trim()) {
      alert('Por favor, seleccione el tipo de documento e ingrese el número.');
      return;
    }

    const entrada = normalizarDoc(numeroDocumento);

    const participante = participantes.find((p) => {
      const guardado = normalizarDoc(p.numeroDocumento);
      if (p.tipoDocumento.toUpperCase() !== tipoDocumento.toUpperCase()) return false;

      if (guardado === entrada) return true;

      const numeroGuardado = guardado.split(' ')[0];
      const numeroEntrada = entrada.split(' ')[0];
      return numeroGuardado === numeroEntrada;
    });

    if (!participante) {
      alert('No se encontró ningún participante con ese documento.');
      setMostrarResultados(false);
      setParticipanteSeleccionado(null);
      setEstadoNotas(null);
      return;
    }

    // Caso 1: Antonella → notas pendientes
    if (participante.numeroDocumento === '7692084 SC') {
      setParticipanteSeleccionado(participante);
      setPuntuacionTotal(0);
      setEstadoNotas('pendiente');
      setMostrarResultados(true);
      return;
    }

    // Caso 2 y 3: Mariana (aprobada) y Diego (reprobado)
    let notaFinal = 50; // valor por defecto
    let estado: EstadoNotas = null;

    if (participante.numeroDocumento === '8429135 CB') {
      notaFinal = 73;
      estado = 'aprobado';
    } else if (participante.numeroDocumento === '10329487 LP') {
      notaFinal = 40;
      estado = 'reprobado';
    }

    setPuntuacionTotal(notaFinal);
    setEstadoNotas(estado);
    setParticipanteSeleccionado(participante);
    setMostrarResultados(true);
  };

  const obtenerMensajeAprobacion = () => {
    if (puntuacionTotal >= 90) return '¡Excelente! Aprobado con honores';
    if (puntuacionTotal >= 80) return '¡Muy bien! Aprobado con distinción';
    if (puntuacionTotal >= 60) return '¡Bien! Aprobado satisfactoriamente';
    if (puntuacionTotal >= 51) return 'Aprobado';
    return 'No Aprobado';
  };

  const obtenerClaseAprobacion = () => {
    if (puntuacionTotal >= 60)
      return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-800';
    if (puntuacionTotal >= 51)
      return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800';
  };

  const fieldBase =
    'w-full px-4 py-3 rounded-lg border transition focus:outline-none focus:ring-2 ' +
    'bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-blue-500/30 focus:border-blue-300 ' +
    'dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-blue-700';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Consulta de Calificaciones y Resultados
          </h1>
        </header>

        {/* Formulario */}
        <div className="rounded-2xl shadow-xl overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <h2 className="text-3xl font-bold">Consulta de Calificaciones</h2>
          </div>
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
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
                  placeholder="Ej: 8429135 CB o solo 8429135"
                />
              </div>
            </div>

            <button
              onClick={generarResultados}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Consultar Calificaciones
            </button>
          </div>
        </div>

        {/* Resultados */}
        {mostrarResultados && participanteSeleccionado && (
          <div className="mt-8 rounded-2xl shadow-xl overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
              <h2 className="text-3xl font-bold">Resultados Obtenidos</h2>
            </div>
            <div className="p-8 space-y-8">
              {/* Información del participante */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                  Información del Participante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Nombre Completo</span>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {participanteSeleccionado.nombreCompleto}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Documento</span>
                    <p className="font-bold">
                      {participanteSeleccionado.tipoDocumento} - {participanteSeleccionado.numeroDocumento}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Área</span>
                    <p className="font-bold text-blue-600 dark:text-blue-400">
                      {participanteSeleccionado.area}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Nivel</span>
                    <p className="font-bold">{participanteSeleccionado.nivel}</p>
                  </div>
                </div>
              </div>

              {/* Estado de las notas */}
              {estadoNotas === 'pendiente' ? (
                <div className="text-center p-12 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl">
                  <div className="text-6xl mb-4">Clock</div>
                  <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                    Notas aún no disponibles
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                    Las calificaciones están siendo procesadas. Por favor, intenta más tarde.
                  </p>
                </div>
              ) : (
                <div className={`p-8 rounded-2xl border-2 ${obtenerClaseAprobacion()}`}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h3 className="text-3xl font-bold">
                        {obtenerMensajeAprobacion()}
                      </h3>
                      <p className="text-sm opacity-80 mt-2">
                        Nota mínima aprobatoria: 51/100
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-6xl font-bold">
                        {puntuacionTotal}
                        <span className="text-3xl">/100</span>
                      </div>
                      <p className="text-sm opacity-75">Puntuación Final</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Para consultas o reclamos: <span className="font-medium">administracion@olimpiadas.edu.bo</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ResultadosDeCalificaciones;