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
    wireframeView: document.getElementById('wireframe-view'),
    wireframeProjectName: document.getElementById('wireframe-project-name'),
    btnExitWireframe: document.getElementById('btn-exit-wireframe'),

    sidebar: document.querySelector('aside'), // Re-select sidebar for toggle
    fileTree: document.getElementById('file-tree'),

    // Header Info
    currentProjectName: document.getElementById('current-project-name'),
    currentFileName: document.getElementById('current-file-name'),

    // Content
    monacoContainer: document.getElementById('monaco-editor-container'),
    emptyState: document.getElementById('empty-state'),

    // Workspace Header User
    workspaceUserAvatar: document.getElementById('workspace-user-avatar'),
    headerUserName: document.getElementById('header-user-name'),
    btnUserMenu: document.getElementById('btn-user-menu'),
    userDropdownMenu: document.getElementById('user-dropdown-menu'),

    // Clone Elements
    btnCloneRepoTrigger: document.getElementById('btn-clone-repo-trigger'),
    cloneModal: document.getElementById('clone-modal'),
    cloneModalContent: document.getElementById('clone-modal-content'),
    btnCloseClone: document.getElementById('btn-close-clone'),
    btnCancelClone: document.getElementById('btn-cancel-clone'),
    btnConfirmClone: document.getElementById('btn-confirm-clone'),
    inputCloneUrl: document.getElementById('input-clone-url'),
    cloneLoading: document.getElementById('clone-loading'),
    cloneStatusText: document.getElementById('clone-status-text'),

    // Dropdown Actions
    menuCloseWorkspace: document.getElementById('menu-close-workspace'),
    menuCheckUpdates: document.getElementById('menu-check-updates'),
    menuLogout: document.getElementById('menu-logout'),
    menuExitApp: document.getElementById('menu-exit-app'),
    btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
    btnWireframe: document.getElementById('btn-wireframe'),

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

    // Clone Repo Trigger
    if (elements.btnCloneRepoTrigger) elements.btnCloneRepoTrigger.addEventListener('click', showCloneModal);

    // UI Interactions
    if (elements.btnToggleSidebar) elements.btnToggleSidebar.addEventListener('click', toggleSidebar);
    if (elements.btnWireframe) elements.btnWireframe.addEventListener('click', showWireframeView);
    if (elements.btnExitWireframe) elements.btnExitWireframe.addEventListener('click', hideWireframeView);

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

    // Clone Modal Logic
    if (elements.btnCloseClone) elements.btnCloseClone.addEventListener('click', hideCloneModal);
    if (elements.btnCancelClone) elements.btnCancelClone.addEventListener('click', hideCloneModal);
    if (elements.btnConfirmClone) elements.btnConfirmClone.addEventListener('click', handleCloneRepo);

    // Click Outside to Close Menu
    document.addEventListener('click', () => {
        if (elements.userDropdownMenu && !elements.userDropdownMenu.classList.contains('hidden')) {
            elements.userDropdownMenu.classList.add('hidden');
        }
    });

    loadRecentWorkspaces();
}

// ═══════════════════════════════════════════════════════════
// CLONE REPO LOGIC
// ═══════════════════════════════════════════════════════════

function showCloneModal() {
    elements.inputCloneUrl.value = '';
    elements.cloneStatusText.classList.add('hidden');
    elements.cloneModal.classList.remove('opacity-0', 'pointer-events-none');
    elements.cloneModalContent.classList.remove('scale-95');
    setTimeout(() => elements.inputCloneUrl.focus(), 100);
}

function hideCloneModal() {
    elements.cloneModal.classList.add('opacity-0', 'pointer-events-none');
    elements.cloneModalContent.classList.add('scale-95');
}

async function handleCloneRepo() {
    const url = elements.inputCloneUrl.value.trim();
    if (!url) {
        showCloneError("Please enter a valid Git URL");
        return;
    }

    // Basic validation
    if (!url.startsWith('http') && !url.startsWith('git@')) {
        showCloneError("Invalid URL format");
        return;
    }

    // 1. Select Destination
    try {
        const parentPath = await window.codlyy.selectFolder();
        if (!parentPath) return; // User cancelled

        // 2. Start Cloning
        elements.cloneLoading.classList.remove('opacity-0', 'pointer-events-none');

        // 3. Call Backend
        const clonedPath = await window.codlyy.cloneRepo(url, parentPath);

        // 4. Success
        hideCloneModal();
        elements.cloneLoading.classList.add('opacity-0', 'pointer-events-none'); // Reset

        // Add to recents and open
        addToRecentWorkspaces(clonedPath);
        openWorkspace(clonedPath);

    } catch (err) {
        elements.cloneLoading.classList.add('opacity-0', 'pointer-events-none');
        console.error("Clone failed:", err);
        showCloneError(err.toString());
    }
}

