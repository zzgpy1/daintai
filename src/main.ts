import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'
import App from './App.vue'
import './style.css'

import zh from './locales/zh.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh',
  fallbackLocale: 'en',
  messages: { zh, en }
})

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 全局错误:', err, info)
  // 可在此上报错误
}

// 全局警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue 警告:', msg, trace)
}

app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')

console.log('✅ Vue 应用已挂载')
