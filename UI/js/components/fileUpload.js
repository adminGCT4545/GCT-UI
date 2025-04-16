/**
 * File Upload Module
 * 
 * Handles file upload functionality and file processing.
 */

import { getFileIcon } from '../utils/utils.js';
import { renderArtifact } from './conversations.js';

// DOM Elements
let fileUploadModal;
let closeFileUploadModalBtn;
let uploadFileBtn;
let fileInput;
let dropArea;
let imagePreview;
let confirmUploadBtn;
let cancelUploadBtn;
let enableOcrCheckbox;
let extractTablesCheckbox;
let segmentDocCheckbox;
let workflowSelect;

// State
let selectedFile = null;

/**
 * Initialize file upload functionality
 */
export function initializeFileUpload() {
    // Get DOM elements
    fileUploadModal = document.getElementById('fileUploadModal');
    closeFileUploadModalBtn = document.getElementById('closeFileUploadModal');
    uploadFileBtn = document.getElementById('uploadFileBtn');
    fileInput = document.getElementById('fileInput');
    dropArea = document.getElementById('dropArea');
    imagePreview = document.getElementById('imagePreview');
    confirmUploadBtn = document.getElementById('confirmUpload');
    cancelUploadBtn = document.getElementById('cancelUpload');
    enableOcrCheckbox = document.getElementById('enableOcr');
    extractTablesCheckbox = document.getElementById('extractTables');
    segmentDocCheckbox = document.getElementById('segmentDoc');
    workflowSelect = document.getElementById('workflowSelect');
    
    // Set up event listeners
    setupEventListeners();
    
    // Make resetFileUpload available globally for other modules
    window.resetFileUpload = resetFileUpload;
}

/**
 * Set up event listeners for file upload
 */
function setupEventListeners() {
    // Open file upload modal
    if (uploadFileBtn) {
        uploadFileBtn.addEventListener('click', () => {
            fileUploadModal.classList.add('active');
        });
    }
    
    // Close file upload modal
    if (closeFileUploadModalBtn) {
        closeFileUploadModalBtn.addEventListener('click', () => {
            fileUploadModal.classList.remove('active');
            resetFileUpload();
        });
    }
    
    // Cancel upload
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', () => {
            fileUploadModal.classList.remove('active');
            resetFileUpload();
        });
    }
    
    // Confirm upload
    if (confirmUploadBtn) {
        confirmUploadBtn.addEventListener('click', processFileUpload);
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Drop area click
    if (dropArea) {
        dropArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Drag and drop events
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.classList.add('dragover');
        });
        
        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('dragover');
        });
        
        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        });
    }
}

/**
 * Handle file selection from input
 * @param {Event} event - The change event
 */
function handleFileSelect(event) {
    if (event.target.files.length > 0) {
        handleFiles(event.target.files);
    }
}

/**
 * Handle files from input or drop
 * @param {FileList} files - The files to handle
 */
function handleFiles(files) {
    selectedFile = files[0];
    
    // Update UI
    if (confirmUploadBtn) {
        confirmUploadBtn.disabled = false;
    }
    
    // Show image preview if it's an image
    if (imagePreview && selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        
        reader.readAsDataURL(selectedFile);
    } else if (imagePreview) {
        imagePreview.style.display = 'none';
    }
    
    // Update drop area text
    if (dropArea) {
        const fileUploadText = dropArea.querySelector('.file-upload-text');
        if (fileUploadText) {
            fileUploadText.textContent = `Selected: ${selectedFile.name} (${formatFileSize(selectedFile.size)})`;
        }
    }
}

/**
 * Process the file upload
 */
function processFileUpload() {
    if (!selectedFile) return;
    
    // Get processing options
    const enableOcr = enableOcrCheckbox ? enableOcrCheckbox.checked : true;
    const extractTables = extractTablesCheckbox ? extractTablesCheckbox.checked : true;
    const segmentDoc = segmentDocCheckbox ? segmentDocCheckbox.checked : false;
    const workflow = workflowSelect ? workflowSelect.value : 'default';
    
    // In a real implementation, this would upload the file to a server
    // For now, simulate processing
    simulateFileProcessing(selectedFile, {
        enableOcr,
        extractTables,
        segmentDoc,
        workflow
    });
    
    // Close modal
    fileUploadModal.classList.remove('active');
}

