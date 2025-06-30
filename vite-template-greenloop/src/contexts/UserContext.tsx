import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { getCurrentUser } from "@/api/api";
import { CurrentUserDto } from "@/types/interfaces";
import { useToken } from "@/contexts/TokenContext";

interface UserContextType {
  user: CurrentUserDto | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CurrentUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { onTokenChange, removeToken } = useToken();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Solo obtener usuario si hay token
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);

        return;
      }

      const userData = await getCurrentUser();

      setUser(userData);
    } catch (err: any) {
      // console.error("Error fetching user:", err);

      // Manejar diferentes tipos de errores
      if (
        err.message?.includes("401") ||
        err.message?.includes("403") ||
        err.message?.includes("authentication") ||
        err.message?.includes("Unauthorized") ||
        err.message?.includes("Forbidden")
      ) {
        // Token inválido o expirado - limpiar todo
        // console.log("Token inválido, limpiando sesión...");
        removeToken();
        setUser(null);
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
      } else {
        // Otros errores (conexión, etc.)
        setError(err.message || "Error al obtener datos del usuario");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [removeToken]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Escuchar cambios en el token usando el callback del TokenContext
  useEffect(() => {
    const unsubscribe = onTokenChange((newToken) => {
      if (newToken) {
        // Token agregado - obtener usuario
        fetchUser();
      } else {
        // Token removido - limpiar usuario
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [onTokenChange, fetchUser]);

  // Mantener el listener del storage para cambios desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        if (e.newValue) {
          // Token agregado - obtener usuario
          fetchUser();
        } else {
          // Token removido - limpiar usuario
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUser]);

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
