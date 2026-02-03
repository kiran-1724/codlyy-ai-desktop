/**
 * CODLYY AI - DESKTOP APPLICATION
 * Main Renderer Process Logic
 */

// ═══════════════════════════════════════════════════════════
// DOM ELEMENTS
// ═══════════════════════════════════════════════════════════

const elements = {
    // Views
    welcomeView: document.getElementById('welcome-view'),
    loginView: document.getElementById('login-view'),
    mainView: document.getElementById('main-view'),

    // Auth Buttons
    btnGetStarted: document.getElementById('btn-get-started'),
    btnLoginGoogle: document.getElementById('btn-login-google'),

    // User Profile
    userProfileCard: document.getElementById('user-profile-card'),
    userName: document.getElementById('user-name'),
    userEmail: document.getElementById('user-email'),
    userAvatar: document.getElementById('user-avatar'),
    btnLogout: document.getElementById('btn-logout'),

    // Update Toast
    updateToast: document.getElementById('update-toast'),
    btnLater: document.getElementById('btn-later'),
    btnStartDownload: document.getElementById('btn-start-download'),
    newVersionText: document.getElementById('new-version-text'),

    // Download Overlay
    downloadOverlay: document.getElementById('download-overlay'),
    liquidFill: document.getElementById('liquid-fill'),
    progressBar: document.getElementById('progress-bar'),
    downloadPercent: document.getElementById('download-percent'),
    downloadStatusTitle: document.getElementById('download-status-title'),
    btnRestart: document.getElementById('btn-restart'),

    // Version Display
    appVersion: document.getElementById('app-version'),
    modalVersion: document.getElementById('modal-version'),

    // Workspace Elements
    // Workspace Elements
    btnGotoWorkspaceSelect: document.getElementById('btn-goto-workspace-select'),
    btnBackToDashboard: document.getElementById('btn-back-to-dashboard'),
    btnExitWorkspace: document.getElementById('btn-exit-workspace'), // Removed in HTML but variable kept for safety or update

    workspaceSelectionView: document.getElementById('workspace-selection-view'),
    btnOpenFolder: document.getElementById('btn-open-folder'),
    recentWorkspacesList: document.getElementById('recent-workspaces-list'),

    workspaceView: document.getElementById('workspace-view'),
    sidebar: document.querySelector('aside'), // Re-select sidebar for toggle
    fileTree: document.getElementById('file-tree'),

    // Header Info
    currentProjectName: document.getElementById('current-project-name'),
    currentFileName: document.getElementById('current-file-name'),

    // Content
    fileContent: document.getElementById('file-content'),
    lineNumbers: document.getElementById('line-numbers'),
    codeViewer: document.getElementById('code-viewer'),
    emptyState: document.getElementById('empty-state'),

    // Workspace Header User
    workspaceUserAvatar: document.getElementById('workspace-user-avatar'),
    headerUserName: document.getElementById('header-user-name'),
    btnUserMenu: document.getElementById('btn-user-menu'),
    userDropdownMenu: document.getElementById('user-dropdown-menu'),

    // Dropdown Actions
    menuCloseWorkspace: document.getElementById('menu-close-workspace'),
    menuCheckUpdates: document.getElementById('menu-check-updates'),
    menuLogout: document.getElementById('menu-logout'),
    menuExitApp: document.getElementById('menu-exit-app'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),

    btnLogout: document.getElementById('btn-logout'),

    // Global
    appTitlebar: document.getElementById('app-titlebar')
};

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

function init() {
    if (!window.codlyy) {
        console.warn("Codlyy API not found (running in pure browser?)");
        return;
    }

    loadAppVersion();
    setupUpdateListeners();
    setupUpdateControls();
    setupAuth();
    setupWorkspace();
    setupShortcuts();
}

function setupShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+B: Toggle Sidebar
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            toggleSidebar();
        }
    });
}

// ═══════════════════════════════════════════════════════════
// WORKSPACE LOGIC
// ═══════════════════════════════════════════════════════════

