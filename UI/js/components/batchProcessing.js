/**
 * Batch Processing Module
 * 
 * Handles batch processing of files and data.
 */

// Create a global batchProcessing object
window.batchProcessing = {};

// DOM Elements
let batchJobsList;
let createBatchJobBtn;
let batchJobModal;
let batchJobForm;

// State
window.batchProcessing.batchJobs = [];
window.batchProcessing.currentBatchJobId = null;

/**
 * Initialize batch processing functionality
 */
window.batchProcessing.initializeBatchProcessing = function() {
    // Get DOM elements
    batchJobsList = document.getElementById('batchJobsList');
    createBatchJobBtn = document.getElementById('createBatchJobBtn');
    batchJobModal = document.getElementById('batchJobModal');
    batchJobForm = document.getElementById('batchJobForm');
    
    // Create elements if they don't exist
    createBatchProcessingElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load saved batch jobs
    loadSavedBatchJobs();
}

/**
 * Create batch processing elements if they don't exist
 */
function createBatchProcessingElements() {
    // Create batch jobs list if it doesn't exist
    if (!batchJobsList) {
        batchJobsList = document.createElement('div');
        batchJobsList.id = 'batchJobsList';
        batchJobsList.className = 'batch-jobs-list';
        
        // Add to right panel
        const rightPanel = document.getElementById('rightPanel');
        if (rightPanel) {
            const batchJobsSection = document.createElement('div');
            batchJobsSection.className = 'dashboard-section';
            
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'dashboard-section-title';
            sectionTitle.textContent = 'Batch Jobs';
            
            batchJobsSection.appendChild(sectionTitle);
            batchJobsSection.appendChild(batchJobsList);
            
            rightPanel.appendChild(batchJobsSection);
        }
    }
    
    // Create batch job button if it doesn't exist
    if (!createBatchJobBtn) {
        createBatchJobBtn = document.createElement('button');
        createBatchJobBtn.id = 'createBatchJobBtn';
        createBatchJobBtn.className = 'settings-button primary';
        createBatchJobBtn.textContent = 'Create Batch Job';
        
        // Add to batch jobs section
        if (batchJobsList && batchJobsList.parentElement) {
            batchJobsList.parentElement.appendChild(createBatchJobBtn);
        }
    }
    
    // Create batch job modal if it doesn't exist
    if (!batchJobModal) {
        batchJobModal = document.createElement('div');
        batchJobModal.id = 'batchJobModal';
        batchJobModal.className = 'file-upload-modal';
        
        batchJobModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">Create Batch Job</div>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="batchJobForm">
                    <div class="settings-option">
                        <label>Job Name</label>
                        <input type="text" id="batchJobName" placeholder="Enter job name" required>
                    </div>
                    <div class="settings-option">
                        <label>Job Type</label>
                        <select id="batchJobType">
                            <option value="document-analysis">Document Analysis</option>
                            <option value="data-processing">Data Processing</option>
                            <option value="image-analysis">Image Analysis</option>
                        </select>
                    </div>
                    <div class="settings-option">
                        <label>Files</label>
                        <div id="batchJobFiles" class="batch-job-files">
                            <div class="file-upload-area">
                                <div class="file-upload-text">Drag & drop files here, or click to select</div>
                                <input type="file" id="batchJobFileInput" multiple style="display: none;">
                            </div>
                            <div id="batchJobFilesList" class="batch-job-files-list"></div>
                        </div>
                    </div>
                    <div class="file-upload-buttons">
                        <button type="button" id="cancelBatchJobBtn" class="settings-button">Cancel</button>
                        <button type="submit" id="submitBatchJobBtn" class="settings-button primary">Create Job</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(batchJobModal);
        
        // Update references
        batchJobForm = document.getElementById('batchJobForm');
    }
    
    // Add CSS for batch processing elements if not already present
    addBatchProcessingStyles();
}

/**
 * Add CSS styles for batch processing elements
 */
