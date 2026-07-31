import axios, { AxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config'
import type { RadioStation, RadioSearchParams, Country, Language, Tag } from '@/types/radio'

class RadioAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()
  // 使用多个镜像地址，按优先级排列
  private apiMirrors = [
    'https://de1.api.radio-browser.info',
    'https://at1.api.radio-browser.info',
    'https://nl1.api.radio-browser.info',
    'https://fr1.api.radio-browser.info',
    'https://us1.api.radio-browser.info'
  ]
  private currentMirrorIndex = 0
  private axiosInstance = axios.create({
    timeout: 30000, // 增加超时到30秒
    headers: { 'User-Agent': 'GlobalRadio/2.0' }
  })
  private abortControllers: AbortController[] = []

  private getCurrentBaseURL(): string {
    return this.apiMirrors[this.currentMirrorIndex % this.apiMirrors.length]
  }

  private switchToNextMirror() {
    this.currentMirrorIndex = (this.currentMirrorIndex + 1) % this.apiMirrors.length
    console.log(`Switching API mirror to: ${this.getCurrentBaseURL()}`)
  }

  private async requestWithRetry<T>(
    endpoint: string,
    params?: any,
    retries = 4,
    signal?: AbortSignal
  ): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < API_CONFIG.cacheTTL) {
      return cached.data as T
    }

    let lastError: any
    for (let attempt = 0; attempt < retries; attempt++) {
      const baseURL = this.getCurrentBaseURL()
      try {
        const config: AxiosRequestConfig = { params, signal }
        const response = await this.axiosInstance.get(`${baseURL}${endpoint}`, config)
        const data = response.data
        // 如果数据为空且是随机请求，则抛出错误以便重试
        if (endpoint === API_CONFIG.endpoints.random && (!data || data.length === 0)) {
          throw new Error('Empty random response')
        }
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      } catch (error) {
        lastError = error
        console.warn(`请求失败 (尝试 ${attempt+1}/${retries})，端点: ${endpoint}`, error)
        // 切换镜像
        this.switchToNextMirror()
        // 等待一段时间再重试（指数退避）
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
      return await this.requestWithRetry<RadioStation[]>(API_CONFIG.endpoints.search, params, 4, controller.signal)
    } finally {
      const idx = this.abortControllers.indexOf(controller)
      if (idx !== -1) this.abortControllers.splice(idx, 1)
    }
  }

  async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.endpoints.top}/${limit}`)
  }

  async getLatestStations(limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.endpoints.latest}/${limit}`)
  }

  async getRandomStations(limit: number = 30): Promise<RadioStation[]> {
    try {
      const result = await this.requestWithRetry<RadioStation[]>(`${API_CONFIG.endpoints.random}/${limit}`)
      if (!result || result.length === 0) {
        return this.getTopStations(limit)
      }
      return result
    } catch {
      return this.getTopStations(limit)
    }
  }

  // 增加 getStationsByCountry 使用 searchStations 作为备选
  async getStationsByCountry(countryCode: string, limit: number = 50): Promise<RadioStation[]> {
    try {
      return await this.requestWithRetry<RadioStation[]>(
        `${API_CONFIG.endpoints.byCountry}/${countryCode}`,
        { limit }
      )
    } catch (error) {
      console.warn(`getStationsByCountry failed for ${countryCode}, falling back to search`, error)
      // 降级使用 searchStations
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
