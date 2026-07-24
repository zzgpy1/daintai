import axios, { AxiosInstance } from 'axios'
import type { RadioStation, RadioSearchParams, ApiResponse, Country, Language, Tag } from '../types/radio'

// API provider interface
interface APIProvider {
  name: string
  baseURL: string
  type: 'radio-browser'
  isAvailable: boolean
  priority: number
}

type CacheOptions = {
  bypassCache?: boolean
}

class RadioAPI {
  private apiProviders: APIProvider[] = [
    { name: 'Radio Browser US1', baseURL: 'https://us1.api.radio-browser.info', type: 'radio-browser', isAvailable: true, priority: 1 },
    { name: 'Radio Browser DE1', baseURL: 'https://de1.api.radio-browser.info', type: 'radio-browser', isAvailable: true, priority: 1 },
    { name: 'Radio Browser NL1', baseURL: 'https://nl1.api.radio-browser.info', type: 'radio-browser', isAvailable: true, priority: 1 },
    { name: 'Radio Browser FR1', baseURL: 'https://fr1.api.radio-browser.info', type: 'radio-browser', isAvailable: true, priority: 1 }
  ]
  
  private userAgent = 'RadioApp/1.0'
  private currentAPI: AxiosInstance
  private currentProvider: APIProvider
  private initializationPromise: Promise<void> | null = null
  private isInitialized = false
  private debugEnabled = !!(import.meta as any).env?.DEV
  private cacheTtlMs = 5 * 60 * 1000
  private cache = {
    topStations: new Map<string, { timestamp: number; data: ApiResponse<RadioStation[]> }>(),
    latestStations: new Map<string, { timestamp: number; data: RadioStation[] }>(),
    stationSearch: new Map<string, { timestamp: number; data: RadioStation[] }>()
  }

  constructor() {
    this.currentProvider = this.apiProviders[0]
    this.currentAPI = this.createAPIInstance(this.currentProvider)
    this.initializationPromise = this.initializeAPI()
  }

