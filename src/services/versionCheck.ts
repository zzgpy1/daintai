import pkg from '@/../package.json'
import { platform } from '@/utils/platform'

export interface ReleaseInfo {
  version: string
  downloadUrl: string
  releaseNotes?: string
  tagName: string
}

// 缓存最新版本信息（避免频繁请求）
let cachedLatestRelease: ReleaseInfo | null = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 分钟

/**
 * 获取当前应用版本
 */
export const getCurrentVersion = (): string => {
  return pkg.version
}

/**
 * 从 GitHub API 获取最新 Release 信息
 */
export const fetchLatestRelease = async (): Promise<ReleaseInfo | null> => {
  // 检查缓存
  if (cachedLatestRelease && Date.now() - cacheTime < CACHE_TTL) {
    return cachedLatestRelease
  }

  try {
    const response = await fetch('https://api.github.com/repos/zzgpy1/diantai/releases/latest')
    if (!response.ok) {
      console.warn('GitHub API 请求失败:', response.status)
      return null
    }
    const data = await response.json()
    const tag = data.tag_name || 'v0.0.0'
    const version = tag.startsWith('v') ? tag.substring(1) : tag

    // 获取下载链接（优先 APK/EXE）
    let downloadUrl = data.html_url // 默认 release 页面
    if (data.assets && data.assets.length > 0) {
      const isElectron = platform.isDesktop()
      const isAndroid = platform.isMobile()
      
      if (isAndroid) {
        const apkAsset = data.assets.find((a: any) => a.name.endsWith('.apk'))
        if (apkAsset) downloadUrl = apkAsset.browser_download_url
      } else if (isElectron) {
        const exeAsset = data.assets.find((a: any) => a.name.endsWith('.exe'))
        if (exeAsset) downloadUrl = exeAsset.browser_download_url
      } else {
        // Web 端，尝试找 .zip 或 .tar.gz（如果有）
        const webAsset = data.assets.find((a: any) => a.name.endsWith('.zip'))
        if (webAsset) downloadUrl = webAsset.browser_download_url
      }
    }

    const releaseInfo: ReleaseInfo = {
      version,
      downloadUrl,
      releaseNotes: data.body,
      tagName: data.tag_name
    }

    // 更新缓存
    cachedLatestRelease = releaseInfo
    cacheTime = Date.now()
    return releaseInfo
  } catch (error) {
    console.error('获取最新 Release 失败:', error)
    return null
  }
}

/**
 * 检查更新：返回 { hasUpdate, latest, error }
 * error 表示网络或解析失败，与“无更新”区分
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
      return { hasUpdate: false, error: '无法获取最新版本信息，请检查网络' }
    }
    // 比较版本号
    const currentParts = current.split('.').map(Number)
    const latestParts = latest.version.split('.').map(Number)
    let hasUpdate = false
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const c = currentParts[i] || 0
      const l = latestParts[i] || 0
      if (l > c) {
        hasUpdate = true
        break
      } else if (l < c) {
        break
      }
    }
    return { hasUpdate, latest: hasUpdate ? latest : latest } // 返回 latest 供显示
  } catch (error) {
    console.error('检查更新异常:', error)
    return { hasUpdate: false, error: '检查更新失败，请重试' }
  }
}
