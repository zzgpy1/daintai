// 平台检测工具
export const platform = {
  // 检测当前平台
  getPlatform(): 'web' | 'electron' | 'capacitor' | 'pwa' {
    // Electron
    if (typeof window !== 'undefined' && (window as any).process?.type === 'renderer') {
      return 'electron'
    }
    // Capacitor
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      return 'capacitor'
    }
    // PWA (standalone mode)
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return 'pwa'
    }
    return 'web'
  },

  isDesktop(): boolean {
    return this.getPlatform() === 'electron'
  },

  isMobile(): boolean {
    return this.getPlatform() === 'capacitor' || this.isPWA()
  },

  isPWA(): boolean {
    return this.getPlatform() === 'pwa'
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

  getBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
    const ua = navigator.userAgent
    if (/Edg/.test(ua)) return 'edge'
    if (/Chrome/.test(ua)) return 'chrome'
    if (/Firefox/.test(ua)) return 'firefox'
    if (/Safari/.test(ua)) return 'safari'
    return 'unknown'
  },

  supportsMediaSession(): boolean {
    return 'mediaSession' in navigator
  },

  supportsWakeLock(): boolean {
    return 'wakeLock' in navigator
  },

  supportsNotifications(): boolean {
    return 'Notification' in window
  },

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.supportsNotifications()) {
      return 'denied'
    }
    return await Notification.requestPermission()
  }
}
