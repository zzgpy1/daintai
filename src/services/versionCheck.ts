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
 * 尝试通过代理获取 GitHub Release 信息
 */
const fetchWithProxy = async (proxyBase: string, timeout = 15000): Promise<Response | null> => {
  const apiUrl = 'https://api.github.com/repos/zzgpy1/diantai/releases/latest'
  const url = proxyBase + apiUrl
  console.log(`[更新] 尝试请求: ${url}`)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': '国内电台/' + pkg.version
      }
    })
    clearTimeout(timeoutId)
    if (response.ok) {
      console.log(`[更新] 请求成功: ${url}`)
      return response
    } else {
      console.warn(`[更新] 请求返回 ${response.status}: ${url}`)
    }
  } catch (error) {
    console.warn(`[更新] 请求失败: ${url}`, error)
  } finally {
    clearTimeout(timeoutId)
  }
  return null
}

/**
 * 获取最新 Release 信息（轮询多个代理）
 */
export const fetchLatestRelease = async (): Promise<ReleaseInfo | null> => {
  // 代理列表（按可靠性排序）
  const proxyList = [
    'https://ghproxy.19860519.xyz/',      // ✅ 您确认可用的代理
    'https://mirror.ghproxy.com/',        // 备用代理1
    'https://gh-proxy.19860519.xyz/',     // 备用代理2（之前报404，但可能恢复）
  ]

  // 依次尝试代理
  for (const proxy of proxyList) {
    const response = await fetchWithProxy(proxy)
    if (response) {
      try {
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
        console.error('[更新] 解析响应失败:', error)
        // 继续尝试下一个代理
        continue
      }
    }
  }

  // 所有代理失败，尝试直接请求（可能被CORS限制，但作为最后手段）
  console.log('[更新] 所有代理失败，尝试直接请求 GitHub API')
  try {
    const response = await fetch('https://api.github.com/repos/zzgpy1/diantai/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': '国内电台/' + pkg.version
      }
    })
    if (response.ok) {
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
      return { version, downloadUrl, releaseNotes: data.body }
    }
  } catch (error) {
    console.error('[更新] 直接请求失败:', error)
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
