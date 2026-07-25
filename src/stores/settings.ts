import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Language = 'zh' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'ru' | 'ar' | 'pt'

export const useSettingsStore = defineStore('settings', () => {
  // 主题设置
  const theme = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) || 'system')
  const language = ref<Language>((localStorage.getItem('language') as Language) || 'zh')
  
  // 播放设置
  const volume = ref<number>(parseFloat(localStorage.getItem('volume') || '0.8'))
  const isMuted = ref<boolean>(localStorage.getItem('isMuted') === 'true')
  const autoPlayNext = ref<boolean>(localStorage.getItem('autoPlayNext') !== 'false')
  const defaultPlaybackRate = ref<number>(parseFloat(localStorage.getItem('playbackRate') || '1.0'))
  
  // 界面设置
  const showLyrics = ref<boolean>(localStorage.getItem('showLyrics') !== 'false')
  const compactMode = ref<boolean>(localStorage.getItem('compactMode') === 'true')
  
  // 缓存设置
  const cacheSize = ref<number>(parseInt(localStorage.getItem('cacheSize') || '100'))
  const clearCacheOnExit = ref<boolean>(localStorage.getItem('clearCacheOnExit') === 'true')
  
  // 通知设置
  const enableNotifications = ref<boolean>(localStorage.getItem('enableNotifications') !== 'false')
  const enableAutoUpdate = ref<boolean>(localStorage.getItem('enableAutoUpdate') !== 'false')
  
  // 隐私设置
  const analyticsEnabled = ref<boolean>(localStorage.getItem('analyticsEnabled') !== 'false')
  const crashReporting = ref<boolean>(localStorage.getItem('crashReporting') !== 'false')

  // 监听变化并保存
  watch([volume, isMuted, autoPlayNext, defaultPlaybackRate], () => {
    localStorage.setItem('volume', String(volume.value))
    localStorage.setItem('isMuted', String(isMuted.value))
    localStorage.setItem('autoPlayNext', String(autoPlayNext.value))
    localStorage.setItem('playbackRate', String(defaultPlaybackRate.value))
  })

  watch([showLyrics, compactMode], () => {
    localStorage.setItem('showLyrics', String(showLyrics.value))
    localStorage.setItem('compactMode', String(compactMode.value))
  })

  watch([cacheSize, clearCacheOnExit], () => {
    localStorage.setItem('cacheSize', String(cacheSize.value))
    localStorage.setItem('clearCacheOnExit', String(clearCacheOnExit.value))
  })

  watch([enableNotifications, enableAutoUpdate], () => {
    localStorage.setItem('enableNotifications', String(enableNotifications.value))
    localStorage.setItem('enableAutoUpdate', String(enableAutoUpdate.value))
  })

  watch([analyticsEnabled, crashReporting], () => {
    localStorage.setItem('analyticsEnabled', String(analyticsEnabled.value))
    localStorage.setItem('crashReporting', String(crashReporting.value))
  })

  // 主题方法
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
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 语言方法
  const setLanguage = (lang: Language) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }

  // 音量方法
  const setVolume = (value: number) => {
    volume.value = Math.max(0, Math.min(1, value))
  }

  const setMuted = (muted: boolean) => {
    isMuted.value = muted
  }

  // 重置所有设置
  const resetSettings = () => {
    theme.value = 'system'
    language.value = 'zh'
    volume.value = 0.8
    isMuted.value = false
    autoPlayNext.value = true
    defaultPlaybackRate.value = 1.0
    showLyrics.value = true
    compactMode.value = false
    cacheSize.value = 100
    clearCacheOnExit.value = false
    enableNotifications.value = true
    enableAutoUpdate.value = true
    analyticsEnabled.value = true
    crashReporting.value = true
    
    const keys = [
      'theme', 'language', 'volume', 'isMuted', 'autoPlayNext',
      'playbackRate', 'showLyrics', 'compactMode', 'cacheSize',
      'clearCacheOnExit', 'enableNotifications', 'enableAutoUpdate',
      'analyticsEnabled', 'crashReporting'
    ]
    keys.forEach(key => localStorage.removeItem(key))
    
    applyTheme()
  }

  // 初始化
  const init = () => {
    applyTheme()
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme()
      }
    })
  }

  return {
    theme,
    language,
    volume,
    isMuted,
    autoPlayNext,
    defaultPlaybackRate,
    showLyrics,
    compactMode,
    cacheSize,
    clearCacheOnExit,
    enableNotifications,
    enableAutoUpdate,
    analyticsEnabled,
    crashReporting,
    setTheme,
    toggleTheme,
    applyTheme,
    setLanguage,
    setVolume,
    setMuted,
    resetSettings,
    init
  }
})
