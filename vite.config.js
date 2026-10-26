import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site from /john-ebden/; the dev server stays at the root.
  base: command === 'build' ? '/john-ebden/' : '/',
  plugins: [react()],
}))
