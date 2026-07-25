// src/services/updateService.ts
import axios from 'axios'
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

interface VersionInfo {
  version: string
  releaseDate: string
  changelog: string[]
  downloadUrl: {
    web?: string
    windows?: string
    mac?: string
    linux?: string
    android?: string
  }
  mandatory: boolean
}

export class UpdateService {
  private static instance: UpdateService
  private currentVersion = '2.0.0'
  private updateCheckUrl = 'https://api.globalradio.app/version/latest'
  private isChecking = false
  private updateAvailable = ref(false)
  private latestVersion = ref<VersionInfo | null>(null)

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService()
    }
    return UpdateService.instance
  }

  async checkForUpdates(): Promise<VersionInfo | null> {
    if (this.isChecking) return this.latestVersion.value

    this.isChecking = true
    try {
      const response = await axios.get(this.updateCheckUrl, {
        params: {
          currentVersion: this.currentVersion,
          platform: this.getPlatform()
        },
        timeout: 10000
      })

      if (response.data && response.data.version) {
        const latest = response.data as VersionInfo
        const hasUpdate = this.compareVersions(latest.version, this.currentVersion) > 0
        
        if (hasUpdate) {
          this.updateAvailable.value = true
          this.latestVersion.value = latest
          return latest
        }
      }
      return null
    } catch (error) {
      console.error('检查更新失败:', error)
      return null
    } finally {
      this.isChecking = false
    }
  }

  // 版本比较
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0
      const p2 = parts2[i] || 0
      if (p1 > p2) return 1
      if (p1 < p2) return -1
    }
    return 0
  }

  // 获取当前平台
  getPlatform(): string {
    if (window.electron) {
      return window.electron.process.platform
    }
    if (window.capacitor) {
      return 'android'
    }
    return 'web'
  }

  // 下载更新
  async downloadUpdate(version: VersionInfo): Promise<boolean> {
    try {
      const platform = this.getPlatform()
      let downloadUrl = version.downloadUrl[platform as keyof typeof version.downloadUrl]
      
      if (!downloadUrl) {
        console.warn(`没有找到 ${platform} 平台的下载链接`)
        return false
      }

      // Web平台直接跳转
      if (platform === 'web') {
        window.open(downloadUrl, '_blank')
        return true
      }

      // Electron下载
      if (window.electron) {
        await window.electron.downloadUpdate(downloadUrl)
        return true
      }

      // Android下载
      if (window.capacitor) {
        // 使用Capacitor的浏览器打开下载链接
        window.open(downloadUrl, '_system')
        return true
      }

      return false
    } catch (error) {
      console.error('下载更新失败:', error)
      return false
    }
  }

  // 检查并提示更新
  async checkAndPrompt(): Promise<void> {
    const updateInfo = await this.checkForUpdates()
    if (updateInfo) {
      // 存储更新信息到store，由UI组件显示
      const settingsStore = useSettingsStore()
      settingsStore.setPendingUpdate(updateInfo)
    }
  }

  // 自动检查更新
  startAutoCheck(intervalHours: number = 6) {
    // 首次检查延迟5秒
    setTimeout(() => this.checkAndPrompt(), 5000)
    
    // 定期检查
    setInterval(() => {
      const settingsStore = useSettingsStore()
      if (settingsStore.autoCheckUpdates) {
        this.checkAndPrompt()
      }
    }, intervalHours * 60 * 60 * 1000)
  }

  // Electron更新支持
  setupElectronUpdater() {
    if (window.electron) {
      window.electron.onUpdateAvailable((info: any) => {
        this.updateAvailable.value = true
        this.latestVersion.value = {
          version: info.version,
          releaseDate: new Date().toISOString(),
          changelog: info.releaseNotes || [],
          downloadUrl: {},
          mandatory: false
        }
      })
    }
  }
}

export const updateService = UpdateService.getInstance()
