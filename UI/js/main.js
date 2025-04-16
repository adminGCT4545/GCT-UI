/**
 * GCT Enterprise App - Main JavaScript File
 * 
 * This file serves as the entry point for the application's JavaScript.
 * It imports and initializes all necessary modules.
 */

// Import modules
import { initializeUI } from './ui.js';
import { initializeConversations } from './components/conversations.js';
import { initializeSettings } from './components/settings.js';
import { initializeFileUpload } from './components/fileUpload.js';
import { initializeNotepad } from './components/notepad.js';
import { initializeBatchProcessing } from './components/batchProcessing.js';
import { initializeDashboard } from './components/dashboard.js';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing GCT Enterprise App...');
    
    // Initialize UI components
    initializeUI();
    
    // Initialize conversation management
    initializeConversations();
    
    // Initialize settings panel
    initializeSettings();
    
    // Initialize file upload functionality
    initializeFileUpload();
    
    // Initialize notepad
    initializeNotepad();
    
    // Initialize batch processing
    initializeBatchProcessing();
    
    // Initialize dashboard
    initializeDashboard();
    
    console.log('GCT Enterprise App initialized successfully.');
});
