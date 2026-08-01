import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  onUpdateAvailable: (cb: () => void) => {
    ipcRenderer.on('update-available', cb)
    return () => ipcRenderer.removeListener('update-available', cb)
  },
  onUpdateDownloaded: (cb: () => void) => {
    ipcRenderer.on('update-downloaded', cb)
    return () => ipcRenderer.removeListener('update-downloaded', cb)
  },
  // ✅ 新增：获取最新 Release（通过 IPC）
  fetchLatestRelease: () => ipcRenderer.invoke('fetch-latest-release')
})

// 调试：确认 API 已暴露
console.log('[预加载] electronAPI 已暴露')
