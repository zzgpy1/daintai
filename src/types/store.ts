// 支持的语言类型
export type SupportedLanguage = 'zh' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'ru' | 'ar' | 'pt'

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'system'

// Toast类型
export type ToastType = 'success' | 'error' | 'warning' | 'info'

// 播放器状态
export interface PlayerState {
  isPlaying: boolean
  currentStation: RadioStation | null
  volume: number
  isMuted: boolean
  isLoading: boolean
  isBuffering: boolean
  error: string | null
  currentTime: number
  duration: number
}

// 应用设置
export interface AppSettings {
  theme: ThemeMode
  language: SupportedLanguage
  volume: number
  isMuted: boolean
  autoPlayNext: boolean
  playbackRate: number
  showLyrics: boolean
  compactMode: boolean
  cacheSize: number
  clearCacheOnExit: boolean
  enableNotifications: boolean
  enableAutoUpdate: boolean
  analyticsEnabled: boolean
  crashReporting: boolean
}
