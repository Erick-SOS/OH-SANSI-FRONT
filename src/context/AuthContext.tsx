import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  type AuthUser,
  getToken,
  getUser,
  saveAuth,
  clearAuth,
} from "../components/auth/authStorage";

interface AuthContextType {
  user: AuthUser | null;
  loadingInit: boolean;
  setSession: (token: string, user: AuthUser) => Promise<void>;
  clearSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loadingInit: true,
  setSession: async () => {},
  clearSession: async () => {},
});

// Verifica exp del JWT (en segundos)
function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64));
    if (!json.exp) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return nowSeconds >= json.exp;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);

  // Al montar: leer token + user del storage y validar
  useEffect(() => {
    (async () => {
      const token = await getToken();
      const storedUser = await getUser();

      if (!token || !storedUser || isTokenExpired(token)) {
        await clearAuth();
        setUser(null);
        setLoadingInit(false);
        return;
      }

      setUser(storedUser);
      setLoadingInit(false);
    })();
  }, []);

  // Para usar en SignIn cuando el back devuelva token+user
  const setSession = async (token: string, user: AuthUser) => {
    await saveAuth(token, user);
    setUser(user);
  };

  // Para logout manual o cuando quieras limpiar sesión
  const clearSession = async () => {
    await clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingInit,
        setSession,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
