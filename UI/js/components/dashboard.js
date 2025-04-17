/**
 * Dashboard Module
 * 
 * Handles the dashboard view and data visualization.
 */

// Create a global dashboard object
window.dashboard = {};

// DOM Elements
let documentViewerPlaceholder;
let entityHighlightPlaceholder;
let timeSeriesChartPlaceholder;
let anomalyVizPlaceholder;
let predictiveVizPlaceholder;
let annotationToolbar;

/**
 * Initialize dashboard functionality
 */
window.dashboard.initializeDashboard = function() {
    // Get DOM elements
    documentViewerPlaceholder = document.getElementById('documentViewerPlaceholder');
    entityHighlightPlaceholder = document.getElementById('entityHighlightPlaceholder');
    timeSeriesChartPlaceholder = document.getElementById('timeSeriesChartPlaceholder');
    anomalyVizPlaceholder = document.getElementById('anomalyVizPlaceholder');
    predictiveVizPlaceholder = document.getElementById('predictiveVizPlaceholder');
    annotationToolbar = document.getElementById('annotationToolbar');
    
    // Create elements if they don't exist
    createDashboardElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize with sample data
    updateDashboardWithSampleData();
    
    // Add CSS for dashboard elements if not already present
    addDashboardStyles();
}

/**
 * Add CSS styles for dashboard elements
 */
