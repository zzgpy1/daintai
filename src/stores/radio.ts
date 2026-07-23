import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation } from '@/types/radio'
import { radioAPI } from '@/services/radioApi'

export const useRadioStore = defineStore('radio', () => {
  const stations = ref<RadioStation[]>([])
  const topStations = ref<RadioStation[]>([])
  const latestStations = ref<RadioStation[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredStations = computed(() => {
    if (!searchQuery.value) return stations.value
    const query = searchQuery.value.toLowerCase().trim()
    return stations.value.filter(station => 
      station.name.toLowerCase().includes(query) ||
      station.country.toLowerCase().includes(query) ||
      station.tags.toLowerCase().includes(query)
    )
  })

  const searchStations = async (params: any = {}) => {
    try {
      isLoading.value = true
      error.value = null
      const results = await radioAPI.searchStations(params)
      stations.value = results
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜索失败'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const loadTopStations = async ({ force = false } = {}) => {
    if (topStations.value.length > 0 && !force) return
    try {
      isLoading.value = true
      error.value = null
      const response = await radioAPI.getTopStations(50)
      topStations.value = response.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载热门电台失败'
    } finally {
      isLoading.value = false
    }
  }

  const loadLatestStations = async ({ force = false } = {}) => {
    if (latestStations.value.length > 0 && !force) return
    try {
      isLoading.value = true
      error.value = null
      latestStations.value = await radioAPI.getLatestStations(50)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载最新电台失败'
    } finally {
      isLoading.value = false
    }
  }

  const loadRandomStations = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await radioAPI.getRandomStations(50)
      stations.value = response.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载随机电台失败'
    } finally {
      isLoading.value = false
    }
  }

  const getStationByUuid = async (uuid: string): Promise<RadioStation | null> => {
    try {
      isLoading.value = true
      error.value = null
      return await radioAPI.getStationByUUID(uuid)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载电台失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const resetSearch = () => {
    searchQuery.value = ''
    stations.value = []
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    stations,
    topStations,
    latestStations,
    isLoading,
    error,
    searchQuery,
    filteredStations,
    searchStations,
    loadTopStations,
    loadLatestStations,
    loadRandomStations,
    getStationByUuid,
    resetSearch,
    clearError
  }
})
