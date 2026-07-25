import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>((localStorage.getItem('theme-mode') as ThemeMode) || 'system')
  
  const isDark = computed(() => {
    if (mode.value === 'dark') return true
    if (mode.value === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const setTheme = (newMode: ThemeMode) => {
    mode.value = newMode
    localStorage.setItem('theme-mode', newMode)
    applyTheme()
  }

  const toggleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const idx = modes.indexOf(mode.value)
    setTheme(modes[(idx + 1) % modes.length])
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const init = () => {
    applyTheme()
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (mode.value === 'system') applyTheme()
    })
  }

  watch(isDark, () => applyTheme())

  return {
    mode,
    isDark,
    setTheme,
    toggleTheme,
    applyTheme,
    init
  }
})
