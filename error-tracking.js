// Error tracking script for GCT UI Mobile
window.addEventListener('error', function(event) {
  console.error('Global error caught:', {
    message: event.message,
    source: event.filename,
    lineNo: event.lineno,
    colNo: event.colno,
    error: event.error
  });
  
  // Display user-friendly error in UI
  const errorDisplay = document.createElement('div');
  errorDisplay.className = 'error-display';
  errorDisplay.innerHTML = `
    <div class="error-message">
      <h3>Something went wrong</h3>
      <p>${event.message}</p>
      <p>Check the console for more details</p>
      <button id="reload-app">Reload App</button>
    </div>
  `;
  
  document.body.appendChild(errorDisplay);
  
  document.getElementById('reload-app')?.addEventListener('click', function() {
    window.location.reload();
  });
});

// Track React errors that aren't caught by the window error handler
window.addEventListener('DOMContentLoaded', function() {
  if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    console.log('React loaded successfully. Version:', React.version);
    console.log('ReactDOM loaded successfully. Version:', ReactDOM.version);
  } else {
    console.error('React and/or ReactDOM not loaded!');
  }
});

// Check Lucide icons availability
window.addEventListener('load', function() {
  if (typeof window.lucide !== 'undefined') {
    console.log('Lucide loaded successfully:', window.lucide);
  } else {
    console.error('Lucide icons not loaded!');
  }
});
