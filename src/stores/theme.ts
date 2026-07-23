import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light')

  const shouldUseDark = computed(() => {
    return mode.value === 'dark'
  })

  const applyTheme = (dark: boolean) => {
    if (typeof document !== 'undefined') {
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const initTheme = () => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode
    if (savedMode && ['light', 'dark'].includes(savedMode)) {
      mode.value = savedMode
    }
    applyTheme(shouldUseDark.value)
  }

  const setMode = (newMode: ThemeMode) => {
    mode.value = newMode
    localStorage.setItem('theme-mode', newMode)
  }

  const toggleMode = () => {
    const newMode = mode.value === 'light' ? 'dark' : 'light'
    setMode(newMode)
  }

  watch(shouldUseDark, (dark) => {
    applyTheme(dark)
  }, { immediate: true })

  return {
    mode,
    shouldUseDark,
    initTheme,
    setMode,
    toggleMode
  }
})
