// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: '全球电台',
        short_name: '全球电台',
        description: '聆听全球高品质电台，享受无限音乐、新闻和娱乐内容',
        theme_color: '#1a365d',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // 修复警告：明确指定要缓存的文件模式
        globPatterns: [
          '**/*.{js,css,html}',
          '**/*.{ico,png,svg}',
          '**/*.{woff,woff2,ttf,eot}'
        ],
        globIgnores: [
          '**/node_modules/**/*',
          'sw.js',
          'workbox-*.js'
        ],
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
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['@headlessui/vue', '@heroicons/vue']
        }
      }
    }
  }
})
