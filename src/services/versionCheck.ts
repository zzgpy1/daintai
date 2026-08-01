import pkg from '@/../package.json'

export interface ReleaseInfo {
  version: string
  downloadUrl: string
  releaseNotes?: string
}

/**
 * 获取当前应用版本（从 package.json）
 */
export const getCurrentVersion = (): string => {
  return pkg.version
}

/**
 * 从 GitHub API 获取最新 Release 信息
 */
export const fetchLatestRelease = async (): Promise<ReleaseInfo | null> => {
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
      // 根据平台选择对应的 asset
      const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer'
      const isAndroid = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()
      
      if (isAndroid) {
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
    console.error('获取最新 Release 失败:', error)
    return null
  }
}

/**
 * 检查更新：比对当前版本与最新版本
 */
export const checkForUpdate = async (): Promise<{ hasUpdate: boolean; latest?: ReleaseInfo }> => {
  const current = getCurrentVersion()
  const latest = await fetchLatestRelease()
  if (!latest) {
    return { hasUpdate: false }
  }
  // 简单比较版本号（仅支持 x.y.z）
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
  return { hasUpdate, latest: hasUpdate ? latest : undefined }
}
