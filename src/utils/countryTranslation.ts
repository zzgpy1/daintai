// src/utils/countryTranslation.ts

// 国家代码到中文名称映射
const countryNamesCN: Record<string, string> = {
  'CN': '中国',
  'US': '美国',
  'GB': '英国',
  'DE': '德国',
  'FR': '法国',
  'JP': '日本',
  'KR': '韩国',
  'RU': '俄罗斯',
  'CA': '加拿大',
  'AU': '澳大利亚',
  'IT': '意大利',
  'ES': '西班牙',
  'BR': '巴西',
  'IN': '印度',
  'MX': '墨西哥',
  'NL': '荷兰',
  'SE': '瑞典',
  'NO': '挪威',
  'DK': '丹麦',
  'FI': '芬兰',
  'AT': '奥地利',
  'BE': '比利时',
  'CH': '瑞士',
  'CZ': '捷克',
  'PL': '波兰',
  'PT': '葡萄牙',
  'GR': '希腊',
  'HU': '匈牙利',
  'IE': '爱尔兰',
  'IL': '以色列',
  'TR': '土耳其',
  'ZA': '南非',
  'EG': '埃及',
  'TH': '泰国',
  'VN': '越南',
  'SG': '新加坡',
  'MY': '马来西亚',
  'ID': '印度尼西亚',
  'PH': '菲律宾',
  'AR': '阿根廷',
  'CL': '智利',
  'CO': '哥伦比亚',
  'PE': '秘鲁',
  'VE': '委内瑞拉',
  'UA': '乌克兰',
  'BY': '白俄罗斯',
  'LT': '立陶宛',
  'LV': '拉脱维亚',
  'EE': '爱沙尼亚',
  'SK': '斯洛伐克',
  'SI': '斯洛文尼亚',
  'HR': '克罗地亚',
  'RS': '塞尔维亚',
  'BG': '保加利亚',
  'RO': '罗马尼亚',
  'LU': '卢森堡',
  'MT': '马耳他',
  'CY': '塞浦路斯',
  'IS': '冰岛',
  'TW': '台湾',
  'HK': '香港',
  'MO': '澳门'
}

// 国家代码到英文名称映射
const countryNamesEN: Record<string, string> = {
  'CN': 'China',
  'US': 'United States',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'JP': 'Japan',
  'KR': 'South Korea',
  'RU': 'Russia',
  'CA': 'Canada',
  'AU': 'Australia',
  'IT': 'Italy',
  'ES': 'Spain',
  'BR': 'Brazil',
  'IN': 'India',
  'MX': 'Mexico',
  'NL': 'Netherlands',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'AT': 'Austria',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'CZ': 'Czech Republic',
  'PL': 'Poland',
  'PT': 'Portugal',
  'GR': 'Greece',
  'HU': 'Hungary',
  'IE': 'Ireland',
  'IL': 'Israel',
  'TR': 'Turkey',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'SG': 'Singapore',
  'MY': 'Malaysia',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'UA': 'Ukraine',
  'BY': 'Belarus',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'SK': 'Slovakia',
  'SI': 'Slovenia',
  'HR': 'Croatia',
  'RS': 'Serbia',
  'BG': 'Bulgaria',
  'RO': 'Romania',
  'LU': 'Luxembourg',
  'MT': 'Malta',
  'CY': 'Cyprus',
  'IS': 'Iceland',
  'TW': 'Taiwan',
  'HK': 'Hong Kong',
  'MO': 'Macau'
}

export function getLocalizedCountryName(countryCodeOrName: string): string {
  if (!countryCodeOrName) return ''
  
  let countryCode = countryCodeOrName.toUpperCase()
  
  // 如果是完整名称，查找代码
  if (countryCode.length !== 2) {
    const foundCode = Object.entries(countryNamesEN).find(
      ([_, name]) => name.toLowerCase() === countryCodeOrName.toLowerCase()
    )?.[0]
    if (foundCode) {
      countryCode = foundCode
    } else {
      return countryCodeOrName
    }
  }
  
  // 优先返回中文名称
  return countryNamesCN[countryCode] || countryNamesEN[countryCode] || countryCodeOrName
}

export function getChineseCountryName(countryCodeOrName: string): string {
  if (!countryCodeOrName) return ''
  
  let countryCode = countryCodeOrName.toUpperCase()
  
  if (countryCode.length !== 2) {
    const foundCode = Object.entries(countryNamesEN).find(
      ([_, name]) => name.toLowerCase() === countryCodeOrName.toLowerCase()
    )?.[0]
    if (foundCode) {
      countryCode = foundCode
    } else {
      return countryCodeOrName
    }
  }
  
  return countryNamesCN[countryCode] || countryCodeOrName
}
