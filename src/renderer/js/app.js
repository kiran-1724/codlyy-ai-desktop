/**
 * CODLYY AI - DESKTOP APPLICATION
 * Main Renderer Process Logic
 */

// ═══════════════════════════════════════════════════════════
// DOM ELEMENTS
// ═══════════════════════════════════════════════════════════

const elements = {
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
}

// ═══════════════════════════════════════════════════════════
// VERSION MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function loadAppVersion() {
    try {
        const version = await window.codlyy.getAppVersion();
        elements.appVersion.innerText = version;
        elements.modalVersion.innerText = version;
    } catch (err) {
        console.error('Failed to get version:', err);
    }
}

// ═══════════════════════════════════════════════════════════
// AUTO-UPDATE LOGIC
// ═══════════════════════════════════════════════════════════

function setupUpdateListeners() {
    // 1. Update Available -> Show Toast
    window.codlyy.onUpdateAvailable((info) => {
        console.log("Update available:", info);
        if (info && info.version) {
            elements.newVersionText.innerText = info.version;
        }
        showUpdateToast();
    });

    // 2. Download Progress -> Animate Liquid
    window.codlyy.onUpdateProgress((progressObj) => {
        const percent = Math.round(progressObj.percent);
        updateProgress(percent);
    });

    // 3. Download Complete -> Show Restart Button
    window.codlyy.onUpdateDownloaded(() => {
        updateProgress(100);
        elements.downloadStatusTitle.innerText = "Update Ready!";
        elements.btnRestart.classList.remove('hidden');
    });
}

function setupUpdateControls() {
    // User Clicks "Update Now"
    elements.btnStartDownload.addEventListener('click', () => {
        hideUpdateToast();
        showDownloadOverlay();
        window.codlyy.startDownload();
    });

    // User Clicks "Later"
    elements.btnLater.addEventListener('click', () => {
        hideUpdateToast();
    });

    // User Clicks "Restart & Install"
    elements.btnRestart.addEventListener('click', () => {
        window.codlyy.restartApp();
    });
}

// ═══════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════

function showUpdateToast() {
    elements.updateToast.dataset.show = "true";
}

function hideUpdateToast() {
    elements.updateToast.dataset.show = "false";
}

function showDownloadOverlay() {
    elements.downloadOverlay.classList.remove('opacity-0', 'pointer-events-none');
}

function updateProgress(percent) {
    elements.downloadPercent.innerText = percent;
    elements.liquidFill.style.height = percent + '%';
    elements.progressBar.style.width = percent + '%';
}

// ═══════════════════════════════════════════════════════════
// DEV/DEMO TRIGGER (Ctrl+U)
// ═══════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'u') {
        console.log("Simulating update flow...");
        elements.newVersionText.innerText = "1.0.4";
        showUpdateToast();
    }
});

// ═══════════════════════════════════════════════════════════
// START APPLICATION
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', init);
