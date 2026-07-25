// src/utils/constants.ts

// 应用常量
export const APP_CONSTANTS = {
  NAME: '全球电台',
  VERSION: '2.0.0',
  REPOSITORY: 'https://github.com/your-repo/global-radio'
}

// API常量
export const API_CONSTANTS = {
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  CACHE_TTL: 5 * 60 * 1000, // 5分钟
  MAX_CACHE_SIZE: 100
}

// 播放器常量
export const PLAYER_CONSTANTS = {
  DEFAULT_VOLUME: 0.8,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  DEFAULT_PLAYBACK_RATE: 1.0,
  MIN_PLAYBACK_RATE: 0.5,
  MAX_PLAYBACK_RATE: 2.0
}

// 睡眠定时器选项
export const SLEEP_TIMER_OPTIONS = [15, 30, 45, 60, 90, 120]

// 语言列表（仅 zh 和 en）
export const SUPPORTED_LANGUAGES = [
  { code: 'zh', name: '中文', nativeName: '中文' },
  { code: 'en', name: 'English', nativeName: 'English' }
] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code']

// 主题模式
export const THEME_MODES = ['light', 'dark', 'system'] as const

// 快速筛选
export const QUICK_FILTERS = [
  { key: 'music', label: '音乐' },
  { key: 'news', label: '新闻' },
  { key: 'talk', label: '谈话' },
  { key: 'sport', label: '体育' }
]

// 热门搜索
export const POPULAR_SEARCHES = ['BBC', 'NPR', '中国之声', 'Music', 'News', 'Radio']
