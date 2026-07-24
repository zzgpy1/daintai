import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RadioStation, RadioSearchParams } from '@/types/radio'
import { radioAPI } from '@/services/radioApi'

export const useRadioStore = defineStore('radio', () => {
  // ... 现有状态保持不变 ...

  // 新增：加载国内推荐电台（中文）
  const loadChineseStations = async (limit: number = 30) => {
    try {
      isLoadingStations.value = true
      error.value = null
      
      // 同时搜索中文标签、中国地区、中文语言
      const [tagResult, countryResult, languageResult] = await Promise.all([
        radioAPI.searchStations({ tag: 'chinese', order: 'random', limit: Math.ceil(limit/3), hidebroken: true }),
        radioAPI.searchStations({ countrycode: 'CN', order: 'random', limit: Math.ceil(limit/3), hidebroken: true }),
        radioAPI.searchStations({ language: 'chinese', order: 'random', limit: Math.ceil(limit/3), hidebroken: true })
      ])
      
      // 合并去重
      const merged = new Map<string, RadioStation>()
      ;[...tagResult, ...countryResult, ...languageResult].forEach(station => {
        if (!merged.has(station.stationuuid)) {
          merged.set(station.stationuuid, station)
        }
      })
      
      // 随机排序并限制数量
      const result = Array.from(merged.values())
        .sort(() => 0.5 - Math.random())
        .slice(0, limit)
      
      // 追加到现有电台列表
      stations.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载中文电台失败'
      console.error('加载中文电台错误:', err)
      return []
    } finally {
      isLoadingStations.value = false
    }
  }

  // 新增：获取热门中文电台（用于首页推荐）
  const getChineseTopStations = async (limit: number = 20) => {
    try {
      const cached = localStorage.getItem('chinese_top_stations')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          return parsed.data
        }
      }
      
      const results = await loadChineseStations(limit)
      localStorage.setItem('chinese_top_stations', JSON.stringify({
        data: results,
        timestamp: Date.now()
      }))
      return results
    } catch (err) {
      console.error('获取中文热门电台失败:', err)
      return []
    }
  }

  return {
    // ... 现有导出 ...
    loadChineseStations,
    getChineseTopStations
  }
})
