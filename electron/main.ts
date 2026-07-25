import { app, BrowserWindow, ipcMain, Menu, Tray, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import * as url from 'url'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// ============================================
// 创建窗口
// ============================================
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'build/icon.png'),
    backgroundColor: '#1a365d',
    show: false
  })

  // 加载页面
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  })

  mainWindow.loadURL(startUrl)

  // 显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 创建托盘
  createTray()

  // 设置菜单
  createMenu()

  // 设置自动更新
  setupAutoUpdater()
}

// ============================================
// 创建托盘
// ============================================
function createTray(): void {
  const iconPath = path.join(__dirname, 'build/icon.png')
  tray = new Tray(iconPath)
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: () => mainWindow?.show() },
    { label: '退出', click: () => app.quit() }
  ])
  
  tray.setToolTip('全球电台')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    mainWindow?.isVisible() ? mainWindow?.hide() : mainWindow?.show()
  })
}

// ============================================
// 创建菜单
// ============================================
function createMenu(): void {
  const template: any[] = [
    {
      label: '文件',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: '查看',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '检查更新',
          click: () => autoUpdater.checkForUpdatesAndNotify()
        },
        {
          label: '访问GitHub',
          click: () => shell.openExternal('https://github.com/your-repo/global-radio')
        },
        { type: 'separator' },
        { label: `版本 ${app.getVersion()}` }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ============================================
// 设置自动更新
// ============================================
function setupAutoUpdater(): void {
  autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'global-radio',
    owner: 'your-repo',
    private: false
  })

  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update-available')
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded')
  })

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err)
    mainWindow?.webContents.send('update-error', err.message)
  })

  // 检查更新
  autoUpdater.checkForUpdatesAndNotify()
}

// ============================================
// IPC通信
// ============================================
ipcMain.handle('get-version', () => app.getVersion())
ipcMain.handle('get-platform', () => process.platform)

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall()
})

// ============================================
// 应用生命周期
// ============================================
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
