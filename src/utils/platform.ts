export const platform = {
  getPlatform(): 'web' | 'electron' | 'capacitor' {
    if (typeof window !== 'undefined') {
      // ① 检查 userAgent 是否包含 Electron
      if (navigator.userAgent.indexOf('Electron') !== -1) {
        return 'electron'
      }
      // ② 检查 preload 暴露的 electronAPI
      if ((window as any).electronAPI) {
        return 'electron'
      }
      // ③ 检测 Capacitor
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
