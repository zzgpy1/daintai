export const platform = {
  getPlatform(): 'web' | 'electron' | 'capacitor' {
    // 检测 Electron（多重判断确保可靠性）
    if (typeof window !== 'undefined') {
      // 1. 通过 process.versions.electron（Electron 官方推荐）
      if (window.process?.versions?.electron) {
        return 'electron'
      }
      // 2. 通过 preload 暴露的 API（如果已暴露）
      if ((window as any).electronAPI) {
        return 'electron'
      }
      // 3. 通过 userAgent
      if (navigator.userAgent.includes('Electron')) {
        return 'electron'
      }
      // 4. 通过 process.type（旧方式，保留兼容）
      if (window.process?.type === 'renderer') {
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
