import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import UserDropdown from "./UserDropdown";
import { AuthContext } from "../../context/AuthContext";
import logoImg from "../../../public/images/LogoUmss/unnamed.png";

const DashboardHeader = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src={logoImg} alt="Logo" className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-sky-800 dark:text-sky-100">
              Oh! SanSí
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <ThemeToggleButton />
            {user ? <UserDropdown /> : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;