/**
 * Conversations Module
 * 
 * Handles conversation management, including creating, loading, and saving conversations.
 */

import { generateId, sanitizeHTML, parseAndSanitizeMarkdown, highlightCodeInElement, autoResizeTextarea } from '../utils/utils.js';

// DOM Elements
let conversationList;
let conversationTitle;
let conversationTitleInput;
let chatContainer;
let messageInput;
let sendButton;
let newChatBtn;
let viewEditHistoryBtn;
let historyEditModal;
let historyEditContent;

// State
let conversations = {};
let currentConversationId = null;
let selectedModel = 'llama3:8b';
let currentTemperature = 0.7;
let isThinkingModeEnabled = false;
let isWebSearchEnabled = false;
let currentResponseStyle = 'normal';
let currentDataResidency = 'us';
let isMedTermEnabled = false;
let isEquipSpecEnabled = false;
let isRagEnabled = false;
let currentKbEndpoint = '';

/**
 * Initialize conversation management
 */
export function initializeConversations() {
    // Get DOM elements
    conversationList = document.getElementById('conversationList');
    conversationTitle = document.getElementById('conversationTitle');
    conversationTitleInput = document.getElementById('conversationTitleInput');
    chatContainer = document.getElementById('chatContainer');
    messageInput = document.getElementById('messageInput');
    sendButton = document.getElementById('sendButton');
    newChatBtn = document.getElementById('newChatBtn');
    viewEditHistoryBtn = document.getElementById('viewEditHistoryBtn');
    historyEditModal = document.getElementById('historyEditModal');
    historyEditContent = document.getElementById('historyEditContent');
    
    // Load saved conversations
    loadSavedConversations();
    
    // Set up event listeners
    setupEventListeners();
    
    // Make conversations available globally for other modules
    window.conversations = conversations;
    window.currentConversationId = currentConversationId;
}

/**
 * Set up event listeners for conversation management
 */
function setupEventListeners() {
    // New chat button
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            createNewConversation();
        });
    }
    
    // Send message
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Update button state on input
        messageInput.addEventListener('input', updateButtonStates);
        
        // Auto-resize textarea
        messageInput.addEventListener('input', () => {
            autoResizeTextarea(messageInput);
        });
    }
    
    // Conversation title editing
    if (conversationTitle && conversationTitleInput) {
        conversationTitle.addEventListener('click', () => {
            conversationTitle.style.display = 'none';
            conversationTitleInput.style.display = 'block';
            conversationTitleInput.focus();
            conversationTitleInput.select();
        });
        
        conversationTitleInput.addEventListener('blur', saveConversationTitle);
        conversationTitleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveConversationTitle();
            }
        });
    }
    
    // View/Edit History
    if (viewEditHistoryBtn) {
        viewEditHistoryBtn.addEventListener('click', showHistoryEditModal);
    }
}

/**
 * Load saved conversations from localStorage
 */
function loadSavedConversations() {
    try {
        const savedConversations = localStorage.getItem('kynseyAiConversations');
        if (savedConversations) {
            conversations = JSON.parse(savedConversations);
        }
        
        const lastConversationId = localStorage.getItem('kynseyAiLastConversationId');
        
        // If there are saved conversations, load the last active one
        if (Object.keys(conversations).length > 0) {
            if (lastConversationId && conversations[lastConversationId]) {
                loadConversation(lastConversationId);
            } else {
                // Load the most recent conversation
                const sortedIds = Object.keys(conversations).sort((a, b) => {
                    return new Date(conversations[b].createdAt || 0) - new Date(conversations[a].createdAt || 0);
                });
                loadConversation(sortedIds[0]);
            }
        } else {
            // Create a new conversation if none exist
            createNewConversation();
        }
        
        // Render the conversation list
        renderConversationList();
    } catch (error) {
        console.error('Error loading saved conversations:', error);
        createNewConversation();
    }
}

/**
 * Create a new conversation
 * @param {boolean} setActive - Whether to set the new conversation as active
 * @returns {string} The ID of the new conversation
 */
