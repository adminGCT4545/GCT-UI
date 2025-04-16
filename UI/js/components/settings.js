/**
 * Settings Module
 * 
 * Handles settings panel functionality and settings management.
 */

import { toggleTheme } from '../ui.js';
import { 
    selectedModel, 
    currentTemperature, 
    isThinkingModeEnabled, 
    isWebSearchEnabled, 
    currentResponseStyle, 
    currentDataResidency,
    isMedTermEnabled,
    isEquipSpecEnabled,
    isRagEnabled,
    currentKbEndpoint
} from './conversations.js';

// DOM Elements
let settingsPanel;
let settingsTabs;
let settingsContents;
let closeSettingsBtn;
let settingsBtn;
let modelSelector;
let temperatureSlider;
let temperatureValue;
let thinkingModeToggle;
let webSearchToggle;
let responseStyleRadios;
let dataResidencySelect;
let medTermToggle;
let equipSpecToggle;
let ragToggle;
let kbEndpoint;
let toggleThemeBtn;
let clearConversationBtn;

/**
 * Initialize settings functionality
 */
export function initializeSettings() {
    // Get DOM elements
    settingsPanel = document.getElementById('settingsPanel');
    settingsTabs = document.querySelectorAll('.settings-tab');
    settingsContents = document.querySelectorAll('.settings-content');
    closeSettingsBtn = document.getElementById('closeSettings');
    settingsBtn = document.getElementById('settingsBtn');
    modelSelector = document.getElementById('modelSelector');
    temperatureSlider = document.getElementById('temperatureSlider');
    temperatureValue = document.getElementById('temperatureValue');
    thinkingModeToggle = document.getElementById('thinkingModeToggle');
    webSearchToggle = document.getElementById('webSearchToggle');
    responseStyleRadios = document.querySelectorAll('input[name="responseStyle"]');
    dataResidencySelect = document.getElementById('dataResidency');
    medTermToggle = document.getElementById('medTermToggle');
    equipSpecToggle = document.getElementById('equipSpecToggle');
    ragToggle = document.getElementById('ragToggle');
    kbEndpoint = document.getElementById('kbEndpoint');
    toggleThemeBtn = document.getElementById('toggleThemeBtn');
    clearConversationBtn = document.getElementById('clearConversationBtn');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize settings UI
    updateSettingsUI();
    
    // Make updateSettingsUI available globally for other modules
    window.updateSettingsUI = updateSettingsUI;
}

/**
 * Set up event listeners for settings
 */
function setupEventListeners() {
    // Open settings panel
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsPanel.classList.add('active');
        });
    }
    
    // Close settings panel
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsPanel.classList.remove('active');
        });
    }
    
    // Settings tabs
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Update active tab
            settingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            settingsContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `settings-tab-${tabName}`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Model selector
    if (modelSelector) {
        modelSelector.addEventListener('change', () => {
            window.selectedModel = modelSelector.value;
            saveSettings();
        });
    }
    
    // Temperature slider
    if (temperatureSlider && temperatureValue) {
        temperatureSlider.addEventListener('input', () => {
            const value = parseFloat(temperatureSlider.value);
            temperatureValue.textContent = value.toFixed(1);
            window.currentTemperature = value;
            saveSettings();
        });
    }
    
    // Thinking mode toggle
    if (thinkingModeToggle) {
        thinkingModeToggle.addEventListener('change', () => {
            window.isThinkingModeEnabled = thinkingModeToggle.checked;
            saveSettings();
        });
    }
    
    // Web search toggle
    if (webSearchToggle) {
        webSearchToggle.addEventListener('change', () => {
            window.isWebSearchEnabled = webSearchToggle.checked;
            saveSettings();
        });
    }
    
    // Response style radios
    responseStyleRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                window.currentResponseStyle = radio.value;
                saveSettings();
            }
        });
    });
    
    // Data residency select
    if (dataResidencySelect) {
        dataResidencySelect.addEventListener('change', () => {
            window.currentDataResidency = dataResidencySelect.value;
            saveSettings();
        });
    }
    
    // Medical terminology toggle
    if (medTermToggle) {
        medTermToggle.addEventListener('change', () => {
            window.isMedTermEnabled = medTermToggle.checked;
            saveSettings();
        });
    }
    
    // Equipment specific toggle
    if (equipSpecToggle) {
        equipSpecToggle.addEventListener('change', () => {
            window.isEquipSpecEnabled = equipSpecToggle.checked;
            saveSettings();
        });
    }
    
    // RAG toggle
    if (ragToggle) {
        ragToggle.addEventListener('change', () => {
            window.isRagEnabled = ragToggle.checked;
            saveSettings();
        });
    }
    
    // KB endpoint
    if (kbEndpoint) {
        kbEndpoint.addEventListener('change', () => {
            window.currentKbEndpoint = kbEndpoint.value;
            saveSettings();
        });
    }
    
    // Theme toggle
    if (toggleThemeBtn) {
        toggleThemeBtn.addEventListener('click', toggleTheme);
    }
    
    // Clear conversation
    if (clearConversationBtn) {
        clearConversationBtn.addEventListener('click', clearCurrentConversation);
    }
}

