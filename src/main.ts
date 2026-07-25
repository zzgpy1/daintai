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

// 创建i18n实例
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh',
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

// ============================================
// 全局错误处理
// ============================================
app.config.errorHandler = (err, instance, info) => {
  console.error('❌ 全局错误:', err)
  console.error('组件:', instance)
  console.error('信息:', info)
  
  // 开发环境下显示详细错误
  if (import.meta.env.DEV) {
    console.error('详细错误栈:', (err as Error).stack)
  }
  
  // 生产环境下上报错误
  if (import.meta.env.PROD) {
    // 可以集成错误上报服务
    // reportError(err, instance, info)
  }
}

// 未捕获的Promise错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ 未处理的Promise拒绝:', event.reason)
  event.preventDefault()
})

// ============================================
// 网络状态监测
// ============================================
window.addEventListener('online', () => {
  console.log('✅ 网络已恢复')
  // 触发网络恢复事件
  window.dispatchEvent(new CustomEvent('network-online'))
})

window.addEventListener('offline', () => {
  console.warn('⚠️ 网络已断开')
  window.dispatchEvent(new CustomEvent('network-offline'))
})

// ============================================
// 性能监测
// ============================================
if (import.meta.env.DEV) {
  // 监测长任务
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('⚠️ 长任务检测:', entry)
          }
        }
      })
      observer.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      // 忽略不支持的情况
    }
  }
}

// ============================================
// 挂载应用
// ============================================
app.mount('#app')

// ============================================
// Service Worker注册（生产环境）
// ============================================
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker注册成功:', registration)
      })
      .catch(error => {
        console.error('❌ Service Worker注册失败:', error)
      })
  })
}
