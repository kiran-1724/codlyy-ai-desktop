const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose protected methods that allow the renderer process to use
 * the ipcRenderer without exposing the entire object
 */
contextBridge.exposeInMainWorld('codlyy', {
    // Ping/Pong test
    ping: () => ipcRenderer.invoke('ping'),

    // Version info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Auto-update API
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, value) => callback(value)),
    onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (event, value) => callback(value)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, value) => callback(value)),

    startDownload: () => ipcRenderer.send('start-download'),
    restartApp: () => ipcRenderer.send('restart-app')
});
