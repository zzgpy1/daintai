import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取信息
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  
  // 更新相关
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // 监听事件
  onThemeUpdated: (callback: (isDark: boolean) => void) => {
    ipcRenderer.on('theme-updated', (_, isDark) => callback(isDark))
    return () => ipcRenderer.removeListener('theme-updated', callback)
  },
  
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
  },
  
  // 播放控制
  onTogglePlayback: (callback: () => void) => {
    ipcRenderer.on('toggle-playback', callback)
    return () => ipcRenderer.removeListener('toggle-playback', callback)
  },
  
  onNextTrack: (callback: () => void) => {
    ipcRenderer.on('next-track', callback)
    return () => ipcRenderer.removeListener('next-track', callback)
  },
  
  onPreviousTrack: (callback: () => void) => {
    ipcRenderer.on('previous-track', callback)
    return () => ipcRenderer.removeListener('previous-track', callback)
  },
  
  onSaveState: (callback: () => void) => {
    ipcRenderer.on('save-state', callback)
    return () => ipcRenderer.removeListener('save-state', callback)
  }
})
