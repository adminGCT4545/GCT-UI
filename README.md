# GCT UI (MOBILE VLM)

This repository contains GCT UI with both desktop and mobile versions for interacting with LM Studio.

## Features

- Web-based UI for interacting with LM Studio
- Mobile-optimized responsive interface
- Platform switching (iOS/Android styling)
- Notes functionality with Markdown support
- AI-powered chat interface
- File attachment with drag and drop support
- Camera integration for photo capture
- Containerized for easy deployment

## Prerequisites

- Docker
- Docker Compose (optional, but recommended)

## Quick Start

### Running Locally

1. Clone this repository
2. Navigate to the repository directory
3. Start the development server:

```bash
# Makes the server script executable first time
chmod +x serve.sh

# Start the local server
./serve.sh
```

4. Access the application selector in your browser at: `http://localhost:9091/selector.html`
5. Choose between the Desktop or Mobile version

### Using Docker Compose (Recommended)

1. Clone this repository
2. Navigate to the repository directory
3. Run the application:

```bash
# For Docker Compose V2 (recommended)
docker compose up -d

# For older Docker Compose V1 (if the above doesn't work)
docker-compose up -d
```

4. Access the application in your browser at: `http://localhost:9091`

### Using Docker directly

1. Build the Docker image:

```bash
docker build -t gct-ui-vlm .
```

2. Run the container:

```bash
docker run -d -p 9091:9091 --name gct-ui-vlm gct-ui-vlm
```

3. Access the application in your browser at: `http://localhost:9091`

## Configuration

### API Endpoint

By default, the application connects to the LM Studio API at `http://192.168.1.7:4545/v1/chat/completions`. 

**Important Note:** If you see a 404 error in the browser console, it likely means the LM Studio backend is not running at the configured address. Make sure your LM Studio application is running and accessible at the configured URL.

You can change the API endpoint by modifying the `API_URL` environment variable in the `docker-compose.yml` file:

```yaml
environment:
  - API_URL=http://your-lm-studio-api:4545/v1/chat/completions
```

Or when running with Docker directly:

```bash
docker run -d -p 9091:9091 -e API_URL=http://your-lm-studio-api:4545/v1/chat/completions --name gct-ui-vlm gct-ui-vlm
```

## Troubleshooting

### Connection Issues

1. **404 Error in Console**: If you see a "Failed to load resource: the server responded with a status of 404 (Not Found)" error in your browser console, check that:
   - LM Studio is running on your machine
   - The API URL in the configuration matches where LM Studio is serving its API
   - Your firewall or network settings allow connections to the LM Studio API

2. **Docker Compose Command Not Working**: If you encounter errors with `docker-compose`, try using the Docker Compose V2 command format: `docker compose` (without the hyphen).

## Development

For development purposes, you can uncomment the volume mounts in the `docker-compose.yml` file to enable live updates without rebuilding the container:

```yaml
volumes:
  - ./index.html:/usr/share/nginx/html/index.html
  - ./script.js:/usr/share/nginx/html/script.js
  - ./notes.js:/usr/share/nginx/html/notes.js
  - ./styles.css:/usr/share/nginx/html/styles.css
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
