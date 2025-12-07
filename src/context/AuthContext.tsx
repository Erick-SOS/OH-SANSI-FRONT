// src/context/AuthContext.tsx

import { createContext, useState, ReactNode, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://back-oh-sansi.vercel.app";

export type RolApp = "ADMINISTRADOR" | "EVALUADOR" | "RESPONSABLE";

export interface UserSession {
  nombreCompleto?: string;
  correo?: string;
  rol: RolApp;
  name?: string;
  email?: string;
  token?: string;
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
  complemento_documento?: string;
  profesion?: string;
  institucion?: string;
  cargo?: string;
  aceptaTerminos: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  loadingInit: boolean;
  // 👇 firma compatible con ambas formas:
  // setSession(token, userForStorage)  y  setSession(session)
  setSession: (
    tokenOrSession: string | UserSession | null,
    userForStorage?: UserSession
  ) => Promise<void> | void;
  clearSession: () => void;
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
  loadingInit: false,
  setSession: async () => {},
  clearSession: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loadingInit] = useState(false);
  const navigate = useNavigate();

  // ✔ implementación compatible con 1 o 2 argumentos
  const setSession = async (
    arg1: string | UserSession | null,
    arg2?: UserSession
  ): Promise<void> => {
    // limpiar sesión
    if (!arg1 && !arg2) {
      setUser(null);
      localStorage.removeItem("token");
      return;
    }

    let session: UserSession;

    // forma vieja: setSession(token, userForStorage)
    if (typeof arg1 === "string" || arg1 === null) {
      const token = arg1 ?? undefined;
      const userFromArgs = arg2;

      if (!userFromArgs) {
        setUser(null);
        localStorage.removeItem("token");
        return;
      }

      session = { ...userFromArgs, token };
    } else {
      // forma nueva: setSession(session)
      session = arg1;
    }

    setUser(session);

    if (session.token) {
      localStorage.setItem("token", session.token);
    }
  };

  const clearSession = () => {
    void setSession(null);
  };

  const login = async (
    correo: string,
    password: string,
    simulatedData?: { name: string; rol: string }
  ) => {
    try {
      if (simulatedData) {
        await setSession("simulated-token", {
          nombreCompleto: simulatedData.name,
          correo,
          rol: simulatedData.rol as RolApp,
          name: simulatedData.name,
          email: correo,
        });
      } else {
        const response = await axios.post(
          `${API_URL}/api/evaluadores/login`,
          { correo, password }
        );

        const token: string | undefined = response.data.token;
        const usuario = response.data.usuario ?? {};

        const nombreCompleto: string =
          usuario.nombreCompleto ?? response.data.name ?? "";
        const emailFrom: string =
          usuario.correo ?? response.data.email ?? correo;
        const rolFrom: RolApp =
          usuario.rol ?? response.data.rol ?? "EVALUADOR";

        await setSession(token ?? null, {
          nombreCompleto,
          correo: emailFrom,
          rol: rolFrom,
          name: nombreCompleto,
          email: emailFrom,
        });
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

      const { ok, usuario, mensaje } = response.data;

      if (!ok) {
        throw new Error(mensaje || "Error al registrarse");
      }

      const fullName = `${usuario.nombre} ${usuario.ap_paterno}${
        usuario.ap_materno ? " " + usuario.ap_materno : ""
      }`;

      await setSession(null, {
        nombreCompleto: fullName,
        correo: usuario.correo,
        rol: (usuario.rol as RolApp) ?? "EVALUADOR",
        name: fullName,
        email: usuario.correo,
      });
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
      clearSession();
      navigate("/");
    } catch (error) {
      console.error("Error en logout:", error);
      clearSession();
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingInit,
        setSession,
        clearSession,
        login,
        register,
        logout,
      }}
    >
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
