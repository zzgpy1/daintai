export const APP_CONSTANTS = {
  VERSION: '2.0.0',
  NAME: '全球电台',
  MAX_HISTORY: 500,
  MAX_FAVORITES: 1000,
  CACHE_TTL: 300000, // 5分钟
  DEBOUNCE_DELAY: 300,
  SLEEP_TIMER_OPTIONS: [15, 30, 45, 60, 90, 120],
  DEFAULT_VOLUME: 0.8
} as const

export const STORAGE_KEYS = {
  FAVORITES: 'radio-favorites',
  HISTORY: 'radio-history',
  THEME: 'theme',
  LANGUAGE: 'language',
  VOLUME: 'volume',
  MUTED: 'isMuted',
  AUTO_PLAY_NEXT: 'autoPlayNext'
} as const
