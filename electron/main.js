const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

let mainWindow = null
let tray = null
let isQuitting = false

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
      // 关键：允许加载本地资源
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, '../public/icon.png'),
    titleBarStyle: 'hiddenInset',
    frame: true,
    show: false,
    backgroundColor: '#1a365d'
  })

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    // 开发模式加载 dev server
    mainWindow.loadURL('http://localhost:4173')
    mainWindow.webContents.openDevTools()
  } else {
    // 生产模式加载打包后的文件
    const indexPath = path.join(__dirname, '../dist/index.html')
    console.log('Loading index from:', indexPath)
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Failed to load index.html:', err)
      // 尝试备用路径
      const fallbackPath = path.join(process.resourcesPath, 'app.asar/dist/index.html')
      mainWindow.loadFile(fallbackPath).catch((err2) => {
        console.error('Fallback also failed:', err2)
      })
    })
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // 检查更新（仅生产模式）
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify()
    }
  })

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  createTray()
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/icon.png')
  tray = new Tray(iconPath)
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '显示主窗口', 
      click: () => { 
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      } 
    },
    { 
      label: '隐藏窗口', 
      click: () => { 
        if (mainWindow) mainWindow.hide() 
      } 
    },
    { type: 'separator' },
    { 
      label: '退出', 
      click: () => { 
        isQuitting = true
        app.quit() 
      } 
    }
  ])
  
  tray.setToolTip('全球电台')
  tray.setContextMenu(contextMenu)
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    }
  })
}

// IPC 事件处理
ipcMain.handle('get-app-version', () => app.getVersion())
ipcMain.handle('platform', () => process.platform)
ipcMain.handle('is-packaged', () => app.isPackaged)

ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize()
})
ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
  }
})
ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close()
})

// 应用生命周期
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 处理未捕获异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})
