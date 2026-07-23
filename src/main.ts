import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useLanguageStore } from './stores/language'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const initApp = async () => {
  const languageStore = useLanguageStore()
  await languageStore.initLanguage()
  app.mount('#app')
}

initApp()
