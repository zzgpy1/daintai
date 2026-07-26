export interface GeneratedIcon {
  letter: string
  backgroundColor: string
  textColor: string
}

const colors = [
  { bg: '#FF6B6B', text: '#FFFFFF' },
  { bg: '#4ECDC4', text: '#FFFFFF' },
  { bg: '#45B7D1', text: '#FFFFFF' },
  { bg: '#96CEB4', text: '#FFFFFF' },
  { bg: '#FFEAA7', text: '#2D3436' },
  { bg: '#DDA0DD', text: '#FFFFFF' },
  { bg: '#98D8C8', text: '#2D3436' },
  { bg: '#F7DC6F', text: '#2D3436' },
  { bg: '#BB8FCE', text: '#FFFFFF' },
  { bg: '#85C1E9', text: '#FFFFFF' }
]

const getStringHash = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

const getFirstLetter = (name: string): string => {
  if (!name) return '?'
  const clean = name.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
  if (!clean) return '?'
  const first = clean.charAt(0).toUpperCase()
  return /[\u4e00-\u9fa5]/.test(first) ? first : first
}

export const generateStationIcon = (stationName: string): GeneratedIcon => {
  const hash = getStringHash(stationName)
  const colorIndex = hash % colors.length
  return {
    letter: getFirstLetter(stationName),
    backgroundColor: colors[colorIndex].bg,
    textColor: colors[colorIndex].text
  }
}

export const generateIconDataUrl = (stationName: string): string => {
  const icon = generateStationIcon(stationName)
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="${icon.backgroundColor}" rx="12"/>
      <text x="32" y="42" font-family="system-ui, sans-serif" font-size="28" font-weight="600" text-anchor="middle" fill="${icon.textColor}">${icon.letter}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
