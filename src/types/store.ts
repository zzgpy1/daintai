import type { RadioStation, FavoriteStation, HistoryItem } from './radio'

// 播放器Store状态
export interface PlayerStoreState {
  currentStation: RadioStation | null
  isPlaying: boolean
  isLoading: boolean
  isBuffering: boolean
  error: string | null
  volume: number
  isMuted: boolean
  playbackRate: number
  currentTime: number
  duration: number
  sleepTimer: number | null
  sleepTimerRemaining: number
}

// 电台Store状态
export interface RadioStoreState {
  stations: RadioStation[]
  topStations: RadioStation[]
  latestStations: RadioStation[]
  countries: Country[]
  languages: Language[]
  tags: Tag[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedCountry: string
  selectedLanguage: string
  selectedTag: string
  currentPage: number
  pageSize: number
}

// 收藏Store状态
export interface FavoritesStoreState {
  favorites: FavoriteStation[]
  isLoading: boolean
}

// 历史Store状态
export interface HistoryStoreState {
  history: HistoryItem[]
  maxHistoryItems: number
}

// 设置Store状态
export interface SettingsStoreState {
  theme: 'light' | 'dark' | 'system'
  language: 'zh' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'ru' | 'ar' | 'pt'
  volume: number
  isMuted: boolean
  autoPlayNext: boolean
  defaultPlaybackRate: number
  showLyrics: boolean
  compactMode: boolean
  cacheSize: number
  clearCacheOnExit: boolean
  enableNotifications: boolean
  enableAutoUpdate: boolean
  analyticsEnabled: boolean
  crashReporting: boolean
}
