const { autoUpdater } = require('electron-updater');
const { BrowserWindow } = require('electron');

let mainWindow = null;

function setupAutoUpdater(window) {
  mainWindow = window;
  
  // 配置自动更新
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // 检查更新
  autoUpdater.checkForUpdates();

  // 事件监听
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 正在检查更新...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('🆕 发现新版本:', info.version);
    mainWindow.webContents.send('update-available', info);
  });

  autoUpdater.on('update-not-available', () => {
    console.log('✅ 当前已是最新版本');
    mainWindow.webContents.send('update-not-available');
  });

  autoUpdater.on('error', (err) => {
    console.error('❌ 更新错误:', err);
    mainWindow.webContents.send('update-error', err.message);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('update-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ 更新已下载，准备安装');
    mainWindow.webContents.send('update-downloaded', info);
  });
}

function checkForUpdates() {
  autoUpdater.checkForUpdates();
}

function downloadUpdate() {
  autoUpdater.downloadUpdate();
}

function installUpdate() {
  autoUpdater.quitAndInstall();
}

module.exports = {
  setupAutoUpdater,
  checkForUpdates,
  downloadUpdate,
  installUpdate
};
