import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FavoriteStation, RadioStation } from '@/types/radio'

export const useFavoritesStore = defineStore('favorites', () => {
  // 状态
  const favorites = ref<FavoriteStation[]>([])
  const maxFavorites = 500

  // 计算属性
  const count = computed(() => favorites.value.length)
  const isEmpty = computed(() => favorites.value.length === 0)

  // 检查是否已收藏
  const isFavorite = (stationUuid: string): boolean => {
    return favorites.value.some(fav => fav.stationuuid === stationUuid)
  }

  // 添加收藏
  const addFavorite = (station: RadioStation): boolean => {
    if (favorites.value.length >= maxFavorites) {
      return false
    }
    
    if (isFavorite(station.stationuuid)) {
      return false
    }
    
    const favorite: FavoriteStation = {
      stationuuid: station.stationuuid,
      name: station.name,
      url: station.url,
      favicon: station.favicon,
      country: station.country,
      countrycode: station.countrycode,
      tags: station.tags,
      addedAt: new Date().toISOString()
    }
    
    favorites.value.unshift(favorite)
    saveFavorites()
    return true
  }

  // 移除收藏
  const removeFavorite = (stationUuid: string): boolean => {
    const index = favorites.value.findIndex(fav => fav.stationuuid === stationUuid)
    if (index === -1) return false
    
    favorites.value.splice(index, 1)
    saveFavorites()
    return true
  }

  // 切换收藏状态
  const toggleFavorite = (station: RadioStation): boolean => {
    if (isFavorite(station.stationuuid)) {
      removeFavorite(station.stationuuid)
      return false
    } else {
      return addFavorite(station)
    }
  }

  // 清空收藏
  const clearFavorites = () => {
    favorites.value = []
    saveFavorites()
  }

  // 获取收藏列表（转换为RadioStation格式）
  const getFavoriteStations = (): RadioStation[] => {
    return favorites.value.map(fav => ({
      stationuuid: fav.stationuuid,
      name: fav.name,
      url: fav.url,
      url_resolved: fav.url,
      homepage: fav.homepage || '',
      favicon: fav.favicon || '',
      tags: fav.tags || '',
      country: fav.country || '',
      countrycode: fav.countrycode || '',
      state: fav.state || '',
      language: fav.language || '',
      languagecodes: '',
      votes: 0,
      lastchangetime: '',
      lastchangetime_iso8601: '',
      codec: '',
      bitrate: 0,
      hls: 0,
      lastcheckok: 1,
      lastchecktime: '',
      lastchecktime_iso8601: '',
      lastcheckoktime: '',
      lastcheckoktime_iso8601: '',
      lastlocalchecktime: '',
      lastlocalchecktime_iso8601: '',
      clicktimestamp: '',
      clicktimestamp_iso8601: '',
      clickcount: 0,
      clicktrend: 0,
      ssl_error: 0,
      geo_lat: null,
      geo_long: null,
      has_extended_info: false
    }))
  }

  // 保存到本地存储
  const saveFavorites = () => {
    try {
      localStorage.setItem('radio-favorites', JSON.stringify(favorites.value))
    } catch (error) {
      console.error('保存收藏失败:', error)
    }
  }

  // 从本地存储加载
  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('radio-favorites')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          favorites.value = parsed
        }
      }
    } catch (error) {
      console.error('加载收藏失败:', error)
      favorites.value = []
    }
  }

  return {
    // 状态
    favorites,
    maxFavorites,
    
    // 计算属性
    count,
    isEmpty,
    
    // 方法
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    getFavoriteStations,
    saveFavorites,
    loadFavorites
  }
})
