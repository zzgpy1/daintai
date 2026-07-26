export interface RadioStation {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  homepage: string
  favicon: string
  tags: string
  country: string
  countrycode: string
  state: string
  language: string
  languagecodes: string
  votes: number
  codec: string
  bitrate: number
  hls: number
  lastcheckok: number
  clickcount: number
  clicktrend: number
  geo_lat: number | null
  geo_long: number | null
}

export interface RadioSearchParams {
  name?: string
  countrycode?: string
  state?: string
  language?: string
  tag?: string
  limit?: number
  offset?: number
  order?: 'name' | 'clickcount' | 'clicktrend' | 'random'
  reverse?: boolean
  hidebroken?: boolean
}

export interface Country {
  name: string
  iso_3166_1: string
  stationcount: number
}

export interface Language {
  name: string
  iso_639: string
  stationcount: number
}

export interface Tag {
  name: string
  stationcount: number
}

export interface FavoriteStation {
  stationuuid: string
  name: string
  url: string
  favicon: string
  country: string
  addedAt: string
}

export interface HistoryItem {
  station: RadioStation
  timestamp: number
}
