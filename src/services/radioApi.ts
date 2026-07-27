import axios from 'axios'
import { API_CONFIG } from '@/config'
import type { RadioStation, RadioSearchParams, Country, Language, Tag } from '@/types/radio'

// 创建 axios 实例，增加超时和重试
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 15000, // 15秒超时
  headers: { 'User-Agent': 'GlobalRadio/2.0' }
})

// 简单重试机制（最多2次）
apiClient.interceptors.response.use(undefined, async (error) => {
  const config = error.config
  if (!config || !config.retry) {
    config.retry = 0
  }
  if (config.retry >= 2) {
    return Promise.reject(error)
  }
  config.retry += 1
  // 延迟 1 秒重试
  await new Promise(resolve => setTimeout(resolve, 1000))
  return apiClient(config)
})

class RadioAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()

  private async request<T>(endpoint: string, params?: any): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < API_CONFIG.cacheTTL) {
      return cached.data as T
    }

    try {
      const response = await apiClient.get(endpoint, { params })
      const data = response.data
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
    }
  }

  // ... 其他方法保持不变
  async searchStations(params: RadioSearchParams): Promise<RadioStation[]> {
    return this.request<RadioStation[]>(API_CONFIG.endpoints.search, params)
  }

  async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    return this.request<RadioStation[]>(`${API_CONFIG.endpoints.top}/${limit}`)
  }

  async getLatestStations(limit: number = 50): Promise<RadioStation[]> {
    return this.request<RadioStation[]>(`${API_CONFIG.endpoints.latest}/${limit}`)
  }

  async getRandomStations(limit: number = 50): Promise<RadioStation[]> {
    return this.request<RadioStation[]>(`${API_CONFIG.endpoints.random}/${limit}`)
  }

  async getStationsByCountry(countryCode: string, limit: number = 50): Promise<RadioStation[]> {
    return this.request<RadioStation[]>(`${API_CONFIG.endpoints.byCountry}/${countryCode}`, { limit })
  }

  async getStationsByTag(tag: string, limit: number = 50): Promise<RadioStation[]> {
    return this.request<RadioStation[]>(`${API_CONFIG.endpoints.byTag}/${tag}`, { limit })
  }

  async getCountries(): Promise<Country[]> {
    return this.request<Country[]>(API_CONFIG.endpoints.countries)
  }

  async getLanguages(): Promise<Language[]> {
    return this.request<Language[]>(API_CONFIG.endpoints.languages)
  }

  async getTags(): Promise<Tag[]> {
    const tags = await this.request<Tag[]>(API_CONFIG.endpoints.tags)
    return tags.filter(t => t.stationcount > 10).slice(0, 100)
  }

  async getStationByUUID(uuid: string): Promise<RadioStation | null> {
    const stations = await this.request<RadioStation[]>(`/json/stations/byuuid/${uuid}`)
    return stations.length > 0 ? stations[0] : null
  }

  async recordClick(stationUuid: string): Promise<void> {
    try {
      await apiClient.get(`/json/url/${stationUuid}`)
    } catch {
      // 静默失败
    }
  }

  async getAPIStatus(): Promise<any> {
    try {
      const data = await this.request<any>(API_CONFIG.endpoints.stats)
      return { ...data, available: true }
    } catch {
      return { available: false }
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const radioAPI = new RadioAPI()
