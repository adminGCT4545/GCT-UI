/**
 * Notepad Module
 * 
 * Handles the notepad functionality for taking and organizing notes.
 */

// Create a global notepad object
window.notepad = {};

// DOM Elements
let notepadContent;
let notepadContainer;
let notepadToggleBtn;

/**
 * Initialize notepad functionality
 */
window.notepad.initializeNotepad = function() {
    // Get DOM elements
    notepadContent = document.createElement('div');
    notepadContent.id = 'notepadContent';
    notepadContent.className = 'notepad-content';
    notepadContent.contentEditable = true;
    notepadContent.spellcheck = false;
    notepadContent.setAttribute('data-placeholder', 'Type your notes here... Use /note in chat or ask AI to edit.');
    
    // Create notepad container if it doesn't exist
    notepadContainer = document.getElementById('notepadContainer');
    if (!notepadContainer) {
        notepadContainer = document.createElement('div');
        notepadContainer.id = 'notepadContainer';
        notepadContainer.className = 'notepad-container';
        notepadContainer.style.display = 'none';
        
        const notepadHeader = document.createElement('div');
        notepadHeader.className = 'notepad-header';
        
        const notepadTitle = document.createElement('div');
        notepadTitle.className = 'notepad-title';
        notepadTitle.textContent = 'Notepad';
        
        const notepadActions = document.createElement('div');
        notepadActions.className = 'notepad-actions';
        
        const trashNotepadBtn = document.createElement('button');
        trashNotepadBtn.className = 'trash-notepad';
        trashNotepadBtn.innerHTML = '🗑️';
        trashNotepadBtn.title = 'Clear notepad';
        trashNotepadBtn.onclick = clearNotepad;
        
        const closeNotepadBtn = document.createElement('button');
        closeNotepadBtn.className = 'close-notepad';
        closeNotepadBtn.innerHTML = '&times;';
        closeNotepadBtn.title = 'Close notepad';
        closeNotepadBtn.onclick = toggleNotepad;
        
        notepadActions.appendChild(trashNotepadBtn);
        notepadActions.appendChild(closeNotepadBtn);
        
        notepadHeader.appendChild(notepadTitle);
        notepadHeader.appendChild(notepadActions);
        
        // Create notepad footer
        const notepadFooter = document.createElement('div');
        notepadFooter.className = 'notepad-footer';
        
        const notepadStatus = document.createElement('div');
        notepadStatus.className = 'notepad-status';
        notepadStatus.textContent = 'Ready';
        
        const notepadButtons = document.createElement('div');
        notepadButtons.className = 'notepad-buttons';
        
        const saveNotepadBtn = document.createElement('button');
        saveNotepadBtn.className = 'save-notepad';
        saveNotepadBtn.textContent = 'Save';
        saveNotepadBtn.onclick = saveNotepadContent;
        
        const askAIBtn = document.createElement('button');
        askAIBtn.className = 'ask-ai-edit';
        askAIBtn.textContent = 'Ask AI to edit';
        askAIBtn.onclick = askAIToEdit;
        
        notepadButtons.appendChild(saveNotepadBtn);
        notepadButtons.appendChild(askAIBtn);
        
        notepadFooter.appendChild(notepadStatus);
        notepadFooter.appendChild(notepadButtons);
        
        notepadContainer.appendChild(notepadHeader);
        notepadContainer.appendChild(notepadContent);
        notepadContainer.appendChild(notepadFooter);
        
        // Add to right panel
        const rightPanel = document.getElementById('rightPanel');
        if (rightPanel) {
            rightPanel.appendChild(notepadContainer);
        } else {
            document.body.appendChild(notepadContainer);
        }
    }
    
    // Create notepad toggle button if it doesn't exist
    notepadToggleBtn = document.getElementById('notepadToggleBtn');
    if (!notepadToggleBtn) {
        notepadToggleBtn = document.createElement('button');
        notepadToggleBtn.id = 'notepadToggleBtn';
        notepadToggleBtn.className = 'input-action-button';
        notepadToggleBtn.title = 'Toggle Notepad';
        notepadToggleBtn.innerHTML = '<span>📝</span>';
        notepadToggleBtn.onclick = toggleNotepad;
        
        // Add to input actions
        const inputActions = document.querySelector('.input-actions');
        if (inputActions) {
            inputActions.appendChild(notepadToggleBtn);
        }
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load saved notepad content
    window.notepad.loadNotepadContent();
}

/**
 * Set up event listeners for notepad
 */
function setupEventListeners() {
    if (notepadContent) {
        // Save content on input
        notepadContent.addEventListener('input', saveNotepadContent);
        
        // Handle keyboard shortcuts
        notepadContent.addEventListener('keydown', (e) => {
            // Ctrl+B for bold
            if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                document.execCommand('bold', false, null);
            }
            
            // Ctrl+I for italic
            if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                document.execCommand('italic', false, null);
            }
            
            // Ctrl+U for underline
            if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                document.execCommand('underline', false, null);
            }
        });
    }
}

