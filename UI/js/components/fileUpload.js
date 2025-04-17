/**
 * File Upload Module
 * 
 * Handles file upload functionality for the application.
 */

// Create a global fileUpload object
window.fileUpload = {};

// DOM Elements
let fileUploadModal;
let fileUploadArea;
let fileInput;
let filePreview;
let fileInfo;
let confirmUploadBtn;
let cancelUploadBtn;
let uploadBtn;

// State
let currentFile = null;

/**
 * Initialize file upload functionality
 */
window.fileUpload.initializeFileUpload = function() {
    // Get DOM elements
    fileUploadModal = document.getElementById('fileUploadModal');
    fileUploadArea = document.getElementById('fileUploadArea');
    fileInput = document.getElementById('fileInput');
    filePreview = document.createElement('img');
    filePreview.className = 'file-preview';
    fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    confirmUploadBtn = document.getElementById('confirmUploadBtn');
    cancelUploadBtn = document.getElementById('cancelUploadBtn');
    uploadBtn = document.getElementById('uploadFileBtn');
    
    // Add file preview and info elements to the DOM
    if (fileUploadArea) {
        fileUploadArea.appendChild(filePreview);
        fileUploadArea.appendChild(fileInfo);
    }
    
    // Set up event listeners
    setupEventListeners();
}

/**
 * Set up event listeners for file upload
 */
function setupEventListeners() {
    // Upload button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', showFileUploadModal);
    }
    
    // File upload area click
    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
    
    // Drag and drop
    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });
        
        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });
        
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                handleFileSelection({ target: { files: e.dataTransfer.files } });
            }
        });
    }
    
    // Confirm upload button
    if (confirmUploadBtn) {
        confirmUploadBtn.addEventListener('click', uploadFile);
    }
    
    // Cancel upload button
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', () => {
            hideFileUploadModal();
            window.fileUpload.resetFileUpload();
        });
    }
    
    // Close modal button
    const closeModalBtn = document.getElementById('closeFileUploadBtn');
    if (closeModalBtn) {
        console.log('Adding click event listener to close modal button');
        closeModalBtn.addEventListener('click', function() {
            console.log('Close modal button clicked');
            const fileUploadModal = document.getElementById('fileUploadModal');
            if (fileUploadModal) {
                console.log('Removing active class from file upload modal');
                fileUploadModal.classList.remove('active');
                console.log('File upload modal classList after removing active:', fileUploadModal.classList);
                window.fileUpload.resetFileUpload();
            } else {
                console.error('File upload modal not found');
            }
        });
    } else {
        console.error('Close modal button not found');
    }
    
    // Add event listener for the close button in the history edit modal
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
            const historyEditModal = document.getElementById('historyEditModal');
            if (historyEditModal) {
                historyEditModal.classList.remove('active');
            }
        });
    }
}

/**
 * Show the file upload modal
 */
function showFileUploadModal() {
    console.log('Show file upload modal called');
    
    // Get file upload modal element directly
    fileUploadModal = document.getElementById('fileUploadModal');
    
    if (!fileUploadModal) {
        console.error('File upload modal not found');
        return;
    }
    
    console.log('File upload modal element:', fileUploadModal);
    console.log('File upload modal classList before adding active:', fileUploadModal.classList);
    
    fileUploadModal.classList.add('active');
    
    console.log('File upload modal classList after adding active:', fileUploadModal.classList);
    console.log('File upload modal should now be visible');
    
    // Check if the modal is actually visible in the DOM
    console.log('File upload modal display style:', window.getComputedStyle(fileUploadModal).display);
}

/**
 * Hide the file upload modal
 */
function hideFileUploadModal() {
    if (!fileUploadModal) return;
    
    fileUploadModal.classList.remove('active');
}

/**
 * Handle file selection
 * @param {Event} event - The file input change event
 */
function handleFileSelection(event) {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    currentFile = file;
    
    // Update file info
    if (fileInfo) {
        fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
        fileInfo.style.display = 'block';
    }
    
    // Show file preview for images
    if (filePreview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            filePreview.src = e.target.result;
            filePreview.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    } else if (filePreview) {
        filePreview.style.display = 'none';
    }
    
    // Enable confirm button
    if (confirmUploadBtn) {
        confirmUploadBtn.disabled = false;
    }
}

