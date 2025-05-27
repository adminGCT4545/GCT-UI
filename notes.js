/**
 * Notes Module for GCT UI
 * 
 * This module implements the notes functionality, including:
 * - Creating, editing, and deleting notes
 * - Markdown support with preview
 * - AI enhancement features
 * - Tags and search functionality
 */

// Panel Management System
const PanelManager = {
    activePanel: null,
    panelStates: new Map(),
    isTransitioning: false,
    
    init() {
        // Initialize panel states
        ['notes', 'chat', 'settings'].forEach(panel => {
            this.panelStates.set(panel, {
                isOpen: false,
                lastPosition: null,
                data: null
            });
        });
    },
    
    setActivePanel(panelId) {
        // Prevent race conditions with async check
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        const previousPanel = this.activePanel;
        if (previousPanel) {
            this.closePanel(previousPanel);
        }
        
        this.activePanel = panelId;
        if (panelId) {
            this.openPanel(panelId);
        }
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 300); // Match transition duration
    },
    
    openPanel(panelId) {
        const panel = document.getElementById(`${panelId}-panel`);
        const state = this.panelStates.get(panelId);
        if (panel && state) {
            panel.classList.add('active');
            state.isOpen = true;
            this.updateNavigation(panelId);
            localStorage.setItem('lastActivePanel', panelId);
        }
    },
    
    closePanel(panelId) {
        const panel = document.getElementById(`${panelId}-panel`);
        const state = this.panelStates.get(panelId);
        if (panel && state) {
            panel.classList.remove('active');
            state.isOpen = false;
            this.updateNavigation(panelId);
        }
    },
    
    updateNavigation(activePanelId) {
        ['notes', 'chat', 'settings'].forEach(panelId => {
            const navItem = document.getElementById(`${panelId}-nav`);
            if (navItem) {
                navItem.classList.toggle('active', panelId === activePanelId);
            }
        });
    },
    
    restoreLastActivePanel() {
        const lastPanel = localStorage.getItem('lastActivePanel');
        if (lastPanel) {
            this.setActivePanel(lastPanel);
        }
    }
};

// Toast Notification System
const ToastManager = {
    queue: [],
    isProcessing: false,
    maxVisible: 3,
    visibleToasts: new Set(),
    
    init() {
        // Create container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        this.container = container;
    },
    
    show(message, options = {}) {
        const toast = {
            id: Date.now(),
            message,
            type: options.type || 'info',
            priority: options.priority || 'normal',
            duration: options.duration || 3000,
            timestamp: Date.now()
        };
        
        // Add to queue based on priority
        if (toast.priority === 'high') {
            this.queue.unshift(toast);
        } else {
            this.queue.push(toast);
        }
        
        this.processQueue();
    },
    
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.queue.length > 0 && this.visibleToasts.size < this.maxVisible) {
            const toast = this.queue.shift();
            await this.displayToast(toast);
        }
        
        this.isProcessing = false;
    },
    
    async displayToast(toast) {
        const toastElement = document.createElement('div');
        toastElement.className = `toast toast-${toast.type}`;
        toastElement.textContent = toast.message;
        
        this.container.appendChild(toastElement);
        this.visibleToasts.add(toast.id);
        
        // Trigger reflow for animation
        toastElement.offsetHeight;
        toastElement.classList.add('show');
        
        return new Promise(resolve => {
            setTimeout(() => {
                toastElement.classList.add('fade-out');
                setTimeout(() => {
                    if (this.container.contains(toastElement)) {
                        this.container.removeChild(toastElement);
                        this.visibleToasts.delete(toast.id);
                        this.processQueue();
                    }
                    resolve();
                }, 300);
            }, toast.duration);
        });
    }
};

// Update showToast function with ToastManager
function showToast(message, type = 'success', priority = 'normal') {
    ToastManager.show(message, { type, priority });
}

