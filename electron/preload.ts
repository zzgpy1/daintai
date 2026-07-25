import { contextBridge, ipcRenderer } from 'electron'

// ============================================
// 暴露安全的API给渲染进程
// ============================================
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取版本
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // 获取平台
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // 安装更新
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // 监听更新事件
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on('update-available', callback)
    return () => ipcRenderer.removeListener('update-available', callback)
  },
  
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', callback)
    return () => ipcRenderer.removeListener('update-downloaded', callback)
  },
  
  onUpdateError: (callback: (error: string) => void) => {
    ipcRenderer.on('update-error', (_, error) => callback(error))
    return () => ipcRenderer.removeListener('update-error', callback)
  }
})