/**
 * Toggle notepad visibility
 */
function toggleNotepad() {
    console.log('Toggle notepad called');
    
    if (!notepadContainer) {
        console.error('Notepad container not found');
        return;
    }
    
    const isVisible = notepadContainer.style.display !== 'none';
    console.log('Notepad is visible:', isVisible);
    
    if (isVisible) {
        console.log('Hiding notepad');
        notepadContainer.style.display = 'none';
    } else {
        console.log('Showing notepad');
        notepadContainer.style.display = 'block';
        
        // Make sure right panel is visible
        const rightPanel = document.getElementById('rightPanel');
        if (rightPanel) {
            console.log('Making right panel visible');
            rightPanel.classList.add('visible');
        } else {
            console.error('Right panel not found');
        }
        
        // Focus notepad
        if (notepadContent) {
            console.log('Focusing notepad content');
            notepadContent.focus();
        } else {
            console.error('Notepad content not found');
        }
    }
}

/**
 * Save notepad content to localStorage
 */
function saveNotepadContent() {
    if (!notepadContent || !window.conversations || !window.conversations.currentConversationId) return;
    
    const content = notepadContent.innerHTML;
    
    // Save to conversation
    if (window.conversations.conversations[window.conversations.currentConversationId]) {
        window.conversations.conversations[window.conversations.currentConversationId].notepadContent = content;
        
        // Save conversations
        localStorage.setItem('kynseyAiConversations', JSON.stringify(window.conversations.conversations));
        
        // Update status
        updateNotepadStatus('Saved');
        setTimeout(() => {
            updateNotepadStatus('Ready');
        }, 2000);
    }
}

/**
 * Clear notepad content
 */
function clearNotepad() {
    if (!notepadContent) return;
    
    if (confirm('Are you sure you want to clear the notepad?')) {
        notepadContent.innerHTML = '';
        saveNotepadContent();
        updateNotepadStatus('Cleared');
        setTimeout(() => {
            updateNotepadStatus('Ready');
        }, 2000);
    }
}

/**
 * Ask AI to edit the notepad content
 */
function askAIToEdit() {
    if (!notepadContent) return;
    
    const content = notepadContent.innerHTML;
    
    // In a real implementation, this would send the content to the AI
    // For now, we'll just update the status
    updateNotepadStatus('Asking AI...');
    
    // Simulate AI response
    setTimeout(() => {
        updateNotepadStatus('AI editing...');
        
        // Simulate AI editing
        setTimeout(() => {
            updateNotepadStatus('Ready');
        }, 2000);
    }, 1000);
}

/**
 * Update the notepad status
 * @param {string} status - The status text to display
 */
function updateNotepadStatus(status) {
    const notepadStatus = document.querySelector('.notepad-status');
    if (notepadStatus) {
        notepadStatus.textContent = status;
    }
}

/**
 * Load notepad content from localStorage
 */
window.notepad.loadNotepadContent = function() {
    if (!notepadContent || !window.conversations || !window.conversations.currentConversationId) return;
    
    // Get content from conversation
    if (window.conversations.conversations[window.conversations.currentConversationId]) {
        const content = window.conversations.conversations[window.conversations.currentConversationId].notepadContent || '';
        notepadContent.innerHTML = content;
    } else {
        notepadContent.innerHTML = '';
    }
}

/**
 * Add a note from chat
 * @param {string} noteText - The note text to add
 */
window.notepad.addNoteFromChat = function(noteText) {
    if (!notepadContent || !noteText) return;
    
    // Format the note
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedNote = `<p><strong>${timestamp}:</strong> ${noteText}</p>`;
    
    // Add to notepad
    notepadContent.innerHTML += formattedNote;
    
    // Save notepad content
    saveNotepadContent();
    
    // Show notepad
    if (notepadContainer) {
        notepadContainer.style.display = 'block';
        
        // Make sure right panel is visible
        const rightPanel = document.getElementById('rightPanel');
        if (rightPanel) {
            rightPanel.classList.add('visible');
        }
    }
}

/**
 * Update notepad content from AI
 * @param {string} newContentHtml - The new content HTML
 * @param {boolean} highlightChanges - Whether to highlight changes
 */
window.notepad.updateNotepadFromAI = function(newContentHtml, highlightChanges = true) {
    if (!notepadContent) return;
    
    if (highlightChanges) {
        // In a real implementation, this would highlight the differences
        // For now, we'll just add a highlight class to the new content
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedContent = `<div class="ai-suggestion"><p><em>AI suggestion (${timestamp}):</em></p>${newContentHtml}</div>`;
        notepadContent.innerHTML += formattedContent;
    } else {
        notepadContent.innerHTML = newContentHtml;
    }
    
    // Save notepad content
    saveNotepadContent();
    
    // Show notepad
    if (notepadContainer) {
        notepadContainer.style.display = 'block';
        
        // Make sure right panel is visible
        const rightPanel = document.getElementById('rightPanel');
        if (rightPanel) {
            rightPanel.classList.add('visible');
        }
    }
}
