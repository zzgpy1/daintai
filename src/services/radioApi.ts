// src/services/radioApi.ts
import axios from 'axios'
import type { RadioStation, Country, Language } from '@/types/radio'

const BASE_URL = 'https://de1.api.radio-browser.info'

export const radioAPI = {
  async searchStations(params: any): Promise<RadioStation[]> {
    const response = await axios.get(`${BASE_URL}/json/stations/search`, { params })
    return response.data || []
  },

  async getTopStations(limit: number = 50): Promise<{ data: RadioStation[] }> {
    const response = await axios.get(`${BASE_URL}/json/stations/topvote/${limit}`)
    return { data: response.data || [] }
  },

  async getRandomStations(limit: number = 50): Promise<{ data: RadioStation[] }> {
    const response = await axios.get(`${BASE_URL}/json/stations/random`, { params: { limit } })
    return { data: response.data || [] }
  },

  async getCountries(): Promise<{ data: Country[] }> {
    const response = await axios.get(`${BASE_URL}/json/countries`)
    return { data: response.data || [] }
  },

  async getStationByUUID(uuid: string): Promise<RadioStation | null> {
    const response = await axios.get(`${BASE_URL}/json/stations/byuuid/${uuid}`)
    return response.data && response.data.length > 0 ? response.data[0] : null
  }
}
