import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation, RadioSearchParams, Country, Language, Tag } from '@/types/radio'
import { radioAPI } from '@/services/radioApi'

export const useRadioStore = defineStore('radio', () => {
  // 状态
  const stations = ref<RadioStation[]>([])
  const topStations = ref<RadioStation[]>([])
  const latestStations = ref<RadioStation[]>([])
  const countries = ref<Country[]>([])
  const languages = ref<Language[]>([])
  const tags = ref<Tag[]>([])
  
  const isLoadingStations = ref(false)
  const isLoadingTopStations = ref(false)
  const isLoadingLatestStations = ref(false)
  const isLoadingMeta = ref(false)
  const isLoadingStationDetail = ref(false)
  
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCountry = ref('')
  const selectedLanguage = ref('')
  const selectedTag = ref('')
  const currentPage = ref(1)
  const pageSize = ref(50)

  // 计算属性
  const isLoading = computed(() => 
    isLoadingStations.value || isLoadingTopStations.value || 
    isLoadingLatestStations.value || isLoadingMeta.value || 
    isLoadingStationDetail.value
  )
  
  const hasMore = computed(() => stations.value.length >= pageSize.value)
  const totalStations = computed(() => stations.value.length)
  
  const filteredStations = computed(() => {
    let filtered = stations.value
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(station => {
        const nameMatch = station.name.toLowerCase().includes(query)
        const countryMatch = station.country.toLowerCase().includes(query)
        const tagsMatch = station.tags.toLowerCase().includes(query)
        return nameMatch || countryMatch || tagsMatch
      })
    }
    
    if (selectedCountry.value) {
      filtered = filtered.filter(station => station.countrycode === selectedCountry.value)
    }
    
    if (selectedLanguage.value) {
      filtered = filtered.filter(station => 
        station.language && station.language.toLowerCase().includes(selectedLanguage.value.toLowerCase())
      )
    }
    
    return filtered
  })

  // 搜索电台
  const searchStations = async (params: RadioSearchParams = {}) => {
    try {
      isLoadingStations.value = true
      error.value = null
      
      const searchParams: RadioSearchParams = {
        ...params,
        limit: pageSize.value,
        offset: (currentPage.value - 1) * pageSize.value,
        hidebroken: true
      }
      
      if (selectedCountry.value) searchParams.countrycode = selectedCountry.value
      if (selectedLanguage.value) searchParams.language = selectedLanguage.value
      if (searchQuery.value) searchParams.name = searchQuery.value
      
      const result = await radioAPI.searchStations(searchParams)
      
      if (currentPage.value === 1) {
        stations.value = result
      } else {
        stations.value.push(...result)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜索失败'
      console.error('搜索电台错误:', err)
    } finally {
      isLoadingStations.value = false
    }
  }

  // 加载热门电台
  const loadTopStations = async ({ force = false } = {}) => {
    if (topStations.value.length > 0 && !force) return
    
    try {
      isLoadingTopStations.value = true
      error.value = null
      topStations.value = await radioAPI.getTopStations(50)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载热门电台失败'
      console.error('加载热门电台错误:', err)
    } finally {
      isLoadingTopStations.value = false
    }
  }

  // 加载最新电台
  const loadLatestStations = async ({ force = false } = {}) => {
    if (latestStations.value.length > 0 && !force) return
    
    try {
      isLoadingLatestStations.value = true
      error.value = null
      latestStations.value = await radioAPI.getLatestStations(50)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载最新电台失败'
      console.error('加载最新电台错误:', err)
    } finally {
      isLoadingLatestStations.value = false
    }
  }

  // 加载随机电台
  const loadRandomStations = async () => {
    try {
      isLoadingStations.value = true
      error.value = null
      stations.value = await radioAPI.getRandomStations(50)
      currentPage.value = 1
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载随机电台失败'
      console.error('加载随机电台错误:', err)
    } finally {
      isLoadingStations.value = false
    }
  }

  // 加载国家列表
  const loadCountries = async () => {
    try {
      isLoadingMeta.value = true
      error.value = null
      countries.value = await radioAPI.getCountries()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载国家列表失败'
      console.error('加载国家列表错误:', err)
    } finally {
      isLoadingMeta.value = false
    }
  }

  // 加载语言列表
  const loadLanguages = async () => {
    try {
      languages.value = await radioAPI.getLanguages()
    } catch (err) {
      console.error('加载语言列表错误:', err)
    }
  }

  // 加载标签列表
  const loadTags = async () => {
    try {
      tags.value = await radioAPI.getTags()
    } catch (err) {
      console.error('加载标签列表错误:', err)
    }
  }

  // 获取单个电台
  const getStationByUuid = async (uuid: string): Promise<RadioStation | null> => {
    try {
      isLoadingStationDetail.value = true
      return await radioAPI.getStationByUUID(uuid)
    } catch (err) {
      error.value = err instanceof Error ? err.message : `无法加载电台 ${uuid}`
      console.error('根据UUID加载电台错误:', err)
      return null
    } finally {
      isLoadingStationDetail.value = false
    }
  }

  // 加载更多
  const loadMoreStations = async () => {
    if (isLoading.value || !hasMore.value) return
    currentPage.value++
    await searchStations()
  }

  // 重置搜索
  const resetSearch = () => {
    searchQuery.value = ''
    selectedCountry.value = ''
    selectedLanguage.value = ''
    selectedTag.value = ''
    currentPage.value = 1
    stations.value = []
    error.value = null
  }

  // 设置搜索查询
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
  }

  const setSelectedCountry = (countryCode: string) => {
    selectedCountry.value = countryCode
    currentPage.value = 1
  }

  const setSelectedLanguage = (language: string) => {
    selectedLanguage.value = language
    currentPage.value = 1
  }

  const clearError = () => {
    error.value = null
  }

  // 清除缓存
  const clearCache = () => {
    radioAPI.clearCache()
  }

  return {
    // 状态
    stations,
    topStations,
    latestStations,
    countries,
    languages,
    tags,
    isLoading,
    isLoadingStations,
    isLoadingTopStations,
    isLoadingLatestStations,
    isLoadingMeta,
    isLoadingStationDetail,
    error,
    searchQuery,
    selectedCountry,
    selectedLanguage,
    selectedTag,
    currentPage,
    pageSize,
    
    // 计算属性
    hasMore,
    totalStations,
    filteredStations,
    
    // 方法
    searchStations,
    loadTopStations,
    loadLatestStations,
    loadRandomStations,
    loadCountries,
    loadLanguages,
    loadTags,
    loadMoreStations,
    getStationByUuid,
    resetSearch,
    setSearchQuery,
    setSelectedCountry,
    setSelectedLanguage,
    clearError,
    clearCache
  }
})
