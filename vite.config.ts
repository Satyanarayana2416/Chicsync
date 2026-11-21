import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // We use (process as any).cwd() to satisfy TS constraints in some environments.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // For Netlify/Vercel, process.env.API_KEY is often available directly in the build environment.
  // We prioritize the `env` object loaded by Vite (which includes .env files), 
  // then fall back to process.env (system environment variables).
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Replaces process.env.API_KEY in the client code with the string value of the key.
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  }
})