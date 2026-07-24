const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const updater = require('./updater');

// ... 其他代码保持不变 ...

// 在 createWindow 末尾添加
function createWindow() {
  // ... 现有代码 ...

  // 设置自动更新（仅生产环境）
  if (app.isPackaged) {
    updater.setupAutoUpdater(mainWindow);
  }
}

// IPC 更新事件
ipcMain.on('check-for-updates', () => {
  updater.checkForUpdates();
});

ipcMain.on('download-update', () => {
  updater.downloadUpdate();
});

ipcMain.on('install-update', () => {
  updater.installUpdate();
});
