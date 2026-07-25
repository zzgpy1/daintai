import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'
import './style.css'

// 导入语言包
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

// 检测系统语言
const detectLanguage = (): string => {
  const saved = localStorage.getItem('language')
  if (saved) return saved
  
  const browserLang = navigator.language.split('-')[0]
  const supported = ['zh', 'en', 'es', 'fr', 'de', 'ja', 'ko', 'ru', 'ar', 'pt']
  return supported.includes(browserLang) ? browserLang : 'en'
}

// 创建i18n实例
const i18n = createI18n({
  legacy: false,
  locale: detectLanguage(),
  fallbackLocale: 'en',
  messages: {
    zh, en, es, fr, de, ja, ko, ru, ar, pt
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
