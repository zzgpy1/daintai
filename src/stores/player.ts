// src/stores/player.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { RadioStation, PlayerState } from '@/types/radio'
import { useHistoryStore } from './history'
import { useFavoritesStore } from './favorites'
import { useToastStore } from './toast'
import { useSettingsStore } from './settings'

export const usePlayerStore = defineStore('player', () => {
  // 状态
  const audio = ref<HTMLAudioElement | null>(null)
  const currentStation = ref<RadioStation | null>(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const volume = ref(0.8)
  const isMuted = ref(false)
  const error = ref<string | null>(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const buffered = ref(0)
  
  // 睡眠定时器
  const sleepTimerMinutes = ref<number | null>(null)
  const sleepTimerRemaining = ref<number | null>(null)
  const sleepTimerInterval = ref<NodeJS.Timeout | null>(null)
  const sleepTimerEndTime = ref<number | null>(null)

  // 音效
  const bassBoost = ref(0)
  const equalizerPreset = ref<'flat' | 'rock' | 'pop' | 'jazz' | 'classical' | 'custom'>('flat')
  const customEq = ref<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

  const historyStore = useHistoryStore()
  const favoritesStore = useFavoritesStore()
  const toastStore = useToastStore()
  const settingsStore = useSettingsStore()

  // 计算属性
  const isFavorite = computed(() => {
    if (!currentStation.value) return false
    return favoritesStore.isFavorite(currentStation.value.stationuuid)
  })

  const playerState = computed<PlayerState>(() => ({
    isPlaying: isPlaying.value,
    currentStation: currentStation.value,
    volume: volume.value,
    isMuted: isMuted.value,
    isLoading: isLoading.value,
    error: error.value,
    currentTime: currentTime.value,
    duration: duration.value
  }))

  const sleepTimerActive = computed(() => sleepTimerRemaining.value !== null && sleepTimerRemaining.value > 0)

  // 初始化音频
  const initAudio = () => {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.preload = 'metadata'
      
      // 设置音量
      audio.value.volume = volume.value
      audio.value.muted = isMuted.value

      // 事件监听
      audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value?.currentTime || 0
        duration.value = audio.value?.duration || 0
      })

      audio.value.addEventListener('progress', () => {
        if (audio.value) {
          const bufferedEnd = audio.value.buffered.length > 0 
            ? audio.value.buffered.end(audio.value.buffered.length - 1) 
            : 0
          buffered.value = duration.value > 0 ? bufferedEnd / duration.value : 0
        }
      })

      audio.value.addEventListener('play', () => {
        isPlaying.value = true
        isLoading.value = false
        error.value = null
      })

      audio.value.addEventListener('pause', () => {
        isPlaying.value = false
      })

      audio.value.addEventListener('ended', () => {
        isPlaying.value = false
        handleStationEnded()
      })

      audio.value.addEventListener('error', (e) => {
        console.error('音频播放错误:', e)
        isPlaying.value = false
        isLoading.value = false
        error.value = '播放失败，请检查网络连接或尝试其他电台'
        toastStore.showError(error.value)
      })

      audio.value.addEventListener('waiting', () => {
        isLoading.value = true
      })

      audio.value.addEventListener('canplay', () => {
        isLoading.value = false
      })

      // 恢复保存的音量
      const savedVolume = settingsStore.getVolume()
      if (savedVolume !== null) {
        volume.value = savedVolume
        if (audio.value) audio.value.volume = savedVolume
      }

      const savedMuted = settingsStore.getMuted()
      if (savedMuted !== null) {
        isMuted.value = savedMuted
        if (audio.value) audio.value.muted = savedMuted
      }
    }
  }

  // 播放电台
  const playStation = async (station: RadioStation, retryCount = 0): Promise<boolean> => {
    const maxRetries = 3
    
    try {
      initAudio()
      
      if (!audio.value) {
        throw new Error('音频初始化失败')
      }

      // 如果正在播放不同电台，停止当前
      if (currentStation.value && currentStation.value.stationuuid !== station.stationuuid) {
        audio.value.pause()
      }

      // 更新当前电台
      currentStation.value = station
      isLoading.value = true
      error.value = null

      // 获取流URL
      const streamUrl = station.url_resolved || station.url
      if (!streamUrl) {
        throw new Error('电台流地址无效')
      }

      // 设置音频源
      audio.value.src = streamUrl
      audio.value.load()

      // 尝试播放
      await audio.value.play()
      
      // 播放成功
      isPlaying.value = true
      isLoading.value = false
      
      // 添加到历史
      historyStore.addToHistory(station)
      
      // 更新媒体会话
      updateMediaSession(station)
      
      // 请求唤醒锁
      requestWakeLock()
      
      return true
      
    } catch (err) {
      console.error(`播放失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, err)
      
      if (retryCount < maxRetries) {
        // 重试
        const delay = Math.pow(2, retryCount) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        return playStation(station, retryCount + 1)
      }
      
      // 所有重试失败
      error.value = '播放失败，请稍后重试或选择其他电台'
      isPlaying.value = false
      isLoading.value = false
      toastStore.showError(error.value)
      return false
    }
  }

  // 暂停播放
  const pauseStation = () => {
    if (audio.value) {
      audio.value.pause()
    }
    releaseWakeLock()
  }

  // 恢复播放
  const resumeStation = async () => {
    if (audio.value && currentStation.value) {
      try {
        await audio.value.play()
        requestWakeLock()
      } catch (err) {
        console.error('恢复播放失败:', err)
        toastStore.showError('恢复播放失败')
      }
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
    releaseWakeLock()
    clearSleepTimer()
  }

  // 设置音量
  const setVolume = (value: number) => {
    const newVolume = Math.max(0, Math.min(1, value))
    volume.value = newVolume
    if (audio.value) {
      audio.value.volume = newVolume
    }
    settingsStore.saveVolume(newVolume)
  }

  // 切换静音
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audio.value) {
      audio.value.muted = isMuted.value
    }
    settingsStore.saveMuted(isMuted.value)
  }

  // 切换收藏
  const toggleFavorite = () => {
    if (!currentStation.value) return
    favoritesStore.toggleFavorite(currentStation.value)
  }

  // 更新媒体会话
  const updateMediaSession = (station: RadioStation) => {
    if ('mediaSession' in navigator) {
      try {
        const artwork = station.favicon 
          ? [{ src: station.favicon, sizes: '512x512', type: 'image/png' }]
          : []
        
        navigator.mediaSession.metadata = new MediaMetadata({
          title: station.name,
          artist: station.country || '未知',
          album: '全球电台',
          artwork
        })

        navigator.mediaSession.setActionHandler('play', () => resumeStation())
        navigator.mediaSession.setActionHandler('pause', () => pauseStation())
        navigator.mediaSession.setActionHandler('stop', () => stopStation())
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious())
        navigator.mediaSession.setActionHandler('nexttrack', () => playNext())
      } catch (e) {
        console.log('媒体会话设置失败:', e)
      }
    }
  }

  // 唤醒锁
  let wakeLock: any = null

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await (navigator as any).wakeLock.request('screen')
      }
    } catch (err) {
      console.log('唤醒锁请求失败:', err)
    }
  }

  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release()
      wakeLock = null
    }
  }

  // 睡眠定时器
  const setSleepTimer = (minutes: number) => {
    // 清除旧定时器
    clearSleepTimer()
    
    sleepTimerMinutes.value = minutes
    sleepTimerRemaining.value = minutes
    sleepTimerEndTime.value = Date.now() + minutes * 60 * 1000
    
    // 启动定时器
    sleepTimerInterval.value = setInterval(() => {
      if (sleepTimerRemaining.value !== null) {
        sleepTimerRemaining.value -= 1
        
        // 显示剩余时间通知
        if (sleepTimerRemaining.value <= 5 && sleepTimerRemaining.value > 0) {
          toastStore.showInfo(`⏰ 将在 ${sleepTimerRemaining.value} 分钟后停止播放`)
        }
        
        // 时间到
        if (sleepTimerRemaining.value <= 0) {
          clearSleepTimer()
          stopStation()
          toastStore.showInfo('⏰ 睡眠定时器已到，播放已停止')
        }
      }
    }, 60000) // 每分钟更新一次
    
    toastStore.showSuccess(`⏰ 已设置 ${minutes} 分钟后停止播放`)
  }

  const clearSleepTimer = () => {
    if (sleepTimerInterval.value) {
      clearInterval(sleepTimerInterval.value)
      sleepTimerInterval.value = null
    }
    sleepTimerMinutes.value = null
    sleepTimerRemaining.value = null
    sleepTimerEndTime.value = null
  }

  // 电台切换辅助
  const playPrevious = () => {
    // 从历史中获取上一个电台
    const history = historyStore.history
    if (history.length > 0) {
      const prevStation = history[0].station
      if (prevStation.stationuuid !== currentStation.value?.stationuuid) {
        playStation(prevStation)
      }
    }
  }

  const playNext = () => {
    // 从收藏或历史中获取下一个电台
    const favorites = favoritesStore.favorites
    if (favorites.length > 0) {
      const currentIndex = favorites.findIndex(f => f.stationuuid === currentStation.value?.stationuuid)
      const nextIndex = (currentIndex + 1) % favorites.length
      playStation(favorites[nextIndex] as RadioStation)
    }
  }

  const handleStationEnded = () => {
    // 自动播放下一首（如果启用）
    const autoNext = settingsStore.getAutoNext()
    if (autoNext) {
      playNext()
    }
  }

  // 清理资源
  const cleanup = () => {
    clearSleepTimer()
    releaseWakeLock()
    if (audio.value) {
      audio.value.pause()
      audio.value.src = ''
    }
  }

  return {
    // 状态
    audio,
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    error,
    currentTime,
    duration,
    buffered,
    sleepTimerRemaining,
    sleepTimerActive,
    bassBoost,
    equalizerPreset,
    customEq,
    
    // 计算属性
    playerState,
    isFavorite,
    
    // 方法
    initAudio,
    playStation,
    pauseStation,
    resumeStation,
    stopStation,
    setVolume,
    toggleMute,
    toggleFavorite,
    setSleepTimer,
    clearSleepTimer,
    playPrevious,
    playNext,
    cleanup,
    updateMediaSession
  }
})