function setupWorkspace() {
    // Navigation
    if (elements.btnGotoWorkspaceSelect) elements.btnGotoWorkspaceSelect.addEventListener('click', showWorkspaceSelectionView);
    if (elements.btnBackToDashboard) elements.btnBackToDashboard.addEventListener('click', showMainView);
    if (elements.btnOpenFolder) elements.btnOpenFolder.addEventListener('click', handleOpenFolder);

    // UI Interactions
    if (elements.btnToggleSidebar) elements.btnToggleSidebar.addEventListener('click', toggleSidebar);

    if (elements.btnUserMenu) {
        elements.btnUserMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleUserMenu();
        });
    }

    // Dropdown Actions
    if (elements.menuCloseWorkspace) {
        elements.menuCloseWorkspace.addEventListener('click', () => {
            showWorkspaceSelectionView(); // Go back to Project Selection
            elements.userDropdownMenu.classList.add('hidden');
        });
    }

    if (elements.menuCheckUpdates) {
        elements.menuCheckUpdates.addEventListener('click', () => {
            // Trigger manual update check
            window.codlyy.checkUpdates();
            elements.userDropdownMenu.classList.add('hidden');
        });
    }

    if (elements.menuLogout) {
        elements.menuLogout.addEventListener('click', () => {
            handleLogout(); // Clear session, go to Welcome
            elements.userDropdownMenu.classList.add('hidden');
        });
    }

    if (elements.menuExitApp) {
        elements.menuExitApp.addEventListener('click', () => {
            window.codlyy.exitApp(); // Quit App
        });
    }

    // Click Outside to Close Menu
    document.addEventListener('click', () => {
        if (elements.userDropdownMenu && !elements.userDropdownMenu.classList.contains('hidden')) {
            elements.userDropdownMenu.classList.add('hidden');
        }
    });

    loadRecentWorkspaces();
}

function toggleSidebar() {
    if (elements.sidebar) {
        elements.sidebar.classList.toggle('hidden');
    }
}

function toggleUserMenu() {
    if (elements.userDropdownMenu) {
        elements.userDropdownMenu.classList.toggle('hidden');
    }
}

async function handleOpenFolder() {
    try {
        const path = await window.codlyy.selectFolder();
        if (path) {
            addToRecentWorkspaces(path);
            openWorkspace(path);
        }
    } catch (err) {
        console.error("Failed to open folder:", err);
    }
}

function loadRecentWorkspaces() {
    if (!elements.recentWorkspacesList) return;

    const recents = JSON.parse(localStorage.getItem('codlyy_recent_workspaces') || '[]');
    elements.recentWorkspacesList.innerHTML = '';

    if (recents.length === 0) {
        elements.recentWorkspacesList.innerHTML = `
            <div class="text-center py-10 opacity-50">
                <p class="text-sm text-zinc-400">No recent workspaces</p>
            </div>`;
        return;
    }

    recents.forEach(path => {
        const name = path.split(/[\\/]/).pop();
        const item = document.createElement('div');
        item.className = "group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors border border-transparent hover:border-zinc-100";
        item.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-500 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-zinc-800 group-hover:text-blue-600 transition-colors">${name}</h4>
                    <p class="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">${path}</p>
                </div>
            </div>
            <svg class="w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        `;
        item.addEventListener('click', () => openWorkspace(path));
        elements.recentWorkspacesList.appendChild(item);
    });
}

function addToRecentWorkspaces(path) {
    let recents = JSON.parse(localStorage.getItem('codlyy_recent_workspaces') || '[]');
    recents = recents.filter(p => p !== path); // Remove if exists
    recents.unshift(path); // Add to top
    if (recents.length > 5) recents.pop(); // Keep max 5
    localStorage.setItem('codlyy_recent_workspaces', JSON.stringify(recents));
}

async function openWorkspace(rootPath) {
    // 1. Switch View
    hideAllViews();
    elements.workspaceView.classList.remove('hidden');
    if (elements.appTitlebar) elements.appTitlebar.classList.add('hidden'); // Hide Titlebar in Workspace

    // 2. Clear Previous State (CRITICAL FIX)
    elements.fileTree.innerHTML = ''; // Clear Tree w/ Loading
    elements.currentFileName.innerText = "No file selected";
    elements.fileContent.innerText = "";
    elements.lineNumbers.innerHTML = "";
    elements.emptyState.classList.remove('hidden');

    // 3. Set Project Info
    const folderName = rootPath.split(/[\\/]/).pop();
    if (elements.currentProjectName) elements.currentProjectName.innerText = folderName;

    // 4. Render Root
    await renderDirectory(rootPath, elements.fileTree, 0);

    // 5. Update Header User Info
    const userProfile = JSON.parse(localStorage.getItem('codlyy_user_profile') || '{}');
    if (elements.workspaceUserAvatar && userProfile.picture) {
        elements.workspaceUserAvatar.src = userProfile.picture;
    }
    if (elements.headerUserName && userProfile.name) {
        elements.headerUserName.innerText = userProfile.name;
    }
}