export function createNewConversation(setActive = true) {
    const newId = generateId();
    const timestamp = new Date();
    const defaultName = `Analysis ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    conversations[newId] = {
        id: newId,
        name: defaultName,
        history: [],
        model: selectedModel,
        temperature: currentTemperature,
        thinkingMode: isThinkingModeEnabled,
        webSearch: isWebSearchEnabled,
        responseStyle: currentResponseStyle,
        dataResidency: currentDataResidency,
        medTermEnabled: isMedTermEnabled,
        equipSpecEnabled: isEquipSpecEnabled,
        ragEnabled: isRagEnabled,
        kbEndpoint: currentKbEndpoint,
        createdAt: timestamp.toISOString(),
        associatedDocument: null,
        notepadContent: '',
        artifacts: []
    };
    
    if (setActive) {
        currentConversationId = newId;
        window.currentConversationId = newId;
        loadConversation(newId);
        renderConversationList();
        saveConversations();
    }
    
    return newId;
}

/**
 * Load a conversation
 * @param {string} id - The ID of the conversation to load
 */
export function loadConversation(id) {
    if (!conversations[id]) {
        console.error("Conversation not found:", id);
        
        if (Object.keys(conversations).length > 0) {
            loadConversation(Object.keys(conversations)[0]);
        } else {
            createNewConversation();
        }
        
        return;
    }
    
    currentConversationId = id;
    window.currentConversationId = id;
    
    const conv = conversations[id];
    
    // Update model settings
    selectedModel = conv.model || 'llama3:8b';
    currentTemperature = conv.temperature || 0.7;
    isThinkingModeEnabled = conv.thinkingMode || false;
    isWebSearchEnabled = conv.webSearch || false;
    currentResponseStyle = conv.responseStyle || 'normal';
    currentDataResidency = conv.dataResidency || 'us';
    isMedTermEnabled = conv.medTermEnabled || false;
    isEquipSpecEnabled = conv.equipSpecEnabled || false;
    isRagEnabled = conv.ragEnabled || false;
    currentKbEndpoint = conv.kbEndpoint || '';
    
    // Update settings UI if needed
    if (typeof updateSettingsUI === 'function') {
        updateSettingsUI();
    }
    
    // Update conversation title
    if (conversationTitle) {
        conversationTitle.textContent = conv.name;
    }
    
    if (conversationTitleInput) {
        conversationTitleInput.value = conv.name;
    }
    
    // Clear chat container
    if (chatContainer) {
        chatContainer.innerHTML = '';
        
        // Add messages from history
        if (conv.history.length === 0) {
            const initialMsgId = generateId();
            addMessage('Hello! How can I help you today?', 'assistant', { messageId: initialMsgId });
            conv.history.push({ 
                role: 'assistant', 
                content: 'Hello! How can I help you today?', 
                id: initialMsgId 
            });
        } else {
            conv.history.forEach(msg => {
                addMessage(msg.content, msg.role, { 
                    messageId: msg.id, 
                    isHtml: msg.role === 'assistant',
                    citations: msg.citations,
                    confidence: msg.confidence
                });
            });
        }
    }
    
    // Update document viewer if in dashboard mode
    if (typeof currentViewMode !== 'undefined' && currentViewMode === 'dashboard') {
        const docViewer = document.getElementById('documentViewerPlaceholder');
        
        if (docViewer) {
            if (conv.associatedDocument) {
                docViewer.innerHTML = `Loading ${conv.associatedDocument.name}...`;
            } else {
                docViewer.innerHTML = `<span>No document loaded. Upload one.</span>`;
            }
        }
    }
    
    // Reset file upload if needed
    if (typeof resetFileUpload === 'function') {
        resetFileUpload();
    }
    
    // Clear message input
    if (messageInput) {
        messageInput.value = '';
        autoResizeTextarea(messageInput);
    }
    
    // Update button states
    updateButtonStates();
    
    // Highlight active conversation in the list
    highlightActiveConversation();
    
    // Save conversations
    saveConversations();
    
    // Update right panel with artifacts
    const rightPanel = document.getElementById('rightPanel');
    if (rightPanel) {
        rightPanel.innerHTML = '<h3 style="color: var(--text-muted); text-align: center; margin-bottom: 1rem;">Details & Artifacts</h3>';
        rightPanel.classList.remove('visible');
        
        if (conv.artifacts && conv.artifacts.length > 0) {
            conv.artifacts.forEach(renderArtifact);
        }
    }
    
    // Load notepad content
    if (typeof loadNotepadContent === 'function') {
        loadNotepadContent();
    }
}

/**
 * Add a message to the chat container
 * @param {string} text - The message text
 * @param {string} role - The role of the message sender ('user' or 'assistant')
 * @param {Object} options - Additional options
 */
export function addMessage(text, role, options = {}) {
    if (!chatContainer) return;
    
    const { 
        isHtml = false, 
        messageId = generateId(), 
        citations = null, 
        confidence = null,
        isStreaming = false
    } = options;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.dataset.messageId = messageId;
    
    if (isStreaming) {
        messageDiv.classList.add('streaming');
    }
    
    // Create delete button for messages
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-message-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.title = 'Delete message';
    deleteBtn.onclick = () => deleteMessage(messageId);
    
    // Create message content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isHtml) {
        contentDiv.innerHTML = sanitizeHTML(text);
    } else {
        contentDiv.textContent = text;
    }
    
    // Add citations if available
    if (citations && Array.isArray(citations) && citations.length > 0) {
        const citationsList = document.createElement('div');
        citationsList.className = 'citation-source-list';
        
        const citationsTitle = document.createElement('h4');
        citationsTitle.textContent = 'Sources:';
        citationsList.appendChild(citationsTitle);
        
        const sourcesList = document.createElement('ul');
        citations.forEach((citation, index) => {
            const sourceItem = document.createElement('li');
            
            if (citation.url) {
                const sourceLink = document.createElement('a');
                sourceLink.href = citation.url;
                sourceLink.target = '_blank';
                sourceLink.textContent = citation.title || citation.url;
                sourceItem.appendChild(sourceLink);
            } else {
                sourceItem.textContent = citation.title || `Source ${index + 1}`;
            }
            
            sourcesList.appendChild(sourceItem);
        });
        
        citationsList.appendChild(sourcesList);
        contentDiv.appendChild(citationsList);
    }
    
    // Add confidence score if available
    if (confidence !== null && typeof confidence === 'number') {
        const confidenceSpan = document.createElement('span');
        confidenceSpan.className = 'confidence-score';
        confidenceSpan.textContent = `Confidence: ${Math.round(confidence * 100)}%`;
        contentDiv.appendChild(confidenceSpan);
    }
    
    // Assemble message
    messageDiv.appendChild(deleteBtn);
    messageDiv.appendChild(contentDiv);
    
    // Add message actions for assistant messages
    if (role === 'assistant') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-action-btn';
        copyBtn.title = 'Copy to clipboard';
        copyBtn.innerHTML = '📋';
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.innerHTML = '✓';
                setTimeout(() => { copyBtn.innerHTML = '📋'; }, 2000);
            });
        };
        
        actionsDiv.appendChild(copyBtn);
        messageDiv.appendChild(actionsDiv);
    }
    
    // Add to chat container
    chatContainer.appendChild(messageDiv);
    
    // Apply syntax highlighting to code blocks
    highlightCodeInElement(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return messageDiv;
}

/**
 * Send a message
 */
function sendMessage() {
    if (!messageInput || !sendButton) return;
    
    const messageText = messageInput.value.trim();
    if (!messageText) return;
    
    // Check for special commands
    if (messageText.startsWith('/note ')) {
        // Handle note command
        const noteText = messageText.substring(6);
        addNoteToNotepad(noteText);
        messageInput.value = '';
        autoResizeTextarea(messageInput);
        updateButtonStates();
        return;
    }
    
    // Add user message to chat
    const userMessageId = generateId();
    addMessage(messageText, 'user', { messageId: userMessageId });
    
    // Add to conversation history
    if (currentConversationId && conversations[currentConversationId]) {
        conversations[currentConversationId].history.push({
            role: 'user',
            content: messageText,
            id: userMessageId
        });
        
        saveConversations();
    }
    
    // Clear input
    messageInput.value = '';
    autoResizeTextarea(messageInput);
    updateButtonStates();
    
    // Add assistant message (streaming)
    const assistantMessageId = generateId();
    const assistantMessage = addMessage('', 'assistant', { 
        messageId: assistantMessageId,
        isHtml: true,
        isStreaming: true
    });
    
    // In a real implementation, this would call the API
    // For now, simulate a response
    simulateAssistantResponse(assistantMessage, assistantMessageId);
}

/**
 * Simulate an assistant response (for demo purposes)
 * @param {HTMLElement} messageElement - The message element
 * @param {string} messageId - The message ID
 */
function simulateAssistantResponse(messageElement, messageId) {
    // Sample response
    const response = "I'm analyzing your request. Here's what I found:\n\n" +
        "This appears to be a sophisticated chat interface application with enterprise features. " +
        "It includes conversation management, document analysis, and various AI-powered features.\n\n" +
        "```javascript\n" +
        "// Example code\n" +
        "function analyzeData(data) {\n" +
        "  const results = processData(data);\n" +
        "  return results;\n" +
        "}\n" +
        "```\n\n" +
        "Would you like me to explain any specific part of the application in more detail?";
    
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
            highlightCodeInElement(messageElement);
            
            // Add to conversation history
            if (currentConversationId && conversations[currentConversationId]) {
                conversations[currentConversationId].history.push({
                    role: 'assistant',
                    content: response,
                    id: messageId
                });
                
                saveConversations();
            }
        }
    }, 10);
}