/**
 * Format file size for display
 * @param {number} bytes - The file size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Upload the selected file
 */
function uploadFile() {
    if (!currentFile || !window.conversations || !window.conversations.currentConversationId) {
        console.error('No file selected or no active conversation');
        return;
    }
    
    // In a real implementation, this would upload the file to a server
    // For now, we'll just simulate the upload and associate it with the current conversation
    
    // Create a message about the upload
    const messageText = `Uploaded file: ${currentFile.name} (${formatFileSize(currentFile.size)})`;
    
    if (typeof window.conversations.addMessage === 'function') {
        const messageId = window.utils.generateId();
        
        // Create a file placeholder element
        const filePlaceholder = document.createElement('div');
        filePlaceholder.className = 'file-placeholder';
        
        const fileIcon = document.createElement('span');
        fileIcon.textContent = window.utils.getFileIcon(currentFile.type);
        
        const fileName = document.createElement('span');
        fileName.textContent = currentFile.name;
        
        filePlaceholder.appendChild(fileIcon);
        filePlaceholder.appendChild(fileName);
        
        // Add message with file placeholder
        const messageDiv = window.conversations.addMessage(messageText, 'user', { messageId });
        
        if (messageDiv) {
            const contentDiv = messageDiv.querySelector('.message-content');
            if (contentDiv) {
                contentDiv.appendChild(filePlaceholder);
            }
        }
        
        // Add to conversation history
        if (window.conversations.conversations[window.conversations.currentConversationId]) {
            window.conversations.conversations[window.conversations.currentConversationId].history.push({
                role: 'user',
                content: messageText,
                id: messageId,
                file: {
                    name: currentFile.name,
                    type: currentFile.type,
                    size: currentFile.size
                }
            });
            
            // Associate document with conversation if it's a document type
            const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv'];
            
            if (docTypes.some(type => currentFile.type.includes(type))) {
                window.conversations.conversations[window.conversations.currentConversationId].associatedDocument = {
                    name: currentFile.name,
                    type: currentFile.type,
                    size: currentFile.size,
                    uploadedAt: new Date().toISOString()
                };
                
                // Update document viewer if in dashboard mode
                if (typeof window.ui !== 'undefined' && window.ui.currentViewMode === 'dashboard') {
                    const docViewer = document.getElementById('documentViewerPlaceholder');
                    
                    if (docViewer) {
                        docViewer.innerHTML = `Loading ${currentFile.name}...`;
                    }
                }
            }
            
            // Save conversations
            localStorage.setItem('kynseyAiConversations', JSON.stringify(window.conversations.conversations));
        }
        
        // Simulate assistant response
        setTimeout(() => {
            const assistantMessageId = window.utils.generateId();
            const assistantMessage = window.conversations.addMessage('', 'assistant', { 
                messageId: assistantMessageId,
                isHtml: true,
                isStreaming: true
            });
            
            simulateFileAnalysisResponse(assistantMessage, assistantMessageId, currentFile);
        }, 1000);
    }
    
    // Hide modal and reset
    hideFileUploadModal();
    window.fileUpload.resetFileUpload();
}

/**
 * Simulate file analysis response
 * @param {HTMLElement} messageElement - The message element
 * @param {string} messageId - The message ID
 * @param {File} file - The uploaded file
 */
