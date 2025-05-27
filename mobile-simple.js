// Simple version of the mobile app to ensure functionality
const { useState } = React;

function MobileApp() {
  const [platform, setPlatform] = useState('ios');
  const [messages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! Welcome to GCT UI. I'm connected to LM Studio and ready to assist you."
    }
  ]);
  
  return (
    <div className="app-container">
      <h1>GCT UI Mobile</h1>
      <button onClick={() => setPlatform(platform === 'ios' ? 'android' : 'ios')} className="platform-toggle-btn">
        {platform === 'ios' ? 'Switch to Android' : 'Switch to iOS'}
      </button>
      
      <div className={`mobile-container ${platform}`}>
        <div className="mobile-frame">
          <div className="mobile-content">
            <div className="chat-panel">
              <div className="chat-header">
                <div className="logo">
                  <h2>GCT UI</h2>
                  <p>Green Chip Technology</p>
                </div>
              </div>
              
              <div className="messages-container">
                {messages.map(message => (
                  <div key={message.id} className={`message ${message.type}`}>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
              </div>
              
              <div className="input-area">
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Type your message..."
                  />
                  <button className="send-btn">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Make it available globally - MUST be done BEFORE DOMContentLoaded
window.App = MobileApp;

// Debug log to confirm the component is exposed
console.log('MobileApp component loaded and exposed as:', window.App);
