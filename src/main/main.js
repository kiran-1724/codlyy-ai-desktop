const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { setupTray } = require('./tray');
require('./quitHandler');
const { initAutoUpdater } = require('./updater');
const { setupIPC } = require('./ipc');

// Optional: Load .env
try { require('dotenv').config(); } catch (e) { }

let mainWindow;

// 1. Single Instance Lock (Crucial for Deep Linking)
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('codlyy', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('codlyy');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    // Handle Second Instance (Windows/Linux Deep Link)
    app.on('second-instance', (event, commandLine) => {
        // Focus existing window
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }

        // Find deep link
        const url = commandLine.find(arg => arg.startsWith('codlyy://'));
        if (url) handleDeepLink(url);
    });

    // App Ready
    app.whenReady().then(() => {
        createWindow();
        setupIPC();

        // Check for deep link on cold start (Windows)
        if (process.platform === 'win32') {
            const url = process.argv.find(arg => arg.startsWith('codlyy://'));
            if (url) handleDeepLink(url);
        }

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
}

// Handle Deep Link (macOS)
app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
        handleDeepLink(url);
    } else {
        // Store if window not ready yet (handled via variable if needed, or wait for window)
    }
});

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

    // Open links in external browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    setupTray(mainWindow);
    initAutoUpdater(mainWindow);

    return mainWindow;
}

// Deep Link Handler
function handleDeepLink(url) {
    try {
        // url format: codlyy://auth/callback?token=...
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get('token');
        const name = urlObj.searchParams.get('name');
        const email = urlObj.searchParams.get('email');
        const picture = urlObj.searchParams.get('picture');

        if (token) {
            console.log('Deep link received token');
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('auth-success', { token, name, email, picture });
                // Restore/Focus
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
            }
        }
    } catch (e) {
        console.error('Deep link parse error:', e);
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

module.exports = { getMainWindow: () => mainWindow };
