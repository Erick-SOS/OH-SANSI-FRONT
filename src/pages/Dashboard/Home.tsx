import { Link } from "react-router-dom";
import PageMeta from "../../components/common/PaginaMeta";

const Home = () => {
  return (
    <>
      <PageMeta
        title="Olimpiadas Oh! SanSí 2025"
        description="Promoviendo la excelencia académica en ciencia y tecnología. Consulta tus resultados, participa y celebra el conocimiento."
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Olimpiadas Oh! SanSí 2025
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Promoviendo la excelencia académica en ciencia y tecnología. 
            Consulta tus resultados, participa y celebra el conocimiento.
          </p>
        </div>
      </section>

      {/* Sobre el Proyecto */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">
            Sobre el Proyecto
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
            El sistema Oh! SanSí tiene como objetivo facilitar la gestión y evaluación de los participantes 
            en las Olimpiadas de Ciencia y Tecnología San Simón. Permite el registro, evaluación y publicación 
            de resultados de forma rápida, transparente y accesible desde cualquier dispositivo.
          </p>
        </div>
      </section>

      {/* Áreas de Competencia */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-12">
            Áreas de Competencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Ciencias Naturales", "Matemática", "Tecnología e Informática"].map((area) => (
              <div
                key={area}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {area}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Desafíos diseñados para poner a prueba tus conocimientos y habilidades.
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/areas"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Ver todas las áreas
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;