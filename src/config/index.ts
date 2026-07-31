import pkg from '@/../package.json'

export const API_CONFIG = {
  baseURL: 'https://de1.api.radio-browser.info',
  fallbackBaseURL: 'https://at1.api.radio-browser.info',
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
  timeout: 30000,
  cacheTTL: 300000
}

export const APP_CONFIG = {
  name: '国内电台',
  version: pkg.version, // 从 package.json 动态获取
  maxHistoryItems: 500,
  sleepTimerOptions: [15, 30, 45, 60, 90, 120],
  defaultVolume: 0.8,
  maxFavorites: 1000,
  cacheTTL: 600000, // 10 分钟
  debounceDelay: 300
}
