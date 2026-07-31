import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import * as url from 'url'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,                      // ✅ 启用安全策略
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, 'build/icon.ico')
  })

  const indexPath = path.join(__dirname, '../dist/index.html')
  const startUrl = url.format({
    pathname: indexPath,
    protocol: 'file:',
    slashes: true
  })

  mainWindow.loadURL(startUrl).catch(err => {
    console.error('加载失败:', err)
    setTimeout(() => mainWindow?.reload(), 2000)
  })

  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => mainWindow?.reload(), 3000)
  })

  // 生产环境关闭 DevTools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => { mainWindow = null })

  autoUpdater.checkForUpdatesAndNotify()
  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update-available')
  })
  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded')
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.handle('get-version', () => app.getVersion())
