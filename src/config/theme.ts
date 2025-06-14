// Use Narra Theme Configuration
export const THEME = {
  // Brand Colors
  brand: {
    primary: "#3D52A0", // Dark Blue
    secondary: "#7091E6", // Medium Blue
    accent: "#EDE8F5", // Light Purple/Pink
  },

  // Sidebar Theme
  sidebar: {
    width: "250px",
    background: "#F8F8F8", // Light gray background
    border: "#E2E2E2", // Light gray border
    text: {
      primary: "#1A1A1A", // Dark text
      secondary: "#6B7280", // Muted text
      active: "#3D52A0", // Brand primary for active states
    },
    hover: {
      background: "#F0F0F0", // Slightly darker on hover
    },
    active: {
      background: "#3D52A0", // Brand primary background
      text: "#FFFFFF", // White text on active
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
      sans: "var(--font-geist-sans)",
      mono: "var(--font-geist-mono)",
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
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
        background: "#3D52A0",
        text: "#FFFFFF",
        hover: "#2A3B7A",
      },
      secondary: {
        background: "#7091E6",
        text: "#FFFFFF",
        hover: "#5A7BD9",
      },
      outline: {
        background: "transparent",
        text: "#3D52A0",
        border: "#3D52A0",
        hover: "#F8F8F8",
      },
    },
    card: {
      background: "#FFFFFF",
      border: "#E2E2E2",
      shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    },
  },
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
  "--brand-primary": THEME.brand.primary,
  "--brand-secondary": THEME.brand.secondary,
  "--brand-accent": THEME.brand.accent,
} as const;

// Type for theme access
export type ThemeConfig = typeof THEME;
