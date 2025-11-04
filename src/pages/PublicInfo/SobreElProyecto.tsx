import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";

export default function SobreElProyecto() {
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
          Sobre el Proyecto
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            <strong>Oh! SanSí</strong> es una plataforma digital diseñada para gestionar de manera eficiente la 
            <strong> Olimpiada Científica Estudiantil Plurinacional</strong> en Bolivia, con el objetivo de promover 
            el talento académico y científico de los estudiantes de secundaria.
          </p>

          <h2 className="text-2xl font-semibold text-sky-700 dark:text-sky-200 mt-8 mb-4">
            Objetivos del Proyecto
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-sky-600 mr-2">•</span>
              Fomentar el desarrollo de habilidades científicas y tecnológicas.
            </li>
            <li className="flex items-start">
              <span className="text-sky-600 mr-2">•</span>
              Identificar y premiar a los mejores talentos estudiantiles.
            </li>
            <li className="flex items-start">
              <span className="text-sky-600 mr-2">•</span>
              Garantizar transparencia en los procesos de evaluación.
            </li>
            <li className="flex items-start">
              <span className="text-sky-600 mr-2">•</span>
              Facilitar el acceso a información pública sobre resultados y fases.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-sky-700 dark:text-sky-200 mt-8 mb-4">
            ¿Quiénes participan?
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Estudiantes de 5to y 6to de secundaria de todo Bolivia, organizados por áreas temáticas:
            Matemática, Física, Química, Biología, Informática, entre otras.
          </p>
        </div>
      </div>
    </div>
  );
}