// src/utils/iconGenerator.ts

// 颜色组合
const colorCombinations = [
  { bg: '#FF6B6B', text: '#FFFFFF' },
  { bg: '#4ECDC4', text: '#FFFFFF' },
  { bg: '#45B7D1', text: '#FFFFFF' },
  { bg: '#96CEB4', text: '#FFFFFF' },
  { bg: '#FFEAA7', text: '#2D3436' },
  { bg: '#DDA0DD', text: '#FFFFFF' },
  { bg: '#98D8C8', text: '#2D3436' },
  { bg: '#F7DC6F', text: '#2D3436' },
  { bg: '#BB8FCE', text: '#FFFFFF' },
  { bg: '#85C1E9', text: '#FFFFFF' },
  { bg: '#F8C471', text: '#2D3436' },
  { bg: '#82E0AA', text: '#2D3436' },
  { bg: '#F1948A', text: '#FFFFFF' },
  { bg: '#AED6F1', text: '#2D3436' },
  { bg: '#A9DFBF', text: '#2D3436' },
  { bg: '#F9E79F', text: '#2D3436' }
]

// 字符串哈希
function getStringHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// 获取首字母
function getFirstLetter(name: string): string {
  if (!name) return '?'
  const cleanName = name.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
  if (!cleanName) return '?'
  const firstChar = cleanName.charAt(0).toUpperCase()
  return firstChar
}

// 生成电台图标
export function generateStationIcon(stationName: string) {
  const hash = getStringHash(stationName)
  const colorIndex = hash % colorCombinations.length
  const colorCombo = colorCombinations[colorIndex]
  
  return {
    letter: getFirstLetter(stationName),
    backgroundColor: colorCombo.bg,
    textColor: colorCombo.text
  }
}

// 生成图标数据URL
export function generateIconDataUrl(stationName: string): string {
  const icon = generateStationIcon(stationName)
  
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="${icon.backgroundColor}" rx="12"/>
      <text x="32" y="42" font-family="system-ui, -apple-system, sans-serif" 
            font-size="28" font-weight="600" text-anchor="middle" 
            fill="${icon.textColor}">${icon.letter}</text>
    </svg>
  `
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// 生成简单的文本图标（当不需要SVG时）
export function generateSimpleIcon(letter: string, bgColor?: string): string {
  const bg = bgColor || '#3B82F6'
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="${bg}" rx="12"/>
      <text x="32" y="42" font-family="system-ui, -apple-system, sans-serif" 
            font-size="28" font-weight="600" text-anchor="middle" 
            fill="white">${letter || '?'}</text>
    </svg>
  `)}`
}
