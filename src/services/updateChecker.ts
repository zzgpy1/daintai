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
  private currentVersion: string = 'v2026.07.24-060846' // 从 package.json 读取

  static getInstance(): UpdateChecker {
    if (!UpdateChecker.instance) {
      UpdateChecker.instance = new UpdateChecker()
    }
    return UpdateChecker.instance
  }

  async checkForUpdate(): Promise<UpdateInfo> {
    try {
      // 从 GitHub API 获取最新 Release
      const response = await fetch(
        'https://api.github.com/repos/zzgpy1/daintai/releases/latest'
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch latest release')
      }

      const data = await response.json()
      const latestVersion = data.tag_name

      // 比较版本号
      const hasUpdate = this.compareVersions(latestVersion, this.currentVersion) > 0

      // 查找 APK 下载链接
      const apkAsset = data.assets.find(
        (asset: any) => asset.name.endsWith('.apk') && !asset.name.includes('debug')
      )

      return {
        hasUpdate,
        version: latestVersion,
        downloadUrl: apkAsset?.browser_download_url || '',
        releaseDate: data.published_at,
        body: data.body
      }
    } catch (error) {
      console.error('检查更新失败:', error)
      return {
        hasUpdate: false,
        version: '',
        downloadUrl: ''
      }
    }
  }

  private compareVersions(v1: string, v2: string): number {
    // 提取版本号中的数字部分进行比较
    const extractNumbers = (v: string) => {
      const match = v.match(/(\d+)/g)
      return match ? match.map(Number) : []
    }

    const nums1 = extractNumbers(v1)
    const nums2 = extractNumbers(v2)

    for (let i = 0; i < Math.max(nums1.length, nums2.length); i++) {
      const n1 = nums1[i] || 0
      const n2 = nums2[i] || 0
      if (n1 !== n2) return n1 - n2
    }
    return 0
  }
}
