// Define App and components in global scope to ensure proper initialization
(function(global) {
  console.log('Initializing mobile.js with global React:', !!window.React);
  console.log('Initializing mobile.js with global ReactDOM:', !!window.ReactDOM);
  console.log('Initializing mobile.js with global lucide:', !!window.lucide);

  // Use React from global namespace in browser environment
  const { useState, useEffect, useRef, createContext, useContext } = React;

  // Enable more verbose logging for development
  const DEBUG = true;
  const log = (message, ...args) => {
    if (DEBUG) {
      console.log(`[Mobile UI] ${message}`, ...args);
    }
  };

  // Define icons for use in the browser environment
  function Icon({ name, size = 24 }) {
    const iconRef = useRef(null);
    
    useEffect(() => {
      // Create the icon when the component mounts
      if (iconRef.current && window.lucide) {
        try {
          // Clear any existing content
          iconRef.current.innerHTML = '';
          
          // Create the icon
          window.lucide.createIcons({
            icons: {
              [name]: true
            },
            attrs: {
              width: size,
              height: size
            },
            elementId: iconRef.current
          });
          
          console.log(`Icon '${name}' created successfully`);
        } catch (error) {
          console.error(`Error creating icon '${name}':`, error);
          // Fallback for icon failures
          iconRef.current.innerHTML = `<span style="display:inline-block;width:${size}px;height:${size}px;background:#333;border-radius:4px;"></span>`;
        }
      } else {
        console.warn(`Could not create icon '${name}' - missing ref or lucide library`);
      }
    }, [name, size]);

    return <span ref={iconRef} className="lucide-icon"></span>;
  }

  // Icons components
  function MessageCircle(props) { return <Icon name="message-circle" {...props} />; }
  function Settings(props) { return <Icon name="settings" {...props} />; }
  function StickyNote(props) { return <Icon name="sticky-note" {...props} />; }
  function BarChart2(props) { return <Icon name="bar-chart-2" {...props} />; }
  function ChevronLeft(props) { return <Icon name="chevron-left" {...props} />; }
  function X(props) { return <Icon name="x" {...props} />; }
  function Paperclip(props) { return <Icon name="paperclip" {...props} />; }
  function Send(props) { return <Icon name="send" {...props} />; }
  function Plus(props) { return <Icon name="plus" {...props} />; }
  function Camera(props) { return <Icon name="camera" {...props} />; }

  // Context to handle platform-specific styling
  // Platform context for iOS/Android styling
  const PlatformContext = createContext('ios');
  log('PlatformContext created');

  function App() {
      const [platform, setPlatform] = useState('ios');
      const [activePanel, setActivePanel] = useState('chat');
      const [messages, setMessages] = useState([]);
      const [inputText, setInputText] = useState('');
      const [loading, setLoading] = useState(false);
      const [showFileUpload, setShowFileUpload] = useState(false);
      const messagesEndRef = useRef(null);

      // Expose App component globally as early as possible
      if (!window.App) {
        window.App = App;
        log('App component exposed globally', {
          name: App.name,
          platform,
          activePanel
        });
      }
  
      // Platform detection (could be expanded based on UserAgent)
      useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        let detectedPlatform = 'ios';
        
        if (userAgent.includes('android')) {
          detectedPlatform = 'android';
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
          detectedPlatform = 'ios';
        }
        
        setPlatform(detectedPlatform);
        log('Platform detected', {
          platform: detectedPlatform,
          userAgent
        });
      }, []);
  
      // Welcome message initialization
      useEffect(() => {
        setMessages([{
          id: 1,
          type: 'ai',
          content: "Welcome to GCT UI Mobile. How can I assist you today?",
          suggestions: [
            "Show available features",
            "Get started guide",
            "System requirements"
          ],
          timestamp: new Date()
        }]);
      }, []);
  
      // Message list auto-scroll
      useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);
  
      // Message handling with debug logs
      const sendMessage = async (text = inputText) => {
        log('Sending message', { text, timestamp: new Date() });
        if (!text.trim()) return;
        
        const newMessage = {
          id: Date.now(),
          type: 'user',
          content: text,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setLoading(true);
        log('Message state updated', { messageId: newMessage.id, loading: true });
  
        try {
          // Simulate API interaction
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const aiResponse = {
            id: Date.now() + 1,
            type: 'ai',
            content: "I'm processing your request. This is a simulated response for the mobile interface demo.",
            suggestions: ["Tell me more", "How does this work?", "Show other options"],
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
          console.error('Message processing error:', error);
        } finally {
          setLoading(false);
        }
      };
  
      // Platform toggle for testing
      const togglePlatform = () => {
        setPlatform(p => {
          const newPlatform = p === 'ios' ? 'android' : 'ios';
          log('Platform toggled', { from: p, to: newPlatform });
          return newPlatform;
        });
      };

    return (
      <PlatformContext.Provider value={platform}>
        <div className="app-container">
          {/* Platform toggle button (for demo purposes) */}
          <div className="platform-toggle">
            <button onClick={togglePlatform} className="platform-toggle-btn">
              {platform === 'ios' ? 'Switch to Android' : 'Switch to iOS'}
            </button>
          </div>
          
          <MobileApp 
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            messages={messages}
            inputText={inputText}
            setInputText={setInputText}
            sendMessage={sendMessage}
            loading={loading}
            messagesEndRef={messagesEndRef}
            showFileUpload={showFileUpload}
            setShowFileUpload={setShowFileUpload}
          />
        </div>
      </PlatformContext.Provider>
    );
  }

  function MobileApp({
    activePanel, 
    setActivePanel, 
    messages, 
    inputText, 
    setInputText, 
    sendMessage, 
    loading,
    messagesEndRef,
    showFileUpload,
    setShowFileUpload
  }) {
    const platform = useContext(PlatformContext);
    
    useEffect(() => {
      log('MobileApp mounted', { platform, activePanel });
      return () => log('MobileApp unmounted');
    }, []);

    useEffect(() => {
      log('Panel changed', { from: activePanel, platform });
    }, [activePanel]);
    
    return (
      <div className={`mobile-container ${platform}`}>
        <div className="mobile-frame">
          {/* Status bar - platform specific */}
          <StatusBar platform={platform} />
          
          {/* Mobile app content */}
          <div className="mobile-content">
            {activePanel === 'chat' && (
              <ChatPanel 
                messages={messages} 
                inputText={inputText}
                setInputText={setInputText}
                sendMessage={sendMessage}
                loading={loading}
                messagesEndRef={messagesEndRef}
                showFileUpload={showFileUpload}
                setShowFileUpload={setShowFileUpload}
              />
            )}
            
            {activePanel === 'notes' && <NotesPanel />}
            {activePanel === 'settings' && <SettingsPanel />}
            {activePanel === 'stats' && <StatsPanel />}
            
            {/* Bottom navigation */}
            <BottomNavigation activePanel={activePanel} setActivePanel={setActivePanel} />
          </div>
        </div>
      </div>
    );
  }

  const StatusBar = React.memo(({ platform }) => {
      const [time, setTime] = useState(() =>
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: platform === 'ios'
        })
      );
      
      useEffect(() => {
        const updateTime = () => {
          setTime(new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: platform === 'ios'
          }));
        };
  
        const timer = setInterval(updateTime, 60000);
        return () => clearInterval(timer);
      }, [platform]);
  
      const renderIosStatus = () => (
        <div className="status-bar ios-status">
          <div className="status-bar-time">{time}</div>
          <div className="status-bar-icons">
            <div className="signal-icon"></div>
            <div className="wifi-icon"></div>
            <div className="battery-icon"></div>
          </div>
        </div>
      );
  
      const renderAndroidStatus = () => (
        <div className="status-bar android-status">
          <div className="status-bar-icons-left">
            <div className="signal-icon"></div>
            <div className="wifi-icon"></div>
          </div>
          <div className="status-bar-time">{time}</div>
          <div className="status-bar-icons-right">
            <div className="battery-icon"></div>
          </div>
        </div>
      );
  
      return platform === 'ios' ? renderIosStatus() : renderAndroidStatus();
  });

