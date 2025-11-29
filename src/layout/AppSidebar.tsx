// src/layout/AppSidebar.tsx
import { useCallback, useEffect, useState } from "react"; // ← quitamos useRef
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon, HorizontaLDots } from "../icons";  // ← así tal cual existe
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { sidebarConfig, NavItem } from "../config/sidebarConfig";
import images from "../assets/images";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  // ← ELIMINADO submenuRefs (ya no lo necesitamos con max-h)

  if (!user?.rol) return null;

  // Normalizamos el rol para que siempre coincida con las claves del config
  const roleKey = user.rol.toLowerCase() as keyof typeof sidebarConfig;
  const navItems: NavItem[] = sidebarConfig[roleKey] || sidebarConfig.administrador || [];

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Abrir automáticamente el submenú de la ruta activa
  useEffect(() => {
    const activeIndex = navItems.findIndex((nav) =>
      nav.subItems?.some((sub) => isActive(sub.path)) || isActive(nav.path || "")
    );
    setOpenSubmenu(activeIndex !== -1 ? activeIndex : null);
  }, [location.pathname, navItems, isActive]);

  const toggleSubmenu = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  // Bloquear scroll del body cuando el sidebar móvil está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Overlay móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={`
          /* MÓVIL: solo fixed cuando está abierto */
          ${isMobileOpen 
            ? "fixed inset-0 z-50 w-[90vw] max-w-[380px]" 
            : "hidden"
          }
      
          /* DESKTOP: comportamiento normal */
          lg:static lg:block lg:inset-auto lg:top-0
      
          flex flex-col
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-300
          overflow-hidden
      
          /* Desktop: ancho expandido/colapsado */
          ${!isMobileOpen && (isExpanded || isHovered) ? "lg:w-[290px]" : "lg:w-[90px]"}
      
          /* Animación de entrada/salida solo en móvil */
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Logo */}
          <div
            className={`py-8 flex px-5 ${
              !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
          >
            <img
              src={images.logoUmss}
              alt="Logo"
              className={`h-10 object-contain transition-all ${
                isExpanded || isHovered ? "w-auto" : "w-10"
              }`}
            />
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto px-5 pb-6 pt-2 min-h-0 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
            <h2
              className={`mb-4 text-xs uppercase text-gray-500 dark:text-gray-400 ${
                !isExpanded && !isHovered ? "lg:text-center" : ""
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Menú"
              ) : (
                <HorizontaLDots className="size-6 mx-auto" />
              )}
            </h2>

            <ul className="flex flex-col gap-2">
              {navItems.map((nav, index) => (
                <li key={index}>
                  {/* Ítem con submenú */}
                  {nav.subItems ? (
                    <button
                      onClick={() => toggleSubmenu(index)}
                      aria-expanded={openSubmenu === index}
                      aria-controls={`submenu-${index}`}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${
                          openSubmenu === index
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                            : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                        ${!isExpanded && !isHovered && !isMobileOpen ? "lg:justify-center" : ""}
                      `}
                    >
                      <span className="flex-shrink-0">{nav.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="flex-1 text-left text-sm font-medium">
                          {nav.name}
                        </span>
                      )}
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <ChevronDownIcon
                          className={`w-5 h-5 transition-transform ${
                            openSubmenu === index ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>
                  ) : (
                    /* Ítem simple */
                    <Link
                      to={nav.path!}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${
                          isActive(nav.path!)
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                            : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                        ${!isExpanded && !isHovered && !isMobileOpen ? "lg:justify-center" : ""}
                      `}
                    >
                      <span className="flex-shrink-0">{nav.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="text-sm font-medium">{nav.name}</span>
                      )}
                    </Link>
                  )}

                  {/* Submenú */}
                  {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                    <div
                      id={`submenu-${index}`}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openSubmenu === index ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      <ul className="mt-2 space-y-1 ml-12">
                        {nav.subItems.map((sub) => (
                          <li key={sub.path}>
                            <Link
                              to={sub.path}
                              className={`
                                block px-4 py-2 text-sm rounded-md transition-colors font-medium
                                ${
                                  isActive(sub.path)
                                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                    : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }
                              `}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Espacio seguro para la barra de navegación del móvil */}
          <div className="h-10 lg:hidden" />
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
