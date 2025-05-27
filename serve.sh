#!/bin/bash

# Kill any existing process using port 9091
if command -v lsof &> /dev/null; then
  echo "Checking if port 9091 is already in use..."
  pid=$(lsof -ti:9091)
  if [ -n "$pid" ]; then
    echo "Killing existing process on port 9091 (PID: $pid)"
    kill -9 $pid
  fi
else
  echo "lsof not found, skipping port check"
fi

echo "Starting a simple HTTP server to serve GCT UI..."
echo "You can access the app at http://localhost:9091/mobile.html"
echo "Press Ctrl+C to stop the server."

# Use Python's built-in HTTP server
python3 -m http.server 9091