/**
 * Simulate file processing (for demo purposes)
 * @param {File} file - The file to process
 * @param {Object} options - Processing options
 */
function simulateFileProcessing(file, options) {
    // Show loading message in chat
    const loadingMessageId = generateId();
    const loadingMessage = `Processing ${file.name}...`;
    
    // If addMessage function is available
    if (typeof window.addMessage === 'function') {
        window.addMessage(loadingMessage, 'assistant', { messageId: loadingMessageId });
    } else {
        // Fallback: add message to chat container
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant-message';
            messageDiv.textContent = loadingMessage;
            chatContainer.appendChild(messageDiv);
        }
    }
    
    // Simulate processing delay
    setTimeout(() => {
        // Associate file with current conversation
        associateFileWithConversation(file);
        
        // Generate artifacts based on file type
        generateArtifactsForFile(file, options);
        
        // Update loading message
        const successMessage = `Processed ${file.name} successfully.`;
        
        // If there's a message element with the loading ID, update it
        const loadingMessageElement = document.querySelector(`[data-message-id="${loadingMessageId}"]`);
        if (loadingMessageElement) {
            const contentDiv = loadingMessageElement.querySelector('.message-content');
            if (contentDiv) {
                contentDiv.textContent = successMessage;
            } else {
                loadingMessageElement.textContent = successMessage;
            }
        }
        
        // Update document viewer if in dashboard mode
        updateDocumentViewer(file);
    }, 1500);
}

/**
 * Associate file with current conversation
 * @param {File} file - The file to associate
 */
function associateFileWithConversation(file) {
    const currentConversationId = window.currentConversationId;
    const conversations = window.conversations;
    
    if (currentConversationId && conversations && conversations[currentConversationId]) {
        conversations[currentConversationId].associatedDocument = {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        };
        
        // Save conversations if the function is available
        if (typeof window.saveConversations === 'function') {
            window.saveConversations();
        } else {
            localStorage.setItem('kynseyAiConversations', JSON.stringify(conversations));
        }
    }
}

/**
 * Generate artifacts based on file type
 * @param {File} file - The file to generate artifacts for
 * @param {Object} options - Processing options
 */
