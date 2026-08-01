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
 */
export const fetchLatestRelease = async (): Promise<ReleaseInfo | null> => {
  // 1. 如果是 Electron 环境，优先通过 IPC 获取（主进程直接请求 GitHub）
  if (platform.isDesktop() && window.electronAPI?.fetchLatestRelease) {
    try {
      console.log('[更新] 使用 IPC 获取最新 Release')
      const data = await window.electronAPI.fetchLatestRelease()
      if (data) {
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

  // 2. 降级方案：使用 fetch + 代理（备用）
  const proxyList = [
    'https://ghproxy.19860519.xyz/',
    'https://mirror.ghproxy.com/',
  ]
  for (const proxy of proxyList) {
    try {
      const url = proxy + 'https://api.github.com/repos/zzgpy1/diantai/releases/latest'
      console.log(`[更新] 尝试 fetch 代理: ${url}`)
      const response = await fetch(url, {
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': `国内电台/${pkg.version}` }
      })
      if (response.ok) {
        const data = await response.json()
        const tag = data.tag_name || 'v0.0.0'
        const version = tag.startsWith('v') ? tag.substring(1) : tag
        let downloadUrl = data.html_url
        if (data.assets && data.assets.length > 0) {
          const apkAsset = data.assets.find((a: any) => a.name.endsWith('.apk'))
          if (apkAsset) downloadUrl = apkAsset.browser_download_url
        }
        return { version, downloadUrl, releaseNotes: data.body }
      }
    } catch (e) {
      console.warn('[更新] fetch 代理失败:', e)
    }
  }

  return null
}

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
