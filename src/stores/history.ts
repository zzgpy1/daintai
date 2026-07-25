import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HistoryItem, RadioStation } from '@/types/radio'

export const useHistoryStore = defineStore('history', () => {
  // 状态
  const history = ref<HistoryItem[]>([])
  const maxHistoryItems = 1000

  // 计算属性
  const count = computed(() => history.value.length)
  const isEmpty = computed(() => history.value.length === 0)

  // 添加到历史
  const addToHistory = (station: RadioStation) => {
    const timestamp = Date.now()
    
    // 检查5分钟内是否有相同电台
    const recentThreshold = 5 * 60 * 1000
    const existingIndex = history.value.findIndex(
      item => item.station.stationuuid === station.stationuuid && 
               (timestamp - item.timestamp) < recentThreshold
    )
    
    if (existingIndex !== -1) {
      // 更新已有记录
      history.value[existingIndex].timestamp = timestamp
      const item = history.value.splice(existingIndex, 1)[0]
      history.value.unshift(item)
    } else {
      // 添加新记录
      history.value.unshift({
        station,
        timestamp
      })
    }
    
    // 限制数量
    if (history.value.length > maxHistoryItems) {
      history.value = history.value.slice(0, maxHistoryItems)
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
  const getRecentStations = (limit: number = 20): RadioStation[] => {
    const unique = new Map<string, HistoryItem>()
    for (const item of history.value) {
      if (!unique.has(item.station.stationuuid)) {
        unique.set(item.station.stationuuid, item)
      }
      if (unique.size >= limit) break
    }
    return Array.from(unique.values()).map(item => item.station)
  }

  // 检查是否在历史中
  const isInHistory = (stationUuid: string): boolean => {
    return history.value.some(item => item.station.stationuuid === stationUuid)
  }

  // 获取今日历史
  const getTodayHistory = (): HistoryItem[] => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    return history.value.filter(item => item.timestamp >= todayStart)
  }

  // 保存到本地存储
  const saveHistory = () => {
    try {
      localStorage.setItem('radio-history', JSON.stringify(history.value))
    } catch (error) {
      console.error('保存历史失败:', error)
    }
  }

  // 从本地存储加载
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('radio-history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          history.value = parsed
        }
      }
    } catch (error) {
      console.error('加载历史失败:', error)
      history.value = []
    }
  }

  return {
    // 状态
    history,
    maxHistoryItems,
    
    // 计算属性
    count,
    isEmpty,
    
    // 方法
    addToHistory,
    removeFromHistory,
    clearHistory,
    getRecentStations,
    isInHistory,
    getTodayHistory,
    saveHistory,
    loadHistory
  }
})
