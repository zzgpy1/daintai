// 在 searchStations 方法中增加中文搜索优化
async searchStations(params: RadioSearchParams = {}): Promise<RadioStation[]> {
  return this.retryWithFallback(async () => {
    const searchParams: any = {}
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        let processedValue = value.toString().trim()
        
        // 检测是否为中文字符
        const hasChinese = /[\u4e00-\u9fff]/.test(processedValue)
        if (hasChinese) {
          processedValue = processedValue.normalize('NFC')
        }
        searchParams[key] = processedValue
      }
    })

    // 如果搜索中文，增加模糊匹配参数
    if (searchParams.name && /[\u4e00-\u9fff]/.test(searchParams.name)) {
      // 使用 tag 和 name 联合搜索
      const [nameResults, tagResults] = await Promise.all([
        this.currentAPI.get('/json/stations/search', { 
          params: { ...searchParams, limit: searchParams.limit || 50, hidebroken: true },
          headers: { 'User-Agent': this.userAgent }
        }),
        this.currentAPI.get('/json/stations/search', {
          params: { 
            tag: searchParams.name, 
            order: 'random', 
            limit: Math.ceil((searchParams.limit || 50) / 2),
            hidebroken: true 
          },
          headers: { 'User-Agent': this.userAgent }
        })
      ])

      const merged = new Map()
      ;[...nameResults.data, ...tagResults.data].forEach((station: RadioStation) => {
        if (!merged.has(station.stationuuid)) {
          merged.set(station.stationuuid, station)
        }
      })
      
      const result = Array.from(merged.values()).slice(0, searchParams.limit || 50)
      return result
    }

    const response = await this.currentAPI.get('/json/stations/search', {
      params: searchParams,
      headers: {
        'Accept-Charset': 'UTF-8',
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': this.userAgent
      }
    })
    
    return response.data || []
  })
}
