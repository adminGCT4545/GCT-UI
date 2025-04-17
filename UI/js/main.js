/**
 * KYNSEY AI - Main JavaScript File
 * 
 * This file serves as the entry point for the application's JavaScript.
 * It initializes all necessary modules.
 */

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing KYNSEY AI App...');
    console.log('DOM fully loaded');
    
    try {
        // Initialize UI components
        if (window.ui && typeof window.ui.initializeUI === 'function') {
            console.log('Initializing UI components...');
            window.ui.initializeUI();
            console.log('UI components initialized');
        } else {
            console.error('UI module not loaded');
        }
        
        // Initialize conversation management
        if (window.conversations && typeof window.conversations.initializeConversations === 'function') {
            console.log('Initializing conversations...');
            window.conversations.initializeConversations();
            console.log('Conversations initialized');
        } else {
            console.error('Conversations module not loaded');
        }
        
        // Initialize settings panel
        if (window.settings && typeof window.settings.initializeSettings === 'function') {
            console.log('Initializing settings...');
            window.settings.initializeSettings();
            console.log('Settings initialized');
        } else {
            console.error('Settings module not loaded');
        }
        
        // Initialize file upload functionality
        if (window.fileUpload && typeof window.fileUpload.initializeFileUpload === 'function') {
            console.log('Initializing file upload...');
            window.fileUpload.initializeFileUpload();
            console.log('File upload initialized');
        } else {
            console.error('File upload module not loaded');
        }
        
        // Initialize notepad
        if (window.notepad && typeof window.notepad.initializeNotepad === 'function') {
            console.log('Initializing notepad...');
            window.notepad.initializeNotepad();
            console.log('Notepad initialized');
        } else {
            console.error('Notepad module not loaded');
        }
        
        // Initialize batch processing
        if (window.batchProcessing && typeof window.batchProcessing.initializeBatchProcessing === 'function') {
            console.log('Initializing batch processing...');
            window.batchProcessing.initializeBatchProcessing();
            console.log('Batch processing initialized');
        } else {
            console.error('Batch processing module not loaded');
        }
        
        // Initialize dashboard
        if (window.dashboard && typeof window.dashboard.initializeDashboard === 'function') {
            console.log('Initializing dashboard...');
            window.dashboard.initializeDashboard();
            console.log('Dashboard initialized');
        } else {
            console.error('Dashboard module not loaded');
        }
        
        // Add event listeners for UI elements
        console.log('Adding event listeners for UI elements...');
        
        // Sidebar toggle button
        const collapseToggleBtn = document.getElementById('collapseToggleBtn');
        if (collapseToggleBtn) {
            console.log('Adding click event listener to sidebar toggle button');
            collapseToggleBtn.addEventListener('click', function() {
                console.log('Sidebar toggle button clicked');
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    console.log('Toggling sidebar expanded class');
                    sidebar.classList.toggle('expanded');
                    console.log('Sidebar classList after toggle:', sidebar.classList);
                } else {
                    console.error('Sidebar element not found');
                }
            });
        } else {
            console.error('Sidebar toggle button not found');
        }
        
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            console.log('Adding click event listener to settings button');
            settingsBtn.addEventListener('click', function() {
                console.log('Settings button clicked');
                const settingsPanel = document.getElementById('settingsPanel');
                if (settingsPanel) {
                    console.log('Toggling settings panel active class');
                    settingsPanel.classList.toggle('active');
                    console.log('Settings panel classList after toggle:', settingsPanel.classList);
                } else {
                    console.error('Settings panel not found');
                }
            });
        } else {
            console.error('Settings button not found');
        }
        
        // Close settings button
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        if (closeSettingsBtn) {
            console.log('Adding click event listener to close settings button');
            closeSettingsBtn.addEventListener('click', function() {
                console.log('Close settings button clicked');
                const settingsPanel = document.getElementById('settingsPanel');
                if (settingsPanel) {
                    console.log('Removing active class from settings panel');
                    settingsPanel.classList.remove('active');
                    console.log('Settings panel classList after removing active:', settingsPanel.classList);
                } else {
                    console.error('Settings panel not found');
                }
            });
        } else {
            console.error('Close settings button not found');
        }
        
        // File upload button
        const uploadBtn = document.getElementById('uploadFileBtn');
        if (uploadBtn) {
            console.log('Adding click event listener to file upload button');
            uploadBtn.addEventListener('click', function() {
                console.log('File upload button clicked');
                const fileUploadModal = document.getElementById('fileUploadModal');
                if (fileUploadModal) {
                    console.log('Adding active class to file upload modal');
                    fileUploadModal.classList.add('active');
                    console.log('File upload modal classList after adding active:', fileUploadModal.classList);
                } else {
                    console.error('File upload modal not found');
                }
            });
        } else {
            console.error('File upload button not found');
        }
        
        // Close file upload modal button
        const closeFileUploadBtn = document.getElementById('closeFileUploadBtn');
        if (closeFileUploadBtn) {
            console.log('Adding click event listener to close file upload button');
            closeFileUploadBtn.addEventListener('click', function() {
                console.log('Close file upload button clicked');
                const fileUploadModal = document.getElementById('fileUploadModal');
                if (fileUploadModal) {
                    console.log('Removing active class from file upload modal');
                    fileUploadModal.classList.remove('active');
                    console.log('File upload modal classList after removing active:', fileUploadModal.classList);
                    
                    // Reset file upload state
                    if (window.fileUpload && typeof window.fileUpload.resetFileUpload === 'function') {
                        window.fileUpload.resetFileUpload();
                    }
                } else {
                    console.error('File upload modal not found');
                }
            });
        } else {
            console.error('Close file upload button not found');
        }
        
        // Dashboard view button
        const viewModeToggle = document.getElementById('viewModeToggle');
        if (viewModeToggle) {
            console.log('Adding click event listener to view mode toggle button');
            viewModeToggle.addEventListener('click', function() {
                console.log('View mode toggle button clicked');
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    console.log('Toggling dashboard view class on main content');
                    mainContent.classList.toggle('dashboard-view');
                    console.log('Main content classList after toggle:', mainContent.classList);
                    
                    // Update button text
                    if (mainContent.classList.contains('dashboard-view')) {
                        viewModeToggle.textContent = 'Chat View';
                    } else {
                        viewModeToggle.textContent = 'Dashboard View';
                    }
                } else {
                    console.error('Main content element not found');
                }
            });
        } else {
            console.error('View mode toggle button not found');
        }
        
        // Template button
        const templateBtn = document.getElementById('templateBtn');
        const templatesPopup = document.getElementById('templatesPopup');
        if (templateBtn && templatesPopup) {
            console.log('Adding click event listener to template button (main.js)');
            templateBtn.addEventListener('click', function() {
                console.log('Template button clicked (main.js)');
                templatesPopup.classList.toggle('active');
                console.log('Templates popup active class toggled:', templatesPopup.classList.contains('active'));
                
                // Call renderTemplatesPopup function if it exists
                if (typeof window.renderTemplatesPopup === 'function') {
                    console.log('Calling renderTemplatesPopup function (main.js)');
                    window.renderTemplatesPopup();
                } else {
                    console.error('renderTemplatesPopup function not found (main.js)');
                }
            });
        } else {
            console.error('Template button or templates popup element not found (main.js)');
        }
        
        // Notepad toggle button
        const notepadToggleBtn = document.getElementById('notepadToggleBtn');
        if (notepadToggleBtn) {
            console.log('Adding click event listener to notepad toggle button (main.js)');
            notepadToggleBtn.addEventListener('click', function() {
                console.log('Notepad toggle button clicked (main.js)');
                if (window.notepad && typeof window.notepad.initializeNotepad === 'function') {
                    // Ensure notepad is initialized
                    window.notepad.initializeNotepad();
                }
                
                // Get the notepad container
                const notepadContainer = document.getElementById('notepadContainer');
                if (notepadContainer) {
                    console.log('Toggling notepad visibility');
                    const isVisible = notepadContainer.style.display !== 'none';
                    
                    if (isVisible) {
                        notepadContainer.style.display = 'none';
                    } else {
                        notepadContainer.style.display = 'block';
                        
                        // Make sure right panel is visible
                        const rightPanel = document.getElementById('rightPanel');
                        if (rightPanel) {
                            rightPanel.classList.add('visible');
                        }
                    }
                } else {
                    console.error('Notepad container not found (main.js)');
                }
            });
        } else {
            console.error('Notepad toggle button not found (main.js)');
        }
        
        // Send button
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');
        if (sendButton && messageInput) {
            console.log('Adding click event listener to send button');
            sendButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Send button clicked');
                const message = messageInput.value.trim();
                if (message) {
                    console.log('Sending message:', message);
                    // Add user message to chat
                    const chatContainer = document.getElementById('chatContainer');
                    if (chatContainer) {
                        const userMessage = document.createElement('div');
                        userMessage.className = 'message user-message';
                        userMessage.textContent = message;
                        chatContainer.appendChild(userMessage);
                        
                        // Clear input
                        messageInput.value = '';
                        
                        // Simulate assistant response
                        setTimeout(() => {
                            const assistantMessage = document.createElement('div');
                            assistantMessage.className = 'message assistant-message';
                            assistantMessage.textContent = "I'm here to help! What would you like to know?";
                            chatContainer.appendChild(assistantMessage);
                            
                            // Scroll to bottom
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        }, 1000);
                        
                        // Scroll to bottom
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    } else {
                        console.error('Chat container not found');
                    }
                } else {
                    console.log('Message is empty');
                }
            });
            
            // Enable/disable send button based on input
            messageInput.addEventListener('input', function() {
                sendButton.disabled = messageInput.value.trim() === '';
            });
        } else {
            console.error('Send button or message input not found');
        }
        
        console.log('KYNSEY AI App initialized successfully.');
    } catch (error) {
        console.error('Error initializing KYNSEY AI App:', error);
    }
});
