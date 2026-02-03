const { app, ipcMain } = require('electron');

ipcMain.on('app-quit', () => {
    app.isQuitting = true;
    app.exit(0);
    app.quit();
});