// Notes Module using IIFE pattern
var Notes = (function() {
    'use strict';

    // Utility Functions
    function getRequiredElement(id) {
        const element = document.getElementById(id);
        if (!element) throw new Error(`Required element #${id} not found`);
        return element;
    }

    function validateNote(note) {
        if (!note.title || note.title.length > 255) throw new Error('Invalid title');
        if (!note.content) throw new Error('Content required');
        if (!Array.isArray(note.tags)) throw new Error('Tags must be an array');
        return note;
    }

    function saveNotesToStorage() {
        try {
            localStorage.setItem('gct_notes', JSON.stringify(notes));
        } catch (e) {
            console.error('Failed to save notes:', e);
            showToast('Failed to save notes', 'error');
            throw e;
        }
    }

    function cleanupEventListeners(element) {
        const oldItems = element.querySelectorAll('.note-item');
        oldItems.forEach(item => {
            const clone = item.cloneNode(true);
            item.parentNode.replaceChild(clone, item);
        });
    }

    // DOM Elements
    let notesPanel;
    let noteEditorPanel;
    let notesNav;
    let closeNotesBtn;
    let newNoteBtn;
    let notesList;
    let notesSearchInput;
    let notesClearSearch;
    let tagsFilterList;
    
    // Note Editor Elements
    let backToNotesBtn;
    let noteTitleInput;
    let noteContentInput;
    let noteContentDisplay;
    let tagInput;
    let addTagBtn;
    let noteTagsList;
    let saveNoteBtn;
    let deleteNoteBtn;
    let enhanceNoteBtn;
    
    // View Toggle Elements
    let editViewBtn;
    let splitViewBtn;
    let previewViewBtn;
    
    // AI Tools Elements
    let aiToolsToggle;
    let aiToolsPanel;
    let aiSuggestionBtns;
    let aiPromptInput;
    let aiPromptBtn;
    let aiResponse;
    let aiThinking;
    
    // Markdown Toolbar Elements
    let mdToolBtns;
    
    // Notes Data
    let notes = [];
    let tags = [];
    let currentNoteId = null;
    let isEditing = false;
    let autoSaveTimeout;
    const AUTOSAVE_DELAY = 2000; // 2 seconds
    const noteStates = new Map();

    // Data Protection Functions
    function hasUnsavedChanges() {
        if (!currentNoteId) return false;
        
        const note = notes.find(n => n.id === currentNoteId);
        if (!note) return false;
        
        return note.title !== noteTitleInput.value ||
               note.content !== noteContentInput.value;
    }

    function promptForUnsavedChanges() {
        if (hasUnsavedChanges()) {
            return confirm('You have unsaved changes. Do you want to save them?');
        }
        return true;
    }

    function setupAutoSave() {
        function triggerAutoSave() {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                if (isEditing && currentNoteId !== null) {
                    saveNote(true); // true indicates auto-save
                }
            }, AUTOSAVE_DELAY);
        }

        if (noteContentInput) {
            noteContentInput.addEventListener('input', triggerAutoSave);
        }
        if (noteTitleInput) {
            noteTitleInput.addEventListener('input', triggerAutoSave);
        }
    }

    function saveNoteState() {
        if (!currentNoteId) return;
        
        noteStates.set(currentNoteId, {
            scroll: noteContentInput.scrollTop,
            selection: {
                start: noteContentInput.selectionStart,
                end: noteContentInput.selectionEnd
            },
            viewMode: noteEditorPanel.className.includes('split') ? 'split' :
                     noteEditorPanel.className.includes('preview') ? 'preview' : 'edit'
        });
    }

    function restoreNoteState(noteId) {
        const state = noteStates.get(noteId);
        if (!state) return;
        
        setViewMode(state.viewMode);
        noteContentInput.scrollTop = state.scroll;
        noteContentInput.setSelectionRange(state.selection.start, state.selection.end);
    }
    
    // Initialize the module
    function init() {
        try {
            console.log('Initializing Notes module');
            
            // Initialize managers
            PanelManager.init();
            ViewManager.init();
            ToastManager.init();
            
            // Check AI connection
            checkAIConnection();
            
            // Restore preferred view mode
            const preferredViewMode = localStorage.getItem('preferredViewMode') || 'edit';
            setViewMode(preferredViewMode);
            
            // Get DOM elements with error handling
            const requiredElements = {
                'notes-panel': el => notesPanel = el,
                'note-editor-panel': el => noteEditorPanel = el,
                'notes-nav': el => notesNav = el,
                'close-notes': el => closeNotesBtn = el,
                'new-note-btn': el => newNoteBtn = el,
                'notes-list': el => notesList = el,
                'notes-search-input': el => notesSearchInput = el,
                'notes-clear-search': el => notesClearSearch = el,
                'tags-filter-list': el => tagsFilterList = el,
                'back-to-notes': el => backToNotesBtn = el,
                'note-title-input': el => noteTitleInput = el,
                'note-content-input': el => noteContentInput = el,
                'note-content-display': el => noteContentDisplay = el,
                'tag-input': el => tagInput = el,
                'add-tag-btn': el => addTagBtn = el,
                'note-tags-list': el => noteTagsList = el,
                'save-note-btn': el => saveNoteBtn = el,
                'delete-note-btn': el => deleteNoteBtn = el,
                'enhance-note-btn': el => enhanceNoteBtn = el
            };

            // Initialize elements with error handling
            for (const [id, setter] of Object.entries(requiredElements)) {
                const element = getRequiredElement(id);
                setter(element);
            }
            
            // Initialize view toggle elements
            editViewBtn = document.getElementById('edit-view-btn');
            splitViewBtn = document.getElementById('split-view-btn');
            previewViewBtn = document.getElementById('preview-view-btn');
            
            // Initialize AI tools elements
            aiToolsToggle = document.querySelector('.ai-tools-toggle');
            aiToolsPanel = document.getElementById('ai-tools-panel');
            aiSuggestionBtns = document.querySelectorAll('.ai-suggestion-btn');
            aiPromptInput = document.getElementById('ai-prompt-input');
            aiPromptBtn = document.getElementById('ai-prompt-btn');
            aiResponse = document.getElementById('ai-response');
            aiThinking = document.getElementById('ai-thinking');
            
            // Initialize markdown toolbar elements
            mdToolBtns = document.querySelectorAll('.md-tool-btn');
            
            // Add event listeners
            setupEventListeners();
            
            // Load notes
            loadNotes();
            
            // Setup panel navigation
            setupPanelNavigation();
            
            // Restore last active panel
            PanelManager.restoreLastActivePanel();
            
            console.log('Notes module initialized');
        } catch (e) {
            console.error('Failed to initialize Notes module:', e);
            if (typeof showToast === 'function') {
                showToast('Failed to initialize Notes', 'error');
            }
            throw e;
        }
    }

    // Setup Event Listeners
    function setupEventListeners() {
        try {
            // Add all event listeners
            if (closeNotesBtn) closeNotesBtn.addEventListener('click', toggleNotesPanel);
            if (newNoteBtn) newNoteBtn.addEventListener('click', createNewNote);
            if (notesSearchInput) {
                notesSearchInput.addEventListener('input', (e) => {
                    e.preventDefault();
                    searchNotes();
                });
            }
            if (notesClearSearch) notesClearSearch.addEventListener('click', clearSearch);
            if (backToNotesBtn) backToNotesBtn.addEventListener('click', closeNoteEditor);
            if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveNote);
            if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', deleteNote);
            if (enhanceNoteBtn) enhanceNoteBtn.addEventListener('click', enhanceNote);
            
            // Tag input handlers
            if (tagInput) {
                tagInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') addTag();
                });
            }
            if (addTagBtn) addTagBtn.addEventListener('click', addTag);
            
            // View toggle handlers
            if (editViewBtn) editViewBtn.addEventListener('click', () => setViewMode('edit'));
            if (splitViewBtn) splitViewBtn.addEventListener('click', () => setViewMode('split'));
            if (previewViewBtn) previewViewBtn.addEventListener('click', () => setViewMode('preview'));
            
            // AI tools handlers
            if (aiToolsToggle) aiToolsToggle.addEventListener('click', toggleAITools);
            if (aiSuggestionBtns) {
                aiSuggestionBtns.forEach(btn => {
                    btn.addEventListener('click', handleAISuggestion);
                });
            }
            if (aiPromptBtn) aiPromptBtn.addEventListener('click', handleCustomPrompt);
            if (aiPromptInput) {
                aiPromptInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') handleCustomPrompt();
                });
            }
            
            // Markdown toolbar handlers
            if (mdToolBtns) {
                mdToolBtns.forEach(btn => {
                    btn.addEventListener('click', handleMarkdownToolClick);
                });
            }
            
            // Note content preview handler
            if (noteContentInput) {
                noteContentInput.addEventListener('input', updatePreview);
            }
            
            // Initialize auto-save
            setupAutoSave();
        } catch (e) {
            console.error('Error setting up event listeners:', e);
            throw e;
        }
    }
