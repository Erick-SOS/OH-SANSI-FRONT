import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";

export default function Reglamento() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-sky-700 dark:text-gray-400 dark:hover:text-sky-300 mb-8"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-sky-800 dark:text-sky-100 mb-6">
          Reglamento Oficial
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-sky-700 dark:text-sky-300 mb-4">
            Normas Generales
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-8">
            <li>• La participación es gratuita y voluntaria.</li>
            <li>• Se permite un solo intento por fase.</li>
            <li>• Está prohibido el uso de calculadoras en ciertas áreas.</li>
            <li>• Los casos de plagio resultan en descalificación inmediata.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-sky-700 dark:text-sky-300 mb-4">
            Documentos Oficiales
          </h2>
          <div className="space-y-3">
            <a
              href="/docs/reglamento-2025.pdf"
              target="_blank"
              className="flex items-center text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200"
            >
              Reglamento Completo 2025 (PDF)
            </a>
            <a
              href="/docs/cronograma.pdf"
              target="_blank"
              className="flex items-center text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200"
            >
              Cronograma de Actividades
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}