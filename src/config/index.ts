export const API_CONFIG = {
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
  cacheTTL: 300000
}

export const APP_CONFIG = {
  name: '全球电台',
  version: '2.0.0',
  maxHistoryItems: 500,
  sleepTimerOptions: [15, 30, 45, 60, 90, 120],
  defaultVolume: 0.8
}
