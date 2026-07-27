import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { radioAPI } from '@/services/radioApi'
import type { RadioStation, Country, Language, Tag } from '@/types/radio'

export const useRadioStore = defineStore('radio', () => {
  const stations = ref<RadioStation[]>([])
  const topStations = ref<RadioStation[]>([])
  const latestStations = ref<RadioStation[]>([])
  const countries = ref<Country[]>([])
  const languages = ref<Language[]>([])
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCountry = ref('')
  const selectedLanguage = ref('')
  const selectedTag = ref('')

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

  const searchStations = async (query?: string) => {
    if (query) searchQuery.value = query
    isLoading.value = true
    error.value = null
    try {
      const params: any = { limit: 100, hidebroken: true }
      if (searchQuery.value) params.name = searchQuery.value
      if (selectedCountry.value) params.countrycode = selectedCountry.value
      if (selectedLanguage.value) params.language = selectedLanguage.value
      if (selectedTag.value) params.tag = selectedTag.value
      stations.value = await radioAPI.searchStations(params)
      if (stations.value.length === 0) {
        error.value = '没有找到匹配的电台'
      }
    } catch (err) {
      error.value = '搜索失败，请稍后重试'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const loadTopStations = async () => {
    isLoading.value = true
    try {
      topStations.value = await radioAPI.getTopStations(50)
    } catch (err) {
      console.error('加载热门电台失败:', err)
      error.value = '加载热门电台失败，请检查网络'
    } finally {
      isLoading.value = false
    }
  }

  const loadLatestStations = async () => {
    isLoading.value = true
    try {
      latestStations.value = await radioAPI.getLatestStations(30)
    } catch (err) {
      console.error('加载最新电台失败:', err)
      error.value = '加载最新电台失败，请检查网络'
    } finally {
      isLoading.value = false
    }
  }

  const loadCountries = async () => {
    try {
      countries.value = await radioAPI.getCountries()
    } catch (err) {
      console.error('加载国家列表失败:', err)
      // 使用模拟国家数据
      countries.value = [{ name: 'China', iso_3166_1: 'CN', stationcount: 100 }]
    }
  }

  const loadLanguages = async () => {
    try {
      languages.value = await radioAPI.getLanguages()
    } catch (err) {
      console.error('加载语言列表失败:', err)
      languages.value = [{ name: 'Chinese', iso_639: 'zh', stationcount: 50 }]
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
    countries,
    languages,
    tags,
    isLoading,
    error,
    searchQuery,
    selectedCountry,
    selectedLanguage,
    selectedTag,
    filteredStations,
    searchStations,
    loadTopStations,
    loadLatestStations,
    loadCountries,
    loadLanguages,
    loadTags,
    getStationByUUID,
    resetSearch
  }
})
