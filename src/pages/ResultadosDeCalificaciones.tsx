import React, { useState } from 'react';

interface Resultado {
  prueba: string;
  calificacion: string;
  puntuacion: number;
  posicion: number;
  observacion: string;
}

const ResultadosDeCalificaciones: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState('');
  const [nivel, setNivel] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [puntuacionTotal, setPuntuacionTotal] = useState(0);

  const areas = [
    "Matemáticas",
    "Ciencias Naturales",
    "Física",
    "Química",
    "Biología",
    "Historia",
    "Geografía",
    "Lenguaje y Literatura",
    "Inglés",
    "Informática"
  ];

  const niveles = ["Primaria", "Secundaria"];

  const observaciones = [
    "Excelente desempeño en la resolución de problemas complejos",
    "Buen manejo de conceptos teóricos, necesita mejorar en la práctica",
    "Creatividad destacada en las soluciones presentadas",
    "Dominio sólido de los fundamentos del área",
    "Presentó trabajo completo y bien estructurado",
    "Demostró habilidades excepcionales bajo presión",
    "Buen trabajo en equipo y colaboración",
    "Necesita mejorar la presentación de resultados",
    "Excelente capacidad de análisis y síntesis",
    "Demostró gran originalidad en su enfoque",
    "Manejo adecuado del tiempo durante la prueba",
    "Excelente comunicación de ideas y procedimientos"
  ];

  const generarResultados = () => {
    // Validar campos
    if (!nombre || !area || !nivel || !modalidad) {
      alert('Por favor, complete todos los campos del formulario.');
      return;
    }

    // Generar resultados aleatorios pero realistas
    const pruebas = [
      "Prueba Teórica",
      "Prueba Práctica",
      "Examen Escrito",
      "Proyecto Final",
      "Evaluación Oral"
    ];

    const nuevosResultados: Resultado[] = [];
    let totalPuntos = 0;

    pruebas.forEach(prueba => {
      // Puntuación entre 40 y 100 para hacerlo realista
      const puntuacion = Math.floor(Math.random() * 61) + 40;
      totalPuntos += puntuacion;

      // Determinar posición (1-10, pero solo mostramos si está en top 3)
      const posicion = Math.floor(Math.random() * 10) + 1;

      // Determinar calificación textual
      let calificacion = "Regular";
      if (puntuacion >= 90) calificacion = "Excelente";
      else if (puntuacion >= 80) calificacion = "Muy Bueno";
      else if (puntuacion >= 60) calificacion = "Bueno";
      else if (puntuacion >= 51) calificacion = "Suficiente";

      // Seleccionar observación aleatoria
      const observacion = observaciones[Math.floor(Math.random() * observaciones.length)];

      nuevosResultados.push({
        prueba,
        calificacion,
        puntuacion,
        posicion,
        observacion
      });
    });

    setResultados(nuevosResultados);
    setPuntuacionTotal(Math.round(totalPuntos / pruebas.length));
    setMostrarResultados(true);
  };

  const obtenerMejorPosicion = () => {
    return Math.min(...resultados.map(r => r.posicion));
  };

  const obtenerMensajeAprobacion = () => {
    if (puntuacionTotal >= 90) return "¡Excelente! Aprobado con honores";
    if (puntuacionTotal >= 80) return "¡Muy bien! Aprobado con distinción";
    if (puntuacionTotal >= 60) return "¡Bien! Aprobado satisfactoriamente";
    if (puntuacionTotal >= 51) return "Aprobado";
    return "No Aprobado";
  };

  const obtenerClaseAprobacion = () => {
    if (puntuacionTotal >= 60) return "text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-800";
    if (puntuacionTotal >= 51) return "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800";
    return "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800";
  };

  const fieldBase =
    "w-full px-4 py-3 rounded-lg border transition focus:outline-hidden focus:ring-2 " +
    "bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:ring-blue-500/30 focus:border-blue-300 " +
    "dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-blue-700";

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
        <div className="rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-200 bg-white
                        dark:border-gray-800 dark:bg-gray-900">
          <div className="bg-blue-600 dark:bg-blue-700 text-white p-6">
            <h2 className="text-2xl font-bold">Consulta de Calificaciones</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {modalidad === 'grupal' ? 'Nombre del Grupo' : 'Nombre del Participante'}
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={fieldBase}
                  placeholder={modalidad === 'grupal' ? 'Ingresa el nombre del grupo' : 'Ingresa tu nombre completo'}
                />
              </div>

              {/* Área */}
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Área de Competencia
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={fieldBase}
                >
                  <option value="">Selecciona un área</option>
                  {areas.map((areaOption) => (
                    <option key={areaOption} value={areaOption}>
                      {areaOption}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nivel */}
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Nivel
                </label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  className={fieldBase}
                >
                  <option value="">Selecciona un nivel</option>
                  {niveles.map((nivelOption) => (
                    <option key={nivelOption} value={nivelOption}>
                      {nivelOption}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modalidad */}
              <div>
                <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Modalidad
                </label>
                <div className="flex space-x-6 text-gray-700 dark:text-gray-300">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="modalidad"
                      value="individual"
                      checked={modalidad === 'individual'}
                      onChange={(e) => setModalidad(e.target.value)}
                      className="mr-2 accent-blue-600 dark:accent-blue-500"
                    />
                    Individual
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="modalidad"
                      value="grupal"
                      checked={modalidad === 'grupal'}
                      onChange={(e) => setModalidad(e.target.value)}
                      className="mr-2 accent-blue-600 dark:accent-blue-500"
                    />
                    Grupal
                  </label>
                </div>
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
        {mostrarResultados && (
          <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white
                          dark:border-gray-800 dark:bg-gray-900">
            <div className="bg-blue-600 dark:bg-blue-700 text-white p-6">
              <h2 className="text-2xl font-bold">Resultados de la Consulta</h2>
            </div>
            <div className="p-6">
              {/* Información del Participante */}
              <div className="rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                  {modalidad === 'grupal' ? 'Información del Grupo' : 'Información del Participante'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {modalidad === 'grupal' ? 'Nombre del Grupo' : 'Nombre'}
                    </span>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{nombre}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Área</span>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{area}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nivel</span>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{nivel}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Modalidad</span>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {modalidad === 'individual' ? 'Individual' : 'Grupal'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado de Aprobación */}
              <div className={`border rounded-lg p-4 mb-6 ${obtenerClaseAprobacion()}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Estado: {obtenerMensajeAprobacion()}</h3>
                    <p className="text-sm">Nota mínima de aprobación: 51/100</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{puntuacionTotal}/100</p>
                    <p className="text-sm">Puntuación Total</p>
                  </div>
                </div>
              </div>

              {/* Posición en el Podio */}
              {obtenerMejorPosicion() <= 3 && (
                <div className="rounded-lg p-4 mb-6
                                bg-yellow-50 border border-yellow-200 text-yellow-800
                                dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
                  <div className="flex items-center">
                    <i className="fas fa-trophy text-yellow-500 dark:text-yellow-300 text-2xl mr-3" />
                    <div>
                      <strong className="text-lg">
                        ¡Felicidades! Has obtenido el {obtenerMejorPosicion()}° lugar
                      </strong>
                      <p>
                        {obtenerMejorPosicion() === 1 ? "¡Medalla de Oro!"
                          : obtenerMejorPosicion() === 2 ? "¡Medalla de Plata!"
                          : "¡Medalla de Bronce!"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-600 dark:text-gray-400">
          <p>Para consultas o correcciones, contactar a: administracion@olimpiadas.edu</p>
        </footer>
      </div>
    </div>
  );
};

export default ResultadosDeCalificaciones;