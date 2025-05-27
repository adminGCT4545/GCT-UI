#!/bin/bash
# Run this script to test the mobile application functionality

# Display header
echo "=================================================="
echo "GCT UI Mobile App Testing Script"
echo "=================================================="
echo ""

# Check port usage
echo "Checking port usage..."
lsof -i :9091 || echo "Port 9091 is available"
echo ""

# Start local server in the background
echo "Starting local server on port 9091..."
python3 -m http.server 9091 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
echo ""

# Wait for server to start
sleep 2

# Ping the server to make sure it's running
echo "Testing server connection..."
curl -s http://localhost:9091 > /dev/null
if [ $? -eq 0 ]; then
    echo "Server is running properly"
else
    echo "ERROR: Server is not responding"
    kill $SERVER_PID
    exit 1
fi
echo ""

# List the key files for verification
echo "Verifying key files..."
FILES=(
    "mobile.html"
    "mobile.js"
    "mobile-init.js"
    "mobile-styles.css"
    "simple-test.html"
    "simple-app.js"
    "icon-test.html"
    "icon-test.js"
    "error-tracking.js"
    "error-styles.css"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ ERROR: $file does not exist"
    fi
done
echo ""

# Open test pages in browser (if available)
echo "Opening test pages in default browser..."
if command -v xdg-open > /dev/null; then
    echo "Opening icon test page..."
    xdg-open http://localhost:9091/icon-test.html
    sleep 2
    echo "Opening simple test page..."
    xdg-open http://localhost:9091/simple-test.html
    sleep 2
    echo "Opening mobile app..."
    xdg-open http://localhost:9091/mobile.html
elif command -v open > /dev/null; then
    echo "Opening icon test page..."
    open http://localhost:9091/icon-test.html
    sleep 2
    echo "Opening simple test page..."
    open http://localhost:9091/simple-test.html
    sleep 2
    echo "Opening mobile app..."
    open http://localhost:9091/mobile.html
else
    echo "No command to open browser available. Please manually open:"
    echo "- http://localhost:9091/icon-test.html"
    echo "- http://localhost:9091/simple-test.html"
    echo "- http://localhost:9091/mobile.html"
fi
echo ""

echo "Test URLs:"
echo "- Icon Test: http://localhost:9091/icon-test.html"
echo "- Simple Test: http://localhost:9091/simple-test.html"
echo "- Mobile App: http://localhost:9091/mobile.html"
echo ""

echo "Press CTRL+C to stop the server when done testing"
wait $SERVER_PID
