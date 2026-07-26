import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation, HistoryItem } from '@/types/radio'

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryItem[]>([])
  const maxItems = 500

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('radio-history')
      if (saved) {
        history.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载历史失败:', error)
    }
  }

  const saveHistory = () => {
    try {
      localStorage.setItem('radio-history', JSON.stringify(history.value))
    } catch (error) {
      console.error('保存历史失败:', error)
    }
  }

  const addToHistory = (station: RadioStation) => {
    const timestamp = Date.now()
    
    // 移除重复记录（5分钟内相同电台）
    const existingIndex = history.value.findIndex(
      item => item.station.stationuuid === station.stationuuid && 
               (timestamp - item.timestamp) < 300000
    )
    
    if (existingIndex !== -1) {
      history.value[existingIndex].timestamp = timestamp
      const item = history.value.splice(existingIndex, 1)[0]
      history.value.unshift(item)
    } else {
      history.value.unshift({ station, timestamp })
    }

    // 限制数量
    if (history.value.length > maxItems) {
      history.value = history.value.slice(0, maxItems)
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

  const getHistoryCount = computed(() => history.value.length)

  const getTodayHistory = computed(() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    return history.value.filter(item => item.timestamp >= todayStart)
  })

  const getUniqueStations = computed(() => {
    const unique = new Map<string, HistoryItem>()
    for (const item of history.value) {
      if (!unique.has(item.station.stationuuid)) {
        unique.set(item.station.stationuuid, item)
      }
    }
    return Array.from(unique.values())
  })

  // 初始化加载
  loadHistory()

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryCount,
    getTodayHistory,
    getUniqueStations,
    loadHistory,
    saveHistory
  }
})
