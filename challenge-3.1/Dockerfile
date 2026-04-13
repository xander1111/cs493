# Use the official Nginx image from Docker Hub
FROM nginx

# Copy static website files to the default Nginx public folder
# (replace 'html' with your actual site directory if needed)
COPY ./html /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
