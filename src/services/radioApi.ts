// 在 searchStations 方法中，增加中文搜索优化
async searchStations(params: RadioSearchParams = {}): Promise<RadioStation[]> {
  return this.retryWithFallback(async () => {
    const searchParams: any = {}
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams[key] = value.toString().trim()
      }
    })

    // 如果搜索中文，增加 tag 联合搜索
    if (searchParams.name && /[\u4e00-\u9fff]/.test(searchParams.name)) {
      const [nameResults, tagResults] = await Promise.all([
        this.currentAPI.get('/json/stations/search', { 
          params: { ...searchParams, limit: searchParams.limit || 50, hidebroken: true }
        }),
        this.currentAPI.get('/json/stations/search', {
          params: { tag: searchParams.name, order: 'random', limit: Math.ceil((searchParams.limit || 50) / 2), hidebroken: true }
        })
      ])

      const merged = new Map()
      ;[...nameResults.data, ...tagResults.data].forEach((station: RadioStation) => {
        if (!merged.has(station.stationuuid)) {
          merged.set(station.stationuuid, station)
        }
      })
      
      return Array.from(merged.values()).slice(0, searchParams.limit || 50)
    }

    const response = await this.currentAPI.get('/json/stations/search', {
      params: searchParams,
      headers: { 'User-Agent': this.userAgent }
    })
    
    return response.data || []
  })
}
