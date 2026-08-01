import pkg from '@/../package.json'
import { platform } from '@/utils/platform'

export interface ReleaseInfo {
  version: string
  downloadUrl: string
  releaseNotes?: string
}

export const getCurrentVersion = (): string => pkg.version

/**
 * 获取最新 Release：优先 IPC（Electron），降级到 fetch
 */
export const fetchLatestRelease = async (): Promise<ReleaseInfo | null> => {
  // 1. Electron IPC 方案（主进程请求）
  if (platform.isDesktop() && window.electronAPI?.fetchLatestRelease) {
    try {
      console.log('[更新] 尝试 IPC 获取...')
      const data = await window.electronAPI.fetchLatestRelease()
      if (data && data.tag_name) {
        const tag = data.tag_name
        const version = tag.startsWith('v') ? tag.substring(1) : tag
        let downloadUrl = data.html_url
        if (data.assets?.length) {
          const apkAsset = data.assets.find((a: any) => a.name.endsWith('.apk'))
          if (apkAsset) downloadUrl = apkAsset.browser_download_url
        }
        console.log('[更新] IPC 成功，最新版本:', version)
        return { version, downloadUrl, releaseNotes: data.body }
      }
    } catch (e) {
      console.warn('[更新] IPC 失败，降级到 fetch:', e)
    }
  }

  // 2. 直接 fetch（适用于 Web 环境或 IPC 不可用）
  try {
    console.log('[更新] 使用 fetch 直接请求...')
    const response = await fetch('https://api.github.com/repos/zzgpy1/diantai/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': `国内电台/${pkg.version}`
      }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    const tag = data.tag_name || 'v0.0.0'
    const version = tag.startsWith('v') ? tag.substring(1) : tag
    let downloadUrl = data.html_url
    if (data.assets?.length) {
      const apkAsset = data.assets.find((a: any) => a.name.endsWith('.apk'))
      if (apkAsset) downloadUrl = apkAsset.browser_download_url
    }
    console.log('[更新] fetch 成功，最新版本:', version)
    return { version, downloadUrl, releaseNotes: data.body }
  } catch (e) {
    console.error('[更新] fetch 失败:', e)
    return null
  }
}

const compareVersions = (v1: string, v2: string): number => {
  const p1 = v1.split('.').map(Number), p2 = v2.split('.').map(Number)
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0, n2 = p2[i] || 0
    if (n1 > n2) return 1
    if (n1 < n2) return -1
  }
  return 0
}

export const checkForUpdate = async (): Promise<{
  hasUpdate: boolean
  latest?: ReleaseInfo
  error?: string
}> => {
  try {
    const current = getCurrentVersion()
    console.log(`[更新] 当前版本: ${current}`)
    const latest = await fetchLatestRelease()
    if (!latest) return { hasUpdate: false, error: '获取更新信息失败，请检查网络' }
    console.log(`[更新] 最新版本: ${latest.version}`)
    const cmp = compareVersions(current, latest.version)
    return cmp < 0 ? { hasUpdate: true, latest } : { hasUpdate: false, latest }
  } catch (e) {
    console.error('[更新] 异常:', e)
    return { hasUpdate: false, error: '检查更新失败，请重试' }
  }
}
