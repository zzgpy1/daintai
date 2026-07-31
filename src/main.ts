import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'
import './style.css'

import zh from './locales/zh.json'
import en from './locales/en.json'

// 使用环境变量，优先从 import.meta.env 读取
const appVersion = import.meta.env.VITE_APP_VERSION || '2.0.3'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh',
  fallbackLocale: 'en',
  messages: { zh, en }
})

const app = createApp(App)

app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 错误:', err, info)
}

app.use(createPinia())
app.use(router)
app.use(i18n)

try {
  app.mount('#app')
  console.log(`✅ 全球电台 v${appVersion} 已启动`)
} catch (e) {
  console.error('❌ Vue 挂载失败:', e)
}
