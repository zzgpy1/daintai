// src/utils/format.ts
export function formatBitrate(bitrate: number): string {
  if (!bitrate || bitrate === 0) return '未知'
  return `${bitrate} kbps`
}

export function formatCodec(codec: string): string {
  if (!codec) return '未知'
  return codec.toUpperCase()
}

export function formatTags(tags: string, maxTags: number = 3): string[] {
  if (!tags) return []
  return tags.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, maxTags)
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
