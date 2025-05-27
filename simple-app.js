// Simple version of the mobile app to ensure functionality
const { useState } = React;

function SimpleApp() {
  const [message, setMessage] = useState('Hello from GCT UI Mobile!');
  
  return (
    <div className="simple-app">
      <h1>{message}</h1>
      <button onClick={() => setMessage('The app is working correctly!')}>
        Click me
      </button>
      
      <div className="version-info">
        <p>React version: {React.version}</p>
        <p>Date: {new Date().toLocaleString()}</p>
      </div>
      
      <div className="navigation">
        <a href="mobile.html">Go to Full Mobile App</a>
        <a href="index.html">Go to Desktop Version</a>
      </div>
    </div>
  );
}

// Make it available globally
window.SimpleApp = SimpleApp;
