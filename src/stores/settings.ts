import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useSettingsStore = defineStore('settings', () => {
  // 主题
  const theme = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) || 'system')
  
  // 播放设置
  const volume = ref<number>(parseFloat(localStorage.getItem('volume') || '0.8'))
  const isMuted = ref<boolean>(localStorage.getItem('isMuted') === 'true')
  const autoPlayNext = ref<boolean>(localStorage.getItem('autoPlayNext') !== 'false')
  const playbackRate = ref<number>(parseFloat(localStorage.getItem('playbackRate') || '1.0'))
  
  // 界面设置
  const compactMode = ref<boolean>(localStorage.getItem('compactMode') === 'true')
  
  // 更新设置
  const enableAutoUpdate = ref<boolean>(localStorage.getItem('enableAutoUpdate') !== 'false')

  // 监听变化
  watch([volume, isMuted, autoPlayNext, playbackRate], () => {
    localStorage.setItem('volume', String(volume.value))
    localStorage.setItem('isMuted', String(isMuted.value))
    localStorage.setItem('autoPlayNext', String(autoPlayNext.value))
    localStorage.setItem('playbackRate', String(playbackRate.value))
  })

  watch([theme], () => {
    localStorage.setItem('theme', theme.value)
  })

  // 方法
  const setTheme = (mode: ThemeMode) => {
    theme.value = mode
    localStorage.setItem('theme', mode)
    applyTheme()
  }

  const toggleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(theme.value)
    setTheme(modes[(currentIndex + 1) % modes.length])
  }

  const applyTheme = () => {
    const isDark = theme.value === 'dark' || 
                   (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    document.documentElement.classList.toggle('dark', isDark)
  }

  const setVolume = (value: number) => {
    volume.value = Math.max(0, Math.min(1, value))
  }

  const setMuted = (muted: boolean) => {
    isMuted.value = muted
  }

  const resetSettings = () => {
    theme.value = 'system'
    volume.value = 0.8
    isMuted.value = false
    autoPlayNext.value = true
    playbackRate.value = 1.0
    compactMode.value = false
    enableAutoUpdate.value = true
    
    localStorage.clear()
    applyTheme()
  }

  const init = () => {
    applyTheme()
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') applyTheme()
    })
  }

  return {
    theme,
    volume,
    isMuted,
    autoPlayNext,
    playbackRate,
    compactMode,
    enableAutoUpdate,
    setTheme,
    toggleTheme,
    applyTheme,
    setVolume,
    setMuted,
    resetSettings,
    init
  }
})
