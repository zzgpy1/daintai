import { defineStore } from 'pinia'
import { ref, computed, watch, onUnmounted } from 'vue'
import type { RadioStation } from '@/types/radio'
import { useHistoryStore } from './history'
import { useFavoritesStore } from './favorites'
import { useToastStore } from './toast'
import { useSettingsStore } from './settings'
import { platform } from '@/utils/platform'
import { PLAYER_CONSTANTS } from '@/utils/constants'

export const usePlayerStore = defineStore('player', () => {
  // ============================================
  // 依赖Store
  // ============================================
  const historyStore = useHistoryStore()
  const favoritesStore = useFavoritesStore()
  const toastStore = useToastStore()
  const settingsStore = useSettingsStore()

  // ============================================
  // 状态
  // ============================================
  const audio = ref<HTMLAudioElement | null>(null)
  const currentStation = ref<RadioStation | null>(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const isBuffering = ref(false)
  const error = ref<string | null>(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(PLAYER_CONSTANTS.DEFAULT_VOLUME)
  const isMuted = ref(false)
  const playbackRate = ref(PLAYER_CONSTANTS.DEFAULT_PLAYBACK_RATE)
  const playFailureCallback = ref<((station: RadioStation) => void) | null>(null)

  // 睡眠定时器
  const sleepTimer = ref<number | null>(null)
  const sleepTimerRemaining = ref<number>(0)
  const sleepTimerInterval = ref<NodeJS.Timeout | null>(null)

  // 内存泄漏防护
  const eventListeners: Array<{ element: EventTarget; event: string; handler: EventListener }> = []

  // ============================================
  // 计算属性
  // ============================================
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

  // ============================================
  // 辅助方法
  // ============================================
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const addEventListener = <K extends keyof HTMLElementEventMap>(
    element: EventTarget,
    event: string,
    handler: EventListener
  ) => {
    element.addEventListener(event, handler)
    eventListeners.push({ element, event, handler })
  }

  // ============================================
  // 音频初始化
  // ============================================
  const initAudio = () => {
    if (audio.value) {
      // 如果已存在，先清理
      cleanupAudio()
    }

    audio.value = new Audio()
    audio.value.preload = 'metadata'
    audio.value.volume = volume.value
    audio.value.muted = isMuted.value
    audio.value.playbackRate = playbackRate.value

    // 设置音频属性
    audio.value.setAttribute('playsinline', 'true')
    audio.value.setAttribute('webkit-playsinline', 'true')

    // ============================================
    // 音频事件监听
    // ============================================
    addEventListener(audio.value, 'loadstart', () => {
      isLoading.value = true
      isBuffering.value = false
    })

    addEventListener(audio.value, 'canplay', () => {
      isLoading.value = false
      isBuffering.value = false
    })

    addEventListener(audio.value, 'play', () => {
      isPlaying.value = true
      isLoading.value = false
      isBuffering.value = false
      error.value = null
      
      if (currentStation.value) {
        historyStore.addToHistory(currentStation.value)
        // 请求唤醒锁
        requestWakeLock()
        // 更新媒体会话
        updateMediaSession(currentStation.value)
      }
    })

    addEventListener(audio.value, 'pause', () => {
      isPlaying.value = false
    })

    addEventListener(audio.value, 'ended', () => {
      isPlaying.value = false
      // 自动播放下一个
      if (settingsStore.autoPlayNext) {
        // 触发下一个电台播放事件
        window.dispatchEvent(new CustomEvent('player:next'))
      }
    })

    addEventListener(audio.value, 'timeupdate', () => {
      if (audio.value) {
        currentTime.value = audio.value.currentTime || 0
        duration.value = audio.value.duration || 0
      }
    })

    addEventListener(audio.value, 'loadedmetadata', () => {
      if (audio.value) {
        duration.value = audio.value.duration || 0
      }
    })

    addEventListener(audio.value, 'waiting', () => {
      isBuffering.value = true
    })

    addEventListener(audio.value, 'canplaythrough', () => {
      isBuffering.value = false
    })

    addEventListener(audio.value, 'error', (e) => {
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

    // 音频焦点丢失处理
    addEventListener(audio.value, 'pause', () => {
      // 如果是因为音频焦点丢失，自动恢复
      if (document.hidden) {
        // 后台播放保持
      }
    })
  }

  const cleanupAudio = () => {
    if (audio.value) {
      // 移除所有事件监听
      for (const listener of eventListeners) {
        try {
          listener.element.removeEventListener(listener.event, listener.handler)
        } catch (e) {
          // 忽略
        }
      }
      eventListeners.length = 0
      
      // 停止播放并释放资源
      audio.value.pause()
      audio.value.src = ''
      audio.value.load()
    }
    audio.value = null
  }

  // ============================================
  // 唤醒锁
  // ============================================
  let wakeLock: any = null

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await (navigator as any).wakeLock.request('screen')
        wakeLock.addEventListener('release', () => {
          console.log('屏幕唤醒锁已释放')
        })
      }
    } catch (err) {
      console.log('无法获取屏幕唤醒锁:', err)
    }
  }

  const releaseWakeLock = () => {
    if (wakeLock) {
      try {
        wakeLock.release()
      } catch (e) {
        // 忽略
      }
      wakeLock = null
    }
  }

  // ============================================
  // 媒体会话
  // ============================================
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

  // ============================================
  // 核心播放方法
  // ============================================
  const playStation = async (station: RadioStation): Promise<void> => {
    if (!audio.value) {
      initAudio()
    }

    try {
      error.value = null
      isLoading.value = true
      isBuffering.value = false

      // 如果正在播放其他电台，先停止
      if (currentStation.value && currentStation.value.stationuuid !== station.stationuuid) {
        audio.value!.pause()
      }

      currentStation.value = station
      const streamUrl = station.url_resolved || station.url

      audio.value!.src = streamUrl
      audio.value!.volume = volume.value
      audio.value!.muted = isMuted.value

      // 尝试播放
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

  const pauseStation = () => {
    if (audio.value) {
      audio.value.pause()
    }
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
    releaseWakeLock()
    
    // 清理媒体会话
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = null
        navigator.mediaSession.playbackState = 'none'
      } catch (e) {
        // 忽略
      }
    }
  }

  // ============================================
  // 音量控制
  // ============================================
  const setVolume = (value: number) => {
    const newVolume = Math.max(PLAYER_CONSTANTS.MIN_VOLUME, 
                              Math.min(PLAYER_CONSTANTS.MAX_VOLUME, value))
    volume.value = newVolume
    if (audio.value) {
      audio.value.volume = newVolume
    }
    settingsStore.setVolume(newVolume)
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audio.value) {
      audio.value.muted = isMuted.value
    }
    settingsStore.setMuted(isMuted.value)
  }

  const setPlaybackRate = (rate: number) => {
    playbackRate.value = Math.max(PLAYER_CONSTANTS.MIN_PLAYBACK_RATE, 
                                  Math.min(PLAYER_CONSTANTS.MAX_PLAYBACK_RATE, rate))
    if (audio.value) {
      audio.value.playbackRate = playbackRate.value
    }
  }

  const seek = (time: number) => {
    if (audio.value && duration.value > 0) {
      const target = Math.max(0, Math.min(duration.value, time))
      audio.value.currentTime = target
      currentTime.value = target
    }
  }

  // ============================================
  // 睡眠定时器
  // ============================================
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
    const secs = (sleepTimerRemaining.value % 1) * 60
    return `${String(mins).padStart(2, '0')}:${String(Math.floor(secs)).padStart(2, '0')}`
  }

  // ============================================
  // 恢复状态
  // ============================================
  const restoreFromStorage = () => {
    try {
      const savedVolume = localStorage.getItem('radio-volume')
      if (savedVolume) {
        volume.value = parseFloat(savedVolume)
      }
      
      const savedMuted = localStorage.getItem('radio-muted')
      if (savedMuted) {
        isMuted.value = savedMuted === 'true'
      }
    } catch (error) {
      console.error('从本地存储恢复状态失败:', error)
    }
  }

  // ============================================
  // 清理资源
  // ============================================
  const cleanup = () => {
    cleanupAudio()
    clearSleepTimer()
    releaseWakeLock()
    eventListeners.length = 0
  }

  // ============================================
  // 设置播放失败回调
  // ============================================
  const setPlayFailureCallback = (callback: ((station: RadioStation) => void) | null) => {
    playFailureCallback.value = callback
  }

  return {
    // 状态
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
    
    // 计算属性
    isFavorite,
    progress,
    formattedCurrentTime,
    formattedDuration,
    isCurrentStation,
    
    // 方法
    initAudio,
    playStation,
    pauseStation,
    resumeStation,
    togglePlayback,
    stopStation,
    setVolume,
    toggleMute,
    setPlaybackRate,
    seek,
    setSleepTimer,
    clearSleepTimer,
    getSleepTimerRemaining,
    restoreFromStorage,
    setPlayFailureCallback,
    cleanup
  }
})