  private stableSerialize(value: unknown): string {
    if (value === null || value === undefined) return String(value)
    if (Array.isArray(value)) return `[${value.map(v => this.stableSerialize(v)).join(',')}]`
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
      return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${this.stableSerialize(v)}`).join(',')}}`
    }
    return JSON.stringify(value)
  }

  private getFromCache<T>(map: Map<string, { timestamp: number; data: T }>, key: string): T | null {
    const cached = map.get(key)
    if (!cached) return null
    if (Date.now() - cached.timestamp > this.cacheTtlMs) {
      map.delete(key)
      return null
    }
    return cached.data
  }

  private setCache<T>(map: Map<string, { timestamp: number; data: T }>, key: string, data: T): void {
    map.set(key, { timestamp: Date.now(), data })
    if (map.size > 80) {
      map.clear()
    }
  }

  private createAPIInstance(provider: APIProvider, timeoutMs: number = 10000): AxiosInstance {
    return axios.create({
      baseURL: provider.baseURL,
      timeout: timeoutMs,
      headers: {
        'User-Agent': this.userAgent
      }
    })
  }

  private async initializeAPI(): Promise<void> {
    if (this.isInitialized) {
      return
    }
    try {
      if (this.debugEnabled) console.log('Initializing API providers...')
      const workingProvider = await this.findWorkingAPI()
      if (workingProvider) {
        this.currentProvider = workingProvider
        this.currentAPI = this.createAPIInstance(workingProvider)
        if (this.debugEnabled) console.log(`Successfully initialized API: ${workingProvider.name}`)
      } else {
        console.warn('No working API found, using default provider')
      }
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize API:', error)
      this.isInitialized = true
    }
  }

  private async findWorkingAPI(): Promise<APIProvider | null> {
    const sortedProviders = [...this.apiProviders].sort((a, b) => a.priority - b.priority)
    return await new Promise<APIProvider | null>((resolve) => {
      let resolved = false
      let remaining = sortedProviders.length
      const maybeResolveNull = () => {
        remaining -= 1
        if (!resolved && remaining <= 0) {
          resolve(null)
        }
      }
      for (const provider of sortedProviders) {
        const instance = this.createAPIInstance(provider, 2500)
        const testPromise = instance.get('/json/stations/topvote/1')
        testPromise
          .then(() => {
            provider.isAvailable = true
            if (!resolved) {
              resolved = true
              if (this.debugEnabled) console.log(`Successfully connected to: ${provider.name}`)
              resolve(provider)
            }
          })
          .catch((error: any) => {
            provider.isAvailable = false
            if (this.debugEnabled) console.log(`Failed to connect to ${provider.name}:`, error.message)
            maybeResolveNull()
          })
      }
    })
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise
      this.initializationPromise = null
    }
  }

  async waitForInitialization(): Promise<void> {
    await this.ensureInitialized()
  }

  isAPIInitialized(): boolean {
    return this.isInitialized && !this.initializationPromise
  }

  private async retryWithFallback<T>(operation: () => Promise<T>, fallbackOperation?: () => T): Promise<T> {
    await this.ensureInitialized()
    try {
      return await operation()
    } catch (error) {
      console.warn(`API request failed on ${this.currentProvider.name}, trying fallback providers...`)
      const availableProviders = this.apiProviders
        .filter(p => p.isAvailable && p !== this.currentProvider)
        .sort((a, b) => a.priority - b.priority)
      for (const provider of availableProviders) {
        try {
          if (this.debugEnabled) console.log(`Trying fallback provider: ${provider.name}`)
          this.currentProvider = provider
          this.currentAPI = this.createAPIInstance(provider)
          return await operation()
        } catch (fallbackError) {
          if (this.debugEnabled) console.log(`Fallback ${provider.name} also failed`)
          provider.isAvailable = false
        }
      }
      if (fallbackOperation) {
        console.warn('All API providers failed, using fallback operation')
        return fallbackOperation()
      }
      throw error
    }
  }

  // 搜索电台 - 支持中文优化
  async searchStations(params: RadioSearchParams = {}): Promise<RadioStation[]> {
    return this.retryWithFallback(async () => {
      const searchParams: any = {}
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          let processedValue = value.toString().trim()
          const hasChinese = /[\u4e00-\u9fff]/.test(processedValue)
          if (hasChinese) {
            processedValue = processedValue.normalize('NFC')
          }
          searchParams[key] = processedValue
        }
      })

      // 如果搜索中文，增加 tag 联合搜索
      if (searchParams.name && /[\u4e00-\u9fff]/.test(searchParams.name)) {
        const [nameResults, tagResults] = await Promise.all([
          this.currentAPI.get('/json/stations/search', { 
            params: { ...searchParams, limit: searchParams.limit || 50, hidebroken: true },
            headers: { 'User-Agent': this.userAgent }
          }),
          this.currentAPI.get('/json/stations/search', {
            params: { tag: searchParams.name, order: 'random', limit: Math.ceil((searchParams.limit || 50) / 2), hidebroken: true },
            headers: { 'User-Agent': this.userAgent }
          })
        ])

        const merged = new Map()
        ;[...nameResults.data, ...tagResults.data].forEach((station: RadioStation) => {
          if (!merged.has(station.stationuuid)) {
            merged.set(station.stationuuid, station)
          }
        })
        
        return Array.from(merged.values()).slice(0, searchParams.limit || 50)
      }

      const response = await this.currentAPI.get('/json/stations/search', {
        params: searchParams,
        headers: {
          'Accept-Charset': 'UTF-8',
          'Content-Type': 'application/json; charset=UTF-8',
          'User-Agent': this.userAgent
        }
      })
      
      return response.data || []
    })
  }

  // 获取热门电台
  async getTopStations(limit: number = 50, userLanguage?: string, options: CacheOptions = {}): Promise<ApiResponse<RadioStation[]>> {
    return this.retryWithFallback(async () => {
      const cacheKey = `${limit}:${userLanguage || ''}`
      if (!options.bypassCache) {
        const cached = this.getFromCache(this.cache.topStations, cacheKey)
        if (cached) {
          return cached
        }
      }

      if (this.debugEnabled) console.log(`Getting top stations (limit: ${limit})`)
      
      const stations = await this.searchStations({
        tag: 'music',
        order: 'clickcount',
        reverse: true,
        limit: limit,
        hidebroken: true
      })
      
      const shuffled = stations.sort(() => 0.5 - Math.random())
      const result = {
        success: true,
        data: shuffled.slice(0, limit),
        source: 'radio-browser'
      }
      if (!options.bypassCache) {
        this.setCache(this.cache.topStations, cacheKey, result)
      }
      return result
    })
  }

  // 获取最新电台
  async getLatestStations(limit: number = 50, options: CacheOptions = {}): Promise<RadioStation[]> {
    return this.retryWithFallback(async () => {
      const cacheKey = String(limit)
      if (!options.bypassCache) {
        const cached = this.getFromCache(this.cache.latestStations, cacheKey)
        if (cached) {
          return cached
        }
      }

      const stations = await this.searchStations({
        order: 'lastchecktime',
        reverse: true,
        limit: limit,
        hidebroken: true
      })
      if (!options.bypassCache) {
        this.setCache(this.cache.latestStations, cacheKey, stations)
      }
      return stations
    }, () => {
      if (this.debugEnabled) console.log('API不可用，无备用数据')
      return []
    })
  }

  // 获取随机电台
  async getRandomStations(limit: number = 50): Promise<ApiResponse<RadioStation[]>> {
    return this.retryWithFallback(async () => {
      const stations = await this.searchStations({
        order: 'random',
        limit: limit,
        hidebroken: true
      })
      return {
        success: true,
        data: stations,
        source: 'radio-browser'
      }
    }, () => {
      return {
        success: true,
        data: [],
        source: 'fallback'
      }
    })
  }

  // 根据国家获取电台
  async getStationsByCountry(countryCode: string, limit: number = 50): Promise<ApiResponse<RadioStation[]>> {
    return this.retryWithFallback(async () => {
      const response = await this.currentAPI.get(`/json/stations/bycountrycodeexact/${countryCode}`, {
        params: { limit }
      })
      return {
        success: true,
        data: response.data,
        source: 'radio-browser'
      }
    })
  }

  // 根据标签获取电台
  async getStationsByTag(tag: string, limit = 100): Promise<RadioStation[]> {
    return this.retryWithFallback(async () => {
      return this.searchStations({ tag, limit, hidebroken: true, order: 'clickcount', reverse: true })
    })
  }

  // 获取国家列表
  async getCountries(): Promise<ApiResponse<Country[]>> {
    return this.retryWithFallback(async () => {
      const response = await this.currentAPI.get('/json/countries')
      return {
        success: true,
        data: response.data,
        source: 'radio-browser'
      }
    })
  }

  // 获取语言列表
  async getLanguages(): Promise<Language[]> {
    return this.retryWithFallback(async () => {
      const response = await this.currentAPI.get('/json/languages')
      return response.data.sort((a: Language, b: Language) => b.stationcount - a.stationcount)
    })
  }

  // 获取标签列表
  async getTags(): Promise<Tag[]> {
    return this.retryWithFallback(async () => {
      const response = await this.currentAPI.get('/json/tags')
      return response.data
        .filter((tag: Tag) => tag.stationcount > 10)
        .sort((a: Tag, b: Tag) => b.stationcount - a.stationcount)
        .slice(0, 100)
    })
  }

  // 记录点击
  async recordClick(stationUuid: string): Promise<void> {
    return this.retryWithFallback(async () => {
      await this.currentAPI.get(`/json/url/${stationUuid}`)
    })
  }

  // 投票
  async voteForStation(stationUuid: string): Promise<boolean> {
    return this.retryWithFallback(async () => {
      const response = await this.currentAPI.get(`/json/vote/${stationUuid}`)
      return response.data.ok === 'true'
    })
  }

  // 根据UUID获取电台
  async getStationByUUID(uuid: string): Promise<RadioStation | null> {
    return this.retryWithFallback(async () => {
      const response = await this.currentAPI.get<RadioStation[]>(`/json/stations/byuuid/${uuid}`)
      return response.data.length > 0 ? response.data[0] : null
    })
  }

  // 获取API状态
  async getAPIStatus(): Promise<any> {
    return this.retryWithFallback(async () => {
      const response = await this.currentAPI.get('/json/stats')
      return {
        ...response.data,
        provider: this.currentProvider.name,
        type: this.currentProvider.type
      }
    })
  }

  // 刷新API连接
  async refreshAPIConnection(): Promise<void> {
    if (this.debugEnabled) console.log('Refreshing API connection...')
    this.isInitialized = false
    this.initializationPromise = this.initializeAPI()
    await this.initializationPromise
    this.initializationPromise = null
  }

  // 获取当前API提供商
  getCurrentProvider(): APIProvider {
    return this.currentProvider
  }

  // 获取所有API提供商状态
  getAllProvidersStatus(): APIProvider[] {
    return this.apiProviders
  }

  // 切换到指定提供商
  async switchToProvider(providerName: string): Promise<boolean> {
    const provider = this.apiProviders.find(p => p.name === providerName)
    if (!provider) {
      console.error(`Provider ${providerName} not found`)
      return false
    }
    try {
      this.currentProvider = provider
      this.currentAPI = this.createAPIInstance(provider)
      await this.currentAPI.get('/json/stations/topvote/1')
      provider.isAvailable = true
      if (this.debugEnabled) console.log(`Successfully switched to provider: ${providerName}`)
      return true
    } catch (error) {
      console.error(`Failed to switch to provider ${providerName}:`, error)
      provider.isAvailable = false
      return false
    }
  }
}

export const radioAPI = new RadioAPI()