// Recursive-ready Directory Renderer
async function renderDirectory(dirPath, container, depth) {
    try {
        const entries = await window.codlyy.readDir(dirPath);

        entries.forEach(entry => {
            const isDir = entry.isDirectory;
            const item = document.createElement('div');
            const paddingLeft = depth * 12 + 16;

            // Container for children (initially hidden)
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'hidden border-l border-zinc-100 ml-4';

            // Item Row
            const row = document.createElement('div');
            row.className = `
                group flex items-center gap-1.5 py-1 px-2 pr-4 cursor-pointer hover:bg-blue-50/50 
                text-zinc-600 hover:text-zinc-900 transition-colors border-l-2 border-transparent hover:border-blue-500
            `;
            row.style.paddingLeft = `${paddingLeft}px`;

            // Icon logic
            let icon = '';
            if (isDir) {
                icon = `<svg class="w-3.5 h-3.5 text-blue-300 group-hover:text-blue-500 transition-colors transform transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
            } else {
                icon = `<svg class="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
            }

            row.innerHTML = `
                ${icon}
                <span class="truncate">${entry.name}</span>
            `;

            // Interactions
            if (isDir) {
                let loaded = false;
                row.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const iconSvg = row.querySelector('svg');

                    if (childrenContainer.classList.contains('hidden')) {
                        // Expand
                        childrenContainer.classList.remove('hidden');
                        iconSvg.classList.add('rotate-90'); // Simple folder open animation request
                        if (!loaded) {
                            await renderDirectory(entry.path, childrenContainer, depth + 1);
                            loaded = true;
                        }
                    } else {
                        // Collapse
                        childrenContainer.classList.add('hidden');
                        iconSvg.classList.remove('rotate-90');
                    }
                });
            } else {
                row.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Highlight active file
                    document.querySelectorAll('#file-tree .bg-blue-100').forEach(el => el.classList.remove('bg-blue-100', 'text-blue-700'));
                    row.classList.add('bg-blue-100', 'text-blue-700');
                    openFile(entry.name, entry.path);
                });
            }

            item.appendChild(row);
            if (isDir) item.appendChild(childrenContainer);
            container.appendChild(item);
        });

    } catch (err) {
        console.error("Error reading directory:", err);
    }
}

async function openFile(name, path) {
    elements.currentFileName.innerText = name;
    elements.emptyState.classList.add('hidden');

    try {
        const content = await window.codlyy.readFile(path);

        // Render Content with Highlighting
        elements.fileContent.textContent = content; // Use textContent for safety before highlighting
        elements.fileContent.className = `language-${getLanguageExtension(name)} bg-transparent p-0 text-zinc-800`;

        // Trigger Highlight.js
        if (window.hljs) {
            window.hljs.highlightElement(elements.fileContent);
        }

        // Generate Line Numbers
        const lines = content.split('\n').length;
        elements.lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => `<div>${i + 1}</div>`).join('');

    } catch (err) {
        elements.fileContent.innerText = "Error reading file.";
    }
}

function getLanguageExtension(filename) {
    const ext = filename.split('.').pop();
    // Simple mapping, hljs usually detects common ones automatically by class
    const map = {
        'js': 'javascript', 'ts': 'typescript', 'html': 'html', 'css': 'css', 'json': 'json',
        'md': 'markdown', 'py': 'python', 'java': 'java', 'c': 'c', 'cpp': 'cpp', 'rs': 'rust', 'go': 'go'
    };
    return map[ext] || ext;
}

// ═══════════════════════════════════════════════════════════
// AUTHENTICATION & VIEW NAVIGATION
// ═══════════════════════════════════════════════════════════

function setupAuth() {
    // 1. Check for Existing Session
    const authToken = localStorage.getItem('codlyy_auth_token');

    if (authToken) {
        console.log("Session found, loading Dashboard...");
        const userProfile = JSON.parse(localStorage.getItem('codlyy_user_profile') || '{}');
        updateProfileUI(userProfile);
        showMainView();
    } else {
        console.log("No session, showing Welcome Screen...");
        showWelcomeView();
    }

    // 2. Listen for Deep Link Login Success
    window.codlyy.onAuthSuccess((data) => {
        console.log("Deep Link Auth Success:", data);

        if (data.token) {
            // Save Session Data
            localStorage.setItem('codlyy_auth_token', data.token);

            const userProfile = {
                name: data.name || "Codlyy User",
                email: data.email || "developer@codlyy.ai",
                picture: data.picture || `https://ui-avatars.com/api/?name=${data.name || 'User'}&background=random`
            };

            localStorage.setItem('codlyy_user_profile', JSON.stringify(userProfile));

            // Update UI & Transition
            updateProfileUI(userProfile);
            showMainView();

            // Reset Login Button
            if (elements.btnLoginGoogle) {
                elements.btnLoginGoogle.classList.remove('opacity-70', 'pointer-events-none', 'scale-95');
                elements.btnLoginGoogle.querySelector('span').innerText = "Continue with Google";
            }
        }
    });

    // 3. User Interactions

    // Get Started
    if (elements.btnGetStarted) elements.btnGetStarted.addEventListener('click', () => showLoginView());

    // Login
    if (elements.btnLoginGoogle) elements.btnLoginGoogle.addEventListener('click', handleGoogleLogin);

    // Logout
    if (elements.btnLogout) elements.btnLogout.addEventListener('click', handleLogout);
}

