"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";

import { THEME, THEME_CSS_VARS, type ThemeConfig } from "@/config/theme";

interface ThemeContextType {
  theme: ThemeConfig;
  cssVars: typeof THEME_CSS_VARS;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Inject CSS variables into the document root
    const root = document.documentElement;

    Object.entries(THEME_CSS_VARS).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Cleanup function
    return () => {
      Object.keys(THEME_CSS_VARS).forEach(property => {
        root.style.removeProperty(property);
      });
    };
  }, []);

  const contextValue: ThemeContextType = {
    theme: THEME,
    cssVars: THEME_CSS_VARS,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme in components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Utility function to get CSS variable value
export function getCSSVar(varName: keyof typeof THEME_CSS_VARS): string {
  if (typeof window !== "undefined") {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
  }
  return THEME_CSS_VARS[varName];
}

// Utility function to apply theme classes
export function getThemeClasses() {
  return {
    sidebar: "sidebar-narra",
    sidebarNavItem: "sidebar-nav-item",
    sidebarBrand: "sidebar-brand",
  };
}
