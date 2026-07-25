import axios, { AxiosInstance, AxiosError } from 'axios'
import { API_CONFIG } from '@/config/api.config'
import type { 
  RadioStation, 
  RadioSearchParams, 
  Country, 
  Language, 
  Tag 
} from '@/types/radio'

// ============================================
// 重试配置
// ============================================
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffFactor: 2
}

class RadioAPI {
  private instance: AxiosInstance
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = API_CONFIG.radioBrowser.cacheTTL
  private currentProvider = API_CONFIG.radioBrowser.baseURL
  private isInitialized = false
  private initPromise: Promise<void> | null = null
  private isRetrying = false

  constructor() {
    this.instance = this.createInstance(this.currentProvider)
    this.initPromise = this.initialize()
  }

  // ============================================
  // 创建axios实例
  // ============================================
  private createInstance(baseURL: string): AxiosInstance {
    const instance = axios.create({
      baseURL,
      timeout: API_CONFIG.radioBrowser.timeout,
      headers: {
        'User-Agent': 'GlobalRadio/2.0',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate'
      }
    })

    // 请求拦截器
    instance.interceptors.request.use(
      (config) => {
        // 添加请求时间戳防止缓存
        config.params = {
          ...config.params,
          _t: Date.now()
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // 网络错误重试
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
          return this.handleRetry(error.config)
        }
        return Promise.reject(error)
      }
    )

    return instance
  }

  // ============================================
  // 重试逻辑
  // ============================================
  private async handleRetry(config: any): Promise<any> {
    if (!config || this.isRetrying) return Promise.reject(new Error('Network error'))
    
    this.isRetrying = true
    const retryCount = config.__retryCount || 0
    
    if (retryCount >= RETRY_CONFIG.maxRetries) {
      this.isRetrying = false
      return Promise.reject(new Error(`Max retries (${RETRY_CONFIG.maxRetries}) exceeded`))
    }
    
    config.__retryCount = retryCount + 1
    
    const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffFactor, retryCount)
    await new Promise(resolve => setTimeout(resolve, delay))
    
    this.isRetrying = false
    return this.instance.request(config)
  }

  // ============================================
  // 初始化API
  // ============================================
  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      const connected = await this.testConnection(this.currentProvider)
      if (connected) {
        this.isInitialized = true
        console.log('✅ Radio API 初始化成功')
        return
      }
      
      console.warn('⚠️ 主API不可用，尝试备用...')
      await this.tryFallbackProviders()
    } catch (error) {
      console.error('❌ API初始化失败:', error)
      this.isInitialized = true // 标记为已初始化避免无限重试
    }
  }

  private async testConnection(baseURL: string): Promise<boolean> {
    try {
      const testInstance = this.createInstance(baseURL)
      await testInstance.get('/json/stats', { timeout: 5000 })
      return true
    } catch {
      return false
    }
  }

  private async tryFallbackProviders(): Promise<void> {
    for (const provider of API_CONFIG.fallbackProviders) {
      try {
        const connected = await this.testConnection(provider)
        if (connected) {
          this.currentProvider = provider
          this.instance = this.createInstance(provider)
          console.log(`✅ 切换至备用API: ${provider}`)
          this.isInitialized = true
          return
        }
      } catch {
        continue
      }
    }
    console.error('❌ 所有API提供商均不可用')
  }

  // ============================================
  // 缓存管理
  // ============================================
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
    
    // LRU缓存清理
    if (this.cache.size > API_CONFIG.cacheMaxSize) {
      const keys = Array.from(this.cache.keys())
      const toRemove = keys.slice(0, Math.floor(keys.length * 0.2))
      toRemove.forEach(k => this.cache.delete(k))
    }
  }

  // ============================================
  // API方法
  // ============================================
  async searchStations(params: RadioSearchParams): Promise<RadioStation[]> {
    await this.initPromise
    
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
      // 返回空数组而不是抛出异常
      return []
    }
  }

  async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    await this.initPromise
    
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

  async getLatestStations(limit: number = 50): Promise<RadioStation[]> {
    await this.initPromise
    
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

  async getRandomStations(limit: number = 50): Promise<RadioStation[]> {
    await this.initPromise
    
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

  async getStationsByCountry(countryCode: string, limit: number = 50): Promise<RadioStation[]> {
    await this.initPromise
    
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

  async getStationsByTag(tag: string, limit: number = 50): Promise<RadioStation[]> {
    await this.initPromise
    
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

  async getCountries(): Promise<Country[]> {
    await this.initPromise
    
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

  async getLanguages(): Promise<Language[]> {
    await this.initPromise
    
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

  async getTags(): Promise<Tag[]> {
    await this.initPromise
    
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

  async getStationByUUID(uuid: string): Promise<RadioStation | null> {
    await this.initPromise
    
    try {
      const response = await this.instance.get(`/json/stations/byuuid/${uuid}`)
      return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      console.error('获取电台详情失败:', error)
      return null
    }
  }

  async recordClick(stationUuid: string): Promise<void> {
    try {
      await this.instance.get(`/json/url/${stationUuid}`)
    } catch (error) {
      // 静默失败，不影响主流程
    }
  }

  async voteForStation(stationUuid: string): Promise<boolean> {
    try {
      const response = await this.instance.get(`/json/vote/${stationUuid}`)
      return response.data.ok === 'true'
    } catch {
      return false
    }
  }

  async getAPIStatus(): Promise<any> {
    await this.initPromise
    
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

  clearCache(): void {
    this.cache.clear()
  }

  // 等待初始化完成
  async waitForInit(): Promise<void> {
    await this.initPromise
  }
}

// 导出单例
export const radioAPI = new RadioAPI()
