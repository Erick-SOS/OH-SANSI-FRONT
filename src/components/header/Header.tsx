import { Link } from "react-router-dom";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import images from "../../assets/images";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-100 to-cyan-50 dark:from-sky-900 dark:to-cyan-900 border-b border-sky-200 dark:border-sky-700 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            {/* Logo más grande */}
            <img 
              src={images.logoUmss} 
              alt="Logo UMSS - Oh! SanSí" 
              className="h-60 w-60 object-contain transition-transform hover:scale-110" 
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sky-700 hover:text-sky-900 dark:text-sky-200 dark:hover:text-white font-medium transition">
              Inicio
            </Link>
            <Link to="/sobre-el-proyecto" className="text-sky-700 hover:text-sky-900 dark:text-sky-200 dark:hover:text-white font-medium transition">
              Sobre el Proyecto
            </Link>
            <Link to="/areas-publicas" className="text-sky-700 hover:text-sky-900 dark:text-sky-200 dark:hover:text-white font-medium transition">
              Áreas
            </Link>
            <Link to="/resultados-de-calificaciones" className="text-sky-700 hover:text-sky-900 dark:text-sky-200 dark:hover:text-white font-medium transition">
              Consultar Resultados
            </Link>
            <Link to="/fases-evaluacion-publica" className="text-sky-700 hover:text-sky-900 dark:text-sky-200 dark:hover:text-white font-medium transition">
              Fases de Evaluación
            </Link>
            <Link to="/reglamento" className="text-sky-700 hover:text-sky-900 dark:text-sky-200 dark:hover:text-white font-medium transition">
              Reglamento
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggleButton />
            <Link
              to="/signin"
              className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;