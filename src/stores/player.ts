import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation } from '@/types/radio'
import { useFavoritesStore } from './favorites'
import { useHistoryStore } from './history'
import { useToastStore } from './toast'
import { useSettingsStore } from './settings'
import { radioAPI } from '@/services/radioApi'
import { useRadioStore } from './radio'

export const usePlayerStore = defineStore('player', () => {
  const favoritesStore = useFavoritesStore()
  const historyStore = useHistoryStore()
  const toastStore = useToastStore()
  const settingsStore = useSettingsStore()
  const radioStore = useRadioStore()

  const audio = ref<HTMLAudioElement | null>(null)
  const currentStation = ref<RadioStation | null>(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(settingsStore.volume)
  const isMuted = ref(false)
  const isBuffering = ref(false)

  let playPromise: Promise<void> | null = null

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
      audio.value.crossOrigin = 'anonymous'

      audio.value.addEventListener('play', () => {
        isPlaying.value = true
        isLoading.value = false
        isBuffering.value = false
        if (currentStation.value) {
          historyStore.addToHistory(currentStation.value)
        }
      })

      audio.value.addEventListener('pause', () => {
        isPlaying.value = false
      })

      audio.value.addEventListener('waiting', () => {
        isBuffering.value = true
      })

      audio.value.addEventListener('canplay', () => {
        isBuffering.value = false
      })

      audio.value.addEventListener('ended', () => {
        isPlaying.value = false
      })

      audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value?.currentTime || 0
        duration.value = audio.value?.duration || 0
      })

      audio.value.addEventListener('loadedmetadata', () => {
        duration.value = audio.value?.duration || 0
      })

      audio.value.addEventListener('error', (e) => {
        if (!audio.value?.src || audio.value?.src === '') return
        const mediaError = (e.target as HTMLAudioElement).error
        if (mediaError) {
          // 如果是网络错误或解码错误，认为该源不可用 -> 标记失效
          if (mediaError.code === MediaError.MEDIA_ERR_NETWORK ||
              mediaError.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ||
              mediaError.code === MediaError.MEDIA_ERR_DECODE) {
            if (currentStation.value) {
              const station = currentStation.value
              console.warn('播放失败，标记失效:', station.name)
              radioStore.markInvalid(station)
              toastStore.showError('该电台源已失效，已自动移除')
              // 停止播放
              stopStation()
            }
            return
          }
          // 其他错误仅记录日志
          let msg = '播放失败'
          switch (mediaError.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              msg = '播放被中止'
              break
            default:
              msg = `播放错误 (${mediaError.code})`
          }
          error.value = msg
          isPlaying.value = false
          isLoading.value = false
          isBuffering.value = false
          if (import.meta.env.DEV) {
            toastStore.showError(msg)
          }
          console.warn('播放错误:', msg)
        }
      })
    }
  }

  const playStation = async (station: RadioStation) => {
    if (!audio.value) initAudio()

    try {
      error.value = null
      isLoading.value = true
      isBuffering.value = false

      if (currentStation.value?.stationuuid === station.stationuuid && isPlaying.value) {
        pauseStation()
        isLoading.value = false
        return
      }

      if (audio.value && !audio.value.paused) {
        audio.value.pause()
        if (playPromise) {
          await playPromise.catch(() => {})
          playPromise = null
        }
      }

      currentStation.value = station
      const streamUrl = station.url_resolved || station.url
      if (!streamUrl) {
        throw new Error('电台流地址无效')
      }

      audio.value.src = streamUrl
      audio.value.volume = volume.value
      audio.value.muted = isMuted.value
      audio.value.crossOrigin = 'anonymous'

      audio.value.load()
      playPromise = audio.value.play()
      await playPromise

      radioAPI.recordClick(station.stationuuid).catch(() => {})

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: station.name,
          artist: station.country || '国内电台'
        })
      }

      toastStore.showSuccess(`正在播放: ${station.name}`)
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
          console.warn('播放被中断:', err.message)
          return
        }
        const msg = err.message || '播放失败，请重试'
        error.value = msg
        if (import.meta.env.DEV) {
          toastStore.showError(msg)
        }
        console.error('播放错误:', err)
      }
    } finally {
      isLoading.value = false
      playPromise = null
    }
  }

  const pauseStation = () => {
    if (audio.value) {
      audio.value.pause()
      if (playPromise) {
        playPromise.catch(() => {})
        playPromise = null
      }
    }
  }

  const resumeStation = async () => {
    if (audio.value && currentStation.value) {
      try {
        playPromise = audio.value.play()
        await playPromise
      } catch (err) {
        console.error('恢复播放失败:', err)
        toastStore.showError('恢复播放失败')
      } finally {
        playPromise = null
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
      audio.value.src = ''
      if (playPromise) {
        playPromise.catch(() => {})
        playPromise = null
      }
    }
    isPlaying.value = false
    currentStation.value = null
    error.value = null
    isBuffering.value = false
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
    isBuffering,
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
