const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function getEntryPath() {
  if (!app.isPackaged) {
    return {
      preload: path.join(__dirname, 'preload.js'),
      index: 'http://localhost:4173'
    };
  }

  const resourcePath = process.resourcesPath;
  const possiblePaths = {
    preload: [
      path.join(__dirname, 'preload.js'),
      path.join(resourcePath, 'app.asar', 'electron', 'preload.js'),
      path.join(resourcePath, 'electron', 'preload.js'),
      path.join(process.cwd(), 'electron', 'preload.js')
    ],
    index: [
      path.join(__dirname, '../dist/index.html'),
      path.join(resourcePath, 'app.asar', 'dist', 'index.html'),
      path.join(resourcePath, 'dist', 'index.html'),
      path.join(process.cwd(), 'dist', 'index.html')
    ]
  };

  let preloadPath = null;
  for (const p of possiblePaths.preload) {
    if (fs.existsSync(p)) {
      preloadPath = p;
      console.log(`✅ 找到 preload: ${p}`);
      break;
    }
  }
  if (!preloadPath) {
    preloadPath = path.join(__dirname, 'preload.js');
  }

  let indexPath = null;
  for (const p of possiblePaths.index) {
    if (fs.existsSync(p)) {
      indexPath = `file://${p}`;
      console.log(`✅ 找到 index.html: ${p}`);
      break;
    }
  }
  if (!indexPath) {
    indexPath = `file://${path.join(__dirname, '../dist/index.html')}`;
  }

  return {
    preload: preloadPath,
    index: indexPath
  };
}

function createWindow() {
  const entry = getEntryPath();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: entry.preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    show: false,
    frame: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a365d',
  });

  console.log(`📂 加载 URL: ${entry.index}`);
  mainWindow.loadURL(entry.index);

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