function addDashboardStyles() {
    // Check if styles already exist
    if (document.getElementById('dashboard-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'dashboard-styles';
    styleElement.textContent = `
        .analysis-dashboard {
            display: none;
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            flex-direction: column;
            gap: 1rem;
        }
        
        .main-content.dashboard-view .analysis-dashboard {
            display: flex;
        }
        
        .dashboard-section {
            background-color: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .dashboard-section-title {
            font-size: 1rem;
            font-weight: bold;
            color: var(--text-primary);
            margin-bottom: 0.75rem;
        }
        
        .chart-placeholder {
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 1rem;
            margin-top: 0.5rem;
        }
        
        .chart-title {
            font-size: 0.9rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .chart-subtitle {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 1rem;
        }
        
        .chart-visualization {
            height: 150px;
            display: flex;
            align-items: flex-end;
            justify-content: space-around;
            margin: 1rem 0;
        }
        
        .chart-bar {
            width: 30px;
            background-color: var(--accent-primary);
            border-radius: 3px 3px 0 0;
            transition: height 0.3s ease;
        }
        
        .chart-line {
            width: 100%;
            height: 2px;
            background-color: var(--accent-primary);
            position: relative;
            margin-top: 75px;
        }
        
        .chart-point {
            width: 8px;
            height: 8px;
            background-color: var(--accent-primary);
            border-radius: 50%;
            position: absolute;
            top: -4px;
        }
        
        .chart-point:nth-child(1) { left: 0%; }
        .chart-point:nth-child(2) { left: 16.6%; }
        .chart-point:nth-child(3) { left: 33.3%; }
        .chart-point:nth-child(4) { left: 50%; }
        .chart-point:nth-child(5) { left: 66.6%; }
        .chart-point:nth-child(6) { left: 83.3%; }
        .chart-point:nth-child(7) { left: 100%; }
        
        .chart-point.anomaly {
            background-color: var(--danger-color);
            width: 10px;
            height: 10px;
            top: -5px;
        }
        
        .chart-area {
            width: 100%;
            height: 100px;
            position: relative;
        }
        
        .chart-line.actual {
            background-color: var(--accent-primary);
            position: absolute;
            top: 30px;
            width: 100%;
            height: 2px;
        }
        
        .chart-line.predicted {
            background-color: var(--warning-color);
            position: absolute;
            top: 60px;
            width: 100%;
            height: 2px;
        }
        
        .chart-legend {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            font-size: 0.8rem;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }
        
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }
        
        .entity-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .entity-item {
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 0.3rem 0.5rem;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }
        
        .entity-badge {
            font-size: 0.7rem;
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
            text-transform: uppercase;
            font-weight: bold;
        }
        
        .entity-badge.person {
            background-color: #e57373;
            color: white;
        }
        
        .entity-badge.organization {
            background-color: #64b5f6;
            color: white;
        }
        
        .entity-badge.location {
            background-color: #81c784;
            color: white;
        }
        
        .entity-badge.date {
            background-color: #ffb74d;
            color: white;
        }
        
        .entity-badge.money {
            background-color: #9575cd;
            color: white;
        }
    `;
    
    document.head.appendChild(styleElement);
}

/**
 * Create dashboard elements if they don't exist
 */
function createDashboardElements() {
    const analysisDashboard = document.getElementById('analysisDashboard');
    if (!analysisDashboard) return;
    
    // Create document viewer placeholder if it doesn't exist
    if (!documentViewerPlaceholder) {
        const docSection = document.createElement('div');
        docSection.className = 'dashboard-section';
        
        const docTitle = document.createElement('div');
        docTitle.className = 'dashboard-section-title';
        docTitle.textContent = 'Document Analysis';
        
        documentViewerPlaceholder = document.createElement('div');
        documentViewerPlaceholder.id = 'documentViewerPlaceholder';
        documentViewerPlaceholder.innerHTML = '<span>No document loaded. Upload one.</span>';
        
        // Create annotation toolbar
        annotationToolbar = document.createElement('div');
        annotationToolbar.id = 'annotationToolbar';
        annotationToolbar.style.display = 'none';
        
        const highlightBtn = document.createElement('button');
        highlightBtn.className = 'tool-btn';
        highlightBtn.title = 'Highlight';
        highlightBtn.innerHTML = '🖌️';
        
        const commentBtn = document.createElement('button');
        commentBtn.className = 'tool-btn';
        commentBtn.title = 'Comment';
        commentBtn.innerHTML = '💬';
        
        const redactBtn = document.createElement('button');
        redactBtn.className = 'tool-btn';
        redactBtn.title = 'Redact';
        redactBtn.innerHTML = '⬛';
        
        annotationToolbar.appendChild(highlightBtn);
        annotationToolbar.appendChild(commentBtn);
        annotationToolbar.appendChild(redactBtn);
        
        documentViewerPlaceholder.appendChild(annotationToolbar);
        
        // Create entity highlight placeholder
        entityHighlightPlaceholder = document.createElement('div');
        entityHighlightPlaceholder.id = 'entityHighlightPlaceholder';
        entityHighlightPlaceholder.innerHTML = 'No entities detected';
        
        docSection.appendChild(docTitle);
        docSection.appendChild(documentViewerPlaceholder);
        docSection.appendChild(entityHighlightPlaceholder);
        
        analysisDashboard.appendChild(docSection);
    }
    
    // Create time series chart placeholder if it doesn't exist
    if (!timeSeriesChartPlaceholder) {
        const dataSection = document.createElement('div');
        dataSection.className = 'dashboard-section';
        
        const dataTitle = document.createElement('div');
        dataTitle.className = 'dashboard-section-title';
        dataTitle.textContent = 'Data Analysis';
        
        timeSeriesChartPlaceholder = document.createElement('div');
        timeSeriesChartPlaceholder.id = 'timeSeriesChartPlaceholder';
        timeSeriesChartPlaceholder.innerHTML = 'Time Series Data Visualization';
        
        anomalyVizPlaceholder = document.createElement('div');
        anomalyVizPlaceholder.id = 'anomalyVizPlaceholder';
        anomalyVizPlaceholder.innerHTML = 'Anomaly Detection';
        
        predictiveVizPlaceholder = document.createElement('div');
        predictiveVizPlaceholder.id = 'predictiveVizPlaceholder';
        predictiveVizPlaceholder.innerHTML = 'Predictive Analysis';
        
        dataSection.appendChild(dataTitle);
        dataSection.appendChild(timeSeriesChartPlaceholder);
        dataSection.appendChild(anomalyVizPlaceholder);
        dataSection.appendChild(predictiveVizPlaceholder);
        
        analysisDashboard.appendChild(dataSection);
    }
}

/**
 * Set up event listeners for dashboard
 */
function setupEventListeners() {
    // Annotation toolbar buttons
    if (annotationToolbar) {
        const toolBtns = annotationToolbar.querySelectorAll('.tool-btn');
        
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle active state
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // In a real implementation, this would activate the corresponding annotation tool
                console.log(`Activated ${btn.title} tool`);
            });
        });
    }
}

