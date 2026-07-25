// src/config/app.config.ts
export const APP_CONFIG = {
  name: '全球电台',
  version: '2.0.0',
  description: '聆听全球高品质电台，享受无限音乐、新闻和娱乐内容',
  author: 'GlobalRadio Team',
  license: 'MIT',
  repository: 'https://github.com/your-repo/global-radio',
  
  // 功能配置
  features: {
    enablePWA: true,
    enableElectron: true,
    enableCapacitor: true,
    enableAnalytics: false,
    enableCrashReporting: false
  },
  
  // 限制配置
  limits: {
    maxHistoryItems: 1000,
    maxFavorites: 500,
    maxSearchResults: 100,
    maxRecentStations: 20
  },
  
  // 默认值
  defaults: {
    volume: 0.8,
    language: 'zh',
    theme: 'system',
    autoPlayNext: true,
    playbackRate: 1.0
  }
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'zh', name: '中文', nativeName: '中文' },
  { code: 'en', name: 'English', nativeName: 'English' }
] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code']
