# Dockerfile for NGINX
# This tells Docker how to build the nginx container

# Start from the official NGINX image
# alpine = very small Linux image (only ~40MB)
FROM nginx:alpine

# Copy our custom nginx configuration file
# COPY <file-on-computer> <file-in-container>
# This replaces nginx's default config with ours
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
# This tells Docker: "This container uses port 80"
EXPOSE 80

# NGINX will start automatically when container starts
# (default CMD in nginx:alpine image)
