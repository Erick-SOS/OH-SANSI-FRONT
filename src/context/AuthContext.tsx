import { createContext, useState, ReactNode } from "react";
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

  const login = async (correo: string, password: string, simulatedData?: { name: string; rol: string }) => {
    try {
      if (simulatedData) {
        // Simulación de login
        setUser({ name: simulatedData.name, email: correo, rol: simulatedData.rol });
        localStorage.setItem("token", "simulated-token"); // Token simulado
      } else {
        // Lógica para cuando el endpoint esté disponible
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
      // Simulación de logout (no necesitamos backend para esto)
      setUser(null);
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error en logout:", error);
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};