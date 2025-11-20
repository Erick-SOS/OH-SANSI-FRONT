// src/layout/AppSidebar.tsx
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon, HorizontaLDots } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext"; // Ahora sí existe
import { sidebarConfig, NavItem } from "../config/sidebarConfig";
import images from "../assets/images";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

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

  return (
    <aside className={`
      flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
      transition-all duration-300 h-full overflow-hidden
      ${isExpanded || isHovered ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "fixed inset-0 z-50" : "relative"}
    `}>
      <div className={`py-8 flex px-5 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <img
          src={images.logoUmss}
          alt="Logo"
          className={`h-10 object-contain ${isExpanded || isHovered ? "w-auto" : "w-10"}`}
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-5">
        <h2 className={`mb-4 text-xs uppercase text-gray-400 ${!isExpanded && !isHovered ? "lg:text-center" : ""}`}>
          {isExpanded || isHovered || isMobileOpen ? "Menú" : <HorizontaLDots className="size-6" />}
        </h2>

        <ul className="flex flex-col gap-4">
          {navItems.map((nav, index) => (
            <li key={index}>
              {nav.subItems ? (
                <button
                  onClick={() => toggleSubmenu(index)}
                  className={`menu-item group ${openSubmenu === index ? "menu-item-active" : "menu-item-inactive"} ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                  }`}
                >
                  <span className={`menu-item-icon-size ${openSubmenu === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform ${openSubmenu === index ? "rotate-180 text-brand-500" : ""}`} />
                  )}
                </button>
              ) : (
                <Link
                  to={nav.path!}
                  className={`menu-item group ${isActive(nav.path!) ? "menu-item-active" : "menu-item-inactive"}`}
                >
                  <span className={`menu-item-icon-size ${isActive(nav.path!) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                </Link>
              )}

              {/* Submenú con altura automática */}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ height: openSubmenu === index ? "auto" : "0px" }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((sub) => (
                      <li key={sub.path}>
                        <Link
                          to={sub.path}
                          className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
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
  );
};

export default AppSidebar;