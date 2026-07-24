const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron')
const path = require('path')

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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    titleBarStyle: 'hiddenInset',
    frame: true,
    show: false
  })

  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    mainWindow.loadURL('http://localhost:4173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  createTray()
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../public/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: () => mainWindow.show() },
    { label: '隐藏窗口', click: () => mainWindow.hide() },
    { type: 'separator' },
    { label: '退出', click: () => { isQuitting = true; app.quit() } }
  ])
  tray.setToolTip('全球电台')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

ipcMain.handle('get-app-version', () => app.getVersion())
ipcMain.handle('platform', () => process.platform)
ipcMain.on('minimize-window', () => mainWindow.minimize())
ipcMain.on('maximize-window', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
})
ipcMain.on('close-window', () => mainWindow.close())

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
