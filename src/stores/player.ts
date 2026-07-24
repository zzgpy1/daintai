import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation, FavoriteStation } from '@/types/radio'

export const usePlayerStore = defineStore('player', () => {
  const audio = ref<HTMLAudioElement | null>(null)
  const currentStation = ref<RadioStation | null>(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const volume = ref(0.8)
  const isMuted = ref(false)
  const error = ref<string | null>(null)
  const favorites = ref<FavoriteStation[]>([])

  const isFavorite = computed(() => {
    if (!currentStation.value) return false
    return favorites.value.some(fav => fav.stationuuid === currentStation.value!.stationuuid)
  })

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
    }
  }

  const playStation = async (station: RadioStation) => {
    try {
      if (!audio.value) initAudio()

      error.value = null
      isLoading.value = true

      if (currentStation.value?.stationuuid !== station.stationuuid) {
        audio.value!.pause()
        currentStation.value = station
        audio.value!.src = station.url_resolved || station.url
        audio.value!.load()
      }

      await audio.value!.play()
      addToHistory(station)
    } catch (err) {
      error.value = '播放失败，请稍后重试'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const pauseStation = () => {
    if (audio.value) audio.value.pause()
  }

  const resumeStation = async () => {
    if (audio.value && currentStation.value) {
      try {
        await audio.value.play()
      } catch (err) {
        console.error('恢复播放失败:', err)
      }
    }
  }

  const stopStation = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
    }
    isPlaying.value = false
    currentStation.value = null
  }

  const setVolume = (newVolume: number) => {
    volume.value = Math.max(0, Math.min(1, newVolume))
    if (audio.value) audio.value.volume = volume.value
    localStorage.setItem('radio-volume', volume.value.toString())
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audio.value) audio.value.muted = isMuted.value
    localStorage.setItem('radio-muted', isMuted.value.toString())
  }

  const toggleFavorite = (station: RadioStation) => {
    const index = favorites.value.findIndex(fav => fav.stationuuid === station.stationuuid)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push({
        stationuuid: station.stationuuid,
        name: station.name,
        url: station.url,
        favicon: station.favicon || '',
        country: station.country || '',
        addedAt: new Date().toISOString()
      })
    }
    saveFavorites()
  }

  const isStationFavorite = (stationUuid: string) => {
    return favorites.value.some(fav => fav.stationuuid === stationUuid)
  }

  const saveFavorites = () => {
    localStorage.setItem('radio-favorites', JSON.stringify(favorites.value))
  }

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('radio-favorites')
      if (saved) favorites.value = JSON.parse(saved)
    } catch (err) {
      console.error('加载收藏夹失败:', err)
    }
  }

  const addToHistory = (station: RadioStation) => {
    // 历史记录由 history store 处理
  }

  const restoreFromStorage = () => {
    const savedVolume = localStorage.getItem('radio-volume')
    if (savedVolume) volume.value = parseFloat(savedVolume)

    const savedMuted = localStorage.getItem('radio-muted')
    if (savedMuted) isMuted.value = savedMuted === 'true'

    loadFavorites()
  }

  return {
    audio,
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    error,
    favorites,
    isFavorite,
    initAudio,
    playStation,
    pauseStation,
    resumeStation,
    stopStation,
    setVolume,
    toggleMute,
    toggleFavorite,
    isStationFavorite,
    restoreFromStorage
  }
})
