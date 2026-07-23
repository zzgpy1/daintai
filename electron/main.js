const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// 确保在打包后也能正确找到入口
function getPreloadPath() {
  // 在开发环境和生产环境中使用不同的路径
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar', 'electron', 'preload.js');
  }
  return path.join(__dirname, 'preload.js');
}

function getIndexPath() {
  if (app.isPackaged) {
    return `file://${path.join(__dirname, '../dist/index.html')}`;
  }
  return 'http://localhost:4173';
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    show: false,
    frame: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a365d',
  });

  const startUrl = getIndexPath();
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 外部链接用默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 隐藏默认菜单栏
  Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
