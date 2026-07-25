/**
 * 格式化比特率
 */
export function formatBitrate(bitrate: number): string {
  if (!bitrate || bitrate === 0) {
    return '未知'
  }
  return `${bitrate} kbps`
}

/**
 * 格式化编码格式
 */
export function formatCodec(codec: string): string {
  if (!codec) {
    return '未知'
  }
  return codec.toUpperCase()
}

/**
 * 格式化标签（限制数量）
 */
export function formatTags(tags: string, maxTags: number = 3): string[] {
  if (!tags) {
    return []
  }
  const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
  return tagList.slice(0, maxTags)
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

/**
 * 格式化数字（千分位）
 */
export function formatNumber(num: number): string {
  if (!num) {
    return '0'
  }
  return num.toLocaleString()
}

/**
 * 格式化时间
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) {
    return '00:00'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 格式化日期
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date >= today) {
    return '今天'
  }
  if (date >= yesterday) {
    return '昨天'
  }
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 获取相对时间
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) {
    return '刚刚'
  }
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  if (hours < 24) {
    return `${hours}小时前`
  }
  if (days < 7) {
    return `${days}天前`
  }
  return formatDate(timestamp)
}
