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
  const provinceStations = ref<RadioStation[]>([])
  const countries = ref<Country[]>([])
  const languages = ref<Language[]>([])
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCountry = ref('CN')
  const selectedLanguage = ref('')
  const selectedTag = ref('')
  const currentCategory = ref<string>('')

  const filteredStations = computed(() => {
    let filtered = stations.value
    // 始终只显示国内电台
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

  const searchStations = async (query?: string, signal?: AbortSignal) => {
    if (query) searchQuery.value = query
    isLoading.value = true
    error.value = null
    try {
      const params: any = { limit: 100, hidebroken: true, countrycode: 'CN' }
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

  // ✅ 关键修正：省份加载支持多策略、大 limit
  const loadProvinceStations = async (province: string) => {
    if (!province) {
      provinceStations.value = []
      return
    }
    isLoading.value = true
    try {
      // 策略1：使用 state 精确匹配（省份名）
      let result = await radioAPI.searchStations({ 
        state: province, 
        countrycode: 'CN', 
        limit: 200,        // 加大 limit 获取尽可能多
        hidebroken: true 
      })
      
      // 如果结果太少（可能 state 字段缺失或不标准），尝试 name 模糊匹配
      if (result.length < 5) {
        console.warn(`state 搜索“${province}”结果较少 (${result.length})，尝试 name 模糊匹配`)
        const nameResults = await radioAPI.searchStations({ 
          name: province, 
          countrycode: 'CN', 
          limit: 200,
          hidebroken: true 
        })
        // 合并并去重
        const merged = [...result, ...nameResults]
        const unique = merged.filter((item, index, self) => 
          index === self.findIndex(s => s.stationuuid === item.stationuuid)
        )
        result = unique
      }

      // 如果还少，尝试 tag 匹配（某些电台标签含省份）
      if (result.length < 5) {
        console.warn(`name 搜索“${province}”结果仍较少，尝试 tag 匹配`)
        const tagResults = await radioAPI.searchStations({ 
          tag: province, 
          countrycode: 'CN', 
          limit: 200,
          hidebroken: true 
        })
        const merged = [...result, ...tagResults]
        const unique = merged.filter((item, index, self) => 
          index === self.findIndex(s => s.stationuuid === item.stationuuid)
        )
        result = unique
      }

      provinceStations.value = result
      if (result.length === 0) {
        toastStore.showInfo(`未找到 ${province} 的电台`)
      } else {
        toastStore.showInfo(`找到 ${result.length} 个 ${province} 的电台`)
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
