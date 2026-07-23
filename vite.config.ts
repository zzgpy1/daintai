import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          hoistStatic: true,
          cacheHandlers: true
        }
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // 确保 PWA 插件能找到入口
      includeAssets: ['favicon.svg', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: '全球电台 - GlobalRadio',
        short_name: '全球电台',
        description: '聆听全球高品质电台，享受无限音乐、新闻和娱乐内容',
        theme_color: '#1a365d',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 3000000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.radio-browser\.info\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'radio-api-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
    cors: true,
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@heroicons/vue', '@headlessui/vue']
        }
      }
    }
  }
})
