import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation } from '@/types/radio'
import { useFavoritesStore } from './favorites'
import { useHistoryStore } from './history'
import { useToastStore } from './toast'
import { useSettingsStore } from './settings'
import { radioAPI } from '@/services/radioApi'

// 检测是否为 HLS 流
const isHLS = (url: string): boolean => {
  return url.includes('.m3u8') || url.includes('m3u8')
}

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

  const initAudio = () => {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.preload = 'metadata'
      audio.value.volume = volume.value

      // 事件绑定
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
              msg = '网络错误，请检查网络连接'
              break
            case MediaError.MEDIA_ERR_DECODE:
              msg = '音频解码失败（可能不支持的格式）'
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              msg = '不支持的音频格式（尝试使用其他电台）'
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
      const streamUrl = station.url_resolved || station.url

      // 检测 HLS 流
      if (isHLS(streamUrl)) {
        // 尝试使用 HLS.js 或提示用户
        toastStore.showWarning('此电台使用 HLS 流，可能无法在浏览器中播放，请尝试其他电台')
        // 仍然尝试播放，但可能失败
      }

      audio.value!.src = streamUrl
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

  // ... 其他方法（pause, resume, toggle, stop, volume, mute, seek, sleep timer 等）保持不变
  // 确保导出所有方法
})
