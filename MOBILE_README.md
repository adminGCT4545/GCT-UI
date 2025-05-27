## Mobile UI Features

The mobile version of GCT UI provides:

- Responsive design optimized for mobile devices
- Platform-specific styling for iOS and Android
- Bottom tab navigation for easy access to all features
- Status bar simulation for a native app feel
- Floating action buttons for common tasks
- Gesture support for basic interactions
- Camera integration for capturing images
- File upload with preview and drag-and-drop support

## Development

The mobile version is built using React and designed to be easily extendable. Key files:

- `mobile.js` - Main React components 
- `mobile-styles.css` - Styling for the mobile interface
- `mobile.html` - HTML entry point for the mobile version
- `selector.html` - Version selector page

### Adding New Features

To add new features to the mobile UI:

1. Create a new React component in `mobile.js`
2. Add any necessary styling in `mobile-styles.css`
3. Link your component to the relevant part of the application
