import axios, { AxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config'
import type { RadioStation, RadioSearchParams, Country, Language, Tag } from '@/types/radio'

class RadioAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private currentBaseURL = API_CONFIG.baseURL
  private axiosInstance = axios.create({
    timeout: API_CONFIG.timeout,
    headers: { 'User-Agent': 'GlobalRadio/2.0' }
  })
  private abortControllers: AbortController[] = []

  private async requestWithRetry<T>(endpoint: string, params?: any, retries = 3, signal?: AbortSignal): Promise<T> {
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
        const config: AxiosRequestConfig = { params, signal }
        const response = await this.axiosInstance.get(`${baseURL}${endpoint}`, config)
        const data = response.data
        if (endpoint === API_CONFIG.endpoints.random && (!data || data.length === 0)) {
          throw new Error('Empty random response')
        }
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

  // 新增取消方法
  cancelAllRequests() {
    this.abortControllers.forEach(ctrl => ctrl.abort())
    this.abortControllers = []
  }

  async searchStations(params: RadioSearchParams, signal?: AbortSignal): Promise<RadioStation[]> {
    // 可以传入 signal 或内部生成
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

  // 其他方法类似修改，可选择性增加 signal
  // ...
}

export const radioAPI = new RadioAPI()
