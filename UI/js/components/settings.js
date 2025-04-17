/**
 * Settings Module
 * 
 * Handles application settings and preferences.
 */

// Create a global settings object
window.settings = {};

// DOM Elements
let settingsPanel;
let settingsTabs;
let settingsContents;
let closeSettingsBtn;
let settingsBtn;

/**
 * Initialize settings panel and event listeners
 */
window.settings.initializeSettings = function() {
    // Get DOM elements
    settingsPanel = document.getElementById('settingsPanel');
    settingsTabs = document.querySelectorAll('.settings-tab');
    settingsContents = document.querySelectorAll('.settings-content');
    closeSettingsBtn = document.querySelector('.close-settings');
    settingsBtn = document.getElementById('settingsBtn');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize settings UI
    window.settings.updateSettingsUI();
    
    // Populate settings content
    populateSettingsContent();
}

/**
 * Set up event listeners for settings panel
 */
function setupEventListeners() {
    console.log('Setting up settings event listeners');
    
    // Settings button
    settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        console.log('Settings button found, adding event listener');
        settingsBtn.addEventListener('click', toggleSettingsPanel);
    } else {
        console.error('Settings button not found');
    }
    
        // Close settings button
        closeSettingsBtn = document.getElementById('closeSettingsBtn');
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
    
    // Settings tabs
    if (settingsTabs && settingsTabs.length > 0) {
        settingsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                switchSettingsTab(tabId);
            });
        });
    } else {
        console.error('Settings tabs not found or empty');
    }
}

/**
 * Toggle settings panel visibility
 */
function toggleSettingsPanel() {
    console.log('Toggle settings panel called');
    
    // Get settings panel element directly
    settingsPanel = document.getElementById('settingsPanel');
    
    if (!settingsPanel) {
        console.error('Settings panel not found');
        return;
    }
    
    console.log('Settings panel element:', settingsPanel);
    console.log('Settings panel classList before toggle:', settingsPanel.classList);
    
    settingsPanel.classList.toggle('active');
    
    console.log('Settings panel classList after toggle:', settingsPanel.classList);
    
    // Apply theme preferences when opening settings
    const darkThemeRadio = document.getElementById('darkTheme');
    const lightThemeRadio = document.getElementById('lightTheme');
    
    if (darkThemeRadio && lightThemeRadio) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        
        if (savedTheme === 'light') {
            lightThemeRadio.checked = true;
            darkThemeRadio.checked = false;
        } else {
            darkThemeRadio.checked = true;
            lightThemeRadio.checked = false;
        }
    } else {
        console.log('Theme radio buttons not found');
    }
    
    // Update model settings
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect && window.conversations) {
        modelSelect.value = window.conversations.selectedModel || 'llama3:8b';
    }
    
    const temperatureSlider = document.getElementById('temperatureSlider');
    const temperatureValue = document.getElementById('temperatureValue');
    if (temperatureSlider && temperatureValue && window.conversations) {
        temperatureSlider.value = window.conversations.currentTemperature || 0.7;
        temperatureValue.textContent = temperatureSlider.value;
    }
    
    const enableThinking = document.getElementById('enableThinking');
    if (enableThinking && window.conversations) {
        enableThinking.checked = window.conversations.isThinkingModeEnabled || false;
    }
    
    const enableWebSearch = document.getElementById('enableWebSearch');
    if (enableWebSearch && window.conversations) {
        enableWebSearch.checked = window.conversations.isWebSearchEnabled || false;
    }
}

/**
 * Switch between settings tabs
 * @param {string} tabId - The ID of the tab to switch to
 */
