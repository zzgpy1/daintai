// src/utils/pinyin.ts

// 常用中文字符拼音首字母映射表（精简版）
const pinyinMap: Record<string, string> = {
  '中': 'Z', '国': 'G', '人': 'R', '民': 'M', '共': 'G', '和': 'H',
  '北': 'B', '京': 'J', '上': 'S', '海': 'H', '广': 'G', '州': 'Z',
  '深': 'S', '圳': 'Z', '成': 'C', '都': 'D', '武': 'W', '汉': 'H',
  '西': 'X', '安': 'A', '重': 'C', '庆': 'Q', '天': 'T', '津': 'J',
  '南': 'N', '宁': 'N', '长': 'C', '沙': 'S', '郑': 'Z', '州': 'Z',
  '合': 'H', '肥': 'F', '福': 'F', '建': 'J', '台': 'T', '湾': 'W',
  '香': 'H', '港': 'G', '澳': 'A', '门': 'M'
}

export function getPinyinFirstLetter(char: string): string {
  if (pinyinMap[char]) {
    return pinyinMap[char]
  }
  
  if (/[a-zA-Z]/.test(char)) {
    return char.toUpperCase()
  }
  
  if (/[0-9]/.test(char)) {
    return '#'
  }
  
  return '#'
}

export function getStationFirstLetter(name: string): string {
  if (!name || name.length === 0) {
    return '#'
  }
  
  const firstChar = name.charAt(0)
  const letter = getPinyinFirstLetter(firstChar)
  
  return /[A-Z]/.test(letter) ? letter : '#'
}

export function groupStationsByLetter<T extends { name: string }>(stations: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {}
  
  stations.forEach(station => {
    const letter = getStationFirstLetter(station.name)
    
    if (!grouped[letter]) {
      grouped[letter] = []
    }
    grouped[letter].push(station)
  })
  
  Object.keys(grouped).forEach(letter => {
    grouped[letter].sort((a, b) => a.name.localeCompare(b.name))
  })
  
  return grouped
}

export function getSortedLetters(groupedStations: Record<string, any[]>): string[] {
  return Object.keys(groupedStations).sort((a, b) => {
    if (a === '#') return 1
    if (b === '#') return -1
    return a.localeCompare(b)
  })
}