/**
 * Delete a message
 * @param {string} messageId - The ID of the message to delete
 */
function deleteMessage(messageId) {
    if (!currentConversationId || !conversations[currentConversationId]) return;
    
    const conversation = conversations[currentConversationId];
    const messageIndex = conversation.history.findIndex(msg => msg.id === messageId);
    
    if (messageIndex > -1) {
        conversation.history.splice(messageIndex, 1);
        
        const messageElement = chatContainer.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
        }
        
        saveConversations();
    }
}

/**
 * Save the conversation title
 */
function saveConversationTitle() {
    if (!conversationTitle || !conversationTitleInput || !currentConversationId || !conversations[currentConversationId]) return;
    
    const newTitle = conversationTitleInput.value.trim();
    if (newTitle) {
        conversations[currentConversationId].name = newTitle;
        conversationTitle.textContent = newTitle;
        saveConversations();
        renderConversationList();
    }
    
    conversationTitleInput.style.display = 'none';
    conversationTitle.style.display = 'block';
}

/**
 * Render the conversation list
 */
function renderConversationList() {
    if (!conversationList) return;
    
    conversationList.innerHTML = '';
    
    const sortedIds = Object.keys(conversations).sort((a, b) => {
        return new Date(conversations[b].createdAt || 0) - new Date(conversations[a].createdAt || 0);
    });
    
    sortedIds.forEach(id => {
        const conv = conversations[id];
        const item = document.createElement('button');
        item.className = 'sidebar-item';
        item.dataset.convId = id;
        item.title = conv.name;
        item.innerHTML = `<span>&#128172;</span><span class="sidebar-item-text">${conv.name}</span>`;
        item.onclick = () => loadConversation(id);
        conversationList.appendChild(item);
    });
    
    highlightActiveConversation();
}

