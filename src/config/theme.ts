// Use Narra Theme Configuration
export const THEME = {
  colors: {
    // Primary brand colors
    primary: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3C82F6", // Main primary color
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A",
    },

    // Sidebar specific colors
    sidebar: {
      background: "#F8F8F8",
      borderColor: "#E2E2E2",
      textPrimary: "#1F2937",
      textSecondary: "#6B7280",
      hoverBg: "#F3F4F6",
      activeBg: "#E8E8E8",
      activeText: "#1F2937",
    },

    // Semantic colors
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3C82F6",

    // Neutral colors
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
  },

  // Sidebar Theme
  sidebar: {
    width: "250px",
    background: "#F8F8F8", // Light gray background
    border: "#E2E2E2", // Light gray border
    text: {
      primary: "#1F2937", // Updated to match new theme
      secondary: "#6B7280", // Muted text
      active: "#1F2937", // Dark text on light active background
    },
    hover: {
      background: "#F3F4F6", // Updated to match new theme
    },
    active: {
      background: "#E8E8E8", // Updated to light gray
      text: "#1F2937", // Dark text on light background
    },
  },

  // Layout
  layout: {
    containerMaxWidth: "1280px",
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "12px",
      xl: "16px",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
      "2xl": "48px",
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  // Animation
  animation: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // Component Variants
  components: {
    button: {
      primary: {
        bg: "#3C82F6",
        hoverBg: "#2563EB",
        text: "#FFFFFF",
      },
      secondary: {
        bg: "#F3F4F6",
        hoverBg: "#E5E7EB",
        text: "#374151",
      },
      outline: {
        background: "transparent",
        text: "#3C82F6", // Updated to new primary
        border: "#3C82F6", // Updated to new primary
        hover: "#F8F8F8",
      },
    },
    card: {
      bg: "#FFFFFF",
      border: "#E5E7EB",
      shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    },
  },
} as const;

// Backward-compatible theme export for test page
export const theme = {
  brand: {
    primary: "#3C82F6",
    secondary: "#2563EB",
    accent: "#60A5FA",
  },
  sidebar: THEME.sidebar,
  components: THEME.components,
  typography: THEME.typography,
  layout: THEME.layout,
  shadows: THEME.shadows,
  animation: THEME.animation,
} as const;

// CSS Custom Properties for the theme
export const THEME_CSS_VARS = {
  // Sidebar
  "--sidebar-width": THEME.sidebar.width,
  "--sidebar-bg": THEME.sidebar.background,
  "--sidebar-border": THEME.sidebar.border,
  "--sidebar-text-primary": THEME.sidebar.text.primary,
  "--sidebar-text-secondary": THEME.sidebar.text.secondary,
  "--sidebar-text-active": THEME.sidebar.text.active,
  "--sidebar-hover-bg": THEME.sidebar.hover.background,
  "--sidebar-active-bg": THEME.sidebar.active.background,
  "--sidebar-active-text": THEME.sidebar.active.text,

  // Brand
  "--brand-primary": THEME.colors.primary[500],
  "--brand-secondary": THEME.colors.primary[600],
  "--brand-accent": THEME.colors.primary[400],
} as const;

// Type for theme access
export type ThemeConfig = typeof THEME;