/**
 * Update document viewer with a document
 * @param {Object} document - The document to display
 */
window.dashboard.updateDocumentViewer = function(document) {
    if (!documentViewerPlaceholder) return;
    
    if (!document) {
        documentViewerPlaceholder.innerHTML = '<span>No document loaded. Upload one.</span>';
        
        if (annotationToolbar) {
            annotationToolbar.style.display = 'none';
        }
        
        if (entityHighlightPlaceholder) {
            entityHighlightPlaceholder.innerHTML = 'No entities detected';
        }
        
        return;
    }
    
    // Display document (in a real implementation, this would render the actual document)
    documentViewerPlaceholder.innerHTML = '';
    
    const docHeader = document.createElement('div');
    docHeader.className = 'document-header';
    docHeader.textContent = document.name;
    
    const docContent = document.createElement('div');
    docContent.className = 'document-content';
    docContent.innerHTML = 'Document content would be displayed here.';
    
    documentViewerPlaceholder.appendChild(docHeader);
    documentViewerPlaceholder.appendChild(docContent);
    
    // Show annotation toolbar
    if (annotationToolbar) {
        annotationToolbar.style.display = 'flex';
        documentViewerPlaceholder.appendChild(annotationToolbar);
    }
    
    // Update entity highlights
    if (entityHighlightPlaceholder) {
        entityHighlightPlaceholder.innerHTML = `
            <h4>Detected Entities</h4>
            <div class="entity-list">
                <div class="entity-item"><span class="entity-badge person">Person</span> John Smith</div>
                <div class="entity-item"><span class="entity-badge organization">Organization</span> Acme Corp</div>
                <div class="entity-item"><span class="entity-badge location">Location</span> New York</div>
                <div class="entity-item"><span class="entity-badge date">Date</span> January 15, 2025</div>
            </div>
        `;
    }
}

/**
 * Update entity highlights
 * @param {Array} entities - The entities to highlight
 */
window.dashboard.updateEntityHighlights = function(entities) {
    if (!entityHighlightPlaceholder) return;
    
    if (!entities || entities.length === 0) {
        entityHighlightPlaceholder.innerHTML = 'No entities detected';
        return;
    }
    
    let html = '<h4>Detected Entities</h4><div class="entity-list">';
    
    entities.forEach(entity => {
        html += `<div class="entity-item"><span class="entity-badge ${entity.type}">${entity.type}</span> ${entity.text}</div>`;
    });
    
    html += '</div>';
    
    entityHighlightPlaceholder.innerHTML = html;
}

/**
 * Update time series chart
 * @param {Object} timeSeriesData - The time series data
 */
window.dashboard.updateTimeSeriesChart = function(timeSeriesData) {
    if (!timeSeriesChartPlaceholder) return;
    
    if (!timeSeriesData) {
        timeSeriesChartPlaceholder.innerHTML = 'No time series data available';
        return;
    }
    
    // In a real implementation, this would use a charting library like Chart.js
    // For now, we'll just display a placeholder
    timeSeriesChartPlaceholder.innerHTML = `
        <div class="chart-placeholder">
            <div class="chart-title">${timeSeriesData.title || 'Time Series Data'}</div>
            <div class="chart-subtitle">${timeSeriesData.subtitle || 'Data over time'}</div>
            <div class="chart-visualization">
                <div class="chart-bar" style="height: 30%"></div>
                <div class="chart-bar" style="height: 50%"></div>
                <div class="chart-bar" style="height: 80%"></div>
                <div class="chart-bar" style="height: 60%"></div>
                <div class="chart-bar" style="height: 40%"></div>
                <div class="chart-bar" style="height: 70%"></div>
                <div class="chart-bar" style="height: 90%"></div>
            </div>
            <div class="chart-legend">
                <div class="legend-item"><span class="legend-color" style="background-color: #0b84ff"></span> Series 1</div>
            </div>
        </div>
    `;
}

/**
 * Update anomaly visualization
 * @param {Object} anomalyData - The anomaly data
 */
