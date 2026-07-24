// 在 useRadioStore 中添加以下方法

const loadChineseStations = async (limit: number = 30) => {
  try {
    isLoadingStations.value = true
    error.value = null
    
    const [tagResult, countryResult] = await Promise.all([
      radioAPI.searchStations({ tag: 'chinese', order: 'random', limit: Math.ceil(limit/2), hidebroken: true }),
      radioAPI.searchStations({ countrycode: 'CN', order: 'random', limit: Math.ceil(limit/2), hidebroken: true })
    ])
    
    const merged = new Map<string, RadioStation>()
    ;[...tagResult, ...countryResult].forEach(station => {
      if (!merged.has(station.stationuuid)) {
        merged.set(station.stationuuid, station)
      }
    })
    
    const result = Array.from(merged.values()).slice(0, limit)
    stations.value = result
    return result
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载中文电台失败'
    return []
  } finally {
    isLoadingStations.value = false
  }
}

// 在 return 中导出
return {
  // ... 现有导出 ...
  loadChineseStations
}
