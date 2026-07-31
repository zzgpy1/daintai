import axios, { AxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config'
import type { RadioStation, RadioSearchParams, Country, Language, Tag } from '@/types/radio'

class RadioAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private apiMirrors = [
    'https://de1.api.radio-browser.info',
    'https://at1.api.radio-browser.info',
    'https://nl1.api.radio-browser.info',
    'https://fr1.api.radio-browser.info',
    'https://us1.api.radio-browser.info'
  ]
  private currentMirrorIndex = 0
  private CACHE_TTL = 600000 // 10 分钟
  private axiosInstance = axios.create({
    timeout: 15000,
    headers: { 'User-Agent': '国内电台/2.0' }
  })
  private abortControllers: AbortController[] = []

  private getCurrentBaseURL(): string {
    return this.apiMirrors[this.currentMirrorIndex % this.apiMirrors.length]
  }

  private switchToNextMirror() {
    this.currentMirrorIndex = (this.currentMirrorIndex + 1) % this.apiMirrors.length
    console.log(`切换 API 镜像: ${this.getCurrentBaseURL()}`)
  }

  private async requestWithRetry<T>(
    endpoint: string,
    params?: any,
    retries = 3,
    signal?: AbortSignal
  ): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T
    }

    let lastError: any
    for (let attempt = 0; attempt < retries; attempt++) {
      const baseURL = this.getCurrentBaseURL()
      try {
        const config: AxiosRequestConfig = { params, signal }
        const response = await this.axiosInstance.get(`${baseURL}${endpoint}`, config)
        const data = response.data
        if (endpoint === API_CONFIG.endpoints.random && (!data || data.length === 0)) {
          throw new Error('Empty random response')
        }
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      } catch (error) {
        lastError = error
        console.warn(`请求失败 (尝试 ${attempt+1}/${retries})，端点: ${endpoint}`, error)
        this.switchToNextMirror()
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
      }
    }
    throw lastError
  }

  cancelAllRequests() {
    this.abortControllers.forEach(ctrl => ctrl.abort())
    this.abortControllers = []
  }

  async searchStations(params: RadioSearchParams, signal?: AbortSignal): Promise<RadioStation[]> {
    const controller = new AbortController()
    if (signal) {
      signal.addEventListener('abort', () => controller.abort())
    }
    this.abortControllers.push(controller)
    try {
      return await this.requestWithRetry<RadioStation[]>(API_CONFIG.endpoints.search, params, 3, controller.signal)
    } finally {
      const idx = this.abortControllers.indexOf(controller)
      if (idx !== -1) this.abortControllers.splice(idx, 1)
    }
  }

  // 不再使用原 top/latest 接口，改用 search 带排序，此方法保留但内部改用 search
  async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    // 直接调用 search 带 order=clickcount
    return this.searchStations({ order: 'clickcount', limit, reverse: true, hidebroken: true })
  }

  async getLatestStations(limit: number = 50): Promise<RadioStation[]> {
    // 使用 search 并尝试按 name 排序（因为没有 lastchange 排序）
    return this.searchStations({ order: 'name', limit, hidebroken: true })
  }

  async getRandomStations(limit: number = 30): Promise<RadioStation[]> {
    try {
      const result = await this.requestWithRetry<RadioStation[]>(`${API_CONFIG.endpoints.random}/${limit}`, undefined, 2)
      if (!result || result.length === 0) {
        return this.getTopStations(limit)
      }
      return result
    } catch {
      return this.getTopStations(limit)
    }
  }

  async getStationsByCountry(countryCode: string, limit: number = 50): Promise<RadioStation[]> {
    try {
      return await this.requestWithRetry<RadioStation[]>(
        `${API_CONFIG.endpoints.byCountry}/${countryCode}`,
        { limit },
        2
      )
    } catch {
      console.warn(`getStationsByCountry 失败，降级到 search`)
      return this.searchStations({ countrycode: countryCode, limit, hidebroken: true })
    }
  }

  async getStationsByTag(tag: string, limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.endpoints.byTag}/${tag}`, { limit })
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
      await this.axiosInstance.get(`${this.getCurrentBaseURL()}/json/url/${stationUuid}`)
    } catch {}
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const radioAPI = new RadioAPI()
