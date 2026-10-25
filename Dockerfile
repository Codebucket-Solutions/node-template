# Node 24 LTS, at least 24.22.1 (fixes CVE-2026-111497 and the rest of the October 2026 Node.js security release)
FROM node:24.22.1-slim

# Set the working directory inside the container
WORKDIR /usr/app

# Production install: no dev dependencies, and no git hooks (husky isn't installed; see .husky/install.mjs)
ENV NODE_ENV=production
ENV HUSKY=0

# Set Registry
RUN npm config set registry https://npm.internal.codebuckets.in

# Dependencies first, so they stay cached while only the code changes
COPY package*.json ./
COPY .husky/install.mjs ./.husky/install.mjs
RUN npm ci --omit=dev

# Copy the rest of the application code to the working directory
COPY . .

# The app listens on PORT, 8080 by default (bin/www)
EXPOSE 8080

# Command to start the application
CMD ["npm", "run", "start"]