function simulateFileAnalysisResponse(messageElement, messageId, file) {
    // Sample response based on file type
    let response = '';
    
    if (file.type.startsWith('image/')) {
        response = `I've analyzed the image "${file.name}".\n\n` +
            "This appears to be an image file. I can see the contents and identify key elements in it. " +
            "Would you like me to describe what I see in the image, or do you have specific questions about it?";
    } else if (file.type.includes('pdf')) {
        response = `I've analyzed the PDF document "${file.name}".\n\n` +
            "This appears to be a PDF document. I've extracted the text content and can help you understand it. " +
            "The document seems to contain information about [simulated content]. " +
            "Would you like me to summarize the key points or answer specific questions about the document?";
    } else if (file.type.includes('word')) {
        response = `I've analyzed the Word document "${file.name}".\n\n` +
            "This appears to be a Word document. I've extracted the text content and can help you understand it. " +
            "The document seems to be about [simulated content]. " +
            "Would you like me to summarize the key points or answer specific questions about the document?";
    } else if (file.type.includes('csv') || file.type.includes('excel')) {
        response = `I've analyzed the spreadsheet "${file.name}".\n\n` +
            "This appears to be a data file. I've analyzed the data and can help you understand it. " +
            "The data contains [simulated content] with approximately [X] rows and [Y] columns. " +
            "Would you like me to perform some analysis on this data or visualize it in some way?";
    } else {
        response = `I've received the file "${file.name}".\n\n` +
            `This is a ${file.type} file. I can help you analyze its contents or answer questions about it. ` +
            "What would you like to know about this file?";
    }
    
    let index = 0;
    const contentDiv = messageElement.querySelector('.message-content');
    
    // Simulate typing
    const interval = setInterval(() => {
        if (index < response.length) {
            const char = response.charAt(index);
            contentDiv.innerHTML += char;
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
            index++;
        } else {
            clearInterval(interval);
            messageElement.classList.remove('streaming');
            
            // Apply syntax highlighting
            window.utils.highlightCodeInElement(messageElement);
            
            // Add to conversation history
            if (window.conversations && window.conversations.currentConversationId && window.conversations.conversations[window.conversations.currentConversationId]) {
                window.conversations.conversations[window.conversations.currentConversationId].history.push({
                    role: 'assistant',
                    content: response,
                    id: messageId
                });
                
                localStorage.setItem('kynseyAiConversations', JSON.stringify(window.conversations.conversations));
            }
            
            // Create an artifact for document analysis
            if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('csv')) {
                createDocumentAnalysisArtifact(file);
            }
        }
    }, 10);
}

/**
 * Create a document analysis artifact
 * @param {File} file - The uploaded file
 */
function createDocumentAnalysisArtifact(file) {
    if (!window.conversations || typeof window.conversations.renderArtifact !== 'function') return;
    
    // Create a sample artifact based on file type
    let artifactContent = '';
    let artifactType = 'text';
    
    if (file.type.includes('pdf') || file.type.includes('word')) {
        artifactContent = "# Document Analysis\n\n" +
            `## ${file.name}\n\n` +
            "### Key Points\n\n" +
            "- This is a simulated document analysis\n" +
            "- The document appears to be about [topic]\n" +
            "- Key entities mentioned: [Entity 1], [Entity 2], [Entity 3]\n\n" +
            "### Summary\n\n" +
            "This document discusses [simulated content]. It appears to be [formal/informal] in tone " +
            "and likely intended for [audience]. The main thesis seems to be [simulated thesis].";
        artifactType = 'markdown';
    } else if (file.type.includes('csv')) {
        artifactContent = "# Data Analysis\n\n" +
            `## ${file.name}\n\n` +
            "### Dataset Overview\n\n" +
            "- Rows: [simulated number]\n" +
            "- Columns: [simulated number]\n" +
            "- Missing values: [simulated percentage]\n\n" +
            "### Key Statistics\n\n" +
            "| Column | Mean | Median | Min | Max |\n" +
            "|--------|------|--------|-----|-----|\n" +
            "| Col 1  | 42.3 | 40.1   | 10.5| 95.2|\n" +
            "| Col 2  | 18.7 | 15.9   | 0.1 | 45.8|\n\n" +
            "### Correlations\n\n" +
            "Strong positive correlation between [Col 1] and [Col 3] (r=0.85)";
        artifactType = 'markdown';
    }
    
    if (artifactContent) {
        window.conversations.renderArtifact({
            title: `Analysis of ${file.name}`,
            content: artifactContent,
            type: artifactType
        });
    }
}

/**
 * Reset file upload state
 */
window.fileUpload.resetFileUpload = function() {
    currentFile = null;
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (filePreview) {
        filePreview.src = '';
        filePreview.style.display = 'none';
    }
    
    if (fileInfo) {
        fileInfo.textContent = '';
        fileInfo.style.display = 'none';
    }
    
    if (confirmUploadBtn) {
        confirmUploadBtn.disabled = true;
    }
}