const ChatPanel = React.memo(({
    messages,
    inputText,
    setInputText,
    sendMessage,
    loading,
    messagesEndRef,
    showFileUpload,
    setShowFileUpload
  }) => {
    const platform = useContext(PlatformContext);
    const [uploadType, setUploadType] = useState('file');
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    const renderHeader = () => (
      <div className="chat-header">
        <div className="logo">
          <h2>GCT UI</h2>
          <p>Green Chip Technology</p>
        </div>
      </div>
    );

    const renderMessages = () => (
      <div className="messages-container">
        {messages.map(message => (
          <Message
            key={message.id}
            message={message}
            sendMessage={sendMessage}
            platform={platform}
          />
        ))}
        {loading && (
          <div className="message ai loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    );

    const renderInputArea = () => (
      <div className="input-area">
        <div className="input-container">
          <div className="attachment-options">
            <button
              className="attachment-btn"
              onClick={() => {
                setUploadType('file');
                setShowFileUpload(true);
              }}
              title="Upload a file"
            >
              <Paperclip size={18} />
            </button>
            <button
              className="camera-btn"
              onClick={() => {
                setUploadType('camera');
                setShowFileUpload(true);
              }}
              title="Take a photo"
            >
              <Camera size={18} />
            </button>
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            aria-label="Message input"
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!inputText.trim()}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    );
    
    return (
      <div className={`chat-panel ${platform}`}>
        {renderHeader()}
        {renderMessages()}
        {renderInputArea()}
        {showFileUpload && (
          <FileUploadModal
            uploadType={uploadType}
            closeModal={() => setShowFileUpload(false)}
          />
        )}
      </div>
    );
});

const Message = React.memo(({ message, sendMessage, platform }) => {
    const { type, content, suggestions, timestamp } = message;
    
    const renderTimestamp = () => {
      if (!timestamp) return null;
      return (
        <span className="message-time">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: platform === 'ios'
          })}
        </span>
      );
    };

    const renderSuggestions = () => {
      if (!suggestions?.length) return null;
      
      return (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.slice(0, 10)}-${index}`}
              className={`suggestion-btn ${platform}`}
              onClick={() => sendMessage(suggestion)}
              aria-label={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      );
    };

    return (
      <div className={`message ${type} ${platform}`} role="listitem">
        <div className="message-content">
          {content}
          {renderTimestamp()}
        </div>
        {renderSuggestions()}
      </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.message.id === nextProps.message.id &&
           prevProps.platform === nextProps.platform;
});

  function NotesPanel() {
    const [notes, setNotes] = useState([
      {
        id: 1,
        title: 'Meeting Notes',
        content: 'Discussed project timeline and resource allocation...',
        tags: ['work', 'meeting'],
        date: '2025-05-15'
      },
      {
        id: 2,
        title: 'Shopping List',
        content: 'Milk, eggs, bread, vegetables...',
        tags: ['personal'],
        date: '2025-05-18'
      }
    ]);
    
    return (
      <div className="notes-panel">
        <div className="notes-header">
          <h2>Notes</h2>
          <button className="new-note-btn">
            <Plus size={18} />
          </button>
        </div>
        
        <div className="notes-search">
          <input type="text" placeholder="Search notes..." />
        </div>
        
        <div className="notes-list">
          {notes.map(note => (
            <div key={note.id} className="note-item">
              <h3 className="note-title">{note.title}</h3>
              <p className="note-preview">{note.content.substring(0, 60)}...</p>
              <div className="note-meta">
                <span className="note-date">{note.date}</span>
                <span className="note-tags">{note.tags.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function SettingsPanel() {
    return (
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Settings</h2>
        </div>
        
        <div className="settings-section">
          <h3>Response Style</h3>
          <div className="radio-option">
            <input type="radio" id="style-professional" name="response-style" value="professional" />
            <label htmlFor="style-professional">Professional</label>
          </div>
          <div className="radio-option">
            <input type="radio" id="style-concise" name="response-style" value="concise" />
            <label htmlFor="style-concise">Concise</label>
          </div>
          <div className="radio-option">
            <input type="radio" id="style-normal" name="response-style" value="normal" defaultChecked />
            <label htmlFor="style-normal">Normal</label>
          </div>
          <div className="radio-option">
            <input type="radio" id="style-creative" name="response-style" value="creative" />
            <label htmlFor="style-creative">Creative</label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Features</h3>
          <div className="checkbox-option">
            <input type="checkbox" id="smart-suggestions" defaultChecked />
            <label htmlFor="smart-suggestions">Show Smart Suggestions</label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Active Model</h3>
          <div className="model-display">llama-3.2-3b-instruct</div>
        </div>
        
        <div className="settings-section">
          <h3>Conversation History</h3>
          <button className="action-button danger">Clear Conversation History</button>
        </div>
      </div>
    );
  }

  function StatsPanel() {
    return (
      <div className="stats-panel">
        <div className="stats-header">
          <h2>Stats</h2>
        </div>
        
        <div className="stats-content">
          <div className="stats-section">
            <h3>Usage Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">1st token</div>
                <div className="stat-value">23.01</div>
                <div className="stat-unit">ms</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Prefill speed</div>
                <div className="stat-value">11.52</div>
                <div className="stat-unit">tokens/s</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Decode speed</div>
                <div className="stat-value">12.33</div>
                <div className="stat-unit">tokens/s</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Latency</div>
                <div className="stat-value">25.52</div>
                <div className="stat-unit">ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function BottomNavigation({ activePanel, setActivePanel }) {
    // Debug navigation interactions
    const handlePanelChange = (newPanel) => {
      log('Navigation clicked', { from: activePanel, to: newPanel });
      setActivePanel(newPanel);
    };
    const platform = useContext(PlatformContext);
    
    return (
      <div className={`bottom-navigation ${platform}`}>
        <div 
          className={`nav-item ${activePanel === 'chat' ? 'active' : ''}`}
          onClick={() => handlePanelChange('chat')}
        >
          <MessageCircle size={20} />
          {platform === 'android' && <span>Chat</span>}
        </div>
        <div 
          className={`nav-item ${activePanel === 'notes' ? 'active' : ''}`}
          onClick={() => handlePanelChange('notes')}
        >
          <StickyNote size={20} />
          {platform === 'android' && <span>Notes</span>}
        </div>
        <div 
          className={`nav-item ${activePanel === 'settings' ? 'active' : ''}`}
          onClick={() => handlePanelChange('settings')}
        >
          <Settings size={20} />
          {platform === 'android' && <span>Settings</span>}
        </div>
        <div 
          className={`nav-item ${activePanel === 'stats' ? 'active' : ''}`}
          onClick={() => handlePanelChange('stats')}
        >
          <BarChart2 size={20} />
          {platform === 'android' && <span>Stats</span>}
        </div>
      </div>
    );
  }

  function FileUploadModal({ uploadType = 'file', closeModal }) {
    const platform = useContext(PlatformContext);
    const [dragActive, setDragActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    
    useEffect(() => {
      // For camera mode, initialize the camera
      if (uploadType === 'camera') {
        log('Initializing camera for file upload');
        initCamera();
      }
      
      // Cleanup function to stop camera when component unmounts
      return () => {
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
        }
      };
    }, [uploadType]);
    
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        setCameraStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          log('Camera stream initialized successfully');
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setCameraError('Could not access camera. Please check permissions.');
      }
    };
    
    const handleCameraCapture = () => {
      if (!videoRef.current) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Get the image as data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      
      // Stop the camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    };
    
    const retakePhoto = () => {
      setCapturedImage(null);
      initCamera();
    };
    
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    };
    
    const handleFiles = (files) => {
      // In a real app, you would process the file here
      log('File selected for upload', {
        name: files[0].name,
        type: files[0].type,
        size: files[0].size
      });
      // Display preview, etc.
    };
    
    const promptFileSelection = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    
    return (
      <div className={`file-upload-modal ${platform}`}>
        <div className="modal-overlay" onClick={closeModal}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{uploadType === 'camera' ? 'Take a Photo' : 'Upload Image'}</h2>
            <button className="close-modal" onClick={closeModal}>
              <X size={20} />
            </button>
          </div>
          
          <div className="modal-body">
            {uploadType === 'file' ? (
              <div 
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={promptFileSelection}
              >
                <p>Drag & drop an image or click to browse</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
            ) : (
              <div className="camera-container">
                {cameraError ? (
                  <div className="camera-error">
                    <p>{cameraError}</p>
                  </div>
                ) : capturedImage ? (
                  <div className="captured-image-container">
                    <img 
                      src={capturedImage} 
                      alt="Captured" 
                      className="captured-image" 
                    />
                  </div>
                ) : (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="camera-preview"
                  />
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button className="cancel-btn" onClick={closeModal}>Cancel</button>
            
            {uploadType === 'camera' ? (
              capturedImage ? (
                <>
                  <button className="retake-btn" onClick={retakePhoto}>Retake</button>
                  <button className="upload-btn">Use Photo</button>
                </>
              ) : (
                <button className="capture-btn" onClick={handleCameraCapture}>
                  Capture
                </button>
              )
            ) : (
              <button className="upload-btn">Upload</button>
            )}
          </div>
        </div>
      </div>
    );
  }

})(window);
