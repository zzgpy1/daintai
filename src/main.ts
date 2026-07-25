import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'
import './style.css'

// 仅导入中文和英文语言包
import zh from './locales/zh.json'
import en from './locales/en.json'

// 检测系统语言
const detectLanguage = (): string => {
  const saved = localStorage.getItem('language')
  if (saved) return saved
  
  const browserLang = navigator.language.split('-')[0]
  // 仅支持 zh 和 en
  return browserLang === 'zh' ? 'zh' : 'en'
}

// 创建i18n实例
const i18n = createI18n({
  legacy: false,
  locale: detectLanguage(),
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// 挂载应用
app.mount('#app')

// 注册Service Worker（生产环境）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
