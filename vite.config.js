import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  preview: { allowedHosts: ['www.clubasogema.com'] },
  plugins: [vue()],
})
