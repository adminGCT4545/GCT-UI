// Simple test script for Lucide icons
const { useState, useEffect, useRef } = React;

function IconTest() {
  const [icons, setIcons] = useState([
    'message-circle', 
    'settings', 
    'sticky-note', 
    'bar-chart-2', 
    'chevron-left',
    'x',
    'paperclip',
    'send',
    'plus',
    'camera'
  ]);
  
  const [status, setStatus] = useState('Testing icons...');
  
  // Test if Lucide is properly loaded
  useEffect(() => {
    if (window.lucide) {
      setStatus('Lucide loaded successfully: ' + Object.keys(window.lucide).join(', '));
    } else {
      setStatus('Error: Lucide not loaded!');
    }
  }, []);

  // Custom Icon component for testing
  const TestIcon = ({ name, size = 24 }) => {
    const iconRef = useRef(null);
    
    useEffect(() => {
      if (iconRef.current && window.lucide) {
        // Clear any existing content
        iconRef.current.innerHTML = '';
        
        try {
          // Create the icon
          window.lucide.createIcons({
            icons: { [name]: true },
            attrs: { width: size, height: size },
            elementId: iconRef.current
          });
          console.log(`Icon '${name}' created successfully`);
        } catch (error) {
          console.error(`Error creating icon '${name}':`, error);
          iconRef.current.innerHTML = `<span style="color: red">Error: ${name}</span>`;
        }
      }
    }, [name, size]);

    return (
      <div className="icon-test-container">
        <span ref={iconRef} className="lucide-icon"></span>
        <span className="icon-name">{name}</span>
      </div>
    );
  };

  return (
    <div className="icon-test">
      <h1>Icon Test</h1>
      <p className="status">{status}</p>
      
      <div className="icons-grid">
        {icons.map(iconName => (
          <TestIcon key={iconName} name={iconName} size={32} />
        ))}
      </div>
      
      <div className="navigation">
        <a href="mobile.html">Go to Full Mobile App</a>
        <a href="simple-test.html">Go to Simple Test</a>
      </div>
    </div>
  );
}

// Make it available globally
window.IconTest = IconTest;
