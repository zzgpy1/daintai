export const platform = {
  getPlatform(): 'web' | 'electron' | 'capacitor' {
    // 检测 Electron（更可靠的方式）
    if (typeof window !== 'undefined' && window.process?.versions?.electron) {
      return 'electron'
    }
    // 检测 Capacitor
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      return 'capacitor'
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
