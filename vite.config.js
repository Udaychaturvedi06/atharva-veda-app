import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: { '/api': 'http://127.0.0.1:5001' }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 10000000
      },
      manifest: {
        name: 'Atharva Veda Mobile',
        short_name: 'AtharvaVeda',
        description: 'Translating and simplifying the Atharva Veda for today.',
        theme_color: '#FAFAF7',
        background_color: '#FAFAF7',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png', // Temporary simple web mock
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
