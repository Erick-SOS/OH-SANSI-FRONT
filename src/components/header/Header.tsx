import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import images from "../../assets/images";
import { FiMenu, FiX } from "react-icons/fi";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative flex items-center justify-between h-16">

          {/* LOGO - Perfecto en móvil y desktop */}
          <div className="flex-shrink-0 -ml-3 sm:-ml-6 lg:-ml-8">
            <Link to="/">
              <img
                src={images.unnamed}
                alt="Oh! SanSí"
                className="h-10 sm:h-11 w-auto block dark:hidden transition-transform hover:scale-105"
              />
              <img
                src={images.unnamed2}
                alt="Oh! SanSí"
                className="h-10 sm:h-11 w-auto hidden dark:block transition-transform hover:scale-105"
              />
            </Link>
          </div>

          {/* MENÚ DESKTOP - Solo se ve en pantallas grandes */}
          <nav className="hidden lg:flex absolute inset-x-0 justify-center pointer-events-none">
            <ul className="flex items-center space-x-5 xl:space-x-9 pointer-events-auto">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sky-700 hover:text-sky-900 dark:text-sky-200 dark:hover:text-white font-medium text-sm xl:text-base whitespace-nowrap transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* DERECHA - Botón + ícono + menú móvil */}
          <div className="flex items-center space-x-3 sm:space-x-4 -mr-3 sm:-mr-6 lg:-mr-14">
            <ThemeToggleButton />

            {/* Botón Iniciar Sesión - Solo en tablets y desktop */}
            <Link
              to="/signin"
              className="hidden sm:block px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-500 rounded-full hover:from-sky-700 hover:to-cyan-600 transition-all shadow-md"
            >
              Iniciar Sesión
            </Link>

            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-sky-700 dark:text-sky-200 hover:bg-sky-200/50 dark:hover:bg-sky-800/50 rounded-lg transition lg:hidden"
            >
              {isMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL - 100% RESPONSIVE Y HERMOSO */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 inset-x-0 bg-white dark:bg-gray-900 border-b border-sky-200 dark:border-sky-800 shadow-xl">
          <div className="px-4 py-5 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-sky-700 dark:text-sky-200 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-sky-800/50 rounded-lg transition"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 border-t border-sky-200 dark:border-sky-700">
              <Link
                to="/signin"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-6 py-3 text-white bg-gradient-to-r from-sky-600 to-cyan-500 rounded-full font-semibold shadow-md hover:shadow-lg transition"
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