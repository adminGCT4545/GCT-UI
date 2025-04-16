/**
 * UI Module
 * 
 * Handles general UI functionality and interactions that don't belong to specific components.
 */

// DOM Elements
let sidebar;
let collapseToggleBtn;
let mainContent;
let viewModeToggle;
let currentViewMode = 'chat';

/**
 * Initialize UI components and event listeners
 */
export function initializeUI() {
    // Get DOM elements
    sidebar = document.getElementById('sidebar');
    collapseToggleBtn = document.getElementById('collapseToggleBtn');
    mainContent = document.getElementById('mainContent');
    viewModeToggle = document.getElementById('viewModeToggle');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI state
    initializeUIState();
}

/**
 * Set up event listeners for UI elements
 */
function setupEventListeners() {
    // Sidebar collapse toggle
    if (collapseToggleBtn) {
        collapseToggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // View mode toggle (chat/dashboard)
    if (viewModeToggle) {
        viewModeToggle.addEventListener('click', toggleViewMode);
    }
    
    // Close panels when clicking outside
    document.addEventListener('click', handleOutsideClicks);
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
}

/**
 * Initialize UI state based on saved preferences or defaults
 */
function initializeUIState() {
    // Set sidebar state (expanded/collapsed)
    const sidebarState = localStorage.getItem('sidebarState') || 'expanded';
    if (sidebarState === 'collapsed' && sidebar) {
        sidebar.classList.remove('expanded');
    }
    
    // Set view mode (chat/dashboard)
    currentViewMode = localStorage.getItem('viewMode') || 'chat';
    updateViewMode();
    
    // Apply any saved theme preferences
    applyThemePreferences();
}

/**
 * Toggle sidebar between expanded and collapsed states
 */
function toggleSidebar() {
    if (!sidebar) return;
    
    const isExpanded = sidebar.classList.contains('expanded');
    
    if (isExpanded) {
        sidebar.classList.remove('expanded');
        localStorage.setItem('sidebarState', 'collapsed');
    } else {
        sidebar.classList.add('expanded');
        localStorage.setItem('sidebarState', 'expanded');
    }
}

/**
 * Toggle between chat view and dashboard view
 */
function toggleViewMode() {
    currentViewMode = currentViewMode === 'chat' ? 'dashboard' : 'chat';
    updateViewMode();
    localStorage.setItem('viewMode', currentViewMode);
}

/**
 * Update the UI based on the current view mode
 */
function updateViewMode() {
    if (!mainContent || !viewModeToggle) return;
    
    const analysisDashboard = document.getElementById('analysisDashboard');
    const inputContainer = document.querySelector('.input-container');
    const rightPanel = document.getElementById('rightPanel');
    
    if (currentViewMode === 'chat') {
        mainContent.classList.remove('dashboard-view');
        if (inputContainer) inputContainer.style.display = 'block';
        if (analysisDashboard) analysisDashboard.style.display = 'none';
        if (viewModeToggle) viewModeToggle.textContent = 'Dashboard View';
        
        // Hide right panel if it contains no artifacts
        if (rightPanel && !rightPanel.querySelector('.artifact')) {
            rightPanel.classList.remove('visible');
        }
    } else {
        mainContent.classList.add('dashboard-view');
        if (inputContainer) inputContainer.style.display = 'none';
        if (analysisDashboard) analysisDashboard.style.display = 'flex';
        if (viewModeToggle) viewModeToggle.textContent = 'Chat View';
        
        // Show document in viewer if available
        updateDocumentViewer();
        
        // Always show right panel in dashboard mode
        if (rightPanel) {
            rightPanel.classList.add('visible');
        }
    }
}

/**
 * Update the document viewer in dashboard mode
 */
function updateDocumentViewer() {
    if (currentViewMode !== 'dashboard') return;
    
    const docViewer = document.getElementById('documentViewerPlaceholder');
    if (!docViewer) return;
    
    // Get current conversation
    const currentConversationId = window.currentConversationId;
    if (!currentConversationId || !window.conversations || !window.conversations[currentConversationId]) {
        docViewer.innerHTML = `<span>No document loaded. Upload one.</span>`;
        return;
    }
    
    const conv = window.conversations[currentConversationId];
    if (conv.associatedDocument) {
        docViewer.innerHTML = `Loading ${conv.associatedDocument.name}...`;
        // In a real implementation, this would actually load the document
    } else {
        docViewer.innerHTML = `<span>No document loaded. Upload one.</span>`;
    }
}

/**
 * Handle clicks outside of panels to close them
 */
function handleOutsideClicks(event) {
    // Settings panel
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (settingsPanel && settingsPanel.classList.contains('active') && 
        !settingsPanel.contains(event.target) && 
        settingsBtn && !settingsBtn.contains(event.target)) {
        settingsPanel.classList.remove('active');
    }
    
    // Templates popup
    const templatesPopup = document.getElementById('templatesPopup');
    const templateBtn = document.getElementById('templateBtn');
    
    if (templatesPopup && templatesPopup.classList.contains('active') && 
        !templatesPopup.contains(event.target) && 
        templateBtn && !templateBtn.contains(event.target)) {
        templatesPopup.classList.remove('active');
    }
    
    // File upload modal
    const fileUploadModal = document.getElementById('fileUploadModal');
    
    if (fileUploadModal && fileUploadModal.classList.contains('active') && 
        !fileUploadModal.querySelector('.modal-content').contains(event.target)) {
        fileUploadModal.classList.remove('active');
        // Reset file upload state
        if (typeof resetFileUpload === 'function') {
            resetFileUpload();
        }
    }
    
    // History edit modal
    const historyEditModal = document.getElementById('historyEditModal');
    
    if (historyEditModal && historyEditModal.classList.contains('active') && 
        !historyEditModal.querySelector('.modal-content').contains(event.target)) {
        historyEditModal.classList.remove('active');
    }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Escape key closes modals and panels
    if (event.key === 'Escape') {
        const settingsPanel = document.getElementById('settingsPanel');
        const fileUploadModal = document.getElementById('fileUploadModal');
        const historyEditModal = document.getElementById('historyEditModal');
        const templatesPopup = document.getElementById('templatesPopup');
        
        if (settingsPanel && settingsPanel.classList.contains('active')) {
            settingsPanel.classList.remove('active');
            event.preventDefault();
        } else if (fileUploadModal && fileUploadModal.classList.contains('active')) {
            fileUploadModal.classList.remove('active');
            event.preventDefault();
        } else if (historyEditModal && historyEditModal.classList.contains('active')) {
            historyEditModal.classList.remove('active');
            event.preventDefault();
        } else if (templatesPopup && templatesPopup.classList.contains('active')) {
            templatesPopup.classList.remove('active');
            event.preventDefault();
        }
    }
    
    // Ctrl+/ to toggle sidebar
    if (event.key === '/' && (event.ctrlKey || event.metaKey)) {
        toggleSidebar();
        event.preventDefault();
    }
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Adjust UI for mobile if needed
    const isMobile = window.innerWidth < 768;
    
    if (isMobile && sidebar && sidebar.classList.contains('expanded')) {
        sidebar.classList.remove('expanded');
    }
}

/**
 * Apply theme preferences (light/dark mode)
 */
function applyThemePreferences() {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (savedTheme !== 'light' && prefersDarkMode)) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

/**
 * Update notification count
 * @param {number} count - The notification count to display
 */
export function updateNotificationCount(count) {
    const notificationBadge = document.getElementById('notification-badge');
    if (!notificationBadge) return;
    
    if (count > 0) {
        notificationBadge.textContent = count > 99 ? '99+' : count;
        notificationBadge.style.display = 'flex';
    } else {
        notificationBadge.style.display = 'none';
    }
}

/**
 * Toggle dark/light theme
 */
export function toggleTheme() {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    
    if (isDarkTheme) {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}
