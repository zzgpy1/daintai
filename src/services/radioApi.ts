import axios from 'axios'
import { API_CONFIG } from '@/config'
import type { RadioStation, RadioSearchParams, Country, Language, Tag } from '@/types/radio'

// 模拟数据（API不可用时使用）
const mockStations: RadioStation[] = [
  {
    stationuuid: 'mock-1',
    name: 'BBC Radio 1',
    url: 'http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio1_mf_p',
    url_resolved: 'http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio1_mf_p',
    homepage: 'https://www.bbc.co.uk/radio1',
    favicon: 'https://www.bbc.co.uk/favicon.ico',
    tags: 'pop, uk',
    country: 'United Kingdom',
    countrycode: 'GB',
    state: '',
    language: 'english',
    languagecodes: 'en',
    votes: 1000,
    codec: 'MP3',
    bitrate: 128,
    hls: 0,
    lastcheckok: 1,
    clickcount: 5000,
    clicktrend: 10,
    geo_lat: 51.5,
    geo_long: -0.1
  },
  {
    stationuuid: 'mock-2',
    name: 'Radio France Culture',
    url: 'https://stream.radiofrance.fr/franceculture/franceculture.m3u8',
    url_resolved: 'https://stream.radiofrance.fr/franceculture/franceculture.m3u8',
    homepage: 'https://www.franceculture.fr',
    favicon: 'https://www.franceculture.fr/favicon.ico',
    tags: 'culture, french',
    country: 'France',
    countrycode: 'FR',
    state: '',
    language: 'french',
    languagecodes: 'fr',
    votes: 800,
    codec: 'AAC',
    bitrate: 96,
    hls: 1,
    lastcheckok: 1,
    clickcount: 3000,
    clicktrend: 8,
    geo_lat: 48.8566,
    geo_long: 2.3522
  },
  {
    stationuuid: 'mock-3',
    name: 'NDR Info',
    url: 'https://www.ndr.de/resources/metadaten/audio/m3u/ndrinfo.m3u',
    url_resolved: 'https://www.ndr.de/resources/metadaten/audio/m3u/ndrinfo.m3u',
    homepage: 'https://www.ndr.de',
    favicon: 'https://www.ndr.de/favicon.ico',
    tags: 'news, german',
    country: 'Germany',
    countrycode: 'DE',
    state: '',
    language: 'german',
    languagecodes: 'de',
    votes: 600,
    codec: 'MP3',
    bitrate: 128,
    hls: 0,
    lastcheckok: 1,
    clickcount: 2000,
    clicktrend: 5,
    geo_lat: 53.55,
    geo_long: 9.99
  }
]

class RadioAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private currentBaseURL = API_CONFIG.baseURL
  private serverList = [
    'https://de1.api.radio-browser.info',
    'https://at1.api.radio-browser.info',
    'https://nl1.api.radio-browser.info',
    'https://us1.api.radio-browser.info'
  ]
  private axiosInstance = axios.create({
    timeout: API_CONFIG.timeout,
    headers: { 'User-Agent': 'GlobalRadio/2.0' }
  })

  private async requestWithRetry<T>(endpoint: string, params?: any, retries = 3): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < API_CONFIG.cacheTTL) {
      return cached.data as T
    }

    // 遍历所有服务器
    for (let attempt = 0; attempt < retries; attempt++) {
      const baseURL = this.serverList[attempt % this.serverList.length]
      try {
        const response = await this.axiosInstance.get(`${baseURL}${endpoint}`, { params })
        const data = response.data
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        this.currentBaseURL = baseURL
        return data
      } catch (error) {
        console.warn(`请求失败 (服务器 ${baseURL}):`, error)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }

    // 所有服务器失败 → 返回模拟数据
    console.warn('所有API服务器不可用，使用模拟数据')
    return this.getMockData<T>(endpoint, params)
  }

  private getMockData<T>(endpoint: string, params?: any): T {
    // 如果是搜索或列表请求，返回模拟电台列表
    if (endpoint.includes('/stations')) {
      let result = [...mockStations]
      // 模拟搜索过滤
      if (params?.name) {
        const q = params.name.toLowerCase()
        result = result.filter(s => s.name.toLowerCase().includes(q))
      }
      return result as T
    }
    // 国家/语言/标签返回空数组，避免UI错误
    if (endpoint.includes('/countries')) {
      return [{ name: 'China', iso_3166_1: 'CN', stationcount: 100 }] as T
    }
    if (endpoint.includes('/languages')) {
      return [{ name: 'Chinese', iso_639: 'zh', stationcount: 50 }] as T
    }
    if (endpoint.includes('/tags')) {
      return [{ name: 'pop', stationcount: 10 }] as T
    }
    // 默认返回空数组
    return [] as T
  }

  async searchStations(params: RadioSearchParams): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(API_CONFIG.endpoints.search, params)
  }

  async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.endpoints.top}/${limit}`)
  }

  async getLatestStations(limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.endpoints.latest}/${limit}`)
  }

  async getRandomStations(limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.endpoints.random}/${limit}`)
  }

  async getCountries(): Promise<Country[]> {
    return this.requestWithRetry<Country[]>(API_CONFIG.endpoints.countries)
  }

  async getLanguages(): Promise<Language[]> {
    return this.requestWithRetry<Language[]>(API_CONFIG.endpoints.languages)
  }

  async getTags(): Promise<Tag[]> {
    const tags = await this.requestWithRetry<Tag[]>(API_CONFIG.endpoints.tags)
    return tags.filter(t => t.stationcount > 10).slice(0, 100)
  }

  async getStationByUUID(uuid: string): Promise<RadioStation | null> {
    const stations = await this.requestWithRetry<RadioStation[]>(`/json/stations/byuuid/${uuid}`)
    return stations.length > 0 ? stations[0] : null
  }

  async recordClick(stationUuid: string): Promise<void> {
    try {
      await this.axiosInstance.get(`${API_CONFIG.baseURL}/json/url/${stationUuid}`)
    } catch {}
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const radioAPI = new RadioAPI()
