// src/utils/format.ts

export function formatBitrate(bitrate: number): string {
  if (!bitrate || bitrate === 0) {
    return '未知'
  }
  return `${bitrate} kbps`
}

export function formatCodec(codec: string): string {
  if (!codec) {
    return '未知'
  }
  return codec.toUpperCase()
}

export function formatTags(tags: string, maxTags: number = 3): string[] {
  if (!tags) {
    return []
  }
  const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
  return tagList.slice(0, maxTags)
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

export function formatNumber(num: number): string {
  if (!num) {
    return '0'
  }
  return num.toLocaleString()
}
