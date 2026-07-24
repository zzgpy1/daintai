const countryNames: Record<string, string> = {
  CN: '中国',
  US: '美国',
  GB: '英国',
  DE: '德国',
  FR: '法国',
  JP: '日本',
  KR: '韩国',
  RU: '俄罗斯',
  CA: '加拿大',
  AU: '澳大利亚',
  IT: '意大利',
  ES: '西班牙',
  BR: '巴西',
  IN: '印度',
  MX: '墨西哥'
}

export function getLocalizedCountryName(code: string): string {
  if (!code) return ''
  const upperCode = code.toUpperCase()
  return countryNames[upperCode] || code
}
