// src/context/AuthContext.tsx (o donde lo tengas)

import { createContext, useState, ReactNode, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://back-oh-sansi.vercel.app";

interface AuthContextType {
  user: { name: string; email: string; rol: string } | null;
  login: (
    correo: string,
    password: string,
    simulatedData?: { name: string; rol: string }
  ) => Promise<void>;
  register: (payload: RegistroEvaluadorPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export interface RegistroEvaluadorPayload {
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  correo: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  tipo_documento: string; // "CI" | "PASAPORTE" | "CARNET_EXTRANJERO"
  numero_documento: string;
  complemento_documento?: string;
  profesion?: string;
  institucion?: string;
  cargo?: string;
  aceptaTerminos: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    rol: string;
  } | null>(null);
  const navigate = useNavigate();

  const login = async (
    correo: string,
    password: string,
    simulatedData?: { name: string; rol: string }
  ) => {
    try {
      if (simulatedData) {
        setUser({ name: simulatedData.name, email: correo, rol: simulatedData.rol });
        localStorage.setItem("token", "simulated-token");
      } else {
        const response = await axios.post(`${API_URL}/api/evaluadores/login`, {
          correo,
          password,
        });
        const { name, email, rol, token } = response.data;
        setUser({ name, email, rol });
        localStorage.setItem("token", token);
      }
    } catch (error) {
      console.error("Error en login:", (error as any)?.response?.data || error);
      throw new Error("Credenciales inválidas");
    }
  };

  const register = async (payload: RegistroEvaluadorPayload) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/evaluadores/registro`,
        payload
      );

      // El backend devuelve: { ok, usuario }
      const { ok, usuario, mensaje } = response.data;

      if (!ok) {
        throw new Error(mensaje || "Error al registrarse");
      }

      // Armar nombre completo desde los datos que devuelve el back
      const fullName = `${usuario.nombre} ${usuario.ap_paterno}${
        usuario.ap_materno ? " " + usuario.ap_materno : ""
      }`;

      // Si quieres que después del registro ya quede logueado:
      setUser({
        name: fullName,
        email: usuario.correo,
        rol: usuario.rol,
      });

      // OJO: este endpoint NO devuelve token, así que no guardamos nada aquí
      // Si más adelante el back devuelve token en el registro, aquí lo agregas

    } catch (error: any) {
      console.error("Error en registro:", error?.response?.data || error);
      const data = error?.response?.data;
      const msg =
        data?.mensaje ||
        data?.message ||
        data?.error ||
        data?.msg ||
        "Error al registrarse";
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error("Error en logout:", error);
      setUser(null);
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
