// App-wide constants and configuration
export const APP_CONFIG = {
  name: "Use Narra",
  description: "Content Curation & Inspiration for Marketers",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  discovery: "/discovery",
  following: "/following",
  boards: "/boards",
  collections: "/collections",
  settings: "/settings",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export const API_ENDPOINTS = {
  posts: "/api/posts",
  profiles: "/api/profiles",
  boards: "/api/boards",
  follows: "/api/follows",
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;
// test comment
