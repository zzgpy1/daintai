import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RadioStation, Country, Language } from '@/types/radio'
import { radioAPI } from '@/services/radioApi'

export const useRadioStore = defineStore('radio', () => {
  const stations = ref<RadioStation[]>([])
  const topStations = ref<RadioStation[]>([])
  const latestStations = ref<RadioStation[]>([])
  const countries = ref<Country[]>([])
  const languages = ref<Language[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const searchStations = async (params: any) => {
    isLoading.value = true
    try {
      const results = await radioAPI.searchStations(params)
      stations.value = results
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜索失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadTopStations = async (limit: number = 50) => {
    isLoading.value = true
    try {
      const result = await radioAPI.getTopStations(limit)
      topStations.value = result.data
      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载热门电台失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadRandomStations = async (limit: number = 50) => {
    isLoading.value = true
    try {
      const result = await radioAPI.getRandomStations(limit)
      stations.value = result.data
      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载随机电台失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadCountries = async () => {
    try {
      const result = await radioAPI.getCountries()
      countries.value = result.data
      return result.data
    } catch (err) {
      console.error('加载国家列表失败:', err)
      throw err
    }
  }

  const getStationByUuid = async (uuid: string) => {
    try {
      return await radioAPI.getStationByUUID(uuid)
    } catch (err) {
      console.error('获取电台详情失败:', err)
      throw err
    }
  }

  return {
    stations,
    topStations,
    latestStations,
    countries,
    languages,
    isLoading,
    error,
    searchStations,
    loadTopStations,
    loadRandomStations,
    loadCountries,
    getStationByUuid
  }
})
