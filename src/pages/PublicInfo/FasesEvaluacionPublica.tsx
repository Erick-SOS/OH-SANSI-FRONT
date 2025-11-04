import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";

const fases = [
  {
    nombre: "Fase Distrital",
    descripcion: "Competencia inicial a nivel distrital.",
    fecha: "Marzo - Abril",
  },
  {
    nombre: "Fase Departamental",
    descripcion: "Ganadores distritales compiten por departamento.",
    fecha: "Mayo - Junio",
  },
  {
    nombre: "Fase Nacional",
    descripcion: "Los mejores de cada departamento compiten a nivel nacional.",
    fecha: "Julio - Agosto",
  },
  {
    nombre: "Premiación",
    descripcion: "Ceremonia oficial de entrega de medallas y certificados.",
    fecha: "Septiembre",
  },
];

export default function FasesEvaluacionPublica() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-sky-700 dark:text-gray-400 dark:hover:text-sky-300 mb-8"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-sky-800 dark:text-sky-100 mb-6">
          Fases de Evaluación
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-10">
          El proceso de evaluación se realiza en etapas progresivas, garantizando equidad y excelencia.
        </p>

        <div className="space-y-8">
          {fases.map((fase, index) => (
            <div
              key={fase.nombre}
              className="flex items-start space-x-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {fase.nombre}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {fase.descripcion}
                </p>
                <p className="text-sm text-sky-600 dark:text-sky-400 font-medium mt-2">
                  {fase.fecha}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}