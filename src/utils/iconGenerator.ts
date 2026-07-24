const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']

export function generateIconDataUrl(name: string): string {
  const letter = name ? name.charAt(0).toUpperCase() : '?'
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const color = colors[hash % colors.length]
  
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="${color}" rx="12"/>
      <text x="32" y="42" font-family="system-ui" font-size="28" font-weight="600" text-anchor="middle" fill="white">${letter}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
