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
    modalVersion: document.getElementById('modal-version')
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
