import axios from 'axios'
import { API_CONFIG } from '@/config'
import type { RadioStation, RadioSearchParams, Country, Language, Tag } from '@/types/radio'

class RadioAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private currentBaseURL = API_CONFIG.baseURL
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

    let lastError: any
    const urls = [this.currentBaseURL, API_CONFIG.fallbackBaseURL]
    for (let attempt = 0; attempt < retries; attempt++) {
      const baseURL = urls[attempt % urls.length]
      try {
        const response = await this.axiosInstance.get(`${baseURL}${endpoint}`, { params })
        const data = response.data
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        if (baseURL === API_CONFIG.fallbackBaseURL) {
          this.currentBaseURL = API_CONFIG.baseURL
        }
        return data
      } catch (error) {
        lastError = error
        console.warn(`请求失败 (尝试 ${attempt+1}/${retries})`, error)
        this.currentBaseURL = attempt % 2 === 0 ? API_CONFIG.fallbackBaseURL : API_CONFIG.baseURL
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
      }
    }
    throw lastError
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

  async getRandomStations(limit: number = 30): Promise<RadioStation[]> {
    // 随机请求有时会返回空数组，增加重试并尝试不同参数
    try {
      const result = await this.requestWithRetry<RadioStation[]>(`${API_CONFIG.endpoints.random}/${limit}`)
      if (!result || result.length === 0) {
        // 如果为空，尝试获取热门作为备选
        return this.getTopStations(limit)
      }
      return result
    } catch {
      return this.getTopStations(limit) // 降级
    }
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
