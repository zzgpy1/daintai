import pkg from '@/../package.json'

export interface ReleaseInfo {
  version: string
  downloadUrl: string
  releaseNotes?: string
}

export const getCurrentVersion = (): string => pkg.version

export const fetchLatestRelease = async (): Promise<ReleaseInfo | null> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    const response = await fetch('https://api.github.com/repos/zzgpy1/diantai/releases/latest', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': '国内电台/2.0'
      }
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn('GitHub API 请求失败:', response.status, response.statusText)
      return null
    }
    const data = await response.json()
    const tag = data.tag_name || 'v0.0.0'
    const version = tag.startsWith('v') ? tag.substring(1) : tag

    let downloadUrl = data.html_url
    if (data.assets && data.assets.length > 0) {
      const { platform } = await import('@/utils/platform')
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
  } catch (error) {
    console.error('获取最新 Release 失败:', error)
    return null
  }
}

export const checkForUpdate = async (): Promise<{ hasUpdate: boolean; latest?: ReleaseInfo; error?: string }> => {
  try {
    const current = getCurrentVersion()
    const latest = await fetchLatestRelease()
    if (!latest) {
      return { hasUpdate: false, error: '无法获取最新版本信息' }
    }
    const currentParts = current.split('.').map(Number)
    const latestParts = latest.version.split('.').map(Number)
    let hasUpdate = false
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const c = currentParts[i] || 0
      const l = latestParts[i] || 0
      if (l > c) { hasUpdate = true; break }
    }
    return { hasUpdate, latest: hasUpdate ? latest : undefined }
  } catch (error) {
    console.error('检查更新失败:', error)
    return { hasUpdate: false, error: '检查更新失败，请重试' }
  }
}
