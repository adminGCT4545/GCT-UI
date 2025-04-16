/**
 * Batch Processing Module
 * 
 * Handles batch processing functionality for processing multiple files or tasks.
 */

// DOM Elements
let batchProcessingPanel;
let batchProcessingToggleBtn;
let closeBatchPanelBtn;
let batchQueueList;
let newBatchBtn;

// State
let isBatchPanelVisible = false;
let batchJobs = [];

/**
 * Initialize batch processing functionality
 */
export function initializeBatchProcessing() {
    // Get DOM elements
    batchProcessingPanel = document.getElementById('batchProcessingPanel');
    batchProcessingToggleBtn = document.getElementById('batchProcessingToggleBtn');
    closeBatchPanelBtn = document.getElementById('closeBatchPanelBtn');
    batchQueueList = document.getElementById('batchQueueList');
    newBatchBtn = document.getElementById('newBatchBtn');
    
    // Load saved batch jobs
    loadSavedBatchJobs();
    
    // Set up event listeners
    setupEventListeners();
}

/**
 * Set up event listeners for batch processing
 */
function setupEventListeners() {
    // Toggle batch processing panel
    if (batchProcessingToggleBtn) {
        batchProcessingToggleBtn.addEventListener('click', toggleBatchPanel);
    }
    
    // Close batch panel
    if (closeBatchPanelBtn) {
        closeBatchPanelBtn.addEventListener('click', () => {
            batchProcessingPanel.classList.remove('visible');
            isBatchPanelVisible = false;
        });
    }
    
    // New batch button
    if (newBatchBtn) {
        newBatchBtn.addEventListener('click', createNewBatchJob);
    }
}

/**
 * Toggle batch processing panel
 */
function toggleBatchPanel() {
    if (!batchProcessingPanel) return;
    
    isBatchPanelVisible = !isBatchPanelVisible;
    batchProcessingPanel.classList.toggle('visible', isBatchPanelVisible);
    
    if (isBatchPanelVisible) {
        fetchBatchJobs();
    }
}

/**
 * Load saved batch jobs from localStorage
 */
function loadSavedBatchJobs() {
    try {
        const savedBatchJobs = localStorage.getItem('kynseyAiBatchJobs');
        if (savedBatchJobs) {
            batchJobs = JSON.parse(savedBatchJobs);
        }
    } catch (error) {
        console.error('Error loading saved batch jobs:', error);
        batchJobs = [];
    }
}

/**
 * Save batch jobs to localStorage
 */
function saveBatchJobs() {
    localStorage.setItem('kynseyAiBatchJobs', JSON.stringify(batchJobs));
}

/**
 * Fetch batch jobs (in a real implementation, this would fetch from a server)
 */
function fetchBatchJobs() {
    if (!batchQueueList) return;
    
    // Clear the list
    batchQueueList.innerHTML = '';
    
    // If there are no batch jobs, show a placeholder
    if (batchJobs.length === 0) {
        batchQueueList.innerHTML = '<div class="placeholder-text">No batch jobs in queue.</div>';
        return;
    }
    
    // Add batch jobs to the list
    batchJobs.forEach(job => {
        const jobItem = createBatchJobElement(job);
        batchQueueList.appendChild(jobItem);
    });
}

/**
 * Create a batch job element
 * @param {Object} job - The batch job
 * @returns {HTMLElement} The batch job element
 */
function createBatchJobElement(job) {
    const jobItem = document.createElement('div');
    jobItem.className = 'batch-item';
    jobItem.dataset.jobId = job.id;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'batch-item-name';
    nameDiv.textContent = job.name;
    
    const statusContainer = document.createElement('div');
    statusContainer.className = 'batch-item-status-container';
    
    const statusDiv = document.createElement('div');
    statusDiv.className = `batch-item-status ${job.status}`;
    statusDiv.textContent = job.status.charAt(0).toUpperCase() + job.status.slice(1);
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'batch-item-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'batch-item-progress-bar';
    progressBar.style.width = `${job.progress}%`;
    
    progressContainer.appendChild(progressBar);
    statusContainer.appendChild(statusDiv);
    statusContainer.appendChild(progressContainer);
    
    jobItem.appendChild(nameDiv);
    jobItem.appendChild(statusContainer);
    
    // Add click handler to show job details
    jobItem.addEventListener('click', () => {
        showBatchJobDetails(job);
    });
    
    return jobItem;
}

/**
 * Show batch job details
 * @param {Object} job - The batch job
 */
function showBatchJobDetails(job) {
    // In a real implementation, this would show a modal with job details
    alert(`Job: ${job.name}\nStatus: ${job.status}\nProgress: ${job.progress}%\nCreated: ${new Date(job.createdAt).toLocaleString()}`);
}

/**
 * Create a new batch job
 */
function createNewBatchJob() {
    // In a real implementation, this would show a modal to create a new batch job
    // For now, simulate creating a job
    const jobName = prompt('Enter batch job name:');
    if (!jobName) return;
    
    const newJob = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name: jobName,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        files: [],
        options: {
            enableOcr: true,
            extractTables: true,
            segmentDoc: false,
            workflow: 'default'
        }
    };
    
    // Add to batch jobs
    batchJobs.push(newJob);
    
    // Save batch jobs
    saveBatchJobs();
    
    // Refresh the list
    fetchBatchJobs();
    
    // Simulate job processing
    simulateJobProcessing(newJob.id);
}

/**
 * Simulate job processing
 * @param {string} jobId - The job ID
 */
function simulateJobProcessing(jobId) {
    // Find the job
    const jobIndex = batchJobs.findIndex(job => job.id === jobId);
    if (jobIndex === -1) return;
    
    // Update status to processing
    batchJobs[jobIndex].status = 'processing';
    saveBatchJobs();
    fetchBatchJobs();
    
    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Update job status to completed
            batchJobs[jobIndex].status = 'completed';
            batchJobs[jobIndex].progress = progress;
            saveBatchJobs();
            fetchBatchJobs();
            
            // Show notification
            showNotification(`Batch job "${batchJobs[jobIndex].name}" completed`);
        } else {
            // Update progress
            batchJobs[jobIndex].progress = progress;
            saveBatchJobs();
            fetchBatchJobs();
        }
    }, 1000);
}

/**
 * Show a notification
 * @param {string} message - The notification message
 */
function showNotification(message) {
    // In a real implementation, this would show a proper notification
    // For now, just log to console
    console.log('Notification:', message);
    
    // Update notification badge if the function is available
    if (typeof window.updateNotificationCount === 'function') {
        window.updateNotificationCount(1);
    }
}

/**
 * Add a file to a batch job
 * @param {File} file - The file to add
 * @param {Object} options - Processing options
 */
export function addFileToBatchJob(file, options = {}) {
    // In a real implementation, this would add a file to an existing or new batch job
    // For now, create a new job for the file
    const jobName = `Process ${file.name}`;
    
    const newJob = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name: jobName,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        files: [{
            name: file.name,
            type: file.type,
            size: file.size
        }],
        options: {
            enableOcr: options.enableOcr || true,
            extractTables: options.extractTables || true,
            segmentDoc: options.segmentDoc || false,
            workflow: options.workflow || 'default'
        }
    };
    
    // Add to batch jobs
    batchJobs.push(newJob);
    
    // Save batch jobs
    saveBatchJobs();
    
    // Refresh the list if panel is visible
    if (isBatchPanelVisible) {
        fetchBatchJobs();
    }
    
    // Simulate job processing
    simulateJobProcessing(newJob.id);
    
    return newJob.id;
}