// Setup Panel Navigation
function setupPanelNavigation() {
    ['notes', 'chat', 'settings'].forEach(panelId => {
        const navItem = document.getElementById(`${panelId}-nav`);
        if (navItem) {
            navItem.addEventListener('click', (e) => {
                e.preventDefault();
                PanelManager.setActivePanel(
                    PanelManager.activePanel === panelId ? null : panelId
                );
            });
        }
    });
}

// Toggle Notes Panel
function toggleNotesPanel() {
    try {
        PanelManager.setActivePanel(
            PanelManager.activePanel === 'notes' ? null : 'notes'
        );
    } catch (e) {
        console.error('Error toggling notes panel:', e);
        showToast('Error toggling panel', 'error');
    }
}



    // Note Operations
    function loadNotes() {
console.time('loadNotes');
            // Memory tracking not available in browser
        try {
            const storedNotes = localStorage.getItem('gct_notes');
            notes = storedNotes ? JSON.parse(storedNotes) : [];
            refreshNotesList();
            updateTagsList();
        } catch (e) {
            console.error('Error loading notes:', e);
console.timeEnd('loadNotes');
            // Memory tracking not available in browser
            showToast('Error loading notes', 'error');
            notes = [];
        }
    }

    function createNewNote() {
        try {
            const newNote = {
                id: Date.now(),
                title: 'New Note',
                content: '',
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            validateNote(newNote);
            notes.unshift(newNote);
            saveNotesToStorage();
            openNote(newNote.id);
        } catch (e) {
            console.error('Error creating note:', e);
            showToast('Error creating note', 'error');
        }
    }

    function openNote(id) {
        try {
            if (currentNoteId && hasUnsavedChanges()) {
                if (confirm('You have unsaved changes. Do you want to save them?')) {
                    saveNote();
                }
                saveNoteState();
            }
            
            const note = notes.find(n => n.id === id);
            if (!note) throw new Error('Note not found');
            
            currentNoteId = id;
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            updatePreview();
            
            // Update tags
            noteTagsList.innerHTML = '';
            note.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag';
                tagEl.textContent = tag;
                tagEl.onclick = () => removeTag(tag);
                noteTagsList.appendChild(tagEl);
            });
            
            PanelManager.setActivePanel('note-editor');
            restoreNoteState(id) || setViewMode('edit');
        } catch (e) {
            console.error('Error opening note:', e);
            showToast('Error opening note', 'error');
        }
    }

    function closeNoteEditor() {
        try {
            if (hasUnsavedChanges()) {
                if (confirm('You have unsaved changes. Do you want to save them?')) {
                    saveNote();
                }
            }
            
            if (currentNoteId) {
                saveNoteState();
            }
            
            PanelManager.setActivePanel('notes');
            currentNoteId = null;
            cleanupEventListeners(noteTagsList);
        } catch (e) {
            console.error('Error closing editor:', e);
            showToast('Error closing editor', 'error');
        }
    }

    function saveNote(isAutoSave = false) {
        try {
            const note = notes.find(n => n.id === currentNoteId);
            if (!note) throw new Error('Note not found');
            
            const updatedNote = {
                ...note,
                title: noteTitleInput.value,
                content: noteContentInput.value,
                updatedAt: new Date().toISOString()
            };
            
            validateNote(updatedNote);
            Object.assign(note, updatedNote);
            saveNotesToStorage();
            refreshNotesList();
            if (!isAutoSave) {
                showToast('Note saved successfully', 'success');
            }
        } catch (e) {
            console.error('Error saving note:', e);
            showToast('Error saving note', 'error');
        }
    }

    function deleteNote() {
        try {
            const index = notes.findIndex(n => n.id === currentNoteId);
            if (index === -1) throw new Error('Note not found');
            
            notes.splice(index, 1);
            saveNotesToStorage();
            closeNoteEditor();
            refreshNotesList();
            updateTagsList();
            showToast('Note deleted successfully', 'success');
        } catch (e) {
            console.error('Error deleting note:', e);
            showToast('Error deleting note', 'error');
        }
    }

    // Search and Filter
    function searchNotes() {
        const searchId = `search-${Date.now()}`;
        console.time(searchId);
        const searchStart = performance.now();
        try {
            const query = notesSearchInput.value.toLowerCase();
            const items = notesList.getElementsByClassName('note-item');
            
            Array.from(items).forEach(item => {
                const title = item.querySelector('.note-title').textContent.toLowerCase();
                const content = item.querySelector('.note-preview').textContent.toLowerCase();
                const visible = title.includes(query) || content.includes(query);
                item.style.display = visible ? '' : 'none';
            });
            
            console.timeEnd(searchId);
            console.log(`Search execution time: ${performance.now() - searchStart}ms`);
            console.log(`Search query length: ${query.length}, results shown: ${Array.from(items).filter(item => item.style.display === '').length}`);
        } catch (e) {
            console.error('Error searching notes:', e);
            showToast('Error searching notes', 'error');
        }
    }

    function clearSearch() {
        try {
            notesSearchInput.value = '';
            searchNotes();
        } catch (e) {
            console.error('Error clearing search:', e);
            showToast('Error clearing search', 'error');
        }
    }

    // Tag Management
    function addTag() {
        try {
            const tag = tagInput.value.trim();
            if (!tag) return;
            
            const note = notes.find(n => n.id === currentNoteId);
            if (!note) throw new Error('Note not found');
            
            if (!note.tags.includes(tag)) {
                note.tags.push(tag);
                const tagEl = document.createElement('span');
                tagEl.className = 'tag';
                tagEl.textContent = tag;
                tagEl.onclick = () => removeTag(tag);
                noteTagsList.appendChild(tagEl);
                saveNotesToStorage();
                updateTagsList();
            }
            
            tagInput.value = '';
        } catch (e) {
            console.error('Error adding tag:', e);
            showToast('Error adding tag', 'error');
        }
    }

    function removeTag(tag) {
        try {
            const note = notes.find(n => n.id === currentNoteId);
            if (!note) throw new Error('Note not found');
            
            note.tags = note.tags.filter(t => t !== tag);
            noteTagsList.innerHTML = '';
            note.tags.forEach(t => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag';
                tagEl.textContent = t;
                tagEl.onclick = () => removeTag(t);
                noteTagsList.appendChild(tagEl);
            });
            
            saveNotesToStorage();
            updateTagsList();
        } catch (e) {
            console.error('Error removing tag:', e);
            showToast('Error removing tag', 'error');
        }
    }

    // View Management
    const ViewManager = {
        currentMode: 'edit',
        transitionInProgress: false,

        init() {
            this.editor = document.getElementById('note-editor-panel');
            this.content = document.getElementById('note-content-input');
            this.preview = document.getElementById('note-content-display');
            this.setupTransitionHandling();
        },

        setupTransitionHandling() {
            // Prevent flickering by handling transitions
            this.editor.addEventListener('transitionstart', () => {
                this.transitionInProgress = true;
            });
            
            this.editor.addEventListener('transitionend', () => {
                this.transitionInProgress = false;
                this.applyScrollPosition();
            });
        },

        setViewMode(mode) {
            if (this.transitionInProgress) return;
            
            // Save scroll positions before mode change
            this.saveScrollPosition();
            
            // Remove existing mode classes
            this.editor.classList.remove('edit-mode', 'split-mode', 'preview-mode');
            
            // Add new mode class
            this.editor.classList.add(`${mode}-mode`);
            this.currentMode = mode;
            
            // Update buttons state
            this.updateViewButtons(mode);
            
            // Handle split view specific logic
            if (mode === 'split') {
                this.setupSplitView();
            }
            
            // Store user preference
            localStorage.setItem('preferredViewMode', mode);
        },

        saveScrollPosition() {
            if (!this.content || !this.preview) return;
            
            this.lastScrollPosition = {
                editor: this.content.scrollTop,
                preview: this.preview.scrollTop
            };
        },

        applyScrollPosition() {
            if (!this.lastScrollPosition) return;
            
            if (this.content) {
                this.content.scrollTop = this.lastScrollPosition.editor;
            }
            if (this.preview) {
                this.preview.scrollTop = this.lastScrollPosition.preview;
            }
        },

        setupSplitView() {
            if (!this.content || !this.preview) return;
            
            // Sync scroll positions between editor and preview
            const syncScroll = (source, target) => {
                const percentage = source.scrollTop /
                    (source.scrollHeight - source.clientHeight);
                target.scrollTop = percentage *
                    (target.scrollHeight - target.clientHeight);
            };
            
            this.content.addEventListener('scroll', () => {
                if (this.currentMode === 'split') {
                    syncScroll(this.content, this.preview);
                }
            });
            
            this.preview.addEventListener('scroll', () => {
                if (this.currentMode === 'split') {
                    syncScroll(this.preview, this.content);
                }
            });
        },

        updateViewButtons(mode) {
            ['edit', 'split', 'preview'].forEach(viewMode => {
                const button = document.getElementById(`${viewMode}-view-btn`);
                if (button) {
                    button.classList.toggle('active', viewMode === mode);
                }
            });
        }
    };

    function setViewMode(mode) {
        ViewManager.setViewMode(mode);
        updatePreview();
    }

    // AI Tools
    function toggleAITools() {
        try {
            aiToolsPanel.classList.toggle('active');
            aiToolsToggle.classList.toggle('active');
        } catch (e) {
            console.error('Error toggling AI tools:', e);
            showToast('Error toggling AI tools', 'error');
        }
    }

    async function handleAISuggestion(event) {
        try {
            const prompt = event.target.dataset.prompt;
            if (!prompt) throw new Error('No prompt provided');
            const response = await sendAIPrompt(prompt);
            if (response) {
                showToast('AI response received', 'success');
            }
        } catch (error) {
            console.error('Error handling AI suggestion:', error);
            showToast('Error with AI suggestion', 'error');
        }
    }

    async function handleCustomPrompt() {
        try {
            const prompt = aiPromptInput.value.trim();
            if (!prompt) return;
            
            const response = await sendAIPrompt(prompt);
            aiPromptInput.value = '';
            
            if (response) {
                showToast('AI response received', 'success');
            }
        } catch (error) {
            console.error('Error handling custom prompt:', error);
            showToast('Error with custom prompt', 'error');
        }
    }

    async function enhanceNote() {
        try {
            const note = notes.find(n => n.id === currentNoteId);
            if (!note) throw new Error('Note not found');
            
            aiThinking.style.display = 'block';
            const prompt = `Please enhance this note by improving its clarity, organization, and completeness:
                       
Title: ${note.title}
Content: ${note.content}

Please provide the enhanced version while maintaining any important information and adding relevant details where appropriate.`;
            
            const response = await AIManager.generateCompletion(prompt);
            noteContentInput.value = response;
            updatePreview();
            showToast('Note enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing note:', error);
            showToast('Error enhancing note', 'error');
        } finally {
            aiThinking.style.display = 'none';
        }
    }

    // Markdown Tools
    function handleMarkdownToolClick(event) {
        try {
            const action = event.target.dataset.action;
            if (!action) throw new Error('No action specified');
            
            const start = noteContentInput.selectionStart;
            const end = noteContentInput.selectionEnd;
            const text = noteContentInput.value;
            
            let result;
            switch (action) {
                case 'bold':
                    result = `${text.slice(0, start)}**${text.slice(start, end)}**${text.slice(end)}`;
                    break;
                case 'italic':
                    result = `${text.slice(0, start)}_${text.slice(start, end)}_${text.slice(end)}`;
                    break;
                case 'code':
                    result = `${text.slice(0, start)}\`${text.slice(start, end)}\`${text.slice(end)}`;
                    break;
                default:
                    throw new Error('Invalid markdown action');
            }
            
            noteContentInput.value = result;
            updatePreview();
        } catch (e) {
            console.error('Error applying markdown:', e);
            showToast('Error applying markdown', 'error');
        }
    }

    function updatePreview() {
        try {
            if (!noteContentInput || !noteContentDisplay) return;
            
            // Prevent unnecessary updates during transitions
            if (ViewManager.transitionInProgress) {
                requestAnimationFrame(updatePreview);
                return;
            }
            
            const content = noteContentInput.value;
            
            // Use marked.js with proper options to prevent flickering
            if (window.marked) {
                marked.setOptions({
                    gfm: true,
                    breaks: true,
                    smartLists: true,
                    smartypants: true
                });
                
                // Use async rendering for better performance
                requestAnimationFrame(() => {
                    noteContentDisplay.innerHTML = marked.parse(content);
                    
                    // Apply syntax highlighting if available
                    if (window.hljs) {
                        noteContentDisplay.querySelectorAll('pre code').forEach(block => {
                            hljs.highlightElement(block);
                        });
                    }
                });
            } else {
                // Fallback to simple markdown
                requestAnimationFrame(() => {
                    noteContentDisplay.innerHTML = simpleMarkdownToHtml(content);
                });
            }
        } catch (e) {
            console.error('Error updating preview:', e);
            showToast('Error updating preview', 'error');
        }
    }

    // Helper Functions
    function refreshNotesList() {
        try {
            if (!notesList) throw new Error('Notes list element not found');
            
            cleanupEventListeners(notesList);
            notesList.innerHTML = '';
            
            notes.forEach(note => {
                const item = document.createElement('div');
                item.className = 'note-item';
                item.innerHTML = `
                    <h3 class="note-title">${note.title}</h3>
                    <p class="note-preview">${note.content.substring(0, 100)}...</p>
                    <div class="note-meta">
                        <span class="note-date">${new Date(note.updatedAt).toLocaleDateString()}</span>
                        <span class="note-tags">${note.tags.join(', ')}</span>
                    </div>
                `;
                item.addEventListener('click', () => openNote(note.id));
                notesList.appendChild(item);
            });
        } catch (e) {
            console.error('Error refreshing notes list:', e);
            showToast('Error refreshing notes', 'error');
        }
    }

    function updateTagsList() {
        console.time('updateTagsList');
        const tagStart = performance.now();
        try {
            if (!tagsFilterList) throw new Error('Tags filter list element not found');
            
            const allTags = new Set();
            notes.forEach(note => note.tags.forEach(tag => allTags.add(tag)));
            
            tagsFilterList.innerHTML = '';
            Array.from(allTags).sort().forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'filter-tag';
                tagEl.textContent = tag;
                tagEl.addEventListener('click', () => filterByTag(tag));
                tagsFilterList.appendChild(tagEl);
            });
            
            console.timeEnd('updateTagsList');
            console.log(`Tag update execution time: ${performance.now() - tagStart}ms`);
        } catch (e) {
            console.error('Error updating tags list:', e);
            showToast('Error updating tags', 'error');
        }
    }

    function filterByTag(tag) {
        try {
            const items = notesList.getElementsByClassName('note-item');
            Array.from(items).forEach(item => {
                const tags = item.querySelector('.note-tags').textContent;
                item.style.display = tags.includes(tag) ? '' : 'none';
            });
        } catch (e) {
            console.error('Error filtering by tag:', e);
            showToast('Error filtering notes', 'error');
        }
    }

    // AI Manager for LM Studio API operations
    const AIManager = {
        API_URL: 'http://192.168.1.7:4545',
        
        async generateCompletion(prompt) {
            console.log('Sending request to LM Studio API:', {
                url: `${this.API_URL}/chat/completions`,
                prompt: prompt
            });

            try {
                const response = await fetch(`${this.API_URL}/v1/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: "system", content: "You are a helpful assistant that helps users enhance their notes." },
                            { role: "user", content: prompt }
                        ],
                        model: "local-model",
                        temperature: 0.7,
                        max_tokens: 500
                    })
                });
                
                console.log('Response status:', response.status);
                const responseText = await response.text();
                console.log('Raw response:', responseText);

                if (!response.ok) {
                    throw new Error(`AI API request failed: ${response.status} - ${responseText}`);
                }

                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    throw new Error(`Invalid JSON response: ${e.message}`);
                }

                console.log('Parsed response:', data);

                if (!data.choices?.[0]?.message?.content) {
                    throw new Error('Unexpected response format');
                }

                return data.choices[0].message.content;
            } catch (error) {
                console.error('AI API error:', error);
                throw error;
            }
        }
    };

    async function sendAIPrompt(prompt) {
        try {
            aiThinking.style.display = 'block';
            const response = await AIManager.generateCompletion(prompt);
            aiResponse.textContent = response;
            return response;
        } catch (error) {
            console.error('Error getting AI response:', error);
            showToast('Error communicating with AI', 'error');
            throw error;
        } finally {
            aiThinking.style.display = 'none';
        }
    }

    function checkAIConnection() {
        console.log('Checking AI connection at:', AIManager.API_URL);
        fetch(`${AIManager.API_URL}/v1/models`)
            .then(async response => {
                console.log('Connection check response:', response.status);
                if (!response.ok) {
                    const text = await response.text();
                    console.error('Connection check failed:', text);
                    throw new Error(`AI service not available: ${response.status} - ${text}`);
                }
                aiToolsToggle.classList.remove('disabled');
                showToast('AI service connected', 'success');
            })
            .catch(error => {
                console.error('AI service connection failed:', error);
                aiToolsToggle.classList.add('disabled');
                showToast('AI service not available - Check if LM Studio is running', 'error');
            });
    }

    // Public API
    return {
        init: init,
        toggleNotesPanel: toggleNotesPanel,
        createNewNote: createNewNote,
        openNote: openNote,
        closeNoteEditor: closeNoteEditor,
        saveNote: saveNote,
        deleteNote: deleteNote,
        enhanceNote: enhanceNote
    };
})();

// Initialize Notes module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof Notes === 'undefined' || !Notes.init) {
            throw new Error('Notes module is not properly initialized');
        }
        Notes.init();
    } catch (e) {
        console.error('Failed to initialize Notes module:', e);
        if (typeof showToast === 'function') {
            showToast('Failed to initialize Notes', 'error');
        }
    }
});