function addBatchProcessingStyles() {
    // Check if styles already exist
    if (document.getElementById('batch-processing-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'batch-processing-styles';
    styleElement.textContent = `
        .batch-jobs-list {
            margin-top: 1rem;
        }
        
        .batch-job-item {
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 0.8rem;
            margin-bottom: 0.8rem;
        }
        
        .batch-job-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .batch-job-name {
            font-weight: bold;
            font-size: 0.95rem;
        }
        
        .batch-job-status {
            font-size: 0.8rem;
            padding: 0.2rem 0.5rem;
            border-radius: 10px;
            text-transform: capitalize;
        }
        
        .batch-job-status.queued {
            background-color: var(--bg-tertiary);
            color: var(--text-muted);
        }
        
        .batch-job-status.processing {
            background-color: rgba(11, 132, 255, 0.2);
            color: var(--accent-primary);
        }
        
        .batch-job-status.completed {
            background-color: rgba(40, 167, 69, 0.2);
            color: #28a745;
        }
        
        .batch-job-info {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        
        .batch-job-type, .batch-job-files-count, .batch-job-date {
            background-color: var(--bg-tertiary);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
        }
        
        .batch-job-progress {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .progress-bar {
            flex-grow: 1;
            height: 6px;
            background-color: var(--bg-tertiary);
            border-radius: 3px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background-color: var(--accent-primary);
            border-radius: 3px;
            transition: width 0.3s ease;
        }
        
        .progress-text {
            font-size: 0.8rem;
            color: var(--text-secondary);
            min-width: 40px;
            text-align: right;
        }
        
        .batch-job-files {
            margin-top: 0.5rem;
        }
        
        .batch-job-files-list {
            margin-top: 0.5rem;
            max-height: 150px;
            overflow-y: auto;
        }
        
        .batch-job-file-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            margin-bottom: 0.5rem;
            position: relative;
        }
        
        .file-icon {
            font-size: 1.2rem;
        }
        
        .file-name {
            flex-grow: 1;
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .file-size {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        
        .remove-file-btn {
            background: none;
            border: none;
            color: var(--danger-color);
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        
        .empty-list {
            color: var(--text-muted);
            font-style: italic;
            text-align: center;
            padding: 1rem;
        }
    `;
    
    document.head.appendChild(styleElement);
}

/**
 * Set up event listeners for batch processing
 */
function setupEventListeners() {
    // Create batch job button
    if (createBatchJobBtn) {
        createBatchJobBtn.addEventListener('click', showBatchJobModal);
    }
    
    // Close modal button
    const closeModalBtn = batchJobModal ? batchJobModal.querySelector('.close-modal') : null;
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideBatchJobModal);
    }
    
    // Cancel button
    const cancelBatchJobBtn = document.getElementById('cancelBatchJobBtn');
    if (cancelBatchJobBtn) {
        cancelBatchJobBtn.addEventListener('click', hideBatchJobModal);
    }
    
    // Batch job form
    if (batchJobForm) {
        batchJobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createBatchJob();
        });
    }
    
    // Batch job file input
    const batchJobFileInput = document.getElementById('batchJobFileInput');
    const batchJobFilesArea = document.getElementById('batchJobFiles');
    
    if (batchJobFileInput && batchJobFilesArea) {
        // Click on area to select files
        batchJobFilesArea.addEventListener('click', () => {
            batchJobFileInput.click();
        });
        
        // File selection
        batchJobFileInput.addEventListener('change', handleBatchJobFileSelection);
        
        // Drag and drop
        batchJobFilesArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            batchJobFilesArea.classList.add('dragover');
        });
        
        batchJobFilesArea.addEventListener('dragleave', () => {
            batchJobFilesArea.classList.remove('dragover');
        });
        
        batchJobFilesArea.addEventListener('drop', (e) => {
            e.preventDefault();
            batchJobFilesArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                handleBatchJobFileSelection({ target: { files: e.dataTransfer.files } });
            }
        });
    }
}

/**
 * Show the batch job modal
 */
function showBatchJobModal() {
    console.log('Show batch job modal called');
    if (!batchJobModal) {
        console.error('Batch job modal not found');
        batchJobModal = document.getElementById('batchJobModal');
        if (!batchJobModal) {
            console.error('Batch job modal still not found after re-query');
            return;
        }
    }
    
    console.log('Adding active class to batch job modal');
    batchJobModal.classList.add('active');
    console.log('Batch job modal should now be visible');
    
    // Reset form
    if (batchJobForm) {
        batchJobForm.reset();
    } else {
        console.error('Batch job form not found');
        batchJobForm = document.getElementById('batchJobForm');
    }
    
    // Clear files list
    const batchJobFilesList = document.getElementById('batchJobFilesList');
    if (batchJobFilesList) {
        batchJobFilesList.innerHTML = '';
    } else {
        console.error('Batch job files list not found');
    }
}

/**
 * Hide the batch job modal
 */
function hideBatchJobModal() {
    if (!batchJobModal) return;
    
    batchJobModal.classList.remove('active');
}

/**
 * Handle batch job file selection
 * @param {Event} event - The file input change event
 */
