// LM Studio API endpoint - Using the value from config.js
const API_URL = window.API_URL || "http://192.168.1.7:4545/v1/chat/completions";

// DOM Elements
let messagesContainer;
let messageInput;
let sendButton;
let settingsPanel;
let settingsButton;
let closeSettingsButton;
let imageUploadModal;
let imageUploadBtn;
let closeImageUploadBtn;
let uploadArea;
let fileInput;
let cancelUploadBtn;
let confirmUploadBtn;

// Chat history
let chatHistory = [];

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chat interface');
    
    // Get DOM elements
    messagesContainer = document.getElementById('messages');
    messageInput = document.getElementById('message-input');
    sendButton = document.getElementById('send-btn');
    settingsPanel = document.getElementById('settings-panel');
    settingsButton = document.querySelector('.nav-item .fa-cog').parentElement;
    closeSettingsButton = document.getElementById('close-settings');
    
    if (!messagesContainer || !messageInput || !sendButton) {
        console.error('Failed to find required DOM elements');
        return;
    }
    
    // Add event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Settings panel event listeners
    if (settingsPanel && closeSettingsButton) {
        const settingsNav = document.getElementById('settings-nav');
        if (settingsNav) {
            settingsNav.addEventListener('click', toggleSettingsPanel);
        }
        closeSettingsButton.addEventListener('click', toggleSettingsPanel);
        
        // Add event listeners for settings options
        document.getElementById('clear-history').addEventListener('click', clearConversationHistory);
        document.getElementById('smart-suggestions').addEventListener('change', toggleSmartSuggestions);
        
        // Response style radio buttons
        const responseStyleRadios = document.querySelectorAll('input[name="response-style"]');
        responseStyleRadios.forEach(radio => {
            radio.addEventListener('change', updateResponseStyle);
        });
    } else {
        console.error('Settings panel elements not found');
    }
    
    // Initialize image upload functionality
    imageUploadModal = document.getElementById('image-upload-modal');
    closeImageUploadBtn = document.getElementById('close-image-upload');
    uploadArea = document.getElementById('upload-area');
    fileInput = document.getElementById('file-input');
    cancelUploadBtn = document.getElementById('cancel-upload');
    confirmUploadBtn = document.getElementById('confirm-upload');
    
    if (imageUploadModal && closeImageUploadBtn && uploadArea && fileInput) {
        // Use attachment button for image upload
        document.querySelector('.attachment-btn').addEventListener('click', toggleImageUploadModal);
        
        // Close button in modal
        closeImageUploadBtn.addEventListener('click', toggleImageUploadModal);
        
        // Cancel button in modal
        cancelUploadBtn.addEventListener('click', toggleImageUploadModal);
        
        // Upload area click to browse files
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // File input change event
        fileInput.addEventListener('change', handleFileSelect);
        
        // Drag and drop functionality
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        
        // Confirm upload button
        confirmUploadBtn.addEventListener('click', handleImageUpload);
    } else {
        console.error('Image upload elements not found');
    }
    
    // Add welcome message
    addAIMessage(
        "Hello! Welcome to GCT UI. I'm connected to LM Studio and ready to assist you.",
        [
            "What can you help me with?",
            "How do I use LM Studio with this interface?",
            "Tell me about GCT UI features"
        ]
    );
    
    console.log('Chat interface initialized');
});

