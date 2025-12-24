
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injects the environment variable so process.env.API_KEY works in client code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  build: {
    target: 'esnext',
  }
});
