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
  private currentVersion: string = 'v2026.07.24-105948'
  private checkedVersion: string = ''

  static getInstance(): UpdateChecker {
    if (!UpdateChecker.instance) {
      UpdateChecker.instance = new UpdateChecker()
    }
    return UpdateChecker.instance
  }

  async checkForUpdate(): Promise<UpdateInfo> {
    try {
      // 防止重复检查同一版本
      const skippedVersion = localStorage.getItem('skipped_version')
      
      const response = await fetch(
        'https://api.github.com/repos/zzgpy1/daintai/releases/latest'
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const latestVersion = data.tag_name || ''

      // 如果已经检查过这个版本，不再提示
      if (this.checkedVersion === latestVersion) {
        return {
          hasUpdate: false,
          version: latestVersion,
          downloadUrl: '',
          releaseDate: ''
        }
      }
      this.checkedVersion = latestVersion

      // 比较版本号
      const hasUpdate = this.compareVersions(latestVersion, this.currentVersion) > 0
      
      // 如果用户跳过了这个版本，不再提示
      const finalHasUpdate = hasUpdate && latestVersion !== skippedVersion

      const apkAsset = data.assets?.find(
        (asset: any) => 
          asset.name.endsWith('.apk') && 
          !asset.name.includes('debug') &&
          !asset.name.includes('unsigned')
      )

      return {
        hasUpdate: finalHasUpdate,
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