function switchSettingsTab(tabId) {
    if (!settingsTabs || !settingsContents) return;
    
    // Update active tab
    settingsTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    
    // Update active content
    settingsContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}Settings`);
    });
}

/**
 * Update settings UI based on current settings
 */
window.settings.updateSettingsUI = function() {
    // This function would update the UI elements based on the current settings
    // For example, setting the correct values for model selection, temperature, etc.
    
    // For now, we'll just populate with default values if needed
    populateSettingsContent();
}

/**
 * Populate settings content with options
 */
function populateSettingsContent() {
    // General Settings
    const generalSettings = document.getElementById('generalSettings');
    if (generalSettings) {
        generalSettings.innerHTML = `
            <div class="settings-section">
                <div class="settings-section-title">Theme</div>
                <div class="settings-option">
                    <input type="radio" id="darkTheme" name="theme" value="dark" checked>
                    <label for="darkTheme">Dark Theme</label>
                </div>
                <div class="settings-option">
                    <input type="radio" id="lightTheme" name="theme" value="light">
                    <label for="lightTheme">Light Theme</label>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Interface</div>
                <div class="settings-option">
                    <input type="checkbox" id="showTimestamps" checked>
                    <label for="showTimestamps">Show message timestamps</label>
                </div>
                <div class="settings-option">
                    <input type="checkbox" id="enableSounds">
                    <label for="enableSounds">Enable notification sounds</label>
                </div>
            </div>
        `;
        
        // Add event listeners for theme toggle
        const darkThemeRadio = document.getElementById('darkTheme');
        const lightThemeRadio = document.getElementById('lightTheme');
        
        if (darkThemeRadio && lightThemeRadio) {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            
            if (savedTheme === 'light') {
                lightThemeRadio.checked = true;
                darkThemeRadio.checked = false;
            } else {
                darkThemeRadio.checked = true;
                lightThemeRadio.checked = false;
            }
            
            darkThemeRadio.addEventListener('change', () => {
                if (darkThemeRadio.checked && typeof window.ui !== 'undefined' && typeof window.ui.toggleTheme === 'function') {
                    document.body.classList.remove('light-theme');
                    localStorage.setItem('theme', 'dark');
                }
            });
            
            lightThemeRadio.addEventListener('change', () => {
                if (lightThemeRadio.checked && typeof window.ui !== 'undefined' && typeof window.ui.toggleTheme === 'function') {
                    document.body.classList.add('light-theme');
                    localStorage.setItem('theme', 'light');
                }
            });
        }
    }
    
    // Model Settings
    const modelSettings = document.getElementById('modelSettings');
    if (modelSettings) {
        modelSettings.innerHTML = `
            <div class="settings-section">
                <div class="settings-section-title">Model Selection</div>
                <div class="settings-option">
                    <select id="modelSelect">
                        <option value="llama3:8b" selected>Llama 3 (8B)</option>
                        <option value="llama3:70b">Llama 3 (70B)</option>
                        <option value="claude:3.5">Claude 3.5</option>
                        <option value="gpt4:turbo">GPT-4 Turbo</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Parameters</div>
                <div class="settings-option">
                    <label>Temperature</label>
                    <div class="slider-container">
                        <input type="range" id="temperatureSlider" min="0" max="1" step="0.1" value="0.7">
                        <span id="temperatureValue">0.7</span>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Features</div>
                <div class="settings-option">
                    <input type="checkbox" id="enableThinking">
                    <label for="enableThinking">Show thinking process</label>
                </div>
                <div class="settings-option">
                    <input type="checkbox" id="enableWebSearch">
                    <label for="enableWebSearch">Enable web search</label>
                </div>
            </div>
        `;
        
        // Add event listeners for model settings
        const temperatureSlider = document.getElementById('temperatureSlider');
        const temperatureValue = document.getElementById('temperatureValue');
        
        if (temperatureSlider && temperatureValue) {
            temperatureSlider.value = window.conversations ? window.conversations.currentTemperature : 0.7;
            temperatureValue.textContent = temperatureSlider.value;
            
            temperatureSlider.addEventListener('input', () => {
                temperatureValue.textContent = temperatureSlider.value;
                if (window.conversations) {
                    window.conversations.currentTemperature = parseFloat(temperatureSlider.value);
                }
            });
        }
        
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect && window.conversations) {
            modelSelect.value = window.conversations.selectedModel;
            
            modelSelect.addEventListener('change', () => {
                window.conversations.selectedModel = modelSelect.value;
            });
        }
        
        const enableThinking = document.getElementById('enableThinking');
        if (enableThinking && window.conversations) {
            enableThinking.checked = window.conversations.isThinkingModeEnabled;
            
            enableThinking.addEventListener('change', () => {
                window.conversations.isThinkingModeEnabled = enableThinking.checked;
            });
        }
        
        const enableWebSearch = document.getElementById('enableWebSearch');
        if (enableWebSearch && window.conversations) {
            enableWebSearch.checked = window.conversations.isWebSearchEnabled;
            
            enableWebSearch.addEventListener('change', () => {
                window.conversations.isWebSearchEnabled = enableWebSearch.checked;
            });
        }
    }
    
    // Account Settings
    const accountSettings = document.getElementById('accountSettings');
    if (accountSettings) {
        accountSettings.innerHTML = `
            <div class="settings-section">
                <div class="settings-section-title">Account Information</div>
                <div class="settings-option">
                    <label>Email</label>
                    <input type="text" value="user@example.com" disabled>
                </div>
                <div class="settings-option">
                    <label>Plan</label>
                    <input type="text" value="Pro" disabled>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Data & Privacy</div>
                <div class="settings-option">
                    <input type="checkbox" id="saveHistory" checked>
                    <label for="saveHistory">Save conversation history</label>
                </div>
                <div class="settings-option">
                    <input type="checkbox" id="allowAnalytics">
                    <label for="allowAnalytics">Allow anonymous usage analytics</label>
                </div>
                <button class="settings-button danger">Delete All Data</button>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Compliance</div>
                <div class="compliance-logos">
                    <span>HIPAA</span>
                    <span>SOC2</span>
                    <span>GDPR</span>
                </div>
            </div>
        `;
    }
}