/**
 * Highlight the active conversation in the list
 */
function highlightActiveConversation() {
    if (!conversationList) return;
    
    const items = conversationList.querySelectorAll('.sidebar-item');
    items.forEach(item => {
        item.classList.toggle('active', item.dataset.convId === currentConversationId);
    });
}

/**
 * Update button states based on input
 */
function updateButtonStates() {
    if (sendButton && messageInput) {
        sendButton.disabled = !messageInput.value.trim();
    }
}

/**
 * Save conversations to localStorage
 */
function saveConversations() {
    localStorage.setItem('kynseyAiConversations', JSON.stringify(conversations));
    localStorage.setItem('kynseyAiLastConversationId', currentConversationId);
}

/**
 * Show the history edit modal
 */
function showHistoryEditModal() {
    if (!historyEditModal || !historyEditContent || !currentConversationId || !conversations[currentConversationId]) return;
    
    const conversation = conversations[currentConversationId];
    historyEditContent.innerHTML = '';
    
    if (conversation.history.length === 0) {
        historyEditContent.innerHTML = '<p style="color: var(--text-muted);">History is empty.</p>';
    } else {
        conversation.history.forEach(msg => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = `margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px dashed var(--border-color);`;
            itemDiv.dataset.messageId = msg.id;
            
            const roleLabel = document.createElement('strong');
            roleLabel.textContent = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
            roleLabel.style.color = msg.role === 'user' ? 'var(--accent-primary)' : 'var(--text-secondary)';
            roleLabel.style.cssText = `display: block; margin-bottom: 0.3rem;`;
            
            const contentDiv = document.createElement('div');
            contentDiv.textContent = msg.content;
            contentDiv.style.cssText = `white-space: pre-wrap; font-size: 0.9rem;`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '&times; Delete';
            deleteBtn.style.cssText = `float: right; background: none; border: 1px solid var(--danger-color); color: var(--danger-color); padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-left: 1rem;`;
            deleteBtn.onclick = () => {
                itemDiv.remove();
                deleteMessage(msg.id);
                
                if (historyEditContent.childElementCount === 0) {
                    historyEditContent.innerHTML = '<p style="color: var(--text-muted);">History is empty.</p>';
                }
            };
            
            itemDiv.appendChild(deleteBtn);
            itemDiv.appendChild(roleLabel);
            itemDiv.appendChild(contentDiv);
            historyEditContent.appendChild(itemDiv);
        });
    }
    
    historyEditModal.classList.add('active');
}