function showCloneError(msg) {
    elements.cloneStatusText.innerText = msg;
    elements.cloneStatusText.classList.remove('hidden');
    elements.cloneStatusText.className = "mt-2 text-xs text-red-500 font-bold";
}

function toggleSidebar() {
    if (elements.sidebar) {
        elements.sidebar.classList.toggle('hidden');
    }
}

function showWireframeView() {
    // 1. Hide Workspace content but keep container if needed, or just switch
    elements.workspaceView.classList.add('hidden');
    elements.wireframeView.classList.remove('hidden');

    // 2. Set Project Name
    const currentName = elements.currentProjectName.innerText;
    if (elements.wireframeProjectName) {
        elements.wireframeProjectName.innerText = currentName !== "NO FOLDER" ? currentName : "Untitled Project";
    }
}

function hideWireframeView() {
    elements.wireframeView.classList.add('hidden');
    elements.workspaceView.classList.remove('hidden');
    // Ensure Monaco editor redraws if needed
    if (editorInstance) editorInstance.layout();
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

    let recents = [];
    try {
        recents = JSON.parse(localStorage.getItem('codlyy_recent_workspaces') || '[]');
    } catch (e) {
        console.error("Corrupt recent workspaces data, clearing...", e);
        localStorage.removeItem('codlyy_recent_workspaces');
        recents = [];
    }

    // Deduplicate and filter invalids just in case
    recents = [...new Set(recents)].filter(p => p && typeof p === 'string');

    elements.recentWorkspacesList.innerHTML = '';

    if (recents.length === 0) {
        elements.recentWorkspacesList.innerHTML = `
            <div class="text-center py-10 opacity-50">
                <p class="text-sm text-zinc-400">No recent workspaces</p>
            </div>`;
        return;
    }

    recents.forEach(path => {
        // Normalize path for display
        const name = path.split(/[\\/]/).pop();
        const displayPath = path.length > 50 ? '...' + path.slice(-50) : path;

        const item = document.createElement('div');
        item.className = "group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors border border-transparent hover:border-zinc-100";
        item.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-500 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                </div>
                <div class="min-w-0">
                    <h4 class="text-sm font-semibold text-zinc-800 group-hover:text-blue-600 transition-colors truncate">${name}</h4>
                    <p class="text-[10px] text-zinc-400 font-mono truncate">${displayPath}</p>
                </div>
            </div>
            <svg class="w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        `;
        item.addEventListener('click', () => openWorkspace(path));
        elements.recentWorkspacesList.appendChild(item);
    });
}

function addToRecentWorkspaces(path) {
    if (!path) return;

    let recents = [];
    try {
        recents = JSON.parse(localStorage.getItem('codlyy_recent_workspaces') || '[]');
    } catch (e) {
        recents = [];
    }

    // Remove if exists (to move to top)
    recents = recents.filter(p => p !== path);
    // Add to top
    recents.unshift(path);
    // Keep max 5
    if (recents.length > 5) recents.pop();

    localStorage.setItem('codlyy_recent_workspaces', JSON.stringify(recents));

    // Reload list immediately if visible
    if (!elements.workspaceSelectionView.classList.contains('hidden')) {
        loadRecentWorkspaces();
    }
}

