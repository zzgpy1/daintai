import { contextBridge, ipcRenderer } from 'electron'

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
  }
})
