import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme");
    // Siempre usar "light" por defecto en lugar de detectar preferencias del sistema

    return (savedTheme as Theme) || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

// Proveedor específico para páginas que requieren tema claro forzado
export function LightThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Forzar tema claro al montar
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add("light");

    return () => {
      // Restaurar el tema guardado al desmontar
      const savedTheme = (localStorage.getItem("theme") as Theme) || "light";

      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(savedTheme);
    };
  }, []);

  const forcedThemeContext: ThemeContextType = {
    theme: "light",
    toggleTheme: () => {
      // No hacer nada - el tema está forzado a claro
    },
  };

  return (
    <ThemeContext.Provider value={forcedThemeContext}>
      {children}
    </ThemeContext.Provider>
  );
}