function handleBatchJobFileSelection(event) {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const files = Array.from(event.target.files);
    const batchJobFilesList = document.getElementById('batchJobFilesList');
    
    if (!batchJobFilesList) return;
    
    // Add files to list
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'batch-job-file-item';
        
        const fileIcon = document.createElement('span');
        fileIcon.className = 'file-icon';
        fileIcon.textContent = window.utils.getFileIcon(file.type);
        
        const fileName = document.createElement('span');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('span');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.title = 'Remove file';
        removeBtn.onclick = () => {
            fileItem.remove();
        };
        
        fileItem.appendChild(fileIcon);
        fileItem.appendChild(fileName);
        fileItem.appendChild(fileSize);
        fileItem.appendChild(removeBtn);
        
        batchJobFilesList.appendChild(fileItem);
    });
}

/**
 * Format file size for display
 * @param {number} bytes - The file size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a new batch job
 */
function createBatchJob() {
    const batchJobName = document.getElementById('batchJobName');
    const batchJobType = document.getElementById('batchJobType');
    const batchJobFilesList = document.getElementById('batchJobFilesList');
    
    if (!batchJobName || !batchJobType || !batchJobFilesList) return;
    
    const name = batchJobName.value.trim();
    const type = batchJobType.value;
    const fileItems = batchJobFilesList.querySelectorAll('.batch-job-file-item');
    
    if (!name) {
        alert('Please enter a job name');
        return;
    }
    
    if (fileItems.length === 0) {
        alert('Please add at least one file');
        return;
    }
    
    // Create batch job
    const batchJobId = window.utils.generateId();
    const timestamp = new Date();
    
    const batchJob = {
        id: batchJobId,
        name: name,
        type: type,
        status: 'queued',
        progress: 0,
        createdAt: timestamp.toISOString(),
        files: Array.from(fileItems).map(item => ({
            name: item.querySelector('.file-name').textContent,
            size: item.querySelector('.file-size').textContent
        }))
    };
    
    // Add to batch jobs
    window.batchProcessing.batchJobs.push(batchJob);
    window.batchProcessing.currentBatchJobId = batchJobId;
    
    // Save batch jobs
    saveBatchJobs();
    
    // Render batch jobs
    renderBatchJobs();
    
    // Hide modal
    hideBatchJobModal();
    
    // Simulate batch job processing
    simulateBatchJobProcessing(batchJobId);
}

/**
 * Simulate batch job processing
 * @param {string} batchJobId - The batch job ID
 */
function simulateBatchJobProcessing(batchJobId) {
    const batchJob = window.batchProcessing.batchJobs.find(job => job.id === batchJobId);
    if (!batchJob) return;
    
    // Update status
    batchJob.status = 'processing';
    saveBatchJobs();
    renderBatchJobs();
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        
        if (progress <= 100) {
            batchJob.progress = progress;
            saveBatchJobs();
            renderBatchJobs();
        } else {
            clearInterval(interval);
            
            // Complete batch job
            batchJob.status = 'completed';
            batchJob.progress = 100;
            batchJob.completedAt = new Date().toISOString();
            
            saveBatchJobs();
            renderBatchJobs();
            
            // Create artifact for batch job
            createBatchJobArtifact(batchJob);
        }
    }, 1000);
}

/**
 * Create an artifact for a completed batch job
 * @param {Object} batchJob - The batch job
 */
function createBatchJobArtifact(batchJob) {
    if (!window.conversations || typeof window.conversations.renderArtifact !== 'function') return;
    
    // Create a sample artifact based on batch job type
    let artifactContent = '';
    let artifactType = 'text';
    
    if (batchJob.type === 'document-analysis') {
        artifactContent = "# Batch Document Analysis\n\n" +
            `## ${batchJob.name}\n\n` +
            "### Summary\n\n" +
            `Processed ${batchJob.files.length} documents\n\n` +
            "### Key Findings\n\n" +
            "- Finding 1: [simulated finding]\n" +
            "- Finding 2: [simulated finding]\n" +
            "- Finding 3: [simulated finding]\n\n" +
            "### Documents\n\n" +
            batchJob.files.map(file => `- ${file.name}`).join('\n');
        artifactType = 'markdown';
    } else if (batchJob.type === 'data-processing') {
        artifactContent = "# Batch Data Processing\n\n" +
            `## ${batchJob.name}\n\n` +
            "### Summary\n\n" +
            `Processed ${batchJob.files.length} data files\n\n` +
            "### Results\n\n" +
            "| Metric | Value |\n" +
            "|--------|-------|\n" +
            "| Total Records | 1,245 |\n" +
            "| Processed Records | 1,240 |\n" +
            "| Failed Records | 5 |\n" +
            "| Processing Time | 3.5s |\n\n" +
            "### Files\n\n" +
            batchJob.files.map(file => `- ${file.name}`).join('\n');
        artifactType = 'markdown';
    } else if (batchJob.type === 'image-analysis') {
        artifactContent = "# Batch Image Analysis\n\n" +
            `## ${batchJob.name}\n\n` +
            "### Summary\n\n" +
            `Processed ${batchJob.files.length} images\n\n` +
            "### Detected Objects\n\n" +
            "- Object 1: 85% confidence\n" +
            "- Object 2: 92% confidence\n" +
            "- Object 3: 78% confidence\n\n" +
            "### Images\n\n" +
            batchJob.files.map(file => `- ${file.name}`).join('\n');
        artifactType = 'markdown';
    }
    
    if (artifactContent) {
        window.conversations.renderArtifact({
            title: `Batch Job: ${batchJob.name}`,
            content: artifactContent,
            type: artifactType
        });
    }
}

