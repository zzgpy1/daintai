// 平台检测工具
export const platform = {
  // 检测当前平台
  getPlatform(): 'web' | 'electron' | 'capacitor' | 'pwa' {
    // Electron
    if (typeof window !== 'undefined' && window.process?.type === 'renderer') {
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

  // 是否为桌面端
  isDesktop(): boolean {
    return this.getPlatform() === 'electron'
  },

  // 是否为移动端
  isMobile(): boolean {
    return this.getPlatform() === 'capacitor' || this.isPWA()
  },

  // 是否为PWA
  isPWA(): boolean {
    return this.getPlatform() === 'pwa'
  },

  // 是否为Web
  isWeb(): boolean {
    return this.getPlatform() === 'web'
  },

  // 检测操作系统
  getOS(): 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'unknown' {
    const ua = navigator.userAgent
    if (/Windows/.test(ua)) return 'windows'
    if (/Mac OS/.test(ua)) return 'mac'
    if (/Linux/.test(ua)) return 'linux'
    if (/Android/.test(ua)) return 'android'
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
    return 'unknown'
  },

  // 检测浏览器
  getBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
    const ua = navigator.userAgent
    if (/Edg/.test(ua)) return 'edge'
    if (/Chrome/.test(ua)) return 'chrome'
    if (/Firefox/.test(ua)) return 'firefox'
    if (/Safari/.test(ua)) return 'safari'
    return 'unknown'
  },

  // 是否支持媒体会话
  supportsMediaSession(): boolean {
    return 'mediaSession' in navigator
  },

  // 是否支持唤醒锁
  supportsWakeLock(): boolean {
    return 'wakeLock' in navigator
  },

  // 是否支持通知
  supportsNotifications(): boolean {
    return 'Notification' in window
  },

  // 请求通知权限
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.supportsNotifications()) {
      return 'denied'
    }
    return await Notification.requestPermission()
  }
}
