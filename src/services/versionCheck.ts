import pkg from '@/../package.json'
import { platform } from '@/utils/platform'

export interface ReleaseInfo {
  version: string
  downloadUrl: string
  releaseNotes?: string
}

export const getCurrentVersion = (): string => {
  return pkg.version
}

/**
 * 从 GitHub API 获取最新 Release 信息（带超时和重试）
 */
export const fetchLatestRelease = async (retries = 2): Promise<ReleaseInfo | null> => {
  const url = 'https://api.github.com/repos/zzgpy1/diantai/releases/latest'
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': '国内电台/2.0' // 必须设置 User-Agent
        }
      })
      clearTimeout(timeoutId)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      const tag = data.tag_name || 'v0.0.0'
      const version = tag.startsWith('v') ? tag.substring(1) : tag

      let downloadUrl = data.html_url
      if (data.assets && data.assets.length > 0) {
        const isElectron = platform.isDesktop()
        const isMobile = platform.isMobile()
        if (isMobile) {
          const apkAsset = data.assets.find((a: any) => a.name.endsWith('.apk'))
          if (apkAsset) downloadUrl = apkAsset.browser_download_url
        } else if (isElectron) {
          const exeAsset = data.assets.find((a: any) => a.name.endsWith('.exe'))
          if (exeAsset) downloadUrl = exeAsset.browser_download_url
        }
      }
      return {
        version,
        downloadUrl,
        releaseNotes: data.body
      }
    } catch (error) {
      console.warn(`获取最新 Release 失败 (尝试 ${attempt+1}/${retries+1}):`, error)
      if (attempt === retries) {
        // 最后一次尝试失败，返回 null
        return null
      }
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  return null
}

/**
 * 版本号比较（支持 x.y.z）
 */
const compareVersions = (v1: string, v2: string): number => {
  const p1 = v1.split('.').map(Number)
  const p2 = v2.split('.').map(Number)
  const maxLen = Math.max(p1.length, p2.length)
  for (let i = 0; i < maxLen; i++) {
    const n1 = p1[i] || 0
    const n2 = p2[i] || 0
    if (n1 > n2) return 1
    if (n1 < n2) return -1
  }
  return 0
}

/**
 * 检查更新
 */
export const checkForUpdate = async (): Promise<{
  hasUpdate: boolean
  latest?: ReleaseInfo
  error?: string
}> => {
  try {
    const current = getCurrentVersion()
    const latest = await fetchLatestRelease()
    if (!latest) {
      return { hasUpdate: false, error: '获取更新信息失败，请检查网络' }
    }
    const comparison = compareVersions(current, latest.version)
    if (comparison < 0) {
      return { hasUpdate: true, latest }
    } else {
      return { hasUpdate: false, latest } // 返回最新信息用于显示版本号
    }
  } catch (error) {
    console.error('检查更新异常:', error)
    return { hasUpdate: false, error: '检查更新失败，请重试' }
  }
}
