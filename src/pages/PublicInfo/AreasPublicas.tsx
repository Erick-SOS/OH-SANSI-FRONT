import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";

const areas = [
  { nombre: "Matemática", icon: "π" },
  { nombre: "Física", icon: "F" },
  { nombre: "Química", icon: "Beaker" },
  { nombre: "Biología", icon: "DNA" },
  { nombre: "Informática", icon: "Code" },
  { nombre: "Robótica", icon: "Robot" },
];

export default function AreasPublicas() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-sky-700 dark:text-gray-400 dark:hover:text-sky-300 mb-8"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-sky-800 dark:text-sky-100 mb-6">
          Áreas de Competencia
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 max-w-3xl">
          La Olimpiada Oh! SanSí se organiza en múltiples áreas del conocimiento. Cada área evalúa habilidades específicas y premia a los mejores talentos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div
              key={area.nombre}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-sky-100 dark:border-gray-700"
            >
              <div className="text-4xl mb-4 text-center text-sky-600 dark:text-sky-400">
                {area.icon}
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-white">
                {area.nombre}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                Fase departamental y nacional
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}