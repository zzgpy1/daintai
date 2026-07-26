import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation, FavoriteStation } from '@/types/radio'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<FavoriteStation[]>([])

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('radio-favorites')
      if (saved) {
        favorites.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载收藏失败:', error)
    }
  }

  const saveFavorites = () => {
    try {
      localStorage.setItem('radio-favorites', JSON.stringify(favorites.value))
    } catch (error) {
      console.error('保存收藏失败:', error)
    }
  }

  const addFavorite = (station: RadioStation) => {
    if (!favorites.value.some(f => f.stationuuid === station.stationuuid)) {
      favorites.value.unshift({
        stationuuid: station.stationuuid,
        name: station.name,
        url: station.url,
        favicon: station.favicon,
        country: station.country,
        addedAt: new Date().toISOString()
      })
      saveFavorites()
    }
  }

  const removeFavorite = (stationUuid: string) => {
    const index = favorites.value.findIndex(f => f.stationuuid === stationUuid)
    if (index !== -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }

  const toggleFavorite = (station: RadioStation) => {
    if (isFavorite(station.stationuuid)) {
      removeFavorite(station.stationuuid)
    } else {
      addFavorite(station)
    }
  }

  const isFavorite = (stationUuid: string): boolean => {
    return favorites.value.some(f => f.stationuuid === stationUuid)
  }

  const clearFavorites = () => {
    favorites.value = []
    saveFavorites()
  }

  const getFavoriteCount = computed(() => favorites.value.length)

  // 初始化加载
  loadFavorites()

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    getFavoriteCount,
    loadFavorites,
    saveFavorites
  }
})
