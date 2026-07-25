// API配置
export const API_CONFIG = {
  // Radio Browser API (公共免费)
  radioBrowser: {
    baseURL: 'https://de1.api.radio-browser.info',
    endpoints: {
      search: '/json/stations/search',
      top: '/json/stations/topvote',
      latest: '/json/stations/lastchange',
      random: '/json/stations/random',
      byCountry: '/json/stations/bycountrycodeexact',
      byTag: '/json/stations/bytag',
      countries: '/json/countries',
      languages: '/json/languages',
      tags: '/json/tags',
      stats: '/json/stats'
    },
    timeout: 10000,
    cacheTTL: 5 * 60 * 1000 // 5分钟
  },
  
  // 备用API提供商
  fallbackProviders: [
    'https://us1.api.radio-browser.info',
    'https://nl1.api.radio-browser.info',
    'https://fr1.api.radio-browser.info'
  ]
}

// 应用配置
export const APP_CONFIG = {
  name: '全球电台',
  version: '2.0.0',
  maxHistoryItems: 1000,
  maxFavorites: 500,
  sleepTimerOptions: [15, 30, 45, 60, 90, 120],
  defaultVolume: 0.8,
  debounceDelay: 300,
  infiniteScrollThreshold: 200
}
