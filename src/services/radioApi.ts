import axios, { AxiosInstance, AxiosError } from 'axios'
import { API_CONFIG } from '@/config/api.config'
import type { 
  RadioStation, 
  RadioSearchParams, 
  ApiResponse, 
  Country, 
  Language, 
  Tag 
} from '@/types/radio'

class RadioAPI {
  private instance: AxiosInstance
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = API_CONFIG.radioBrowser.cacheTTL
  private currentProvider = API_CONFIG.radioBrowser.baseURL
  private isInitialized = false

  constructor() {
    this.instance = axios.create({
      baseURL: this.currentProvider,
      timeout: API_CONFIG.radioBrowser.timeout,
      headers: {
        'User-Agent': 'GlobalRadio/2.0',
        'Accept': 'application/json'
      }
    })
    this.initialize()
  }

  private async initialize() {
    try {
      await this.testConnection()
      this.isInitialized = true
      console.log('✅ Radio API 初始化成功')
    } catch (error) {
      console.warn('⚠️ 主API不可用，尝试备用...')
      await this.tryFallbackProviders()
    }
  }

  private async testConnection(): Promise<boolean> {
    try {
      await this.instance.get('/json/stats')
      return true
    } catch {
      return false
    }
  }

  private async tryFallbackProviders() {
    for (const provider of API_CONFIG.fallbackProviders) {
      try {
        const testInstance = axios.create({
          baseURL: provider,
          timeout: 5000
        })
        await testInstance.get('/json/stats')
        this.currentProvider = provider
        this.instance = axios.create({
          baseURL: provider,
          timeout: API_CONFIG.radioBrowser.timeout,
          headers: {
            'User-Agent': 'GlobalRadio/2.0'
          }
        })
        console.log(`✅ 切换至备用API: ${provider}`)
        this.isInitialized = true
        return
      } catch {
        continue
      }
    }
    console.error('❌ 所有API提供商均不可用')
  }

  private getCacheKey(params: any): string {
    return JSON.stringify(params)
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
    // 缓存限制
    if (this.cache.size > 100) {
      const keys = Array.from(this.cache.keys())
      const toRemove = keys.slice(0, 20)
      toRemove.forEach(k => this.cache.delete(k))
    }
  }

  // 搜索电台
  async searchStations(params: RadioSearchParams): Promise<RadioStation[]> {
    const cacheKey = this.getCacheKey({ ...params, action: 'search' })
    const cached = this.getFromCache<RadioStation[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await this.instance.get(API_CONFIG.radioBrowser.endpoints.search, { params })
      const data = response.data || []
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('搜索电台失败:', error)
      return []
    }
  }

  // 获取热门电台
  async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    const cacheKey = `top_${limit}`
    const cached = this.getFromCache<RadioStation[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await this.instance.get(
        `${API_CONFIG.radioBrowser.endpoints.top}/${limit}`
      )
      const data = response.data || []
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('获取热门电台失败:', error)
      return []
    }
  }

  // 获取最新电台
  async getLatestStations(limit: number = 50): Promise<RadioStation[]> {
    const cacheKey = `latest_${limit}`
    const cached = this.getFromCache<RadioStation[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await this.instance.get(
        `${API_CONFIG.radioBrowser.endpoints.latest}/${limit}`
      )
      const data = response.data || []
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('获取最新电台失败:', error)
      return []
    }
  }

  // 获取随机电台
  async getRandomStations(limit: number = 50): Promise<RadioStation[]> {
    const cacheKey = `random_${limit}`
    const cached = this.getFromCache<RadioStation[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await this.instance.get(
        `${API_CONFIG.radioBrowser.endpoints.random}/${limit}`
      )
      const data = response.data || []
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('获取随机电台失败:', error)
      return []
    }
  }

  // 按国家获取电台
  async getStationsByCountry(countryCode: string, limit: number = 50): Promise<RadioStation[]> {
    try {
      const response = await this.instance.get(
        `${API_CONFIG.radioBrowser.endpoints.byCountry}/${countryCode}`,
        { params: { limit } }
      )
      return response.data || []
    } catch (error) {
      console.error('按国家获取电台失败:', error)
      return []
    }
  }

  // 按标签获取电台
  async getStationsByTag(tag: string, limit: number = 50): Promise<RadioStation[]> {
    try {
      const response = await this.instance.get(
        `${API_CONFIG.radioBrowser.endpoints.byTag}/${tag}`,
        { params: { limit } }
      )
      return response.data || []
    } catch (error) {
      console.error('按标签获取电台失败:', error)
      return []
    }
  }

  // 获取国家列表
  async getCountries(): Promise<Country[]> {
    const cacheKey = 'countries'
    const cached = this.getFromCache<Country[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await this.instance.get(API_CONFIG.radioBrowser.endpoints.countries)
      const data = response.data || []
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('获取国家列表失败:', error)
      return []
    }
  }

  // 获取语言列表
  async getLanguages(): Promise<Language[]> {
    const cacheKey = 'languages'
    const cached = this.getFromCache<Language[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await this.instance.get(API_CONFIG.radioBrowser.endpoints.languages)
      const data = response.data || []
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('获取语言列表失败:', error)
      return []
    }
  }

  // 获取标签列表
  async getTags(): Promise<Tag[]> {
    const cacheKey = 'tags'
    const cached = this.getFromCache<Tag[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await this.instance.get(API_CONFIG.radioBrowser.endpoints.tags)
      const data = (response.data || [])
        .filter((tag: Tag) => tag.stationcount > 10)
        .slice(0, 100)
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.error('获取标签列表失败:', error)
      return []
    }
  }

  // 根据UUID获取单个电台
  async getStationByUUID(uuid: string): Promise<RadioStation | null> {
    try {
      const response = await this.instance.get(`/json/stations/byuuid/${uuid}`)
      return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      console.error('获取电台详情失败:', error)
      return null
    }
  }

  // 记录点击
  async recordClick(stationUuid: string): Promise<void> {
    try {
      await this.instance.get(`/json/url/${stationUuid}`)
    } catch (error) {
      // 静默失败
    }
  }

  // 投票
  async voteForStation(stationUuid: string): Promise<boolean> {
    try {
      const response = await this.instance.get(`/json/vote/${stationUuid}`)
      return response.data.ok === 'true'
    } catch (error) {
      return false
    }
  }

  // 获取API状态
  async getAPIStatus(): Promise<any> {
    try {
      const response = await this.instance.get(API_CONFIG.radioBrowser.endpoints.stats)
      return {
        ...response.data,
        provider: this.currentProvider,
        available: true
      }
    } catch {
      return {
        available: false,
        provider: this.currentProvider
      }
    }
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear()
  }
}

export const radioAPI = new RadioAPI()