function handleGoogleLogin() {
    console.log("Opening Google Login Page...");

    // UI Feedback
    elements.btnLoginGoogle.classList.add('opacity-70', 'pointer-events-none', 'scale-95');
    const originalText = elements.btnLoginGoogle.querySelector('span').innerText;
    elements.btnLoginGoogle.querySelector('span').innerText = "Connecting...";

    // Open External Browser
    window.codlyy.openExternal('https://codlyy.vercel.app/auth/desktop-login');

    // Timeout Reset
    setTimeout(() => {
        elements.btnLoginGoogle.classList.remove('opacity-70', 'pointer-events-none', 'scale-95');
        elements.btnLoginGoogle.querySelector('span').innerText = originalText;
    }, 45000);
}

function handleLogout() {
    // Clear Session
    localStorage.removeItem('codlyy_auth_token');
    localStorage.removeItem('codlyy_user_profile');

    // Transition
    showWelcomeView();
}

function updateProfileUI(profile) {
    if (!profile) return;
    if (elements.userName) elements.userName.innerText = profile.name || "Codlyy User";
    if (elements.userEmail) elements.userEmail.innerText = profile.email || "developer@codlyy.ai";
    if (elements.userAvatar && profile.picture) elements.userAvatar.src = profile.picture;
}

// --- View Switchers ---

function hideAllViews() {
    if (elements.welcomeView) elements.welcomeView.classList.add('hidden');
    if (elements.loginView) elements.loginView.classList.add('hidden');
    if (elements.mainView) elements.mainView.classList.add('hidden');
    if (elements.workspaceView) elements.workspaceView.classList.add('hidden');
    if (elements.workspaceSelectionView) elements.workspaceSelectionView.classList.add('hidden');
}

function showWelcomeView() {
    hideAllViews();
    if (elements.welcomeView) elements.welcomeView.classList.remove('hidden');
}

function showLoginView() {
    hideAllViews();
    if (elements.loginView) elements.loginView.classList.remove('hidden');
}

function showMainView() {
    hideAllViews();
    if (elements.mainView) elements.mainView.classList.remove('hidden');
}

function showWorkspaceSelectionView() {
    hideAllViews();
    if (elements.workspaceSelectionView) elements.workspaceSelectionView.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════
// VERSION MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function loadAppVersion() {
    try {
        const version = await window.codlyy.getAppVersion();
        if (elements.appVersion) elements.appVersion.innerText = version;
        if (elements.modalVersion) elements.modalVersion.innerText = version;
    } catch (err) {
        console.error('Failed to get version:', err);
    }
}

// ═══════════════════════════════════════════════════════════
// AUTO-UPDATE LOGIC
// ═══════════════════════════════════════════════════════════

function setupUpdateListeners() {
    window.codlyy.onUpdateAvailable((info) => {
        if (info && info.version) elements.newVersionText.innerText = info.version;
        showUpdateToast();
    });

    window.codlyy.onUpdateProgress((progressObj) => {
        const percent = Math.round(progressObj.percent);
        updateProgress(percent);
    });

    window.codlyy.onUpdateDownloaded(() => {
        updateProgress(100);
        elements.downloadStatusTitle.innerText = "Update Ready!";
        elements.btnRestart.classList.remove('hidden');
    });
}

function setupUpdateControls() {
    elements.btnStartDownload.addEventListener('click', () => {
        hideUpdateToast();
        showDownloadOverlay();
        window.codlyy.startDownload();
    });

    elements.btnLater.addEventListener('click', () => {
        hideUpdateToast();
    });

    elements.btnRestart.addEventListener('click', () => {
        window.codlyy.restartApp();
    });
}

// ═══════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════

function showUpdateToast() { elements.updateToast.dataset.show = "true"; }
function hideUpdateToast() { elements.updateToast.dataset.show = "false"; }
function showDownloadOverlay() { elements.downloadOverlay.classList.remove('opacity-0', 'pointer-events-none'); }
function updateProgress(percent) {
    elements.downloadPercent.innerText = percent;
    elements.liquidFill.style.height = percent + '%';
    elements.progressBar.style.width = percent + '%';
}

// ═══════════════════════════════════════════════════════════
// DEV TRIGGERS
// ═══════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
    // Ctrl+U: Test Update
    if (e.ctrlKey && e.key === 'u') {
        elements.newVersionText.innerText = "1.0.9";
        showUpdateToast();
    }
    // Ctrl+L: Logout (Clear Token + Show Welcome)
    if (e.ctrlKey && e.key === 'l') {
        handleLogout();
    }
});

document.addEventListener('DOMContentLoaded', init);
