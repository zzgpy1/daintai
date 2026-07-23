import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation, FavoriteStation } from '@/types/radio'

export const usePlayerStore = defineStore('player', () => {
  // 状态
  const audio = ref<HTMLAudioElement | null>(null)
  const currentStation = ref<RadioStation | null>(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const volume = ref(0.8)
  const isMuted = ref(false)
  const error = ref<string | null>(null)
  const favorites = ref<FavoriteStation[]>([])

  // 计算属性
  const isFavorite = computed(() => {
    if (!currentStation.value) return false
    return favorites.value.some(fav => fav.stationuuid === currentStation.value!.stationuuid)
  })

  // 初始化音频
  const initAudio = () => {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.volume = volume.value
      audio.value.muted = isMuted.value

      audio.value.addEventListener('play', () => {
        isPlaying.value = true
        isLoading.value = false
        error.value = null
      })

      audio.value.addEventListener('pause', () => {
        isPlaying.value = false
      })

      audio.value.addEventListener('error', (e) => {
        console.error('音频播放错误:', e)
        isPlaying.value = false
        isLoading.value = false
        error.value = '播放失败，请稍后重试'
      })

      audio.value.addEventListener('ended', () => {
        isPlaying.value = false
      })
    }
  }

  // 播放电台
  const playStation = async (station: RadioStation) => {
    try {
      initAudio()
      isLoading.value = true
      error.value = null

      if (currentStation.value?.stationuuid === station.stationuuid && isPlaying.value) {
        pauseStation()
        return
      }

      currentStation.value = station
      audio.value!.src = station.url_resolved || station.url
      audio.value!.volume = volume.value
      audio.value!.muted = isMuted.value

      await audio.value!.play()
      isPlaying.value = true
      isLoading.value = false

      // 添加到历史记录
      addToHistory(station)

    } catch (err) {
      console.error('播放失败:', err)
      error.value = '无法播放此电台，请尝试其他电台'
      isLoading.value = false
      isPlaying.value = false
    }
  }

  // 暂停播放
  const pauseStation = () => {
    if (audio.value) {
      audio.value.pause()
      isPlaying.value = false
    }
  }

  // 恢复播放
  const resumeStation = () => {
    if (audio.value && currentStation.value) {
      audio.value.play().catch(err => {
        console.error('恢复播放失败:', err)
        error.value = '恢复播放失败'
      })
    }
  }

  // 停止播放
  const stopStation = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
    }
    isPlaying.value = false
    currentStation.value = null
  }

  // 设置音量
  const setVolume = (newVolume: number) => {
    volume.value = Math.max(0, Math.min(1, newVolume))
    if (audio.value) {
      audio.value.volume = volume.value
    }
    localStorage.setItem('radio-volume', volume.value.toString())
  }

  // 切换静音
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audio.value) {
      audio.value.muted = isMuted.value
    }
    localStorage.setItem('radio-muted', isMuted.value.toString())
  }

  // 收藏操作
  const addToFavorites = (station: RadioStation) => {
    const favorite: FavoriteStation = {
      stationuuid: station.stationuuid,
      name: station.name,
      url: station.url,
      favicon: station.favicon,
      country: station.country,
      addedAt: new Date().toISOString()
    }
    if (!favorites.value.some(fav => fav.stationuuid === station.stationuuid)) {
      favorites.value.unshift(favorite)
      saveFavorites()
    }
  }

  const removeFromFavorites = (stationUuid: string) => {
    const index = favorites.value.findIndex(fav => fav.stationuuid === stationUuid)
    if (index !== -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }

  const toggleFavorite = (station: RadioStation) => {
    if (isStationFavorite(station.stationuuid)) {
      removeFromFavorites(station.stationuuid)
    } else {
      addToFavorites(station)
    }
  }

  const isStationFavorite = (stationUuid: string) => {
    return favorites.value.some(fav => fav.stationuuid === stationUuid)
  }

  const clearFavorites = () => {
    favorites.value = []
    saveFavorites()
  }

  // 保存和加载收藏
  const saveFavorites = () => {
    localStorage.setItem('radio-favorites', JSON.stringify(favorites.value))
  }

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('radio-favorites')
      if (saved) {
        favorites.value = JSON.parse(saved)
      }
    } catch (err) {
      console.error('加载收藏失败:', err)
    }
  }

  // 历史记录
  const addToHistory = (station: RadioStation) => {
    // 简单的历史记录实现
    const history = JSON.parse(localStorage.getItem('radio-history') || '[]')
    const item = {
      station,
      timestamp: Date.now()
    }
    // 去重：如果同一个电台在5分钟内再次播放，只更新时间
    const existingIndex = history.findIndex((h: any) => 
      h.station.stationuuid === station.stationuuid && 
      (Date.now() - h.timestamp) < 5 * 60 * 1000
    )
    if (existingIndex !== -1) {
      history[existingIndex].timestamp = Date.now()
      // 移到最前面
      const [item] = history.splice(existingIndex, 1)
      history.unshift(item)
    } else {
      history.unshift(item)
    }
    // 限制历史记录数量
    if (history.length > 100) {
      history.length = 100
    }
    localStorage.setItem('radio-history', JSON.stringify(history))
  }

  const clearError = () => {
    error.value = null
  }

  // 初始化
  loadFavorites()

  return {
    // 状态
    audio,
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    error,
    favorites,
    // 计算属性
    isFavorite,
    // 方法
    playStation,
    pauseStation,
    resumeStation,
    stopStation,
    setVolume,
    toggleMute,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isStationFavorite,
    clearFavorites,
    clearError,
    addToHistory,
    loadFavorites,
    saveFavorites
  }
})
