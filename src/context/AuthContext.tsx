import { createContext, useState, ReactNode, useContext} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface AuthContextType {
  user: { name: string; email: string; rol: string } | null;
  login: (correo: string, password: string, simulatedData?: { name: string; rol: string }) => Promise<void>;
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
  tipo_documento: string;
  numero_documento: string;
  profesion?: string;
  institucion?: string;
  cargo?: string;
  aceptaTerminos: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string; rol: string } | null>(null);
  const navigate = useNavigate(); // 👈 Importante

  const login = async (correo: string, password: string, simulatedData?: { name: string; rol: string }) => {
    try {
      if (simulatedData) {
        setUser({ name: simulatedData.name, email: correo, rol: simulatedData.rol });
        localStorage.setItem("token", "simulated-token");
      } else {
        const response = await axios.post("http://localhost:3000/api/evaluadores/login", {
          correo,
          password,
        });
        const { name, email, rol, token } = response.data;
        setUser({ name, email, rol });
        localStorage.setItem("token", token);
      }
    } catch (error) {
      console.error("Error en login:", error);
      throw new Error("Credenciales inválidas");
    }
  };

  const register = async (payload: RegistroEvaluadorPayload) => {
    try {
      const response = await axios.post("http://localhost:3000/api/evaluadores/registro", payload);
      const { name, email, rol, token } = response.data;
      setUser({ name, email, rol });
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error en registro:", error);
      throw new Error("Error al registrarse");
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("token");

      // 👇 Redirige al inicio
      navigate("/");
    } catch (error) {
      console.error("Error en logout:", error);
      setUser(null);
      localStorage.removeItem("token");
      navigate("/"); // 👈 También redirige en caso de error
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