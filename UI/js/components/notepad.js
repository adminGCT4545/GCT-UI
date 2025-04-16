/**
 * Notepad Module
 * 
 * Handles notepad functionality for taking notes during conversations.
 */

// DOM Elements
let notepadContainer;
let notepadContent;
let notepadToggleBtn;
let notepadCollapseBtn;
let notepadClearBtn;
let notepadSaveBtn;
let notepadAskLLMBtn;
let notepadStatus;

/**
 * Initialize notepad functionality
 */
export function initializeNotepad() {
    // Get DOM elements
    notepadContainer = document.getElementById('notepadContainer');
    notepadContent = document.getElementById('notepadContent');
    notepadToggleBtn = document.getElementById('notepadToggleBtn');
    notepadCollapseBtn = document.getElementById('notepadCollapseBtn');
    notepadClearBtn = document.getElementById('notepadClearBtn');
    notepadSaveBtn = document.getElementById('notepadSaveBtn');
    notepadAskLLMBtn = document.getElementById('notepadAskLLMBtn');
    notepadStatus = document.getElementById('notepadStatus');
    
    // Set up event listeners
    setupEventListeners();
    
    // Make functions available globally for other modules
    window.loadNotepadContent = loadNotepadContent;
    window.addNoteFromChat = addNoteFromChat;
}

/**
 * Set up event listeners for notepad
 */
function setupEventListeners() {
    // Toggle notepad visibility
    if (notepadToggleBtn) {
        notepadToggleBtn.addEventListener('click', toggleNotepad);
    }
    
    // Collapse notepad
    if (notepadCollapseBtn) {
        notepadCollapseBtn.addEventListener('click', () => {
            notepadContainer.classList.remove('visible');
        });
    }
    
    // Clear notepad
    if (notepadClearBtn) {
        notepadClearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the notepad?')) {
                notepadContent.innerHTML = '';
                saveNotepadContent();
                updateNotepadStatus('Cleared');
            }
        });
    }
    
    // Save notepad content
    if (notepadSaveBtn) {
        notepadSaveBtn.addEventListener('click', () => {
            saveNotepadContent();
            updateNotepadStatus('Saved');
        });
    }
    
    // Ask AI to edit notepad
    if (notepadAskLLMBtn) {
        notepadAskLLMBtn.addEventListener('click', askAIToEditNotepad);
    }
    
    // Auto-save on input
    if (notepadContent) {
        notepadContent.addEventListener('input', () => {
            // Debounce save to avoid saving on every keystroke
            clearTimeout(notepadContent.saveTimeout);
            notepadContent.saveTimeout = setTimeout(() => {
                saveNotepadContent();
                updateNotepadStatus('Auto-saved');
            }, 2000);
        });
    }
}

/**
 * Toggle notepad visibility
 */
function toggleNotepad() {
    if (!notepadContainer) return;
    
    const isVisible = notepadContainer.classList.contains('visible');
    
    if (isVisible) {
        notepadContainer.classList.remove('visible');
    } else {
        notepadContainer.classList.add('visible');
        loadNotepadContent();
        
        // Focus notepad
        if (notepadContent) {
            notepadContent.focus();
        }
    }
}

/**
 * Load notepad content from current conversation
 */
export function loadNotepadContent() {
    if (!notepadContent) return;
    
    const currentConversationId = window.currentConversationId;
    const conversations = window.conversations;
    
    if (currentConversationId && conversations && conversations[currentConversationId]) {
        const notepadText = conversations[currentConversationId].notepadContent || '';
        notepadContent.innerHTML = notepadText;
    } else {
        notepadContent.innerHTML = '';
    }
}

/**
 * Save notepad content to current conversation
 */
function saveNotepadContent() {
    if (!notepadContent) return;
    
    const currentConversationId = window.currentConversationId;
    const conversations = window.conversations;
    
    if (currentConversationId && conversations && conversations[currentConversationId]) {
        conversations[currentConversationId].notepadContent = notepadContent.innerHTML;
        
        // Save conversations if the function is available
        if (typeof window.saveConversations === 'function') {
            window.saveConversations();
        } else {
            localStorage.setItem('kynseyAiConversations', JSON.stringify(conversations));
        }
    }
}

/**
 * Add a note from chat to the notepad
 * @param {string} noteText - The note text to add
 */
export function addNoteFromChat(noteText) {
    if (!notepadContent || !noteText) return;
    
    // Show notepad if it's hidden
    if (notepadContainer && !notepadContainer.classList.contains('visible')) {
        notepadContainer.classList.add('visible');
    }
    
    // Add the note with a timestamp
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedNote = `<div><strong>${timestamp}:</strong> ${noteText}</div>`;
    
    // Append to existing content
    notepadContent.innerHTML += formattedNote;
    
    // Save the updated content
    saveNotepadContent();
    
    // Update status
    updateNotepadStatus('Note added');
}

/**
 * Ask AI to edit or improve the notepad content
 */
function askAIToEditNotepad() {
    if (!notepadContent) return;
    
    const currentContent = notepadContent.innerHTML;
    
    if (!currentContent.trim()) {
        updateNotepadStatus('Notepad is empty');
        return;
    }
    
    // Update status
    updateNotepadStatus('Asking AI to edit...');
    
    // In a real implementation, this would call the AI API
    // For now, simulate a response
    setTimeout(() => {
        // Get plain text content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentContent;
        const plainText = tempDiv.textContent;
        
        // Simulate AI improving the content
        const improvedContent = improveNotepadContent(plainText);
        
        // Update notepad
        notepadContent.innerHTML = improvedContent;
        
        // Save the updated content
        saveNotepadContent();
        
        // Update status
        updateNotepadStatus('AI edit complete');
    }, 1500);
}

/**
 * Simulate AI improving notepad content
 * @param {string} content - The original content
 * @returns {string} Improved content
 */
function improveNotepadContent(content) {
    // This is a simple simulation of AI improving the content
    // In a real implementation, this would call an AI API
    
    // Add formatting
    let improved = content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Add structure
    improved = `<h3>Organized Notes</h3><p>${improved}</p>`;
    
    // Add a summary
    improved += `<h3>Summary</h3><p>These notes cover key points from the conversation, including important details and action items.</p>`;
    
    return improved;
}

/**
 * Update the notepad status message
 * @param {string} message - The status message
 */
function updateNotepadStatus(message) {
    if (!notepadStatus) return;
    
    notepadStatus.textContent = message;
    notepadStatus.style.opacity = '1';
    
    // Fade out after a delay
    clearTimeout(notepadStatus.fadeTimeout);
    notepadStatus.fadeTimeout = setTimeout(() => {
        notepadStatus.style.opacity = '0.7';
    }, 3000);
}