/**
 * Add a note to the notepad
 * @param {string} noteText - The note text to add
 */
function addNoteToNotepad(noteText) {
    if (!noteText) return;
    
    // If notepad functionality is available
    if (typeof window.addNoteFromChat === 'function') {
        window.addNoteFromChat(noteText);
    } else {
        console.log('Notepad functionality not available');
    }
}

/**
 * Render an artifact in the right panel
 * @param {Object} artifact - The artifact to render
 */
function renderArtifact(artifact) {
    if (!artifact || !artifact.content) {
        console.warn("Attempted to render invalid artifact:", artifact);
        return;
    }
    
    const rightPanel = document.getElementById('rightPanel');
    if (!rightPanel) return;
    
    if (!rightPanel.classList.contains('visible')) {
        rightPanel.classList.add('visible');
    }
    
    const placeholder = rightPanel.querySelector('h3');
    if (placeholder && placeholder.textContent.includes('Artifacts')) {
        placeholder.remove();
    }
    
    const artifactId = artifact.id || generateId();
    
    // Check if artifact already exists
    if (rightPanel.querySelector(`[data-artifact-id="${artifactId}"]`)) {
        console.log("Artifact already rendered:", artifactId);
        return;
    }
    
    const artifactDiv = document.createElement('div');
    artifactDiv.className = 'artifact';
    artifactDiv.dataset.artifactId = artifactId;
    
    const type = artifact.type || 'text';
    const title = sanitizeHTML(artifact.title || `Artifact (${type})`);
    const safeType = sanitizeHTML(type);
    
    let contentHtml = '';
    
    if (type === 'code' || type === 'csv' || type === 'json') {
        const lang = sanitizeHTML(artifact.language || (type === 'csv' ? 'csv' : (type === 'json' ? 'json' : '')));
        
        // Create code element
        const codeElement = document.createElement('code');
        if (lang) codeElement.className = `language-${lang}`;
        codeElement.textContent = artifact.content;
        
        contentHtml = `<pre>${codeElement.outerHTML}</pre>`;
    } else if (type === 'markdown') {
        contentHtml = parseAndSanitizeMarkdown(artifact.content);
    } else {
        contentHtml = `<p>${sanitizeHTML(artifact.content).replace(/\n/g, '<br>')}</p>`;
    }
    
    artifactDiv.innerHTML = `
        <div class="artifact-header">
            <span class="artifact-title">${title}</span>
            <span class="artifact-type">${safeType}</span>
        </div>
        <div class="artifact-content">${contentHtml}</div>
    `;
    
    rightPanel.appendChild(artifactDiv);
    
    // Apply syntax highlighting
    highlightCodeInElement(artifactDiv);
    
    // Add artifact to conversation state if not already there
    if (currentConversationId && conversations[currentConversationId]) {
        if (!conversations[currentConversationId].artifacts) {
            conversations[currentConversationId].artifacts = [];
        }
        
        // Add only if it doesn't exist by ID
        if (!conversations[currentConversationId].artifacts.some(a => a.id === artifactId)) {
            conversations[currentConversationId].artifacts.push({ ...artifact, id: artifactId });
            saveConversations();
        }
    }
}

// Export functions and state for other modules
export {
    conversations,
    currentConversationId,
    selectedModel,
    currentTemperature,
    isThinkingModeEnabled,
    isWebSearchEnabled,
    currentResponseStyle,
    currentDataResidency,
    isMedTermEnabled,
    isEquipSpecEnabled,
    isRagEnabled,
    currentKbEndpoint,
    renderArtifact
};
