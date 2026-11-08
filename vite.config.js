import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // './' makes every file link relative, so the built site works from any
  // folder: GitHub Pages serves it at /gacha-pull-simulator/, not at /.
  base: './',
})
