/**
 * Dashboard Module
 * 
 * Handles dashboard functionality for document analysis and visualization.
 */

// DOM Elements
let analysisDashboard;
let documentViewerPlaceholder;
let entityHighlightPlaceholder;
let timeSeriesChartPlaceholder;
let anomalyVizPlaceholder;
let predictiveVizPlaceholder;
let annotationToolbar;

/**
 * Initialize dashboard functionality
 */
export function initializeDashboard() {
    // Get DOM elements
    analysisDashboard = document.getElementById('analysisDashboard');
    documentViewerPlaceholder = document.getElementById('documentViewerPlaceholder');
    entityHighlightPlaceholder = document.getElementById('entityHighlightPlaceholder');
    timeSeriesChartPlaceholder = document.getElementById('timeSeriesChartPlaceholder');
    anomalyVizPlaceholder = document.getElementById('anomalyVizPlaceholder');
    predictiveVizPlaceholder = document.getElementById('predictiveVizPlaceholder');
    annotationToolbar = document.getElementById('annotationToolbar');
    
    // Set up event listeners
    setupEventListeners();
}

/**
 * Set up event listeners for dashboard
 */
function setupEventListeners() {
    // Annotation toolbar buttons
    if (annotationToolbar) {
        const toolButtons = annotationToolbar.querySelectorAll('.tool-btn');
        toolButtons.forEach(button => {
            button.addEventListener('click', () => {
                // In a real implementation, this would activate the selected tool
                // For now, just show an alert
                alert(`${button.textContent} tool selected`);
            });
        });
    }
}

/**
 * Update document viewer with document content
 * @param {Object} document - The document to display
 */
export function updateDocumentViewer(document) {
    if (!documentViewerPlaceholder) return;
    
    // In a real implementation, this would display the document content
    // For now, just show a placeholder
    documentViewerPlaceholder.innerHTML = `
        <div id="annotationToolbar">
            <button class="tool-btn">Highlight</button>
            <button class="tool-btn">Comment</button>
            <button class="tool-btn">Draw</button>
        </div>
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">📄</div>
            <div>${document.name || 'Document'}</div>
            <div style="color: var(--text-muted); font-size: 0.8rem;">${document.type || 'Unknown type'}</div>
        </div>
    `;
    
    // Set up event listeners for the new toolbar
    setupEventListeners();
}

/**
 * Update entity highlights based on extracted entities
 * @param {Array} entities - The extracted entities
 */
export function updateEntityHighlights(entities) {
    if (!entityHighlightPlaceholder) return;
    
    // In a real implementation, this would display the extracted entities
    // For now, just show a placeholder with some sample entities
    
    if (!entities || entities.length === 0) {
        entityHighlightPlaceholder.innerHTML = `
            <span>No entities detected in the document.</span>
        `;
        return;
    }
    
    let entitiesHtml = '<div style="padding: 1rem;">';
    
    // Group entities by type
    const entityTypes = {};
    entities.forEach(entity => {
        if (!entityTypes[entity.type]) {
            entityTypes[entity.type] = [];
        }
        entityTypes[entity.type].push(entity);
    });
    
    // Create entity type sections
    Object.keys(entityTypes).forEach(type => {
        entitiesHtml += `<h4>${type}</h4><ul>`;
        
        entityTypes[type].forEach(entity => {
            entitiesHtml += `<li><span style="background-color: ${getEntityColor(type)}; padding: 2px 5px; border-radius: 3px;">${entity.text}</span> (confidence: ${entity.confidence.toFixed(2)})</li>`;
        });
        
        entitiesHtml += '</ul>';
    });
    
    entitiesHtml += '</div>';
    
    entityHighlightPlaceholder.innerHTML = entitiesHtml;
}

/**
 * Get color for entity type
 * @param {string} type - The entity type
 * @returns {string} The color for the entity type
 */
function getEntityColor(type) {
    const colors = {
        'Person': '#ffcccc',
        'Organization': '#ccffcc',
        'Location': '#ccccff',
        'Date': '#ffffcc',
        'Money': '#ffccff',
        'Percent': '#ccffff',
        'Time': '#ffddcc',
        'Quantity': '#ddffcc',
        'Ordinal': '#ccddff',
        'Cardinal': '#ffccdd',
        'Event': '#ccffdd',
        'Work_Of_Art': '#ddccff',
        'Law': '#ffddcc',
        'Language': '#ccffdd'
    };
    
    return colors[type] || '#eeeeee';
}

/**
 * Update time series chart with time series data
 * @param {Array} timeSeriesData - The time series data
 */
export function updateTimeSeriesChart(timeSeriesData) {
    if (!timeSeriesChartPlaceholder) return;
    
    // In a real implementation, this would display a chart using a library like Chart.js
    // For now, just show a placeholder
    
    if (!timeSeriesData || timeSeriesData.length === 0) {
        timeSeriesChartPlaceholder.textContent = 'No time series data available.';
        return;
    }
    
    // Create a simple ASCII chart
    let min = Math.min(...timeSeriesData.map(d => d.value));
    let max = Math.max(...timeSeriesData.map(d => d.value));
    let range = max - min;
    
    let chartHeight = 10;
    let chartWidth = Math.min(timeSeriesData.length, 30);
    
    let chart = '';
    
    for (let y = 0; y < chartHeight; y++) {
        let row = '';
        let value = max - (y / (chartHeight - 1)) * range;
        
        if (y === 0) {
            row += `${max.toFixed(1)} `;
        } else if (y === chartHeight - 1) {
            row += `${min.toFixed(1)} `;
        } else if (y === Math.floor(chartHeight / 2)) {
            row += `${((max + min) / 2).toFixed(1)} `;
        } else {
            row += '      ';
        }
        
        for (let x = 0; x < chartWidth; x++) {
            let dataIndex = Math.floor((x / chartWidth) * timeSeriesData.length);
            let dataValue = timeSeriesData[dataIndex].value;
            
            if (dataValue >= value && dataValue <= value + (range / chartHeight)) {
                row += '█';
            } else {
                row += ' ';
            }
        }
        
        chart += row + '\n';
    }
    
    timeSeriesChartPlaceholder.innerHTML = `<pre style="font-size: 12px; line-height: 1;">${chart}</pre>`;
}

