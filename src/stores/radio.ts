import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { radioAPI } from '@/services/radioApi'
import type { RadioStation, Country, Language, Tag } from '@/types/radio'
import { useToastStore } from './toast'

export const useRadioStore = defineStore('radio', () => {
  const toastStore = useToastStore()
  const stations = ref<RadioStation[]>([])
  const topStations = ref<RadioStation[]>([])
  const latestStations = ref<RadioStation[]>([])
  const chinaStations = ref<RadioStation[]>([])
  const categoryStations = ref<RadioStation[]>([])
  const provinceStations = ref<RadioStation[]>([]) // 新增
  const countries = ref<Country[]>([])
  const languages = ref<Language[]>([])
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCountry = ref('CN')    // 默认中国
  const selectedLanguage = ref('')
  const selectedTag = ref('')
  const currentCategory = ref<string>('')

  const filteredStations = computed(() => {
    let filtered = stations.value
    // 始终只显示国内电台（countrycode 为 CN 或 country 包含 China）
    filtered = filtered.filter(s => s.countrycode === 'CN' || s.country.toLowerCase().includes('china'))
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.tags.toLowerCase().includes(q) ||
        (s.language && s.language.toLowerCase().includes(q)) ||
        (s.state && s.state.toLowerCase().includes(q))
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

  // 搜索始终带国家过滤
  const searchStations = async (query?: string, signal?: AbortSignal) => {
    if (query) searchQuery.value = query
    isLoading.value = true
    error.value = null
    try {
      const params: any = { limit: 100, hidebroken: true, countrycode: 'CN' } // 强制国内
      if (searchQuery.value) params.name = searchQuery.value
      if (selectedCountry.value) params.countrycode = selectedCountry.value
      if (selectedLanguage.value) params.language = selectedLanguage.value
      if (selectedTag.value) params.tag = selectedTag.value
      stations.value = await radioAPI.searchStations(params, signal)
      if (stations.value.length === 0) {
        toastStore.showInfo('没有找到匹配的国内电台')
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

  // 热门：使用搜索按点击量排序并过滤国内
  const loadTopStations = async () => {
    isLoading.value = true
    try {
      const result = await radioAPI.searchStations({ 
        order: 'clickcount', 
        limit: 50, 
        reverse: true, 
        countrycode: 'CN', 
        hidebroken: true 
      })
      topStations.value = result
    } catch (err) {
      console.error('加载热门电台失败:', err)
      try {
        const result = await radioAPI.searchStations({ countrycode: 'CN', limit: 50, hidebroken: true })
        topStations.value = result
        toastStore.showInfo('使用备用方式加载热门电台')
      } catch (e) {
        toastStore.showError('加载热门电台失败')
        topStations.value = []
      }
    } finally {
      isLoading.value = false
    }
  }

  // 最新：使用搜索按名称排序并过滤国内
  const loadLatestStations = async () => {
    isLoading.value = true
    try {
      const result = await radioAPI.searchStations({ 
        order: 'name', 
        limit: 30, 
        countrycode: 'CN', 
        hidebroken: true 
      })
      latestStations.value = result
    } catch (err) {
      console.error('加载最新电台失败:', err)
      try {
        const result = await radioAPI.searchStations({ countrycode: 'CN', limit: 30, hidebroken: true })
        latestStations.value = result
        toastStore.showInfo('使用备用方式加载最新电台')
      } catch (e) {
        toastStore.showError('加载最新电台失败')
        latestStations.value = []
      }
    } finally {
      isLoading.value = false
    }
  }

  // 国内频道
  const loadChinaStations = async () => {
    isLoading.value = true
    try {
      chinaStations.value = await radioAPI.getStationsByCountry('CN', 50)
      if (chinaStations.value.length === 0) {
        const results = await radioAPI.searchStations({ country: 'China', limit: 50 })
        chinaStations.value = results
      }
    } catch (err) {
      console.error('加载国内电台失败:', err)
      try {
        const results = await radioAPI.searchStations({ country: 'China', limit: 50 })
        chinaStations.value = results
        toastStore.showInfo('使用备用方式加载国内频道')
      } catch (e) {
        toastStore.showError('加载国内电台失败')
        chinaStations.value = []
      }
    } finally {
      isLoading.value = false
    }
  }

  // 分类（已含国内过滤）
  const loadCategoryStations = async (tag: string) => {
    if (!tag) {
      categoryStations.value = []
      return
    }
    isLoading.value = true
    currentCategory.value = tag
    try {
      const result = await radioAPI.searchStations({ 
        tag, 
        countrycode: 'CN', 
        limit: 50, 
        hidebroken: true 
      })
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

  // 修正：省份加载，支持降级搜索
  const loadProvinceStations = async (province: string) => {
    if (!province) {
      provinceStations.value = []
      return
    }
    isLoading.value = true
    try {
      // 先尝试用 state 精确匹配
      let result = await radioAPI.searchStations({ 
        state: province, 
        countrycode: 'CN', 
        limit: 50, 
        hidebroken: true 
      })
      
      // 如果为空，尝试用 name 模糊匹配（电台名可能包含省份）
      if (result.length === 0) {
        console.warn(`state 搜索“${province}”无结果，尝试 name 模糊匹配`)
        result = await radioAPI.searchStations({ 
          name: province, 
          countrycode: 'CN', 
          limit: 50, 
          hidebroken: true 
        })
      }

      // 如果还空，尝试用 tag（某些电台标签包含省份）
      if (result.length === 0) {
        console.warn(`name 搜索“${province}”无结果，尝试 tag 匹配`)
        result = await radioAPI.searchStations({ 
          tag: province, 
          countrycode: 'CN', 
          limit: 50, 
          hidebroken: true 
        })
      }

      provinceStations.value = result
      if (result.length === 0) {
        toastStore.showInfo(`未找到 ${province} 的电台`)
      }
    } catch (err) {
      console.error(`加载省份 ${province} 失败:`, err)
      toastStore.showError(`加载 ${province} 电台失败`)
      provinceStations.value = []
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
    selectedCountry.value = 'CN'
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
    provinceStations,
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
    loadProvinceStations,
    loadCountries,
    loadLanguages,
    loadTags,
    getStationByUUID,
    resetSearch
  }
})
