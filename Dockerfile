# Use nginx:alpine as base image
FROM nginx:alpine

# Copy the static content to nginx's served directory
COPY public /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 