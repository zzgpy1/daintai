import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { radioAPI } from '@/services/radioApi'
import type { RadioStation, Country, Language, Tag } from '@/types/radio'
import { useToastStore } from './toast'

const CACHE_KEY_CHINA = 'radio-china-cache'
const CACHE_KEY_TOP = 'radio-top-cache'
const CACHE_KEY_LATEST = 'radio-latest-cache'
const CACHE_TTL = 600000 // 10分钟

function loadCachedData(key: string): any[] | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
    return null
  } catch { return null }
}

function saveCachedData(key: string, data: any[]) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

export const useRadioStore = defineStore('radio', () => {
  const toastStore = useToastStore()
  const stations = ref<RadioStation[]>([])
  const topStations = ref<RadioStation[]>([])
  const latestStations = ref<RadioStation[]>([])
  const chinaStations = ref<RadioStation[]>([])
  const categoryStations = ref<RadioStation[]>([])
  const countries = ref<Country[]>([])
  const languages = ref<Language[]>([])
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCountry = ref('')
  const selectedLanguage = ref('')
  const selectedTag = ref('')
  const currentCategory = ref<string>('')

  // 防止并发请求
  let chinaLoadingPromise: Promise<void> | null = null
  let topLoadingPromise: Promise<void> | null = null
  let latestLoadingPromise: Promise<void> | null = null

  const filteredStations = computed(() => {
    let filtered = stations.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.tags.toLowerCase().includes(q) ||
        (s.language && s.language.toLowerCase().includes(q))
      )
    }
    if (selectedCountry.value) {
      filtered = filtered.filter(s => s.countrycode === selectedCountry.value)
    }
    if (selectedLanguage.value) {
      filtered = filtered.filter(s => s.language?.toLowerCase().includes(selectedLanguage.value.toLowerCase()))
    }
    if (selectedTag.value) {
      filtered = filtered.filter(s => s.tags.toLowerCase().includes(selectedTag.value.toLowerCase()))
    }
    return filtered
  })

  const searchStations = async (query?: string, signal?: AbortSignal) => {
    if (query) searchQuery.value = query
    isLoading.value = true
    error.value = null
    try {
      const params: any = { limit: 100, hidebroken: true }
      if (searchQuery.value) params.name = searchQuery.value
      if (selectedCountry.value) params.countrycode = selectedCountry.value
      if (selectedLanguage.value) params.language = selectedLanguage.value
      if (selectedTag.value) params.tag = selectedTag.value
      stations.value = await radioAPI.searchStations(params, signal)
      if (stations.value.length === 0) {
        toastStore.showInfo('没有找到匹配的电台')
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('搜索已取消')
        return
      }
      error.value = '搜索失败，请检查网络'
      console.error(err)
      toastStore.showError('搜索失败，请稍后重试')
    } finally {
      isLoading.value = false
    }
    return stations.value
  }

  const loadTopStations = async () => {
    // 先读缓存
    const cached = loadCachedData(CACHE_KEY_TOP)
    if (cached) {
      topStations.value = cached
    }
    if (topLoadingPromise) return topLoadingPromise

    topLoadingPromise = (async () => {
      isLoading.value = true
      try {
        let data = await radioAPI.getTopStations(50)
        if (data.length > 0) {
          topStations.value = data
          saveCachedData(CACHE_KEY_TOP, data)
        } else {
          // 降级
          const fallback = await radioAPI.searchStations({ order: 'clickcount', limit: 50, reverse: true })
          if (fallback.length > 0) {
            topStations.value = fallback
            saveCachedData(CACHE_KEY_TOP, fallback)
          } else {
            throw new Error('No top stations')
          }
        }
      } catch (err) {
        console.error('加载热门电台失败:', err)
        if (!cached) {
          toastStore.showError('加载热门电台失败')
        } else {
          console.warn('刷新热门电台失败，使用缓存数据')
        }
      } finally {
        isLoading.value = false
        topLoadingPromise = null
      }
    })()
    await topLoadingPromise
  }

  const loadLatestStations = async () => {
    const cached = loadCachedData(CACHE_KEY_LATEST)
    if (cached) {
      latestStations.value = cached
    }
    if (latestLoadingPromise) return latestLoadingPromise

    latestLoadingPromise = (async () => {
      isLoading.value = true
      try {
        let data = await radioAPI.getLatestStations(30)
        if (data.length > 0) {
          latestStations.value = data
          saveCachedData(CACHE_KEY_LATEST, data)
        } else {
          const fallback = await radioAPI.searchStations({ order: 'name', limit: 30 })
          if (fallback.length > 0) {
            latestStations.value = fallback
            saveCachedData(CACHE_KEY_LATEST, fallback)
          } else {
            throw new Error('No latest stations')
          }
        }
      } catch (err) {
        console.error('加载最新电台失败:', err)
        if (!cached) {
          toastStore.showError('加载最新电台失败')
        } else {
          console.warn('刷新最新电台失败，使用缓存数据')
        }
      } finally {
        isLoading.value = false
        latestLoadingPromise = null
      }
    })()
    await latestLoadingPromise
  }

  const loadChinaStations = async () => {
    const cached = loadCachedData(CACHE_KEY_CHINA)
    if (cached) {
      chinaStations.value = cached
    }
    if (chinaLoadingPromise) return chinaLoadingPromise

    chinaLoadingPromise = (async () => {
      isLoading.value = true
      try {
        let data = await radioAPI.getStationsByCountry('CN', 50)
        if (data.length > 0) {
          chinaStations.value = data
          saveCachedData(CACHE_KEY_CHINA, data)
        } else {
          const fallback = await radioAPI.searchStations({ country: 'China', limit: 50 })
          if (fallback.length > 0) {
            chinaStations.value = fallback
            saveCachedData(CACHE_KEY_CHINA, fallback)
          } else {
            throw new Error('No China stations')
          }
        }
      } catch (err) {
        console.error('加载国内电台失败:', err)
        if (!cached) {
          toastStore.showError('加载国内电台失败')
        } else {
          console.warn('刷新国内电台失败，使用缓存数据')
        }
      } finally {
        isLoading.value = false
        chinaLoadingPromise = null
      }
    })()
    await chinaLoadingPromise
  }

  const loadCategoryStations = async (tag: string, countryCode: string = 'CN') => {
    if (!tag) {
      categoryStations.value = []
      return
    }
    isLoading.value = true
    currentCategory.value = tag
    try {
      const result = await radioAPI.searchStations({ tag, countrycode: countryCode, limit: 50, hidebroken: true })
      categoryStations.value = result
      if (categoryStations.value.length === 0) {
        toastStore.showInfo(`未找到国内“${tag}”分类的电台`)
      }
    } catch (err) {
      console.error(`加载分类 ${tag} 失败:`, err)
      toastStore.showError(`加载分类失败`)
    } finally {
      isLoading.value = false
    }
  }

  const loadCountries = async () => {
    try {
      countries.value = await radioAPI.getCountries()
    } catch (err) {
      console.error('加载国家列表失败:', err)
    }
  }

  const loadLanguages = async () => {
    try {
      languages.value = await radioAPI.getLanguages()
    } catch (err) {
      console.error('加载语言列表失败:', err)
    }
  }

  const loadTags = async () => {
    try {
      tags.value = await radioAPI.getTags()
    } catch (err) {
      console.error('加载标签列表失败:', err)
    }
  }

  const getStationByUUID = async (uuid: string): Promise<RadioStation | null> => {
    try {
      return await radioAPI.getStationByUUID(uuid)
    } catch (err) {
      console.error('获取电台详情失败:', err)
      return null
    }
  }

  const resetSearch = () => {
    searchQuery.value = ''
    selectedCountry.value = ''
    selectedLanguage.value = ''
    selectedTag.value = ''
    stations.value = []
  }

  return {
    stations,
    topStations,
    latestStations,
    chinaStations,
    categoryStations,
    countries,
    languages,
    tags,
    isLoading,
    error,
    searchQuery,
    selectedCountry,
    selectedLanguage,
    selectedTag,
    currentCategory,
    filteredStations,
    searchStations,
    loadTopStations,
    loadLatestStations,
    loadChinaStations,
    loadCategoryStations,
    loadCountries,
    loadLanguages,
    loadTags,
    getStationByUUID,
    resetSearch
  }
})
