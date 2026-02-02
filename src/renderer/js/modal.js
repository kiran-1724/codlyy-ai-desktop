/**
 * CODLYY AI - WHAT'S NEW MODAL
 * Modal management logic
 */

// ═══════════════════════════════════════════════════════════
// DOM ELEMENTS
// ═══════════════════════════════════════════════════════════

const modal = {
    container: document.getElementById('whats-new-modal'),
    content: document.getElementById('modal-content'),
    btnOpen: document.getElementById('btn-whats-new'),
    btnClose: document.getElementById('btn-close-modal')
};

// ═══════════════════════════════════════════════════════════
// MODAL CONTROLS
// ═══════════════════════════════════════════════════════════

function openModal() {
    modal.container.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        modal.content.classList.remove('scale-90');
        modal.content.classList.add('scale-100');
    }, 10);
}

function closeModal() {
    modal.content.classList.remove('scale-100');
    modal.content.classList.add('scale-90');
    setTimeout(() => {
        modal.container.classList.add('opacity-0', 'pointer-events-none');
    }, 200);
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════

function setupModalListeners() {
    // Open modal
    modal.btnOpen.addEventListener('click', openModal);

    // Close modal
    modal.btnClose.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.container.addEventListener('click', (e) => {
        if (e.target === modal.container) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.container.classList.contains('opacity-0')) {
            closeModal();
        }
    });
}

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', setupModalListeners);
