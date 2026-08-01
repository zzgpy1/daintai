import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import * as url from 'url'
import https from 'https'

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
      webSecurity: false,       // 可保持 false 避免其他限制
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

// ✅ 新增：通过主进程获取最新 Release 信息（使用代理）
ipcMain.handle('fetch-latest-release', async () => {
  return new Promise((resolve) => {
    const proxyUrl = 'https://ghproxy.19860519.xyz/https://api.github.com/repos/zzgpy1/diantai/releases/latest'
    https.get(proxyUrl, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve(json)
        } catch (e) {
          console.error('解析 Release 信息失败:', e)
          resolve(null)
        }
      })
    }).on('error', (err) => {
      console.error('获取 Release 信息失败:', err)
      resolve(null)
    })
  })
})
