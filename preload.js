const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('codlyy', {
  ping: () => 'pong'
});
