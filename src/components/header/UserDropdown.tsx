// src/components/header/UserDropdown.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import ConfirmModal from "../modals/ConfirmModal";
import ResultModal from "../modals/ResultModal";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import { getToken, roleLabel } from "../auth/authStorage";

function getInitials(fullName: string): string {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-teal-500",
];

function getAvatarColor(key: string): string {
  if (!key) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i)) % 1000;
  }
  const idx = hash % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [resultVisible, setResultVisible] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const navigate = useNavigate();
  const { user, clearSession } = useAuth();

  const toggleDropdown = () => setIsOpen((v) => !v);
  const closeDropdown = () => setIsOpen(false);

  const displayName = user?.nombreCompleto ?? "Usuario invitado";
  const email = user?.correo ?? "usuario@correo.com";
  const roleText = roleLabel(user?.rol);

  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const avatarColor = useMemo(
    () => getAvatarColor(email || displayName),
    [email, displayName]
  );

  function handleSignOutClick() {
    if (!user) {
      // Si no hay sesión, ir directo al login
      navigate("/signin");
      return;
    }
    setConfirmVisible(true);
  }

  async function handleConfirmLogout() {
    setLogoutLoading(true);
    try {
      const token = await getToken();

      if (token) {
        await api("/auth/logout", {
          method: "POST",
          token,
        });
      }

      await clearSession();
      setConfirmVisible(false);
      closeDropdown();

      setResultType("success");
      setResultTitle("Sesión cerrada");
      setResultMessage("Has cerrado sesión correctamente.");
      setResultVisible(true);
    } catch (err: unknown) {
      setConfirmVisible(false);
      closeDropdown();

      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cerrar sesión.";
      setResultType("error");
      setResultTitle("Error al cerrar sesión");
      setResultMessage(msg);
      setResultVisible(true);
    } finally {
      setLogoutLoading(false);
    }
  }

  const handleResultClose = () => {
    const wasSuccess = resultType === "success";
    setResultVisible(false);
    if (wasSuccess) {
      navigate("/signin", { replace: true });
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-2 rounded-lg px-0 py-0 text-gray-700 dark:text-gray-400"
        >
          {/* Avatar con iniciales y color según usuario */}
          <span
            className={`flex items-center justify-center rounded-full h-11 w-11 text-sm font-semibold text-white ${avatarColor}`}
          >
            {initials || "US"}
          </span>

          <span className="flex flex-col mr-1 leading-tight text-left">
            <span className="font-medium text-theme-sm truncate max-w-[140px]">
              {displayName}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
              {roleText || "Sin rol"}
            </span>
          </span>

          <svg
            className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            width="18"
            height="20"
            viewBox="0 0 18 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Dropdown
          isOpen={isOpen}
          onClose={closeDropdown}
          className="absolute right-0 mt-[14px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
        >
          <div className="pb-2">
            <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-200">
              {displayName}
            </span>
            {roleText && (
              <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-white/10 dark:text-gray-300 capitalize">
                {roleText}
              </span>
            )}
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
                <svg
                  className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5Z"
                  />
                </svg>
                Editar perfil
              </DropdownItem>
            </li>
          </ul>

          <button
            onClick={handleSignOutClick}
            className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <svg
              className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497Z"
              />
            </svg>
            {user ? "Cerrar sesión" : "Iniciar sesión"}
          </button>
        </Dropdown>
      </div>

      {/* Modal de confirmación para logout */}
      <ConfirmModal
        visible={confirmVisible}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión en tu cuenta?"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirmLogout}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        danger
        loading={logoutLoading}
      />

      {/* Modal de resultado del logout */}
      <ResultModal
        visible={resultVisible}
        type={resultType}
        title={resultTitle}
        message={resultMessage}
        onClose={handleResultClose}
      />
    </>
  );
}
