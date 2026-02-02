const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Optional: Load .env if present (for local testing of private repos)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed or not needed
}

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Disable auto-download so we can ask the user
autoUpdater.autoDownload = false;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    autoHideMenuBar: true, // This removes the "File, Edit, View" menu
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');

  // Check for updates once the window is ready
  mainWindow.once('ready-to-show', () => {
    // Check for updates immediately on startup (for demo/production)
    // In dev, this might log an error if not configured, which is fine.
    try {
      autoUpdater.checkForUpdates();
    } catch (error) {
      log.error("Error checking for updates:", error);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- Update Events ---

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  log.error('Update error:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  log.info(`Download progress: ${progressObj.percent}%`);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

// --- IPC Handlers ---

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});


ipcMain.on('start-download', () => {
  log.info('User requested download');
  autoUpdater.downloadUpdate();
});

ipcMain.on('restart-app', () => {
  log.info('User requested restart');
  autoUpdater.quitAndInstall();
});