const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = false;

function initAutoUpdater(mainWindow) {
    // Check for updates on startup
    mainWindow.once('ready-to-show', () => {
        try {
            autoUpdater.checkForUpdates();
        } catch (error) {
            log.error("Error checking for updates:", error);
        }
    });

    // Update Events
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
}

function downloadUpdate() {
    log.info('User requested download');
    autoUpdater.downloadUpdate();
}

function quitAndInstall() {
    log.info('User requested restart');
    autoUpdater.quitAndInstall();
}

module.exports = {
    initAutoUpdater,
    downloadUpdate,
    quitAndInstall
};
