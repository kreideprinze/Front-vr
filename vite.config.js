// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/react-vite'

export default defineConfig({
  plugins: [react()],
  base: '/Front-DK/', // This must match your GitHub repository name exactly
})