window.dashboard.updateAnomalyVisualization = function(anomalyData) {
    if (!anomalyVizPlaceholder) return;
    
    if (!anomalyData) {
        anomalyVizPlaceholder.innerHTML = 'No anomaly data available';
        return;
    }
    
    // In a real implementation, this would use a visualization library
    // For now, we'll just display a placeholder
    anomalyVizPlaceholder.innerHTML = `
        <div class="chart-placeholder">
            <div class="chart-title">${anomalyData.title || 'Anomaly Detection'}</div>
            <div class="chart-visualization">
                <div class="chart-line">
                    <div class="chart-point"></div>
                    <div class="chart-point"></div>
                    <div class="chart-point anomaly"></div>
                    <div class="chart-point"></div>
                    <div class="chart-point"></div>
                    <div class="chart-point anomaly"></div>
                    <div class="chart-point"></div>
                </div>
            </div>
            <div class="chart-legend">
                <div class="legend-item"><span class="legend-color" style="background-color: #0b84ff"></span> Normal</div>
                <div class="legend-item"><span class="legend-color" style="background-color: #dc3545"></span> Anomaly</div>
            </div>
        </div>
    `;
}

/**
 * Update predictive visualization
 * @param {Object} predictionData - The prediction data
 */
window.dashboard.updatePredictiveVisualization = function(predictionData) {
    if (!predictiveVizPlaceholder) return;
    
    if (!predictionData) {
        predictiveVizPlaceholder.innerHTML = 'No prediction data available';
        return;
    }
    
    // In a real implementation, this would use a visualization library
    // For now, we'll just display a placeholder
    predictiveVizPlaceholder.innerHTML = `
        <div class="chart-placeholder">
            <div class="chart-title">${predictionData.title || 'Predictive Analysis'}</div>
            <div class="chart-visualization">
                <div class="chart-area">
                    <div class="chart-line actual"></div>
                    <div class="chart-line predicted"></div>
                </div>
            </div>
            <div class="chart-legend">
                <div class="legend-item"><span class="legend-color" style="background-color: #0b84ff"></span> Actual</div>
                <div class="legend-item"><span class="legend-color" style="background-color: #ffc107"></span> Predicted</div>
            </div>
        </div>
    `;
}

/**
 * Generate sample data for dashboard
 * @returns {Object} Sample data
 */
function generateSampleData() {
    // Generate sample entities
    const entities = [
        { type: 'person', text: 'John Smith' },
        { type: 'organization', text: 'Acme Corp' },
        { type: 'location', text: 'New York' },
        { type: 'date', text: 'January 15, 2025' },
        { type: 'money', text: '$1,500,000' }
    ];
    
    // Generate sample time series data
    const timeSeriesData = {
        title: 'Monthly Revenue',
        subtitle: 'Last 12 months',
        data: Array.from({ length: 12 }, (_, i) => ({
            label: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
            value: Math.floor(Math.random() * 1000000) + 500000
        }))
    };
    
    // Generate sample anomaly data
    const anomalyData = {
        title: 'System Performance Anomalies',
        data: Array.from({ length: 30 }, (_, i) => ({
            timestamp: new Date(2025, 0, i + 1).toISOString(),
            value: Math.floor(Math.random() * 100) + 50,
            isAnomaly: i === 7 || i === 18 || i === 25
        }))
    };
    
    // Generate sample prediction data
    const predictionData = {
        title: 'Sales Forecast',
        actual: Array.from({ length: 12 }, (_, i) => ({
            label: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
            value: Math.floor(Math.random() * 1000000) + 500000
        })),
        predicted: Array.from({ length: 6 }, (_, i) => ({
            label: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
            value: Math.floor(Math.random() * 1000000) + 600000,
            confidence: Math.random() * 0.3 + 0.7
        }))
    };
    
    return {
        entities,
        timeSeriesData,
        anomalyData,
        predictionData
    };
}

/**
 * Update dashboard with sample data
 */
function updateDashboardWithSampleData() {
    const sampleData = generateSampleData();
    
    // Update entity highlights
    window.dashboard.updateEntityHighlights(sampleData.entities);
    
    // Update time series chart
    window.dashboard.updateTimeSeriesChart(sampleData.timeSeriesData);
    
    // Update anomaly visualization
    window.dashboard.updateAnomalyVisualization(sampleData.anomalyData);
    
    // Update predictive visualization
    window.dashboard.updatePredictiveVisualization(sampleData.predictionData);
}
