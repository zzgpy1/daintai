// 电台数据类型
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
  lastchangetime: string
  lastchangetime_iso8601: string
  codec: string
  bitrate: number
  hls: number
  lastcheckok: number
  lastchecktime: string
  lastchecktime_iso8601: string
  lastcheckoktime: string
  lastcheckoktime_iso8601: string
  lastlocalchecktime: string
  lastlocalchecktime_iso8601: string
  clicktimestamp: string
  clicktimestamp_iso8601: string
  clickcount: number
  clicktrend: number
  ssl_error: number
  geo_lat: number | null
  geo_long: number | null
  has_extended_info: boolean
}

// 搜索参数
export interface RadioSearchParams {
  name?: string
  country?: string
  countrycode?: string
  state?: string
  language?: string
  tag?: string
  codec?: string
  bitrateMin?: number
  bitrateMax?: number
  order?: 'name' | 'url' | 'homepage' | 'favicon' | 'tags' | 'country' | 'state' | 'language' | 'votes' | 'codec' | 'bitrate' | 'lastcheckok' | 'lastchecktime' | 'clicktimestamp' | 'clickcount' | 'clicktrend' | 'random'
  reverse?: boolean
  offset?: number
  limit?: number
  hidebroken?: boolean
}

// 国家
export interface Country {
  name: string
  iso_3166_1: string
  stationcount: number
}

// 语言
export interface Language {
  name: string
  iso_639: string
  stationcount: number
}

// 标签
export interface Tag {
  name: string
  stationcount: number
}

// 播放器状态
export interface PlayerState {
  isPlaying: boolean
  currentStation: RadioStation | null
  volume: number
  isMuted: boolean
  isLoading: boolean
  isBuffering: boolean
  error: string | null
  currentTime: number
  duration: number
}

// 收藏电台
export interface FavoriteStation {
  stationuuid: string
  name: string
  url: string
  favicon: string
  country: string
  addedAt: string
}

// 历史记录
export interface HistoryItem {
  station: RadioStation
  timestamp: number
  playDuration?: number
}

// API响应
export interface ApiResponse<T> {
  success: boolean
  data: T
  source: string
  message?: string
}
