import { useState, useContext } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(v => !v);
  const closeDropdown  = () => setIsOpen(false);

  /* Para cuando haya user  
  const name = user?.name ?? "Usuario";
  const email = user?.email ?? "usuario@correo.com";
  const role  = (user?.rol ?? "usuario").toString();*/

  const name = "Juan Vera".toString();
  const email = "admin@gmail.com".toString();
  const role  = "Administrador".toString();

  function handleSignOut() {
    if (user) {
      logout();
      closeDropdown();
      navigate("/", { replace: true });
    } else {
      // si no hay usuario, envía a iniciar sesión
      navigate("/signin");
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 rounded-lg px-0 py-0 text-gray-700 dark:text-gray-400"
      >
        <span className="overflow-hidden rounded-full h-11 w-11">
          <img src="/images/user/owner.jpg" alt="User" className="h-11 w-11 object-cover" />
        </span>

        <span className="flex flex-col mr-1 leading-tight text-left">
          <span className="font-medium text-theme-sm">{name}</span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
            {role.toLowerCase()}
          </span>
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          width="18" height="20" viewBox="0 0 18 20" fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4.3125 8.65625L9 13.3437L13.6875 8.65625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[14px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="pb-2">
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-200">
            {name}
          </span>
          <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700
                           dark:bg-white/10 dark:text-gray-300 capitalize">
            {role.toLowerCase()}
          </span>
          <span className="mt-1 block text-theme-xs text-gray-500 dark:text-gray-400">
            {email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-3 pb-3 border-t border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5Z"/>
              </svg>
              Editar perfil
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497Z"/>
          </svg>
          {user ? "Cerrar sesión" : "Iniciar sesión"}
        </button>
      </Dropdown>
    </div>
  );
}
