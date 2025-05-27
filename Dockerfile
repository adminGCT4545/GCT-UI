FROM nginx:alpine

# Copy application files
COPY index.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY notes.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY config.js /usr/share/nginx/html/

# Copy mobile version files
COPY mobile.html /usr/share/nginx/html/
COPY mobile.js /usr/share/nginx/html/
COPY mobile-styles.css /usr/share/nginx/html/
COPY selector.html /usr/share/nginx/html/
COPY MOBILE_README.md /usr/share/nginx/html/

# Configure Nginx to serve on our chosen port
RUN sed -i.bak 's/listen\s*80;/listen 9091;/g' /etc/nginx/conf.d/default.conf

# Expose the port
EXPOSE 9091

# Create a script to inject environment variables
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'echo "window.API_URL = \"${API_URL:-http://192.168.1.7:4545/v1/chat/completions}\";" > /usr/share/nginx/html/config.js' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Make index.html redirect to selector.html
RUN echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; URL=selector.html"></head><body></body></html>' > /usr/share/nginx/html/redirect.html && \
    mv /usr/share/nginx/html/redirect.html /usr/share/nginx/html/index.html.original && \
    mv /usr/share/nginx/html/selector.html /usr/share/nginx/html/index.html

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

# Start Nginx with our custom entrypoint
CMD ["/docker-entrypoint.sh"]
