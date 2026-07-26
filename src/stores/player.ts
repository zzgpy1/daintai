import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation } from '@/types/radio'
import { useFavoritesStore } from './favorites'
import { useHistoryStore } from './history'
import { useToastStore } from './toast'
import { useSettingsStore } from './settings'
import { radioAPI } from '@/services/radioApi'

export const usePlayerStore = defineStore('player', () => {
  const favoritesStore = useFavoritesStore()
  const historyStore = useHistoryStore()
  const toastStore = useToastStore()
  const settingsStore = useSettingsStore()

  const audio = ref<HTMLAudioElement | null>(null)
  const currentStation = ref<RadioStation | null>(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(settingsStore.volume)
  const isMuted = ref(false)

  // 睡眠定时器
  const sleepTimer = ref<number | null>(null)
  const sleepTimerRemaining = ref(0)
  const sleepTimerInterval = ref<NodeJS.Timeout | null>(null)

  const isFavorite = computed(() => {
    if (!currentStation.value) return false
    return favoritesStore.isFavorite(currentStation.value.stationuuid)
  })

  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const initAudio = () => {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.preload = 'metadata'
      audio.value.volume = volume.value

      audio.value.addEventListener('play', () => {
        isPlaying.value = true
        isLoading.value = false
        if (currentStation.value) {
          historyStore.addToHistory(currentStation.value)
        }
      })

      audio.value.addEventListener('pause', () => {
        isPlaying.value = false
      })

      audio.value.addEventListener('ended', () => {
        isPlaying.value = false
        if (settingsStore.autoPlayNext) {
          // 自动播放下一个
        }
      })

      audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value?.currentTime || 0
        duration.value = audio.value?.duration || 0
      })

      audio.value.addEventListener('loadedmetadata', () => {
        duration.value = audio.value?.duration || 0
      })

      audio.value.addEventListener('error', (e) => {
        const mediaError = (e.target as HTMLAudioElement).error
        let msg = '播放失败'
        if (mediaError) {
          switch (mediaError.code) {
            case MediaError.MEDIA_ERR_NETWORK:
              msg = '网络错误'
              break
            case MediaError.MEDIA_ERR_DECODE:
              msg = '音频解码失败'
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              msg = '不支持的音频格式'
              break
          }
        }
        error.value = msg
        isPlaying.value = false
        isLoading.value = false
        toastStore.showError(msg)
      })
    }
  }

  const playStation = async (station: RadioStation) => {
    if (!audio.value) initAudio()

    try {
      error.value = null
      isLoading.value = true

      if (currentStation.value?.stationuuid !== station.stationuuid) {
        audio.value!.pause()
      }

      currentStation.value = station
      audio.value!.src = station.url_resolved || station.url
      audio.value!.volume = volume.value
      audio.value!.muted = isMuted.value

      await audio.value!.play()
      radioAPI.recordClick(station.stationuuid)

      // 更新媒体会话
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: station.name,
          artist: station.country || '全球电台'
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '播放失败'
      error.value = msg
      toastStore.showError(msg)
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

  const togglePlayback = async () => {
    if (isPlaying.value) {
      pauseStation()
    } else {
      await resumeStation()
    }
  }

  const stopStation = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
    }
    isPlaying.value = false
    currentStation.value = null
    error.value = null
  }

  const setVolume = (value: number) => {
    volume.value = Math.max(0, Math.min(1, value))
    if (audio.value) audio.value.volume = volume.value
    settingsStore.setVolume(volume.value)
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audio.value) audio.value.muted = isMuted.value
    settingsStore.setMuted(isMuted.value)
  }

  const seek = (time: number) => {
    if (audio.value && duration.value > 0) {
      audio.value.currentTime = Math.max(0, Math.min(duration.value, time))
    }
  }

  // 睡眠定时器
  const setSleepTimer = (minutes: number) => {
    clearSleepTimer()
    sleepTimer.value = minutes
    sleepTimerRemaining.value = minutes

    sleepTimerInterval.value = setInterval(() => {
      sleepTimerRemaining.value--
      if (sleepTimerRemaining.value <= 0) {
        clearSleepTimer()
        stopStation()
        toastStore.showInfo('⏰ 定时已到，播放已停止')
      }
    }, 60000)

    toastStore.showSuccess(`⏰ ${minutes}分钟后停止播放`)
  }

  const clearSleepTimer = () => {
    if (sleepTimerInterval.value) {
      clearInterval(sleepTimerInterval.value)
      sleepTimerInterval.value = null
    }
    sleepTimer.value = null
    sleepTimerRemaining.value = 0
  }

  return {
    audio,
    currentStation,
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    volume,
    isMuted,
    sleepTimer,
    sleepTimerRemaining,
    isFavorite,
    progress,
    initAudio,
    playStation,
    pauseStation,
    resumeStation,
    togglePlayback,
    stopStation,
    setVolume,
    toggleMute,
    seek,
    setSleepTimer,
    clearSleepTimer,
    formatTime
  }
})