function generateArtifactsForFile(file, options) {
    // Generate different artifacts based on file type
    if (file.type.includes('pdf') || file.type.includes('word')) {
        // Text extraction artifact
        const textArtifact = {
            title: 'Extracted Text',
            type: 'text',
            content: `This is the extracted text content from ${file.name}.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.`
        };
        
        renderArtifact(textArtifact);
        
        // If OCR is enabled
        if (options.enableOcr) {
            const ocrArtifact = {
                title: 'OCR Results',
                type: 'text',
                content: `OCR processing results for ${file.name}.\n\nAdditional text extracted from images in the document.`
            };
            
            renderArtifact(ocrArtifact);
        }
        
        // If table extraction is enabled
        if (options.extractTables) {
            const tableArtifact = {
                title: 'Extracted Table',
                type: 'csv',
                content: 'ID,Name,Value\n1,Item 1,15.2\n2,Item 2,10.0\n3,Item 3,22.5'
            };
            
            renderArtifact(tableArtifact);
        }
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
        // Table artifact
        const tableArtifact = {
            title: 'Spreadsheet Data',
            type: 'csv',
            content: 'ID,Name,Value,Category\n1,Item 1,15.2,A\n2,Item 2,10.0,B\n3,Item 3,22.5,A\n4,Item 4,8.7,C'
        };
        
        renderArtifact(tableArtifact);
        
        // Analysis artifact
        const analysisArtifact = {
            title: 'Data Analysis',
            type: 'markdown',
            content: `# Spreadsheet Analysis\n\n## Summary Statistics\n\n- **Count:** 4 items\n- **Total Value:** 56.4\n- **Average Value:** 14.1\n- **Categories:** A (2), B (1), C (1)\n\n## Recommendations\n\nBased on the data, category A has the highest total value.`
        };
        
        renderArtifact(analysisArtifact);
    } else if (file.type.startsWith('image/')) {
        // Image analysis artifact
        const imageAnalysisArtifact = {
            title: 'Image Analysis',
            type: 'markdown',
            content: `# Image Analysis\n\n## Detected Objects\n\n- Person (confidence: 0.92)\n- Chair (confidence: 0.87)\n- Table (confidence: 0.76)\n\n## Scene Classification\n\nIndoor office environment (confidence: 0.89)`
        };
        
        renderArtifact(imageAnalysisArtifact);
        
        // If OCR is enabled
        if (options.enableOcr) {
            const ocrArtifact = {
                title: 'OCR Results',
                type: 'text',
                content: `Text detected in image:\n\n"SAMPLE DOCUMENT\nImportant information\nDate: 2023-04-15\nReference: DOC-12345"`
            };
            
            renderArtifact(ocrArtifact);
        }
    } else if (file.type.includes('dicom')) {
        // DICOM metadata artifact
        const dicomMetadataArtifact = {
            title: 'DICOM Metadata',
            type: 'code',
            language: 'json',
            content: JSON.stringify({
                patientID: 'ANONYMOUS',
                studyDate: '20230415',
                modality: 'MR',
                manufacturer: 'GE MEDICAL SYSTEMS',
                pixelSpacing: [0.5, 0.5],
                rows: 512,
                columns: 512
            }, null, 2)
        };
        
        renderArtifact(dicomMetadataArtifact);
        
        // Analysis artifact
        const analysisArtifact = {
            title: 'Image Analysis',
            type: 'markdown',
            content: `# DICOM Image Analysis\n\n## Findings\n\n- No abnormalities detected\n- Normal tissue contrast\n- Good image quality\n\n## Technical Assessment\n\nThis is a standard MR image with good quality and resolution.`
        };
        
        renderArtifact(analysisArtifact);
    }
}

/**
 * Update document viewer if in dashboard mode
 * @param {File} file - The file that was uploaded
 */
function updateDocumentViewer(file) {
    // Check if in dashboard mode
    if (typeof window.currentViewMode !== 'undefined' && window.currentViewMode === 'dashboard') {
        const docViewer = document.getElementById('documentViewerPlaceholder');
        
        if (docViewer) {
            // In a real implementation, this would display the document
            // For now, just show a placeholder
            docViewer.innerHTML = `
                <div id="annotationToolbar">
                    <button class="tool-btn">Highlight</button>
                    <button class="tool-btn">Comment</button>
                    <button class="tool-btn">Draw</button>
                </div>
                <div style="text-align: center; padding: 1rem;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">${getFileIcon(file.type)}</div>
                    <div>${file.name}</div>
                    <div style="color: var(--text-muted); font-size: 0.8rem;">${formatFileSize(file.size)}</div>
                </div>
            `;
        }
    }
}

/**
 * Reset file upload state
 */
export function resetFileUpload() {
    selectedFile = null;
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }
    
    if (confirmUploadBtn) {
        confirmUploadBtn.disabled = true;
    }
    
    if (dropArea) {
        const fileUploadText = dropArea.querySelector('.file-upload-text');
        if (fileUploadText) {
            fileUploadText.textContent = 'Drag & drop file or click to browse (PDF, DOCX, XLSX, DICOM, Images, Text...)';
        }
    }
    
    // Reset checkboxes to defaults
    if (enableOcrCheckbox) enableOcrCheckbox.checked = true;
    if (extractTablesCheckbox) extractTablesCheckbox.checked = true;
    if (segmentDocCheckbox) segmentDocCheckbox.checked = false;
    if (workflowSelect) workflowSelect.value = 'default';
}

/**
 * Format file size for display
 * @param {number} bytes - The file size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
