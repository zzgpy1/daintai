// 支持的语言类型（仅 zh 和 en）
export type SupportedLanguage = 'zh' | 'en'

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

// 注意：RadioStation 类型在 radio.ts 中定义
// 这里声明以避免循环依赖
interface RadioStation {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  homepage: string
  favicon: string
  tags: string
  country: string
  countrycode: string
  state: string
  language: string
  languagecodes: string
  votes: number
  // ... 其他字段
}
