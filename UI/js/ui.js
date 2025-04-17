/**
 * KYNSEY AI - UI Module
 * 
 * Handles general UI functionality and interactions that don't belong to specific components.
 */

// Create a global UI object
window.ui = {};

// DOM Elements
let sidebar;
let collapseToggleBtn;
let mainContent;
let viewModeToggle;
window.ui.currentViewMode = 'chat';

/**
 * Initialize UI components and event listeners
 */
window.ui.initializeUI = function() {
    console.log('UI initializeUI function called');
    
    // Get DOM elements
    sidebar = document.getElementById('sidebar');
    collapseToggleBtn = document.getElementById('collapseToggleBtn');
    mainContent = document.getElementById('mainContent');
    viewModeToggle = document.getElementById('viewModeToggle');
    
    // Set up event listeners
    console.log('About to call setupEventListeners');
    setupEventListeners();
    console.log('setupEventListeners completed');
    
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
    
    // Template button
    const templateBtn = document.getElementById('templateBtn');
    const templatesPopup = document.getElementById('templatesPopup');
    if (templateBtn && templatesPopup) {
        console.log('Setting up template button click listener');
        templateBtn.addEventListener('click', () => {
            console.log('Template button clicked');
            templatesPopup.classList.toggle('active');
            console.log('Templates popup active class toggled:', templatesPopup.classList.contains('active'));
            
            // Check if renderTemplatesPopup function exists
            if (typeof window.renderTemplatesPopup === 'function') {
                console.log('Calling renderTemplatesPopup function');
                window.renderTemplatesPopup();
            } else {
                console.error('renderTemplatesPopup function not found');
            }
        });
    } else {
        console.error('Template button or templates popup element not found', {
            templateBtn: !!templateBtn,
            templatesPopup: !!templatesPopup
        });
    }
    
    // View/Edit History button
    const viewEditHistoryBtn = document.getElementById('viewEditHistoryBtn');
    if (viewEditHistoryBtn) {
        viewEditHistoryBtn.addEventListener('click', () => {
            if (typeof window.conversations !== 'undefined' && 
                typeof window.conversations.showHistoryEditModal === 'function') {
                window.conversations.showHistoryEditModal();
            }
        });
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
    // Set sidebar state (expanded/collapsed) - default to collapsed in new design
    const sidebarState = localStorage.getItem('sidebarState') || 'collapsed';
    if (sidebarState === 'expanded' && sidebar) {
        sidebar.classList.add('expanded');
        if (collapseToggleBtn) {
            collapseToggleBtn.innerHTML = '<span>&lt;&lt;</span>';
            collapseToggleBtn.title = "Collapse Menu";
        }
    } else if (sidebar) {
        sidebar.classList.remove('expanded');
        if (collapseToggleBtn) {
            collapseToggleBtn.innerHTML = '<span>&gt;</span>';
            collapseToggleBtn.title = "Expand Menu";
        }
    }
    
    // Set view mode (chat/dashboard)
    window.ui.currentViewMode = localStorage.getItem('viewMode') || 'chat';
    updateViewMode();
}

/**
 * Toggle sidebar between expanded and collapsed states
 */
function toggleSidebar() {
    console.log('Toggle sidebar called');
    
    // Get sidebar element directly
    sidebar = document.getElementById('sidebar');
    
    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }
    
    console.log('Sidebar element:', sidebar);
    
    const isExpanded = sidebar.classList.contains('expanded');
    console.log('Sidebar is expanded:', isExpanded);
    
    if (isExpanded) {
        console.log('Removing expanded class');
        sidebar.classList.remove('expanded');
        localStorage.setItem('sidebarState', 'collapsed');
        if (collapseToggleBtn) {
            collapseToggleBtn.innerHTML = '<span>&gt;</span>';
            collapseToggleBtn.title = "Expand Menu";
        }
    } else {
        console.log('Adding expanded class');
        sidebar.classList.add('expanded');
        localStorage.setItem('sidebarState', 'expanded');
        if (collapseToggleBtn) {
            collapseToggleBtn.innerHTML = '<span>&lt;&lt;</span>';
            collapseToggleBtn.title = "Collapse Menu";
        }
    }
    
    console.log('Sidebar classList after toggle:', sidebar.classList);
    console.log('Sidebar toggled, new state:', sidebar.classList.contains('expanded'));
}

/**
 * Toggle between chat view and dashboard view
 */
function toggleViewMode() {
    window.ui.currentViewMode = window.ui.currentViewMode === 'chat' ? 'dashboard' : 'chat';
    updateViewMode();
    localStorage.setItem('viewMode', window.ui.currentViewMode);
}

/**
 * Update the UI based on the current view mode
 */
function updateViewMode() {
    if (!mainContent || !viewModeToggle) return;
    
    const analysisDashboard = document.getElementById('analysisDashboard');
    const inputContainer = document.querySelector('.input-container');
    const rightPanel = document.getElementById('rightPanel');
    
    if (window.ui.currentViewMode === 'chat') {
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
    if (window.ui.currentViewMode !== 'dashboard') return;
    
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
        if (typeof window.fileUpload !== 'undefined' && typeof window.fileUpload.resetFileUpload === 'function') {
            window.fileUpload.resetFileUpload();
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
 * Note: In the new design, dark theme is default and light theme is optional
 */
function applyThemePreferences() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
}

/**
 * Update notification count
 * @param {number} count - The notification count to display
 */
window.ui.updateNotificationCount = function(count) {
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
window.ui.toggleTheme = function() {
    const isLightTheme = document.body.classList.contains('light-theme');
    
    if (isLightTheme) {
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    }
}