/**
 * Update settings UI based on current settings
 */
export function updateSettingsUI() {
    if (modelSelector) {
        modelSelector.value = selectedModel;
    }
    
    if (temperatureSlider && temperatureValue) {
        temperatureSlider.value = currentTemperature;
        temperatureValue.textContent = currentTemperature.toFixed(1);
    }
    
    if (thinkingModeToggle) {
        thinkingModeToggle.checked = isThinkingModeEnabled;
    }
    
    if (webSearchToggle) {
        webSearchToggle.checked = isWebSearchEnabled;
    }
    
    responseStyleRadios.forEach(radio => {
        radio.checked = radio.value === currentResponseStyle;
    });
    
    if (dataResidencySelect) {
        dataResidencySelect.value = currentDataResidency;
    }
    
    if (medTermToggle) {
        medTermToggle.checked = isMedTermEnabled;
    }
    
    if (equipSpecToggle) {
        equipSpecToggle.checked = isEquipSpecEnabled;
    }
    
    if (ragToggle) {
        ragToggle.checked = isRagEnabled;
    }
    
    if (kbEndpoint) {
        kbEndpoint.value = currentKbEndpoint;
    }
    
    // Update active model display if it exists
    const activeModelDisplay = document.getElementById('activeModelDisplay');
    if (activeModelDisplay) {
        activeModelDisplay.textContent = `Current: ${selectedModel}`;
    }
}

/**
 * Save settings to the current conversation
 */
function saveSettings() {
    const currentConversationId = window.currentConversationId;
    const conversations = window.conversations;
    
    if (currentConversationId && conversations && conversations[currentConversationId]) {
        const conv = conversations[currentConversationId];
        
        conv.model = window.selectedModel || selectedModel;
        conv.temperature = window.currentTemperature || currentTemperature;
        conv.thinkingMode = window.isThinkingModeEnabled || isThinkingModeEnabled;
        conv.webSearch = window.isWebSearchEnabled || isWebSearchEnabled;
        conv.responseStyle = window.currentResponseStyle || currentResponseStyle;
        conv.dataResidency = window.currentDataResidency || currentDataResidency;
        conv.medTermEnabled = window.isMedTermEnabled || isMedTermEnabled;
        conv.equipSpecEnabled = window.isEquipSpecEnabled || isEquipSpecEnabled;
        conv.ragEnabled = window.isRagEnabled || isRagEnabled;
        conv.kbEndpoint = window.currentKbEndpoint || currentKbEndpoint;
        
        // Save conversations if the function is available
        if (typeof saveConversations === 'function') {
            saveConversations();
        } else {
            localStorage.setItem('kynseyAiConversations', JSON.stringify(conversations));
        }
    }
}

/**
 * Clear the current conversation
 */
function clearCurrentConversation() {
    const currentConversationId = window.currentConversationId;
    const conversations = window.conversations;
    
    if (!currentConversationId || !conversations || !conversations[currentConversationId]) return;
    
    if (confirm(`Are you sure you want to clear all history, artifacts, and the associated document for "${conversations[currentConversationId].name}"? This cannot be undone.`)) {
        conversations[currentConversationId].history = [];
        conversations[currentConversationId].artifacts = [];
        conversations[currentConversationId].associatedDocument = null;
        conversations[currentConversationId].notepadContent = '';
        
        // Reload the conversation if the function is available
        if (typeof loadConversation === 'function') {
            loadConversation(currentConversationId);
        } else {
            // Fallback: reload the page
            window.location.reload();
        }
    }
}
