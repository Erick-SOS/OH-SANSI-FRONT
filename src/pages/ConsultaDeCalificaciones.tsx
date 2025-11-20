import React, { useState } from 'react';

interface Resultado {
  prueba: string;
  calificacion: string;
  puntuacion: number;
  posicion: number;
  observacion: string;
}

interface Participante {
  tipoDocumento: string;
  numeroDocumento: string; // con extensión, ej. "8429135 CB"
  nombreCompleto: string;
  area: string;
  nivel: string;
}

// Participantes “quemados” en el código
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
  const [participanteSeleccionado, setParticipanteSeleccionado] =
    useState<Participante | null>(null);

  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [puntuacionTotal, setPuntuacionTotal] = useState(0);
  const [estadoNotas, setEstadoNotas] = useState<EstadoNotas>(null);

  const observaciones = [
    'Excelente desempeño en la resolución de problemas complejos',
    'Buen manejo de conceptos teóricos, necesita mejorar en la práctica',
    'Creatividad destacada en las soluciones presentadas',
    'Dominio sólido de los fundamentos del área',
    'Presentó trabajo completo y bien estructurado',
    'Demostró habilidades excepcionales bajo presión',
    'Buen trabajo en equipo y colaboración',
    'Necesita mejorar la presentación de resultados',
    'Excelente capacidad de análisis y síntesis',
    'Demostró gran originalidad en su enfoque',
    'Manejo adecuado del tiempo durante la prueba',
    'Excelente comunicación de ideas y procedimientos',
  ];

  const normalizarDoc = (doc: string) =>
    doc.replace(/\s+/g, ' ').trim().toUpperCase();

  const generarResultados = () => {
    if (!tipoDocumento || !numeroDocumento.trim()) {
      alert(
        'Por favor, seleccione el tipo de documento e ingrese el número.'
      );
      return;
    }

    const entrada = normalizarDoc(numeroDocumento);

    // Buscar participante por tipo + número (con o sin extensión)
    const participante = participantes.find((p) => {
      const guardado = normalizarDoc(p.numeroDocumento); // "8429135 CB"
      if (p.tipoDocumento.toUpperCase() !== tipoDocumento.toUpperCase()) {
        return false;
      }

      // Coincidencia exacta
      if (guardado === entrada) return true;

      // Coincidencia solo por número (sin extensión)
      const numeroGuardado = guardado.split(' ')[0]; // "8429135"
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

    // 👉 Caso 3: Antonella – notas aún no subidas
    if (participante.numeroDocumento === '7692084 SC') {
      setParticipanteSeleccionado(participante);
      setResultados([]);
      setPuntuacionTotal(0);
      setEstadoNotas('pendiente');
      setMostrarResultados(true);
      return;
    }

    // Para Mariana y Diego generamos resultados por prueba (solo decorativo)
    const pruebas = [
      'Prueba Teórica',
      'Prueba Práctica',
      'Examen Escrito',
      'Proyecto Final',
      'Evaluación Oral',
    ];

    const nuevosResultados: Resultado[] = [];
    let totalPuntos = 0;

    pruebas.forEach((prueba) => {
      const puntuacion = Math.floor(Math.random() * 61) + 40; // 40–100
      totalPuntos += puntuacion;

      const posicion = Math.floor(Math.random() * 10) + 1;

      let calificacion = 'Regular';
      if (puntuacion >= 90) calificacion = 'Excelente';
      else if (puntuacion >= 80) calificacion = 'Muy Bueno';
      else if (puntuacion >= 60) calificacion = 'Bueno';
      else if (puntuacion >= 51) calificacion = 'Suficiente';

      const observacion =
        observaciones[Math.floor(Math.random() * observaciones.length)];

      nuevosResultados.push({
        prueba,
        calificacion,
        puntuacion,
        posicion,
        observacion,
      });
    });

    // Nota promedio
    let nuevoTotal = Math.round(totalPuntos / pruebas.length);

    // 🔒 Forzamos las notas según cada participante
    if (participante.numeroDocumento === '8429135 CB') {
      // Mariana -> Aprobado
      nuevoTotal = 73;
      setEstadoNotas('aprobado');
    } else if (participante.numeroDocumento === '10329487 LP') {
      // Diego -> Reprobado
      nuevoTotal = 40;
      setEstadoNotas('reprobado');
    }

    setResultados(nuevosResultados);
    setPuntuacionTotal(nuevoTotal);
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
    'w-full px-4 py-3 rounded-lg border transition focus:outline-hidden focus:ring-2 ' +
    'bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-blue-500/30 focus:border-blue-300 ' +
    'dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-blue-700';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-2 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="text-4xl text-blue-600 mr-3">
              <i className="fas fa-trophy"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Consulta de Calificaciones y Resultados
            </h1>
          </div>
        </header>

        {/* Formulario de Consulta */}
        <div className="rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="bg-blue-600 dark:bg-blue-700 text-white p-6">
            <h2 className="text-2xl font-bold">Consulta de Calificaciones</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Tipo de documento */}
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

              {/* Número de documento */}
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Número de Documento
                </label>
                <input
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  className={fieldBase}
                  placeholder="Ej: 5678123 OR o solo 5678123"
                />
              </div>

              {/* Botón Consultar */}
              <button
                onClick={generarResultados}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg
                           transition duration-200 transform hover:-translate-y-1 shadow-lg
                           focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
              >
                <i className="fas fa-search mr-2"></i>
                Consultar Calificaciones
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {mostrarResultados && participanteSeleccionado && (
          <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="bg-blue-600 dark:bg-blue-700 text-white p-6">
              <h2 className="text-2xl font-bold">Resultados</h2>
            </div>
            <div className="p-6">
              {/* Datos de la Consulta + Participante */}
              <div className="rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                  Datos de la Consulta
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Tipo de Documento
                    </span>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {tipoDocumento === 'CI'
                        ? 'Cédula de Identidad'
                        : 'Pasaporte'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Número
                    </span>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {participanteSeleccionado.numeroDocumento}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Nombre Completo
                    </span>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {participanteSeleccionado.nombreCompleto}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Área de competición
                    </span>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {participanteSeleccionado.area}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Nivel
                    </span>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {participanteSeleccionado.nivel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado de notas */}
              {estadoNotas === 'pendiente' ? (
                // Mensaje para Antonella (notas no subidas)
                <div className="border rounded-lg p-4 mb-6 text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <h3 className="text-lg font-bold">Notas no disponibles</h3>
                  <p className="text-sm">
                    Las notas aún no se han subido para este participante. Por favor, vuelva a intentar más adelante.
                  </p>
                </div>
              ) : (
                // Estado + nota (Mariana: aprobado, Diego: reprobado)
                <div
                  className={`border rounded-lg p-4 mb-6 ${obtenerClaseAprobacion()}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        Estado: {obtenerMensajeAprobacion()}
                      </h3>
                      <p className="text-sm">
                        Nota mínima de aprobación: 51/100
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {puntuacionTotal}/100
                      </p>
                      <p className="text-sm">Puntuación Total</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-600 dark:text-gray-400">
          <p>
            Para consultas o correcciones, contactar a: administracion@olimpiadas.edu
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ResultadosDeCalificaciones;


