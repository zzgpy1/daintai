const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// 确保在打包后也能正确找到入口
function getPreloadPath() {
  const possiblePaths = [
    path.join(__dirname, 'preload.js'),
    path.join(process.resourcesPath, 'app.asar', 'electron', 'preload.js'),
    path.join(process.cwd(), 'electron', 'preload.js')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log(`✅ 找到 preload 文件: ${p}`);
      return p;
    }
  }
  console.warn('⚠️ 未找到 preload 文件，使用默认路径');
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
  console.log(`📂 加载 URL: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  Menu.setApplicationMenu(null);
}

// 导出用于 electron-builder 的入口
module.exports = { app, createWindow };

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
