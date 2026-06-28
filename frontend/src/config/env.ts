/**
 * Type-safe environment variables.
 * All env vars must be prefixed with VITE_ to be exposed in the client bundle.
 */
const env = {
  apiBaseUrl: (import.meta as any).env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  appName: (import.meta as any).env.VITE_APP_NAME ?? 'AI Interview Platform',
  appVersion: (import.meta as any).env.VITE_APP_VERSION ?? '1.0.0',
  isDev: (import.meta as any).env.DEV,
  isProd: (import.meta as any).env.PROD,
} as const;

export default env;
