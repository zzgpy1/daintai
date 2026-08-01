export const platform = {
  getPlatform(): 'web' | 'electron' | 'capacitor' {
    // 检测 Electron：通过 process.versions.electron 或 window.electronAPI
    if (typeof window !== 'undefined') {
      // 方式1：Electron 渲染进程特有属性
      if (window.process?.versions?.electron) {
        return 'electron'
      }
      // 方式2：通过预加载脚本暴露的 API（如果有）
      if ((window as any).electronAPI) {
        return 'electron'
      }
      // 检测 Capacitor
      if ((window as any).Capacitor?.isNativePlatform()) {
        return 'capacitor'
      }
    }
    return 'web'
  },

  isDesktop(): boolean {
    return this.getPlatform() === 'electron'
  },

  isMobile(): boolean {
    return this.getPlatform() === 'capacitor'
  },

  isWeb(): boolean {
    return this.getPlatform() === 'web'
  },

  getOS(): 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'unknown' {
    const ua = navigator.userAgent
    if (/Windows/.test(ua)) return 'windows'
    if (/Mac OS/.test(ua)) return 'mac'
    if (/Linux/.test(ua)) return 'linux'
    if (/Android/.test(ua)) return 'android'
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
    return 'unknown'
  },

  supportsMediaSession(): boolean {
    return 'mediaSession' in navigator
  }
}
