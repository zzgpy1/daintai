import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) || 'light')
  const language = ref<string>(localStorage.getItem('language') || 'zh')
  const volume = ref<number>(parseFloat(localStorage.getItem('volume') || '0.8'))
  const isMuted = ref<boolean>(localStorage.getItem('isMuted') === 'true')
  const autoPlayNext = ref<boolean>(localStorage.getItem('autoPlayNext') !== 'false')
  const enableNotifications = ref<boolean>(localStorage.getItem('enableNotifications') !== 'false')
  const enableAutoUpdate = ref<boolean>(localStorage.getItem('enableAutoUpdate') !== 'false')

  const setTheme = (mode: ThemeMode) => {
    theme.value = mode
    localStorage.setItem('theme', mode)
    applyTheme()
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const applyTheme = () => {
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const setLanguage = (lang: string) => {
    language.value = lang
    localStorage.setItem('language', lang)
    location.reload()
  }

  const setVolume = (value: number) => {
    volume.value = value
    localStorage.setItem('volume', String(value))
  }

  const setMuted = (muted: boolean) => {
    isMuted.value = muted
    localStorage.setItem('isMuted', String(muted))
  }

  const init = () => {
    applyTheme()
  }

  return {
    theme,
    language,
    volume,
    isMuted,
    autoPlayNext,
    enableNotifications,
    enableAutoUpdate,
    setTheme,
    toggleTheme,
    applyTheme,
    setLanguage,
    setVolume,
    setMuted,
    init
  }
})