/**
 * Update anomaly visualization with anomaly data
 * @param {Array} anomalyData - The anomaly data
 */
export function updateAnomalyVisualization(anomalyData) {
    if (!anomalyVizPlaceholder) return;
    
    // In a real implementation, this would display a visualization using a library like D3.js
    // For now, just show a placeholder
    
    if (!anomalyData || anomalyData.length === 0) {
        anomalyVizPlaceholder.textContent = 'No anomaly data available.';
        return;
    }
    
    let anomalyHtml = '<div style="padding: 1rem;">';
    anomalyHtml += '<h4>Detected Anomalies</h4><ul>';
    
    anomalyData.forEach(anomaly => {
        const severity = anomaly.severity || 'medium';
        const color = severity === 'high' ? '#ffcccc' : (severity === 'medium' ? '#ffffcc' : '#ccffcc');
        
        anomalyHtml += `
            <li style="margin-bottom: 0.5rem;">
                <div style="background-color: ${color}; padding: 0.5rem; border-radius: 4px;">
                    <strong>${anomaly.type}</strong>: ${anomaly.description}
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        Severity: ${severity}, Confidence: ${(anomaly.confidence * 100).toFixed(1)}%
                    </div>
                </div>
            </li>
        `;
    });
    
    anomalyHtml += '</ul></div>';
    
    anomalyVizPlaceholder.innerHTML = anomalyHtml;
}

/**
 * Update predictive visualization with prediction data
 * @param {Array} predictionData - The prediction data
 */
export function updatePredictiveVisualization(predictionData) {
    if (!predictiveVizPlaceholder) return;
    
    // In a real implementation, this would display a visualization using a library like D3.js
    // For now, just show a placeholder
    
    if (!predictionData || predictionData.length === 0) {
        predictiveVizPlaceholder.textContent = 'No prediction data available.';
        return;
    }
    
    let predictionHtml = '<div style="padding: 1rem;">';
    predictionHtml += '<h4>Predictions</h4>';
    
    // Create a simple bar chart
    predictionHtml += '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
    
    predictionData.forEach(prediction => {
        const percentage = (prediction.probability * 100).toFixed(1);
        
        predictionHtml += `
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                    <span>${prediction.label}</span>
                    <span>${percentage}%</span>
                </div>
                <div style="width: 100%; background-color: #eee; height: 10px; border-radius: 5px;">
                    <div style="width: ${percentage}%; background-color: var(--accent-primary); height: 10px; border-radius: 5px;"></div>
                </div>
            </div>
        `;
    });
    
    predictionHtml += '</div></div>';
    
    predictiveVizPlaceholder.innerHTML = predictionHtml;
}

/**
 * Generate sample data for dashboard visualizations
 * @returns {Object} Sample data for dashboard visualizations
 */
export function generateSampleData() {
    // Generate sample entities
    const entities = [
        { type: 'Person', text: 'John Smith', confidence: 0.92 },
        { type: 'Person', text: 'Jane Doe', confidence: 0.87 },
        { type: 'Organization', text: 'Acme Corp', confidence: 0.95 },
        { type: 'Organization', text: 'Global Industries', confidence: 0.89 },
        { type: 'Location', text: 'New York', confidence: 0.94 },
        { type: 'Date', text: 'January 15, 2023', confidence: 0.97 },
        { type: 'Money', text: '$1,500,000', confidence: 0.99 }
    ];
    
    // Generate sample time series data
    const timeSeriesData = [];
    for (let i = 0; i < 30; i++) {
        timeSeriesData.push({
            date: new Date(2023, 0, i + 1),
            value: Math.sin(i / 5) * 10 + 20 + Math.random() * 5
        });
    }
    
    // Generate sample anomaly data
    const anomalyData = [
        { type: 'Outlier', description: 'Unusual value detected in financial data', severity: 'high', confidence: 0.88 },
        { type: 'Pattern Break', description: 'Unexpected change in trend', severity: 'medium', confidence: 0.76 },
        { type: 'Seasonal Anomaly', description: 'Deviation from expected seasonal pattern', severity: 'low', confidence: 0.65 }
    ];
    
    // Generate sample prediction data
    const predictionData = [
        { label: 'Category A', probability: 0.65 },
        { label: 'Category B', probability: 0.25 },
        { label: 'Category C', probability: 0.10 }
    ];
    
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
export function updateDashboardWithSampleData() {
    const sampleData = generateSampleData();
    
    updateEntityHighlights(sampleData.entities);
    updateTimeSeriesChart(sampleData.timeSeriesData);
    updateAnomalyVisualization(sampleData.anomalyData);
    updatePredictiveVisualization(sampleData.predictionData);
}
