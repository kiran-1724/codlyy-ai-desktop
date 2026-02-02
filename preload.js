const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('codlyy', {
  ping: () => 'pong',
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),


  // Auto-update API
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, value) => callback(value)),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (event, value) => callback(value)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, value) => callback(value)),

  startDownload: () => ipcRenderer.send('start-download'),
  restartApp: () => ipcRenderer.send('restart-app')
});
