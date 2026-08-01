export {}

declare global {
  interface Window {
    electronAPI?: {
      installUpdate: () => Promise<void>
      getVersion: () => Promise<string>
      onUpdateAvailable: (cb: () => void) => () => void
      onUpdateDownloaded: (cb: () => void) => () => void
      fetchLatestRelease: () => Promise<any>  // ✅ 新增
    }
  }
}
