"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "dark";

type ThemeContextType = {
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set theme to dark and ensure it's applied
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    setIsInitialized(true);
  }, []);

  // Provide a static dark theme context
  const themeContextValue = { theme: "dark" as Theme };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
