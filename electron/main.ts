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
      webSecurity: false, // ✅ 临时解决跨域（生产环境可移除或配置白名单）
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, 'build/icon.ico')
  })

  // 使用 url.format 构建正确的 file:// URL
  const indexPath = path.join(__dirname, '../dist/index.html')
  const startUrl = url.format({
    pathname: indexPath,
    protocol: 'file:',
    slashes: true
  })
  
  mainWindow.loadURL(startUrl)

  // ✅ 开启 DevTools 方便调试（发布时可注释掉）
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => { mainWindow = null })

  // 自动更新
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
