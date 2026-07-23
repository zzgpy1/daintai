// electron/main.js
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// 获取 preload 脚本路径（支持开发和生产环境）
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

// 获取 index.html 路径
function getIndexPath() {
  if (app.isPackaged) {
    // 生产环境：从 app.asar 中读取
    return `file://${path.join(__dirname, '../dist/index.html')}`;
  }
  // 开发环境：使用 Vite 预览服务
  return 'http://localhost:4173';
}

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

  // 外部链接用默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 隐藏默认菜单
  Menu.setApplicationMenu(null);
}

// 应用准备就绪
app.whenReady().then(createWindow);

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS 点击 dock 图标时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
