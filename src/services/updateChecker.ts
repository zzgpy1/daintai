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
  private currentVersion: string = 'v2026.07.24-124559'
  private lastCheckTime: number = 0

  static getInstance(): UpdateChecker {
    if (!UpdateChecker.instance) {
      UpdateChecker.instance = new UpdateChecker()
    }
    return UpdateChecker.instance
  }

  async checkForUpdate(): Promise<UpdateInfo> {
    try {
      // 1小时内不重复检查
      const now = Date.now()
      if (now - this.lastCheckTime < 3600000) {
        return { hasUpdate: false, version: '', downloadUrl: '', releaseDate: '' }
      }
      this.lastCheckTime = now

      // 检查用户是否跳过了此版本
      const skippedVersion = localStorage.getItem('skipped_version')
      
      const response = await fetch(
        'https://api.github.com/repos/zzgpy1/daintai/releases/latest'
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const latestVersion = data.tag_name || ''

      // 如果当前版本已经是最新，不提示
      if (this.compareVersions(latestVersion, this.currentVersion) <= 0) {
        return { hasUpdate: false, version: '', downloadUrl: '', releaseDate: '' }
      }

      // 如果用户跳过了此版本，不提示
      if (latestVersion === skippedVersion) {
        return { hasUpdate: false, version: '', downloadUrl: '', releaseDate: '' }
      }

      const apkAsset = data.assets?.find(
        (asset: any) => 
          asset.name.endsWith('.apk') && 
          !asset.name.includes('debug') &&
          !asset.name.includes('unsigned')
      )

      return {
        hasUpdate: true,
        version: latestVersion,
        downloadUrl: apkAsset?.browser_download_url || '',
        releaseDate: data.published_at || '',
        body: data.body || ''
      }
    } catch (error) {
      console.error('检查更新失败:', error)
      return { hasUpdate: false, version: '', downloadUrl: '', releaseDate: '' }
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const clean1 = v1.replace(/^v/, '').split(/[.-]/).map(Number)
    const clean2 = v2.replace(/^v/, '').split(/[.-]/).map(Number)

    for (let i = 0; i < Math.max(clean1.length, clean2.length); i++) {
      const n1 = clean1[i] || 0
      const n2 = clean2[i] || 0
      if (n1 !== n2) return n1 - n2
    }
    return 0
  }
}
