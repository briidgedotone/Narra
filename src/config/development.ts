// Development-specific configuration
export const DEV_CONFIG = {
  // Enable debug logging in development
  enableDebugLogs: process.env.NODE_ENV === "development",

  // Mock data flags for development
  useMockData: process.env.USE_MOCK_DATA === "true",

  // Development-only features
  showDevTools: process.env.NODE_ENV === "development",

  // API endpoints for development
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",

  // Development database settings
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// Development utilities
export const devLog = (...args: unknown[]) => {
  if (DEV_CONFIG.enableDebugLogs) {
    console.log("[DEV]", ...args);
  }
};

export const devWarn = (...args: unknown[]) => {
  if (DEV_CONFIG.enableDebugLogs) {
    console.warn("[DEV]", ...args);
  }
};

export const devError = (...args: unknown[]) => {
  if (DEV_CONFIG.enableDebugLogs) {
    console.error("[DEV]", ...args);
  }
};
