# Use nginx as base image
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy the application files to nginx's default serving directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Create a custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080 (configurable)
EXPOSE 8080

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 