// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useSettingsStore } from './stores/settings'
import { updateService } from './services/updateService'
import './style.css'

// 创建应用
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化设置
const settingsStore = useSettingsStore()
settingsStore.init()

// 检查更新（延迟执行）
setTimeout(() => {
  updateService.checkAndPrompt()
}, 5000)

// 启动自动更新检查
updateService.startAutoCheck()

// Electron更新支持
if (window.electron) {
  updateService.setupElectronUpdater()
}

// 挂载应用
app.mount('#app')
