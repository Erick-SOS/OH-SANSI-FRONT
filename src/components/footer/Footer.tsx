import { Link } from "react-router-dom";
import images from "../../assets/images";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMNA 1 - LOGO Y TEXTO CENTRADOS */}
          <div className="flex flex-col items-center text-center">
            {/* Logo que cambia según el modo */}
            <div className="mb-6">
              {/* Logo modo claro (azul) */}
              <img
                src={images.unnamed}
                alt="Logo Oh! SanSí"
                className="h-30 w-auto object-contain block dark:hidden"
              />
              {/* Logo modo oscuro (blanco) */}
              <img
                src={images.unnamed2}
                alt="Logo Oh! SanSí"
                className="h-30 w-auto object-contain hidden dark:block"
              />
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              Olimpiada en Ciencias y Tecnología San Simón, 
              un espacio para el desarrollo del talento juvenil en Bolivia.
            </p>
          </div>

          {/* COLUMNA 2 - ENLACES RÁPIDOS */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-blue-400 transition">Inicio</Link></li>
              <li><Link to="/sobre-el-proyecto" className="hover:text-blue-400 transition">Sobre el Proyecto</Link></li>
              <li><Link to="/areas-publicas" className="hover:text-blue-400 transition">Áreas</Link></li>
              <li><Link to="/resultados-de-calificaciones" className="hover:text-blue-400 transition">Consultar Resultados</Link></li>
              <li><Link to="/fases-evaluacion-publica" className="hover:text-blue-400 transition">Fases de Evaluación</Link></li>
              <li><Link to="/reglamento" className="hover:text-blue-400 transition">Reglamento</Link></li>
            </ul>
          </div>

          {/* COLUMNA 3 - CONTACTO */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center">
                <span className="mr-2">Email</span>
                <a href="mailto:info@ohsansi.edu.bo">info@ohsansi.edu.bo</a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">Phone</span>
                <a href="tel:+59144234567">+591 4 4234567</a>
              </li>
              <li className="flex items-center">
                <span className="mr-2">Location</span>
                <span>Universidad San Simón, Cochabamba, Bolivia</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © 2025 Oh! SanSí - Olimpiada en Ciencias y Tecnología. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
