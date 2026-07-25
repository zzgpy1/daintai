// API配置
export const API_CONFIG = {
  radioBrowser: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://de1.api.radio-browser.info',
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
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    cacheTTL: parseInt(import.meta.env.VITE_CACHE_TTL || '300000')
  },
  fallbackProviders: [
    import.meta.env.VITE_FALLBACK_API_1 || 'https://us1.api.radio-browser.info',
    import.meta.env.VITE_FALLBACK_API_2 || 'https://nl1.api.radio-browser.info',
    import.meta.env.VITE_FALLBACK_API_3 || 'https://fr1.api.radio-browser.info'
  ]
}

// 应用配置
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || '全球电台',
  version: import.meta.env.VITE_APP_VERSION || '2.0.0',
  maxHistoryItems: 1000,
  maxFavorites: 500,
  sleepTimerOptions: [15, 30, 45, 60, 90, 120],
  defaultVolume: 0.8,
  debounceDelay: 300,
  infiniteScrollThreshold: 200
}
