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
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCountry = ref('')
  const selectedLanguage = ref('')
  const selectedTag = ref('')
  const currentPage = ref(1)
  const pageSize = ref(50)
  const hasMore = ref(true)

  // 计算属性
  const totalStations = computed(() => stations.value.length)
  
  const filteredStations = computed(() => {
    let filtered = stations.value
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(station => {
        return station.name.toLowerCase().includes(query) ||
               station.country.toLowerCase().includes(query) ||
               station.tags.toLowerCase().includes(query) ||
               (station.language && station.language.toLowerCase().includes(query))
      })
    }
    
    if (selectedCountry.value) {
      filtered = filtered.filter(station => 
        station.countrycode === selectedCountry.value
      )
    }
    
    if (selectedLanguage.value) {
      filtered = filtered.filter(station => 
        station.language && station.language.toLowerCase().includes(selectedLanguage.value.toLowerCase())
      )
    }
    
    if (selectedTag.value) {
      filtered = filtered.filter(station => 
        station.tags.toLowerCase().includes(selectedTag.value.toLowerCase())
      )
    }
    
    return filtered
  })

  // 搜索电台
  const searchStations = async (params: RadioSearchParams = {}) => {
    isLoading.value = true
    error.value = null
    
    try {
      const searchParams: RadioSearchParams = {
        ...params,
        limit: pageSize.value,
        offset: (currentPage.value - 1) * pageSize.value,
        hidebroken: true
      }
      
      if (selectedCountry.value) {
        searchParams.countrycode = selectedCountry.value
      }
      
      if (selectedLanguage.value) {
        searchParams.language = selectedLanguage.value
      }
      
      if (selectedTag.value) {
        searchParams.tag = selectedTag.value
      }
      
      if (searchQuery.value) {
        searchParams.name = searchQuery.value
      }
      
      const results = await radioAPI.searchStations(searchParams)
      
      if (currentPage.value === 1) {
        stations.value = results
      } else {
        stations.value.push(...results)
      }
      
      hasMore.value = results.length >= pageSize.value
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜索失败'
      console.error('搜索电台错误:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 加载热门电台
  const loadTopStations = async (limit: number = 50) => {
    isLoading.value = true
    error.value = null
    
    try {
      topStations.value = await radioAPI.getTopStations(limit)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载热门电台失败'
      console.error('加载热门电台错误:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 加载最新电台
  const loadLatestStations = async (limit: number = 50) => {
    isLoading.value = true
    error.value = null
    
    try {
      latestStations.value = await radioAPI.getLatestStations(limit)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载最新电台失败'
      console.error('加载最新电台错误:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 加载随机电台
  const loadRandomStations = async (limit: number = 50) => {
    isLoading.value = true
    error.value = null
    
    try {
      stations.value = await radioAPI.getRandomStations(limit)
      currentPage.value = 1
      hasMore.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载随机电台失败'
      console.error('加载随机电台错误:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 加载更多
  const loadMore = async () => {
    if (isLoadingMore.value || !hasMore.value) return
    
    isLoadingMore.value = true
    currentPage.value++
    await searchStations()
    isLoadingMore.value = false
  }

  // 加载国家列表
  const loadCountries = async () => {
    try {
      countries.value = await radioAPI.getCountries()
    } catch (err) {
      console.error('加载国家列表错误:', err)
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

  // 重置搜索
  const resetSearch = () => {
    searchQuery.value = ''
    selectedCountry.value = ''
    selectedLanguage.value = ''
    selectedTag.value = ''
    currentPage.value = 1
    stations.value = []
    hasMore.value = true
    error.value = null
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  return {
    stations,
    topStations,
    latestStations,
    countries,
    languages,
    tags,
    isLoading,
    isLoadingMore,
    error,
    searchQuery,
    selectedCountry,
    selectedLanguage,
    selectedTag,
    currentPage,
    pageSize,
    hasMore,
    totalStations,
    filteredStations,
    searchStations,
    loadTopStations,
    loadLatestStations,
    loadRandomStations,
    loadMore,
    loadCountries,
    loadLanguages,
    loadTags,
    resetSearch,
    clearError
  }
})