/**
 * Load saved batch jobs from localStorage
 */
function loadSavedBatchJobs() {
    try {
        const savedBatchJobs = localStorage.getItem('kynseyAiBatchJobs');
        if (savedBatchJobs) {
            window.batchProcessing.batchJobs = JSON.parse(savedBatchJobs);
        }
        
        const lastBatchJobId = localStorage.getItem('kynseyAiLastBatchJobId');
        if (lastBatchJobId) {
            window.batchProcessing.currentBatchJobId = lastBatchJobId;
        }
        
        renderBatchJobs();
    } catch (error) {
        console.error('Error loading saved batch jobs:', error);
    }
}

/**
 * Save batch jobs to localStorage
 */
function saveBatchJobs() {
    localStorage.setItem('kynseyAiBatchJobs', JSON.stringify(window.batchProcessing.batchJobs));
    localStorage.setItem('kynseyAiLastBatchJobId', window.batchProcessing.currentBatchJobId);
}

/**
 * Render batch jobs list
 */
function renderBatchJobs() {
    if (!batchJobsList) return;
    
    batchJobsList.innerHTML = '';
    
    if (window.batchProcessing.batchJobs.length === 0) {
        batchJobsList.innerHTML = '<div class="empty-list">No batch jobs</div>';
        return;
    }
    
    // Sort batch jobs by creation date (newest first)
    const sortedJobs = [...window.batchProcessing.batchJobs].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    sortedJobs.forEach(job => {
        const jobItem = document.createElement('div');
        jobItem.className = 'batch-job-item';
        jobItem.dataset.jobId = job.id;
        
        const jobHeader = document.createElement('div');
        jobHeader.className = 'batch-job-header';
        
        const jobName = document.createElement('div');
        jobName.className = 'batch-job-name';
        jobName.textContent = job.name;
        
        const jobStatus = document.createElement('div');
        jobStatus.className = `batch-job-status ${job.status}`;
        jobStatus.textContent = job.status.charAt(0).toUpperCase() + job.status.slice(1);
        
        jobHeader.appendChild(jobName);
        jobHeader.appendChild(jobStatus);
        
        const jobInfo = document.createElement('div');
        jobInfo.className = 'batch-job-info';
        
        const jobType = document.createElement('div');
        jobType.className = 'batch-job-type';
        jobType.textContent = job.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const jobFiles = document.createElement('div');
        jobFiles.className = 'batch-job-files-count';
        jobFiles.textContent = `${job.files.length} file${job.files.length !== 1 ? 's' : ''}`;
        
        const jobDate = document.createElement('div');
        jobDate.className = 'batch-job-date';
        jobDate.textContent = new Date(job.createdAt).toLocaleString();
        
        jobInfo.appendChild(jobType);
        jobInfo.appendChild(jobFiles);
        jobInfo.appendChild(jobDate);
        
        const jobProgress = document.createElement('div');
        jobProgress.className = 'batch-job-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = `${job.progress}%`;
        
        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = `${job.progress}%`;
        
        progressBar.appendChild(progressFill);
        jobProgress.appendChild(progressBar);
        jobProgress.appendChild(progressText);
        
        jobItem.appendChild(jobHeader);
        jobItem.appendChild(jobInfo);
        jobItem.appendChild(jobProgress);
        
        batchJobsList.appendChild(jobItem);
    });
}

/**
 * Add a file to a batch job
 * @param {File} file - The file to add
 * @param {Object} options - Additional options
 */
window.batchProcessing.addFileToBatchJob = function(file, options = {}) {
    // In a real implementation, this would add a file to an existing or new batch job
    // For now, we'll just show the batch job modal
    showBatchJobModal();
}
