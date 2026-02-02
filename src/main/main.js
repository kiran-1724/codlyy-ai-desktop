const { app, BrowserWindow } = require('electron');
const path = require('path');
const { setupTray } = require('./tray');
const { initAutoUpdater } = require('./updater');
const { setupIPC } = require('./ipc');

// Optional: Load .env for development
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not installed or not needed
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        autoHideMenuBar: true,
        backgroundColor: '#ffffff',
        icon: path.join(__dirname, '../assets/icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Setup system tray
    setupTray(mainWindow);

    // Initialize auto-updater
    initAutoUpdater(mainWindow);

    return mainWindow;
}

app.whenReady().then(() => {
    createWindow();

    // Setup IPC handlers
    setupIPC();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Export for other modules
module.exports = { getMainWindow: () => mainWindow };
