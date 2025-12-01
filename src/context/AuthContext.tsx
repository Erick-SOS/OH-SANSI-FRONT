import { createContext, useState, ReactNode, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://back-oh-sansi.vercel.app";

// ------------ TIPOS ------------
export interface RegistroEvaluadorPayload {
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  correo: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  tipo_documento: string;
  numero_documento: string;
  complemento_documento?: string;
  profesion?: string;
  institucion?: string;
  cargo?: string;
  aceptaTerminos: boolean;
}

interface AuthContextType {
  user: { name: string; email: string; rol: string } | null;
  login: (correo: string, password: string) => Promise<void>;
  register: (payload: RegistroEvaluadorPayload) => Promise<void>;
  logout: () => Promise<void>;
}

// ------------ CONTEXTO ------------
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// ------------ PROVIDER ------------
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string; rol: string } | null>(null);
  const navigate = useNavigate();

  // ----------- LOGIN -----------
  const login = async (correo: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/evaluadores/login`, {
        correo,
        password,
      });

      const { name, email, rol, token } = response.data;

      setUser({ name, email, rol });
      localStorage.setItem("token", token);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Credenciales inválidas";
      throw new Error(msg);
    }
  };

  // ----------- REGISTRO -----------
  const register = async (payload: RegistroEvaluadorPayload) => {
    try {
      const response = await axios.post(`${API_URL}/api/evaluadores/registro`, payload);

      const { name, email, rol, token } = response.data;

      // Loguear inmediatamente luego de registrar
      setUser({ name, email, rol });
      localStorage.setItem("token", token);

    } catch (error: any) {
      // Captura el mensaje real que manda tu backend
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al registrarse";

      throw new Error(msg);
    }
  };

  // ----------- LOGOUT -----------
  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("token");
      navigate("/");
    } catch {
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

// Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
};
