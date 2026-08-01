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
 * 获取最新 Release 信息
 * 优先使用 Electron IPC（主进程请求），否则降级到 fetch
 */
export const fetchLatestRelease = async (): Promise<ReleaseInfo | null> => {
  // ✅ 方案1：Electron 环境优先使用 IPC
  if (platform.isDesktop() && window.electronAPI?.fetchLatestRelease) {
    try {
      console.log('[更新] 使用 IPC 获取最新 Release')
      const data = await window.electronAPI.fetchLatestRelease()
      
      if (data) {
        console.log('[更新] IPC 返回数据:', data.tag_name)
        const tag = data.tag_name || 'v0.0.0'
        const version = tag.startsWith('v') ? tag.substring(1) : tag
        
        let downloadUrl = data.html_url
        if (data.assets && data.assets.length > 0) {
          const apkAsset = data.assets.find((a: any) => a.name.endsWith('.apk'))
          if (apkAsset) downloadUrl = apkAsset.browser_download_url
        }
        return { version, downloadUrl, releaseNotes: data.body }
      } else {
        console.warn('[更新] IPC 返回 null')
      }
    } catch (error) {
      console.error('[更新] IPC 请求失败:', error)
    }
  }

  // ✅ 方案2：降级到 fetch（Web 环境或 IPC 失败）
  console.log('[更新] 降级到 fetch 请求')
  try {
    const response = await fetch('https://api.github.com/repos/zzgpy1/diantai/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': `国内电台/${pkg.version}`
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()
    const tag = data.tag_name || 'v0.0.0'
    const version = tag.startsWith('v') ? tag.substring(1) : tag
    
    let downloadUrl = data.html_url
    if (data.assets && data.assets.length > 0) {
      const apkAsset = data.assets.find((a: any) => a.name.endsWith('.apk'))
      if (apkAsset) downloadUrl = apkAsset.browser_download_url
    }
    console.log('[更新] fetch 成功，最新版本:', version)
    return { version, downloadUrl, releaseNotes: data.body }
  } catch (error) {
    console.error('[更新] fetch 请求失败:', error)
  }

  return null
}

/**
 * 版本号比较
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
    console.log(`[更新] 当前版本: ${current}`)
    
    const latest = await fetchLatestRelease()
    if (!latest) {
      return { hasUpdate: false, error: '获取更新信息失败，请检查网络' }
    }
    
    console.log(`[更新] 最新版本: ${latest.version}`)
    const comparison = compareVersions(current, latest.version)
    
    if (comparison < 0) {
      return { hasUpdate: true, latest }
    } else {
      return { hasUpdate: false, latest }
    }
  } catch (error) {
    console.error('[更新] 检查更新异常:', error)
    return { hasUpdate: false, error: '检查更新失败，请重试' }
  }
}
