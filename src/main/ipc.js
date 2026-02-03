const { ipcMain, app, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
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

    // ═══════════════════════════════════════════════════════════
    // WORKSPACE: FILE SYSTEM OPERATIONS
    // ═══════════════════════════════════════════════════════════

    // 1. Open Folder Dialog
    ipcMain.handle('dialog:openFolder', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (canceled) return null;
        return filePaths[0]; // Return the selected path
    });

    // 2. Read Directory (Basic, non-recursive for now, app will handle recursion)
    ipcMain.handle('fs:readDir', async (event, dirPath) => {
        try {
            const dirents = await fs.promises.readdir(dirPath, { withFileTypes: true });
            return dirents.map(dirent => ({
                name: dirent.name,
                isDirectory: dirent.isDirectory(),
                path: path.join(dirPath, dirent.name)
            })).sort((a, b) => {
                // Folders first, then files
                if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
                return a.isDirectory ? -1 : 1;
            });
        } catch (error) {
            console.error('Failed to read directory:', error);
            throw error;
        }
    });

    // 3. Read File Content
    ipcMain.handle('fs:readFile', async (event, filePath) => {
        try {
            return await fs.promises.readFile(filePath, 'utf-8');
        } catch (error) {
            console.error('Failed to read file:', error);
            throw error;
        }
    });
}

module.exports = { setupIPC };
