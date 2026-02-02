const { ipcMain, app } = require('electron');
const { downloadUpdate, quitAndInstall } = require('./updater');

function setupIPC() {
    // Get app version
    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    });

    // Ping/Pong for connection testing
    ipcMain.handle('ping', () => {
        return 'pong';
    });

    // Update controls
    ipcMain.on('start-download', () => {
        downloadUpdate();
    });

    ipcMain.on('open-external', (event, url) => {
        require('electron').shell.openExternal(url);
    });


    ipcMain.on('restart-app', () => {
        quitAndInstall();
    });
}

module.exports = { setupIPC };
