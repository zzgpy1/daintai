import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation, FavoriteStation } from '@/types/radio'
import { STORAGE_KEYS } from '@/utils/constants'

export const useFavoritesStore = defineStore('favorites', () => {
  // 状态
  const favorites = ref<FavoriteStation[]>([])
  const isLoading = ref(false)

  // 计算属性
  const totalFavorites = computed(() => favorites.value.length)
  
  const isFavorite = (stationUuid: string) => {
    return favorites.value.some(fav => fav.stationuuid === stationUuid)
  }

  // 添加收藏
  const addFavorite = (station: RadioStation) => {
    if (isFavorite(station.stationuuid)) {
      return
    }
    
    const favorite: FavoriteStation = {
      stationuuid: station.stationuuid,
      name: station.name,
      url: station.url,
      favicon: station.favicon,
      country: station.country,
      addedAt: new Date().toISOString()
    }
    
    favorites.value.unshift(favorite)
    saveFavorites()
  }

  // 移除收藏
  const removeFavorite = (stationUuid: string) => {
    const index = favorites.value.findIndex(fav => fav.stationuuid === stationUuid)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }

  // 切换收藏
  const toggleFavorite = (station: RadioStation) => {
    if (isFavorite(station.stationuuid)) {
      removeFavorite(station.stationuuid)
    } else {
      addFavorite(station)
    }
  }

  // 清空收藏
  const clearFavorites = () => {
    favorites.value = []
    saveFavorites()
  }

  // 保存到本地存储
  const saveFavorites = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites.value))
    } catch (error) {
      console.error('保存收藏失败:', error)
    }
  }

  // 加载收藏
  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES)
      if (saved) {
        favorites.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载收藏失败:', error)
      favorites.value = []
    }
  }

  return {
    favorites,
    isLoading,
    totalFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    loadFavorites,
    saveFavorites
  }
})
