const { ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

function setupGitHandlers() {
    ipcMain.handle('git:clone', async (event, { repoUrl, targetPath }) => {
        return new Promise((resolve, reject) => {
            // Validate git installed
            exec('git --version', (err) => {
                if (err) {
                    return reject("Git is not installed or not in PATH.");
                }

                // Extract repo name to create subfolder
                // e.g. https://github.com/user/repo.git -> repo
                const cleanUrl = repoUrl.trim();
                const repoName = cleanUrl.split('/').pop().replace('.git', '');

                // If user selected 'C:/Projects', we clone into 'C:/Projects/repo'
                // However, standard behavior is usually 'git clone <url>' INSIDE the target path
                // creating the folder.

                const command = `git clone "${cleanUrl}"`;

                exec(command, { cwd: targetPath }, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Clone error:', stderr);
                        return reject(stderr || error.message);
                    }
                    resolve(path.join(targetPath, repoName));
                });
            });
        });
    });
}

module.exports = { setupGitHandlers };
