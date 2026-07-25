import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation, HistoryItem } from '@/types/radio'
import { STORAGE_KEYS } from '@/utils/constants'

export const useHistoryStore = defineStore('history', () => {
  // 状态
  const history = ref<HistoryItem[]>([])
  const maxHistoryItems = ref(1000)

  // 计算属性
  const totalVisited = computed(() => history.value.length)
  
  const uniqueStations = computed(() => {
    const uniqueUuids = new Set(history.value.map(item => item.station.stationuuid))
    return uniqueUuids.size
  })

  // 添加到历史
  const addToHistory = (station: RadioStation) => {
    const timestamp = Date.now()
    
    // 5分钟内重复只更新时间
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

  // 移除历史记录
  const removeFromHistory = (timestamp: number) => {
    const index = history.value.findIndex(item => item.timestamp === timestamp)
    if (index !== -1) {
      history.value.splice(index, 1)
      saveHistory()
    }
  }

  // 清空历史
  const clearHistory = () => {
    history.value = []
    saveHistory()
  }

  // 获取最近播放
  const getRecentStations = (limit: number = 10) => {
    const uniqueStations = new Map<string, HistoryItem>()
    for (const item of history.value) {
      if (!uniqueStations.has(item.station.stationuuid)) {
        uniqueStations.set(item.station.stationuuid, item)
      }
      if (uniqueStations.size >= limit) break
    }
    return Array.from(uniqueStations.values())
  }

  // 获取上一首
  const getPreviousStation = (): RadioStation | null => {
    if (history.value.length < 2) return null
    return history.value[1].station
  }

  // 获取下一首
  const getNextStation = (): RadioStation | null => {
    if (history.value.length < 2) return null
    return history.value[0].station
  }

  // 保存历史
  const saveHistory = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.value))
    } catch (error) {
      console.error('保存历史失败:', error)
    }
  }

  // 加载历史
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY)
      if (saved) {
        history.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载历史失败:', error)
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
    getRecentStations,
    getPreviousStation,
    getNextStation,
    loadHistory,
    saveHistory
  }
})
