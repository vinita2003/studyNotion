import { defineConfig } from 'vite'
import envCompatible from 'vite-plugin-env-compatible'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
envPrefix: "REACT_APP_"
export default defineConfig({
  plugins: [
    react(),
    envCompatible(),
  ],
})
