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
      webSecurity: false,
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

// ✅ 新增：通过主进程直接请求 GitHub API（带重试）
ipcMain.handle('fetch-latest-release', async () => {
  const fetchRelease = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: '/repos/zzgpy1/diantai/releases/latest',
        method: 'GET',
        headers: {
          'User-Agent': '国内电台/2.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
      const req = https.get(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data))
            } catch (e) {
              reject(new Error('解析响应失败'))
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        })
      })
      req.on('error', reject)
      req.setTimeout(10000, () => {
        req.destroy()
        reject(new Error('请求超时'))
      })
    })
  }

  // 重试最多3次
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await fetchRelease()
      return result
    } catch (error) {
      console.error(`[更新] 第 ${attempt} 次请求失败:`, error.message)
      if (attempt === 3) {
        // 最后一次失败，返回 null
        return null
      }
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
    }
  }
  return null
})
