import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import images from "../../assets/images";
import { FiMenu, FiX } from "react-icons/fi";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: "Inicio", path: "/" },
    { name: "Sobre el Proyecto", path: "/sobre-el-proyecto" },
    { name: "Áreas", path: "/areas-publicas" },
    { name: "Consultar Resultados", path: "/resultados-de-calificaciones" },
    { name: "Premiados", path: "/consulta-de-premiados" },
    { name: "Fases de Evaluación", path: "/fases-evaluacion-publica" },
    { name: "Reglamento", path: "/reglamento" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-100 to-cyan-50 dark:from-sky-900 dark:to-cyan-900 border-b border-sky-200 dark:border-sky-700 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={images.logoUmss}
              alt="Logo UMSS - Oh! SanSí"
              className="h-12 w-auto object-contain transition-transform hover:scale-110"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sky-700 hover:text-sky-900 dark:text-sky-200 dark:hover:text-white font-medium transition text-sm xl:text-base"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggleButton />
            <Link
              to="/signin"
              className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition"
            >
              Iniciar Sesión
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-lg text-sky-700 hover:bg-sky-200/50 dark:text-sky-200 dark:hover:bg-sky-800/50 focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-sky-600 hover:bg-sky-50 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-800 transition"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/signin"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;