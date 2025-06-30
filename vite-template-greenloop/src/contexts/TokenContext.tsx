import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

type TokenContextType = {
  token: string | null;
  saveToken: (userToken: string) => void;
  removeToken: () => void;
  onTokenChange: (callback: (token: string | null) => void) => () => void;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

type TokenProviderProps = {
  children: ReactNode;
};

export function TokenProvider({ children }: TokenProviderProps) {
  const getToken = () => {
    return localStorage.getItem("token");
  };

  const [token, setToken] = useState<string | null>(getToken());
  const callbacksRef = useRef<Set<(token: string | null) => void>>(new Set());

  const saveToken = useCallback((userToken: string) => {
    localStorage.setItem("token", userToken);
    setToken(userToken);
    // Notificar a todos los callbacks
    callbacksRef.current.forEach((callback) => callback(userToken));
  }, []);

  const removeToken = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("theme");
    setToken(null);
    // Notificar a todos los callbacks
    callbacksRef.current.forEach((callback) => callback(null));
  }, []);

  const onTokenChange = useCallback(
    (callback: (token: string | null) => void) => {
      callbacksRef.current.add(callback);

      // Retornar función de cleanup
      return () => {
        callbacksRef.current.delete(callback);
      };
    },
    []
  );

  const value = {
    token,
    saveToken,
    removeToken,
    onTokenChange,
  };

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
}

export const useToken = () => {
  const context = useContext(TokenContext);

  if (context === undefined) {
    throw new Error("useToken must be used within a TokenProvider");
  }

  return context;
};
