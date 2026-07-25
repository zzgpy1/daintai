import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { RadioStation } from '@/types/radio'
import { useHistoryStore } from './history'
import { useFavoritesStore } from './favorites'
import { useToastStore } from './toast'
import { useSettingsStore } from './settings'
import { platform } from '@/utils/platform'

export const usePlayerStore = defineStore('player', () => {
  // 依赖其他Store
  const historyStore = useHistoryStore()
  const favoritesStore = useFavoritesStore()
  const toastStore = useToastStore()
  const settingsStore = useSettingsStore()

  // 状态
  const audio = ref<HTMLAudioElement | null>(null)
  const currentStation = ref<RadioStation | null>(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const isBuffering = ref(false)
  const error = ref<string | null>(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(settingsStore.volume)
  const isMuted = ref(false)
  const playbackRate = ref(1.0)

  // 睡眠定时器
  const sleepTimer = ref<number | null>(null)
  const sleepTimerRemaining = ref<number>(0)
  const sleepTimerInterval = ref<NodeJS.Timeout | null>(null)

  // 计算属性
  const isCurrentStation = (station: RadioStation) => {
    return currentStation.value?.stationuuid === station.stationuuid
  }

  const isFavorite = computed(() => {
    if (!currentStation.value) return false
    return favoritesStore.isFavorite(currentStation.value.stationuuid)
  })

  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() => {
    return formatTime(currentTime.value)
  })

  const formattedDuration = computed(() => {
    return formatTime(duration.value)
  })

  // 初始化音频
  const initAudio = () => {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.preload = 'metadata'
      audio.value.volume = volume.value
      audio.value.muted = isMuted.value
      audio.value.playbackRate = playbackRate.value

      // 事件监听
      audio.value.addEventListener('play', () => {
        isPlaying.value = true
        isLoading.value = false
        isBuffering.value = false
        if (currentStation.value) {
          historyStore.addToHistory(currentStation.value)
          updateMediaSession(currentStation.value)
        }
      })

      audio.value.addEventListener('pause', () => {
        isPlaying.value = false
      })

      audio.value.addEventListener('ended', () => {
        isPlaying.value = false
        if (settingsStore.autoPlayNext) {
          // 触发下一个电台播放
        }
      })

      audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value?.currentTime || 0
        duration.value = audio.value?.duration || 0
      })

      audio.value.addEventListener('loadedmetadata', () => {
        duration.value = audio.value?.duration || 0
      })

      audio.value.addEventListener('waiting', () => {
        isBuffering.value = true
      })

      audio.value.addEventListener('canplay', () => {
        isBuffering.value = false
      })

      audio.value.addEventListener('error', (e) => {
        const mediaError = (e.target as HTMLAudioElement).error
        let errorMessage = '播放失败，请稍后重试'
        if (mediaError) {
          switch (mediaError.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = '播放已中止'
              break
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = '网络错误，请检查连接'
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = '音频解码失败'
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = '不支持的音频格式'
              break
          }
        }
        error.value = errorMessage
        isPlaying.value = false
        isLoading.value = false
        isBuffering.value = false
        toastStore.showError(errorMessage)
      })
    }
  }

  // 播放电台
  const playStation = async (station: RadioStation): Promise<void> => {
    if (!audio.value) {
      initAudio()
    }

    try {
      error.value = null
      isLoading.value = true
      isBuffering.value = false

      if (currentStation.value && currentStation.value.stationuuid !== station.stationuuid) {
        audio.value!.pause()
      }

      currentStation.value = station
      const streamUrl = station.url_resolved || station.url

      audio.value!.src = streamUrl
      audio.value!.volume = volume.value
      audio.value!.muted = isMuted.value

      await audio.value!.play()
      
      // 记录点击
      try {
        const { radioAPI } = await import('@/services/radioApi')
        radioAPI.recordClick(station.stationuuid)
      } catch {
        // 静默失败
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : '播放失败'
      error.value = message
      toastStore.showError(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 暂停播放
  const pauseStation = () => {
    if (audio.value) {
      audio.value.pause()
    }
  }

  // 恢复播放
  const resumeStation = async () => {
    if (audio.value && currentStation.value) {
      try {
        await audio.value.play()
      } catch (err) {
        console.error('恢复播放失败:', err)
      }
    }
  }

  // 切换播放状态
  const togglePlayback = async () => {
    if (isPlaying.value) {
      pauseStation()
    } else {
      await resumeStation()
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
    error.value = null
  }

  // 设置音量
  const setVolume = (value: number) => {
    const newVolume = Math.max(0, Math.min(1, value))
    volume.value = newVolume
    if (audio.value) {
      audio.value.volume = newVolume
    }
    settingsStore.setVolume(newVolume)
  }

  // 切换静音
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audio.value) {
      audio.value.muted = isMuted.value
    }
    settingsStore.setMuted(isMuted.value)
  }

  // 跳转
  const seek = (time: number) => {
    if (audio.value && duration.value > 0) {
      const target = Math.max(0, Math.min(duration.value, time))
      audio.value.currentTime = target
      currentTime.value = target
    }
  }

  // 格式化时间
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 更新媒体会话
  const updateMediaSession = (station: RadioStation) => {
    if ('mediaSession' in navigator) {
      try {
        const artwork = station.favicon ? [{ src: station.favicon }] : []
        navigator.mediaSession.metadata = new MediaMetadata({
          title: station.name,
          artist: station.country || '全球电台',
          album: '在线广播',
          artwork
        })
      } catch (e) {
        // 忽略
      }
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
        toastStore.showInfo('⏰ 睡眠定时器已到，播放已停止')
      }
    }, 60000)

    toastStore.showSuccess(`⏰ 睡眠定时器已设置: ${minutes}分钟后停止`)
  }

  const clearSleepTimer = () => {
    if (sleepTimerInterval.value) {
      clearInterval(sleepTimerInterval.value)
      sleepTimerInterval.value = null
    }
    sleepTimer.value = null
    sleepTimerRemaining.value = 0
  }

  const getSleepTimerRemaining = (): string => {
    if (!sleepTimerRemaining.value) return '--:--'
    const mins = Math.floor(sleepTimerRemaining.value)
    const secs = Math.round((sleepTimerRemaining.value % 1) * 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // 恢复状态
  const restoreFromStorage = () => {
    const saved = localStorage.getItem('player-state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        if (state.volume) setVolume(state.volume)
        if (state.isMuted !== undefined) isMuted.value = state.isMuted
      } catch {
        // 忽略
      }
    }
  }

  // 清理
  const cleanup = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value.src = ''
    }
    clearSleepTimer()
  }

  return {
    audio,
    currentStation,
    isPlaying,
    isLoading,
    isBuffering,
    error,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    sleepTimer,
    sleepTimerRemaining,
    isFavorite,
    progress,
    formattedCurrentTime,
    formattedDuration,
    isCurrentStation,
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
    getSleepTimerRemaining,
    restoreFromStorage,
    cleanup
  }
})
