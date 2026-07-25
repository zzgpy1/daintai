// 应用常量定义

// 支持的音频格式
export const AUDIO_FORMATS = ['mp3', 'aac', 'ogg', 'flac', 'wav', 'm3u8', 'pls']

// 默认电台图标
export const DEFAULT_ICON = '/favicon.ico'

// 颜色方案
export const COLORS = {
  primary: '#007AFF',
  primaryDark: '#0055CC',
  secondary: '#AF52DE',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  light: '#F2F2F7',
  dark: '#1C1C1E'
}

// 国家代码映射
export const COUNTRY_CODE_MAP: Record<string, string> = {
  'CN': '中国',
  'US': '美国',
  'GB': '英国',
  'DE': '德国',
  'FR': '法国',
  'JP': '日本',
  'KR': '韩国',
  'RU': '俄罗斯',
  'CA': '加拿大',
  'AU': '澳大利亚',
  'IT': '意大利',
  'ES': '西班牙',
  'BR': '巴西',
  'IN': '印度',
  'MX': '墨西哥'
}

// 语言代码映射
export const LANGUAGE_CODE_MAP: Record<string, string> = {
  'zh': '中文',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'ja': '日本語',
  'ko': '한국어',
  'ru': 'Русский',
  'ar': 'العربية',
  'pt': 'Português'
}

// 标签分类
export const TAG_CATEGORIES = [
  { name: 'music', label: '音乐' },
  { name: 'news', label: '新闻' },
  { name: 'talk', label: '谈话' },
  { name: 'sport', label: '体育' },
  { name: 'pop', label: '流行' },
  { name: 'rock', label: '摇滚' },
  { name: 'jazz', label: '爵士' },
  { name: 'classical', label: '古典' },
  { name: 'electronic', label: '电子' },
  { name: 'folk', label: '民谣' }
]

// 存储键名
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  VOLUME: 'volume',
  MUTED: 'isMuted',
  FAVORITES: 'radio-favorites',
  HISTORY: 'radio-history',
  AUTO_PLAY_NEXT: 'autoPlayNext',
  PLAYBACK_RATE: 'playbackRate',
  SHOW_LYRICS: 'showLyrics',
  COMPACT_MODE: 'compactMode',
  CACHE_SIZE: 'cacheSize',
  CLEAR_CACHE_ON_EXIT: 'clearCacheOnExit',
  ENABLE_NOTIFICATIONS: 'enableNotifications',
  ENABLE_AUTO_UPDATE: 'enableAutoUpdate',
  ANALYTICS_ENABLED: 'analyticsEnabled',
  CRASH_REPORTING: 'crashReporting',
  PLAYER_STATE: 'player-state'
}
