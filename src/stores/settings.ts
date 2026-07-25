// src/stores/settings.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface VersionInfo {
  version: string
  releaseDate: string
  changelog: string[]
  downloadUrl: {
    web?: string
    windows?: string
    mac?: string
    linux?: string
    android?: string
  }
  mandatory: boolean
}

export const useSettingsStore = defineStore('settings', () => {
  // 基本设置
  const theme = ref<'light' | 'dark' | 'system'>('system')
  const language = ref('zh')
  const volume = ref(0.8)
  const muted = ref(false)
  const autoPlay = ref(true)
  const autoNext = ref(false)
  const autoCheckUpdates = ref(true)
  
  // 睡眠定时器预设
  const sleepTimerPresets = ref<number[]>([15, 30, 45, 60, 90, 120])
  
  // 更新相关
  const pendingUpdate = ref<VersionInfo | null>(null)
  const ignoredVersion = ref<string | null>(null)
  const lastUpdateCheck = ref<number | null>(null)

  // 方法
  const setTheme = (value: 'light' | 'dark' | 'system') => {
    theme.value = value
    localStorage.setItem('theme', value)
    applyTheme()
  }

  const applyTheme = () => {
    const isDark = theme.value === 'dark' || 
      (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    document.documentElement.classList.toggle('dark', isDark)
  }

  const setLanguage = (value: string) => {
    language.value = value
    localStorage.setItem('language', value)
  }

  const setVolume = (value: number) => {
    volume.value = value
    localStorage.setItem('volume', String(value))
  }

  const setMuted = (value: boolean) => {
    muted.value = value
    localStorage.setItem('muted', String(value))
  }

  const getVolume = () => {
    const saved = localStorage.getItem('volume')
    return saved ? parseFloat(saved) : null
  }

  const getMuted = () => {
    const saved = localStorage.getItem('muted')
    return saved ? saved === 'true' : null
  }

  const getAutoNext = () => autoNext.value

  const setPendingUpdate = (info: VersionInfo) => {
    if (ignoredVersion.value === info.version) return
    pendingUpdate.value = info
  }

  const dismissUpdate = () => {
    pendingUpdate.value = null
  }

  const setIgnoredVersion = (version: string) => {
    ignoredVersion.value = version
    localStorage.setItem('ignoredVersion', version)
  }

  const getIgnoredVersion = () => {
    return localStorage.getItem('ignoredVersion')
  }

  // 初始化
  const init = () => {
    // 主题
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
    if (savedTheme) {
      theme.value = savedTheme
    }
    applyTheme()

    // 语言
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage) {
      language.value = savedLanguage
    }

    // 音量
    const savedVolume = getVolume()
    if (savedVolume !== null) {
      volume.value = savedVolume
    }

    // 静音
    const savedMuted = getMuted()
    if (savedMuted !== null) {
      muted.value = savedMuted
    }

    // 忽略的版本
    const savedIgnored = getIgnoredVersion()
    if (savedIgnored) {
      ignoredVersion.value = savedIgnored
    }
  }

  return {
    theme,
    language,
    volume,
    muted,
    autoPlay,
    autoNext,
    autoCheckUpdates,
    sleepTimerPresets,
    pendingUpdate,
    ignoredVersion,
    lastUpdateCheck,
    setTheme,
    setLanguage,
    setVolume,
    setMuted,
    getVolume,
    getMuted,
    getAutoNext,
    setPendingUpdate,
    dismissUpdate,
    setIgnoredVersion,
    getIgnoredVersion,
    init,
    applyTheme
  }
})
