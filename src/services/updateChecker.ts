// src/services/updateChecker.ts

export interface UpdateInfo {
  hasUpdate: boolean
  version: string
  downloadUrl: string
  releaseDate: string
  body?: string
}

export class UpdateChecker {
  private static instance: UpdateChecker
  // 从 package.json 读取版本号，保持与构建一致
  private currentVersion: string = 'v2026.07.24-102147'

  static getInstance(): UpdateChecker {
    if (!UpdateChecker.instance) {
      UpdateChecker.instance = new UpdateChecker()
    }
    return UpdateChecker.instance
  }

  async checkForUpdate(): Promise<UpdateInfo> {
    try {
      const response = await fetch(
        'https://api.github.com/repos/zzgpy1/daintai/releases/latest'
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const latestVersion = data.tag_name || ''

      // 比较版本号（移除 v 前缀）
      const hasUpdate = this.compareVersions(latestVersion, this.currentVersion) > 0

      // 查找非 Debug 的 APK
      const apkAsset = data.assets?.find(
        (asset: any) => 
          asset.name.endsWith('.apk') && 
          !asset.name.includes('debug') &&
          !asset.name.includes('unsigned')
      )

      return {
        hasUpdate,
        version: latestVersion,
        downloadUrl: apkAsset?.browser_download_url || '',
        releaseDate: data.published_at || '',
        body: data.body || ''
      }
    } catch (error) {
      console.error('检查更新失败:', error)
      return {
        hasUpdate: false,
        version: '',
        downloadUrl: '',
        releaseDate: ''
      }
    }
  }

  private compareVersions(v1: string, v2: string): number {
    // 移除 v 前缀，按点或连字符分割
    const clean1 = v1.replace(/^v/, '')
    const clean2 = v2.replace(/^v/, '')
    
    const parts1 = clean1.split(/[.-]/).map(Number)
    const parts2 = clean2.split(/[.-]/).map(Number)

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const n1 = parts1[i] || 0
      const n2 = parts2[i] || 0
      if (n1 !== n2) return n1 - n2
    }
    return 0
  }
}
