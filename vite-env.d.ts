// Fix: Removed '/// <reference types="vite/client" />' as it was causing a resolution error.
// The application uses process.env.API_KEY, so we manually declare the NodeJS.ProcessEnv interface.

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}