import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation, HistoryItem } from '@/types/radio'

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryItem[]>([])
  const maxHistoryItems = ref(100)

  const totalVisited = computed(() => history.value.length)
  const uniqueStations = computed(() => {
    const unique = new Set(history.value.map(item => item.station.stationuuid))
    return unique.size
  })

  const addToHistory = (station: RadioStation) => {
    const timestamp = Date.now()
    const recentThreshold = 5 * 60 * 1000
    
    const existingIndex = history.value.findIndex(
      item => item.station.stationuuid === station.stationuuid && 
               (timestamp - item.timestamp) < recentThreshold
    )
    
    if (existingIndex !== -1) {
      history.value[existingIndex].timestamp = timestamp
      const item = history.value.splice(existingIndex, 1)[0]
      history.value.unshift(item)
    } else {
      history.value.unshift({ station, timestamp })
    }
    
    if (history.value.length > maxHistoryItems.value) {
      history.value = history.value.slice(0, maxHistoryItems.value)
    }
    
    saveHistory()
  }

  const removeFromHistory = (timestamp: number) => {
    const index = history.value.findIndex(item => item.timestamp === timestamp)
    if (index !== -1) {
      history.value.splice(index, 1)
      saveHistory()
    }
  }

  const clearHistory = () => {
    history.value = []
    saveHistory()
  }

  const saveHistory = () => {
    localStorage.setItem('radio-history', JSON.stringify(history.value))
  }

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('radio-history')
      if (saved) {
        history.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
      history.value = []
    }
  }

  return {
    history,
    maxHistoryItems,
    totalVisited,
    uniqueStations,
    addToHistory,
    removeFromHistory,
    clearHistory,
    saveHistory,
    loadHistory
  }
})