// Send message function
async function sendMessage() {
    console.log('Sending message');
    
    if (!messageInput) {
        console.error('Message input element not found');
        return;
    }
    
    // Get the message from the input field
    const userMessage = messageInput.value.trim();
    console.log('User message:', userMessage);
    
    // Don't proceed if the message is empty
    if (userMessage === '') {
        console.log('Empty message, not sending');
        return;
    }
    
    // Add user message to UI
    addUserMessage(userMessage);
    
    // Clear input
    messageInput.value = '';
    
    // Update chat history
    chatHistory.push({ role: "user", content: userMessage });
    
    try {
        // Show loading indicator
        const loadingId = showLoadingIndicator();
        console.log('Showing loading indicator');
        
        let aiResponse;
        
        try {
            console.log('Attempting to connect to LM Studio API');
            // Send request to LM Studio API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "LM Studio Model",
                    messages: chatHistory,
                    temperature: 0.7,
                    stream: false
                })
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            aiResponse = data.choices[0].message.content;
            console.log('Received API response');
        } catch (apiError) {
            console.error('API Error:', apiError);
            // Fallback for demo/testing when API is not available
            console.log('Using fallback response');
            aiResponse = getFallbackResponse(userMessage);
        }
        
        // Remove loading indicator after a short delay to ensure it's visible
        setTimeout(() => {
            removeLoadingIndicator(loadingId);
            
            // Update chat history with AI response
            chatHistory.push({ role: "assistant", content: aiResponse });
            
            // Generate suggestions based on the AI response
            const suggestions = generateSuggestions(aiResponse);
            
            // Add AI message to UI with suggestions
            addAIMessage(aiResponse, suggestions);
            
            console.log('AI response added to chat');
        }, 500);
        
    } catch (error) {
        console.error('Error in sendMessage:', error);
        removeLoadingIndicator();
        addAIMessage(
            "Sorry, I encountered an error. Please try again.",
            ["Retry", "Check API settings"]
        );
    }
}

// Fallback response function for demo/testing when API is not available
function getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! How can I assist you today?";
    } else if (lowerMessage.includes('help')) {
        return "I'm here to help! You can ask me questions, and I'll do my best to assist you.";
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('gct')) {
        return "GCT UI offers a seamless interface to interact with LM Studio models. You can chat, ask questions, and get AI-powered responses.";
    } else if (lowerMessage.includes('how') && lowerMessage.includes('use')) {
        return "To use this interface, simply type your message in the input box and press Send. You can also click on suggestion buttons for quick responses.";
    } else {
        return "I understand your message. In a real environment, I would connect to LM Studio API to provide a more specific response.";
    }
}

// Add user message to UI
function addUserMessage(message) {
    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user');
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

// Add AI message to UI with suggestions
function addAIMessage(message, suggestions = []) {
    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'ai');
    messageElement.textContent = message;
    
    if (suggestions.length > 0) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.classList.add('suggestions');
        
        suggestions.forEach(suggestion => {
            const suggestionButton = document.createElement('button');
            suggestionButton.classList.add('suggestion-btn');
            suggestionButton.textContent = suggestion;
            suggestionButton.addEventListener('click', () => {
                if (messageInput) {
                    // Set the input value to the suggestion text
                    messageInput.value = suggestion;
                    // Use setTimeout to ensure the value is set before sending
                    setTimeout(() => {
                        sendMessage();
                    }, 10);
                }
            });
            suggestionsContainer.appendChild(suggestionButton);
        });
        
        messageElement.appendChild(suggestionsContainer);
    }
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

// Show loading indicator
function showLoadingIndicator() {
    if (!messagesContainer) {
        console.error('Messages container not found');
        return Date.now();
    }
    
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('message', 'ai', 'loading');
    loadingElement.textContent = 'Thinking...';
    messagesContainer.appendChild(loadingElement);
    scrollToBottom();
    return Date.now(); // Return unique ID for the loading indicator
}

// Remove loading indicator
function removeLoadingIndicator(id) {
    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    const loadingElements = document.querySelectorAll('.loading');
    if (loadingElements.length > 0) {
        loadingElements[loadingElements.length - 1].remove();
    }
}