async function openWorkspace(rootPath) {
    // 1. Switch View
    hideAllViews();
    elements.workspaceView.classList.remove('hidden');
    if (elements.appTitlebar) elements.appTitlebar.classList.add('hidden'); // Hide Titlebar in Workspace

    // 2. Clear Previous State
    elements.fileTree.innerHTML = ''; // Clear Tree
    elements.currentFileName.innerText = "No file selected";
    elements.emptyState.classList.remove('hidden');

    // Clear Monaco editor if it exists
    if (editorInstance) {
        editorInstance.setValue('');
    }

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
                group flex items-center gap-1.5 py-1 px-2 pr-4 cursor-pointer hover:bg-zinc-100 
                text-zinc-600 hover:text-zinc-900 transition-colors rounded-r-md mr-2
            `;
            row.style.paddingLeft = `${paddingLeft}px`;

            // Icon logic
            let icon = '';
            if (isDir) {
                icon = `<svg class="w-4 h-4 text-blue-400 group-hover:text-blue-500 transition-colors transform transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
            } else {
                icon = `<svg class="w-4 h-4 text-zinc-400 group-hover:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
            }

            row.innerHTML = `
                ${icon}
                <span class="truncate text-[13px]">${entry.name}</span>
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
                    document.querySelectorAll('#file-tree .active-file-row').forEach(el => {
                        el.classList.remove('active-file-row', 'bg-blue-50', 'text-blue-600', 'font-medium');
                        el.classList.add('text-zinc-600');
                    });
                    row.classList.remove('text-zinc-600');
                    row.classList.add('active-file-row', 'bg-blue-50', 'text-blue-600', 'font-medium');
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

// ═══════════════════════════════════════════════════════════
// EDITOR LOGIC (MONACO)
// ═══════════════════════════════════════════════════════════

let editorInstance = null;

function initEditor() {
    if (editorInstance) return;

    // Check if loader is available
    if (typeof require === 'undefined' && window.require) {
        window.require = window.require;
    }

    // Configure Monaco loader
    if (window.require && window.require.config) {
        require.config({
            paths: {
                'vs': './vs'
            }
        });

        // Load Monaco
        require(['vs/editor/editor.main'], function () {
            if (editorInstance) return; // Already created

            // Disable TypeScript validation to avoid red squiggles in viewer mode
            if (monaco.languages.typescript) {
                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: true,
                    noSyntaxValidation: true
                });
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: true,
                    noSyntaxValidation: true
                });
            }

            editorInstance = monaco.editor.create(document.getElementById('monaco-editor-container'), {
                value: '',
                language: 'plaintext',
                theme: 'vs',
                automaticLayout: true,
                readOnly: true,
                minimap: { enabled: false }, // Disabled for cleaner UI
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
                lineHeight: 20,
                padding: { top: 12, bottom: 12 },
                scrollBeyondLastLine: false,
                renderLineHighlight: 'line',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                renderWhitespace: 'none',
                scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    useShadows: false,
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10
                },
                formatOnType: true,
                formatOnPaste: true,
                tabSize: 2 // React standard
            });

            console.log('Monaco Editor initialized successfully');
        });
    } else {
        // Retry if loader not ready yet
        setTimeout(initEditor, 100);
    }
}

async function openFile(name, path) {
    if (!editorInstance) initEditor();

    // 1. Calculate and Display Relative Path
    // Assume we have the root workspace path stored or accessible. 
    // We can infer it from the tree root text or store it in state.
    // For now, let's just make it look "exact".

    // We need to strip the root part if we want workspace-relative.
    // Ideally pass 'rootPath' to openFile or store globally.
    // Let's rely on global 'currentWorkspaceRoot' if we add it, oherwise display full path for now as requested "exact file path".

    elements.currentFileName.innerText = path; // Show Full Path as requested
    elements.currentFileName.title = path; // Tooltip

    elements.emptyState.classList.add('hidden');

    try {
        const content = await window.codlyy.readFile(path);

        // Update Monaco
        if (editorInstance) {
            const model = editorInstance.getModel();
            const language = getMonacoLanguage(name);

            if (model) {
                monaco.editor.setModelLanguage(model, language);
                model.setValue(content);
            } else {
                // Should not happen if created correctly, but fallback
                const newModel = monaco.editor.createModel(content, language);
                editorInstance.setModel(newModel);
            }

            // Temporarily enable editing to allow formatting
            editorInstance.updateOptions({ readOnly: false });

            // Attempt to format the document to ensure "neat alignment"
            // We use a small timeout to let the language service initialize
            setTimeout(() => {
                editorInstance.getAction('editor.action.formatDocument').run().then(() => {
                    // Re-enable read-only after formatting (if viewer mode is desired)
                    // editorInstance.updateOptions({ readOnly: true }); 
                    // User didn't strictly say it must be read-only, but previous code had it.
                    // To be safe and let them "align" or edit if needed for "rich" feel, 
                    // keeping it editable might be better for an "AI Desktop". 
                    // But if strictly a viewer:
                    editorInstance.updateOptions({ readOnly: true });
                }).catch(err => {
                    // If format fails (no provider), just set read-only
                    editorInstance.updateOptions({ readOnly: true });
                });
            }, 300);

            editorInstance.setScrollTop(0);
        } else {
            console.warn("Editor not initialized yet. Retrying...");
            setTimeout(() => openFile(name, path), 200);
        }

    } catch (err) {
        console.error("Read file error:", err);
        if (editorInstance) editorInstance.setValue("// Error reading file: \n" + err.toString());
    }
}

function getMonacoLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
        'js': 'javascript', 'jsx': 'javascript',
        'ts': 'typescript', 'tsx': 'typescript',
        'html': 'html', 'css': 'css', 'scss': 'scss',
        'json': 'json', 'md': 'markdown',
        'py': 'python', 'java': 'java', 'c': 'c', 'cpp': 'cpp',
        'rs': 'rust', 'go': 'go', 'php': 'php',
        'sql': 'sql', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml',
        'sh': 'shell', 'bash': 'shell'
    };
    return map[ext] || 'plaintext';
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
    if (elements.wireframeView) elements.wireframeView.classList.add('hidden');
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
