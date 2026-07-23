import type { RadioStation, ApiResponse } from '@/types/radio'

const API_BASE = 'https://de1.api.radio-browser.info'

export const radioAPI = {
  async searchStations(params: any = {}): Promise<RadioStation[]> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, String(value))
    })
    const response = await fetch(`${API_BASE}/json/stations/search?${query}`)
    if (!response.ok) throw new Error('搜索失败')
    return response.json()
  },

  async getTopStations(limit: number = 50): Promise<ApiResponse<RadioStation[]>> {
    const response = await fetch(`${API_BASE}/json/stations/topvote/${limit}`)
    if (!response.ok) throw new Error('获取热门电台失败')
    const data = await response.json()
    return { success: true, data, source: 'radio-browser' }
  },

  async getLatestStations(limit: number = 50): Promise<RadioStation[]> {
    const response = await fetch(`${API_BASE}/json/stations/lastchange/${limit}`)
    if (!response.ok) throw new Error('获取最新电台失败')
    return response.json()
  },

  async getRandomStations(limit: number = 50): Promise<ApiResponse<RadioStation[]>> {
    const response = await fetch(`${API_BASE}/json/stations/search?order=random&limit=${limit}&hidebroken=true`)
    if (!response.ok) throw new Error('获取随机电台失败')
    const data = await response.json()
    return { success: true, data, source: 'radio-browser' }
  },

  async getStationByUUID(uuid: string): Promise<RadioStation | null> {
    const response = await fetch(`${API_BASE}/json/stations/byuuid/${uuid}`)
    if (!response.ok) return null
    const data = await response.json()
    return data.length > 0 ? data[0] : null
  }
}
