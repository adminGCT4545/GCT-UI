// Icons components
const MessageCircle = (props) => <Icon name="message-circle" {...props} />;
const Settings = (props) => <Icon name="settings" {...props} />;
const StickyNote = (props) => <Icon name="sticky-note" {...props} />;
const BarChart2 = (props) => <Icon name="bar-chart-2" {...props} />;
const ChevronLeft = (props) => <Icon name="chevron-left" {...props} />;
const X = (props) => <Icon name="x" {...props} />;
const Paperclip = (props) => <Icon name="paperclip" {...props} />;
const Send = (props) => <Icon name="send" {...props} />;
const Plus = (props) => <Icon name="plus" {...props} />;
const Camera = (props) => <Icon name="camera" {...props} />;

// Context to handle platform-specific styling
const PlatformContext = createContext('ios');

const App = () => {
  const [platform, setPlatform] = useState('ios'); // 'ios' or 'android'
  const [activePanel, setActivePanel] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);

  // Toggle between iOS and Android for demo purposes
  const togglePlatform = () => {
    setPlatform(platform === 'ios' ? 'android' : 'ios');
  };

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hello! Welcome to GCT UI. I'm connected to LM Studio and ready to assist you.",
        suggestions: [
          "What can you help me with?",
          "How do I use LM Studio with this interface?",
          "Tell me about GCT UI features"
        ],
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a message
  const sendMessage = (text = inputText) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    }]);
    
    setInputText('');
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Add AI response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: "I understand your message. In a real environment, I would connect to LM Studio API to provide a more specific response.",
        suggestions: ["Tell me more", "How does that work?", "Can you explain further?"],
        timestamp: new Date()
      }]);
    }, 1500);
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
};
