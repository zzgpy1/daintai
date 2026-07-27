import axios from 'axios'
import { API_CONFIG } from '@/config'
import type { RadioStation, RadioSearchParams, Country, Language, Tag } from '@/types/radio'

class RadioAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private axiosInstance = axios.create({
    timeout: API_CONFIG.timeout || 15000,
    headers: { 'User-Agent': 'GlobalRadio/2.0' }
  })

  // 带重试的请求
  private async requestWithRetry<T>(url: string, params?: any, retries = 2): Promise<T> {
    const cacheKey = `${url}:${JSON.stringify(params)}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < API_CONFIG.cacheTTL) {
      return cached.data as T
    }

    let lastError: any
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await this.axiosInstance.get(url, { params })
        const data = response.data
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      } catch (error) {
        lastError = error
        console.warn(`请求失败 (尝试 ${i+1}/${retries+1}):`, error)
        if (i < retries) {
          // 等待指数退避
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
      }
    }
    throw lastError
  }

  async searchStations(params: RadioSearchParams): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.search}`, params)
  }

  async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.top}/${limit}`)
  }

  async getLatestStations(limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.latest}/${limit}`)
  }

  async getRandomStations(limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.random}/${limit}`)
  }

  async getStationsByCountry(countryCode: string, limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.byCountry}/${countryCode}`, { limit })
  }

  async getStationsByTag(tag: string, limit: number = 50): Promise<RadioStation[]> {
    return this.requestWithRetry<RadioStation[]>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.byTag}/${tag}`, { limit })
  }

  async getCountries(): Promise<Country[]> {
    return this.requestWithRetry<Country[]>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.countries}`)
  }

  async getLanguages(): Promise<Language[]> {
    return this.requestWithRetry<Language[]>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.languages}`)
  }

  async getTags(): Promise<Tag[]> {
    const tags = await this.requestWithRetry<Tag[]>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.tags}`)
    return tags.filter(t => t.stationcount > 10).slice(0, 100)
  }

  async getStationByUUID(uuid: string): Promise<RadioStation | null> {
    const stations = await this.requestWithRetry<RadioStation[]>(`${API_CONFIG.baseURL}/json/stations/byuuid/${uuid}`)
    return stations.length > 0 ? stations[0] : null
  }

  async recordClick(stationUuid: string): Promise<void> {
    try {
      await this.axiosInstance.get(`${API_CONFIG.baseURL}/json/url/${stationUuid}`)
    } catch {
      // 静默失败
    }
  }

  async getAPIStatus(): Promise<any> {
    try {
      const data = await this.requestWithRetry<any>(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.stats}`)
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
