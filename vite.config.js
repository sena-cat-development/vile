// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),

    quasar({
      sassVariables: 'src/quasar-variables.sass'
    })
  ],

  // ✨ AÑADE ESTO (Puede ayudar con la caché y el acceso al servidor) ✨
  server: {
    // Sirve los archivos estáticos desde la carpeta pública (ya el valor por defecto, pero lo forzamos)
    fs: {
      strict: false 
    }
  }
})