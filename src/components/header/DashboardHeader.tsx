// src/components/header/DashboardHeader.tsx
import { Link } from "react-router-dom";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import UserDropdown from "./UserDropdown";

const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard-admin" className="flex items-center space-x-2">
            <img
              src="/images/LogoUmss/unnamed.png"
              alt="Logo Oh! SanSí"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold text-sky-800 dark:text-sky-100">
              Oh! SanSí
            </span>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4 pr-1 sm:pr-20">
            <ThemeToggleButton />
            {/* Dropdown totalmente estático */}
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
