// This script initializes the mobile React app
console.log('Starting app initialization...');
console.log('Window.App:', window.App);

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, attempting to render app...');
    
    try {
        console.log('App render called');
        
        // Use React 18's createRoot API
        const root = ReactDOM.createRoot(document.getElementById('root'));
        
        // Render the App component
        if (window.App) {
            // Render using the globally exposed App component
            root.render(React.createElement(window.App));
            console.log('App rendered successfully');
        } else {
            // Show error if App component isn't available
            console.error('Error: App component not found in window object');
            showErrorMessage('App component not found. Please check if mobile.js is loading correctly.');
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        showErrorMessage(`Error initializing app: ${error.message}`);
    }
    
    // Helper function to display errors to the user
    function showErrorMessage(message) {
        // Create error display element
        const errorDisplay = document.createElement('div');
        errorDisplay.className = 'error-display';
        errorDisplay.innerHTML = `
            <div class="error-message">
                <h3>Something went wrong</h3>
                <p>${message}</p>
                <p>Check the console for more details</p>
                <div style="display:flex;gap:10px;justify-content:center;margin-top:15px;">
                    <button id="reload-app">Reload App</button>
                    <button id="back-to-selector">Back to Selector</button>
                </div>
            </div>
        `;
        
        // Add to the body
        document.body.appendChild(errorDisplay);
        
        // Add event listeners to buttons
        document.getElementById('reload-app')?.addEventListener('click', function() {
            window.location.reload();
        });
        
        document.getElementById('back-to-selector')?.addEventListener('click', function() {
            window.location.href = 'selector.html';
        });
    }
});
