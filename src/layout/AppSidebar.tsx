// src/layout/AppSidebar.tsx
import { useCallback, useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon, HorizontaLDots } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { sidebarConfig, NavItem } from "../config/sidebarConfig";
import images from "../assets/images";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const submenuRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!user?.rol) return null;

  const navItems: NavItem[] = sidebarConfig[user.rol as keyof typeof sidebarConfig] || [];

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    const activeIndex = navItems.findIndex(nav =>
      nav.subItems?.some(sub => isActive(sub.path)) || isActive(nav.path || "")
    );
    setOpenSubmenu(activeIndex !== -1 ? activeIndex : null);
  }, [location.pathname, navItems, isActive]);

  const toggleSubmenu = (index: number) => {
    setOpenSubmenu(prev => prev === index ? null : index);
  };

  // BLOQUEAR SCROLL CUANDO SIDEBAR MÓVIL ESTÁ ABIERTO
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
      {/* Overlay oscuro cuando está abierto en móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen lg:h-full z-50
        flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 overflow-y-auto
        ${isExpanded || isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className={`py-8 flex px-5 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
          <img
            src={images.logoUmss}
            alt="Logo"
            className={`h-10 object-contain transition-all ${isExpanded || isHovered ? "w-auto" : "w-10"}`}
          />
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-5 pb-10">
          <h2 className={`mb-4 text-xs uppercase text-gray-400 ${!isExpanded && !isHovered ? "lg:text-center" : ""}`}>
            {isExpanded || isHovered || isMobileOpen ? "Menú" : <HorizontaLDots className="size-6 mx-auto" />}
          </h2>

          <ul className="flex flex-col gap-2">
            {navItems.map((nav, index) => (
              <li key={index}>
                {nav.subItems ? (
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${openSubmenu === index 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                      ${!isExpanded && !isHovered && !isMobileOpen ? "lg:justify-center" : ""}
                    `}
                  >
                    <span className="flex-shrink-0">{nav.icon}</span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="flex-1 text-left text-sm font-medium">{nav.name}</span>
                    )}
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${openSubmenu === index ? "rotate-180" : ""}`} />
                    )}
                  </button>
                ) : (
                  <Link
                    to={nav.path!}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${isActive(nav.path!) 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
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

                {/* SUBMENÚS QUE AHORA SÍ SE VEN EN MÓVIL */}
                {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                  <div
                    ref={(el) => {
                      submenuRefs.current[index] = el;
                    }}
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      height: openSubmenu === index 
                        ? `${submenuRefs.current[index]?.scrollHeight || 0}px` 
                        : "0px"
                    }}
                  >
                    <ul className="mt-2 space-y-1 ml-12">
                      {nav.subItems.map((sub) => (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            className={`
                              block px-4 py-2 text-sm rounded-md transition-colors
                              ${isActive(sub.path) 
                                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium" 
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
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
      </aside>
    </>
  );
};

export default AppSidebar;
