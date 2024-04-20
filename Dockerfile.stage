# Use the node:20-slim image as base
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /usr/app

# Copy the rest of the application code to the working directory
COPY . .

# Install dependencies
RUN npm install

# Expose any necessary ports (if your application listens on any)
# EXPOSE 3000

# Command to start the application
CMD ["npm", "run", "start:stage"]
