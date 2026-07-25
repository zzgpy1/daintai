import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'

// ============================================
// 导入样式 - 确保路径正确
// ============================================
import './style.css'

// ============================================
// 导入语言包
// ============================================
import zh from './locales/zh.json'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'
import pt from './locales/pt.json'

// ============================================
// 创建 i18n 实例
// ============================================
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh',
  fallbackLocale: 'en',
  messages: {
    zh, en, es, fr, de, ja, ko, ru, ar, pt
  }
})

// ============================================
// 创建应用
// ============================================
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// ============================================
// 全局错误处理
// ============================================
app.config.errorHandler = (err, instance, info) => {
  console.error('❌ 全局错误:', err)
  if (import.meta.env.DEV) {
    console.error('组件:', instance)
    console.error('信息:', info)
  }
}

// ============================================
// 挂载应用
// ============================================
app.mount('#app')

// ============================================
// Service Worker 注册（生产环境）
// ============================================
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker 注册成功')
        })
        .catch(error => {
          console.error('❌ Service Worker 注册失败:', error)
        })
    }, 2000)
  })
}
