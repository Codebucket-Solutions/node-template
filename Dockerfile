# Use Node20 Slim Image
FROM harbor.internal.codebuckets.in/node20/slim

# Set the working directory inside the container
WORKDIR /usr/app

# Copy the rest of the application code to the working directory
COPY . .

# Set Registry
RUN npm set registry https://npm.internal.codebuckets.in

# Install dependencies for production
RUN npm install --production

# Expose any necessary ports (if your application listens on any)
EXPOSE 3000

# Command to start the application
CMD ["npm", "run", "start"]