// Scroll to bottom of messages container
function scrollToBottom() {
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Generate suggestions based on AI response
function generateSuggestions(response) {
    // This is a simple implementation - in a real app, you might use NLP or predefined rules
    // to generate more contextually relevant suggestions
    
    if (response.toLowerCase().includes('help')) {
        return ["Show me how", "Tell me more", "Examples please"];
    } else if (response.toLowerCase().includes('error') || response.toLowerCase().includes('sorry')) {
        return ["Try again", "Check API settings"];
    } else {
        return ["Tell me more", "How does that work?", "Can you explain further?"];
    }
}

// Settings Panel Functions

// Toggle settings panel visibility
function toggleSettingsPanel() {
    if (settingsPanel) {
        settingsPanel.classList.toggle('active');
    }
}

// Clear conversation history
function clearConversationHistory() {
    if (messagesContainer) {
        // Clear UI
        messagesContainer.innerHTML = '';
        
        // Clear chat history array
        chatHistory = [];
        
        // Add a confirmation message
        addAIMessage("Conversation history has been cleared.", ["Start a new conversation"]);
        
        // Close settings panel
        toggleSettingsPanel();
    }
}

// Toggle smart suggestions
function toggleSmartSuggestions(event) {
    const showSuggestions = event.target.checked;
    console.log(`Smart suggestions ${showSuggestions ? 'enabled' : 'disabled'}`);
    
    // In a real app, you would save this preference and apply it
    // For now, we'll just log it
}

// Update response style
function updateResponseStyle(event) {
    const selectedStyle = event.target.value;
    console.log(`Response style set to: ${selectedStyle}`);
    
    // In a real app, you would save this preference and apply it to future responses
    // For now, we'll just log it
}

// Image Upload Functions

// Toggle image upload modal visibility
function toggleImageUploadModal() {
    if (imageUploadModal) {
        imageUploadModal.classList.toggle('active');
        
        // Reset the upload area when closing
        if (!imageUploadModal.classList.contains('active')) {
            resetUploadArea();
        }
    }
}

// Handle drag over event
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (uploadArea) {
        uploadArea.style.borderColor = '#0084ff';
        uploadArea.style.backgroundColor = 'rgba(0, 132, 255, 0.05)';
    }
}

// Handle drag leave event
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (uploadArea) {
        uploadArea.style.borderColor = '#3a3a3a';
        uploadArea.style.backgroundColor = 'transparent';
    }
}

// Handle drop event
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (uploadArea) {
        uploadArea.style.borderColor = '#3a3a3a';
        uploadArea.style.backgroundColor = 'transparent';
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }
}

// Handle file selection from input
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFiles(files);
    }
}

// Handle the selected files
function handleFiles(files) {
    const file = files[0]; // Only handle the first file for now
    
    if (!file.type.match('image.*')) {
        alert('Please select an image file.');
        return;
    }
    
    // Display the selected file in the upload area
    if (uploadArea) {
        // Clear previous content
        uploadArea.innerHTML = '';
        
        // Create preview image
        const img = document.createElement('img');
        img.classList.add('preview-image');
        img.file = file;
        
        // Add image to upload area
        uploadArea.appendChild(img);
        
        // Add file name
        const fileNameElement = document.createElement('p');
        fileNameElement.textContent = file.name;
        fileNameElement.style.marginTop = '10px';
        uploadArea.appendChild(fileNameElement);
        
        // Read and display the image
        const reader = new FileReader();
        reader.onload = (function(aImg) { 
            return function(e) { 
                aImg.src = e.target.result; 
                aImg.style.maxWidth = '100%';
                aImg.style.maxHeight = '150px';
                aImg.style.marginTop = '10px';
            }; 
        })(img);
        reader.readAsDataURL(file);
    }
}

// Handle image upload
function handleImageUpload() {
    // In a real application, you would upload the file to a server here
    // For this demo, we'll just simulate a successful upload
    
    // Close the modal
    toggleImageUploadModal();
    
    // Add a message to the chat indicating successful upload
    addAIMessage(
        "Image uploaded successfully! In a real application, this image would be processed or stored.",
        ["Tell me more about image processing", "How can I use this image?"]
    );
}

// Reset upload area to initial state
function resetUploadArea() {
    if (uploadArea) {
        uploadArea.innerHTML = '<p>Drag & drop an image or click to browse</p>';
        uploadArea.style.borderColor = '#3a3a3a';
        uploadArea.style.backgroundColor = 'transparent';
    }
    
    if (fileInput) {
        fileInput.value = '';
    }
}
