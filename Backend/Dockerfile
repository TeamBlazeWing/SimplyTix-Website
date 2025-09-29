# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create a non-root user and set up directories in one layer
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  mkdir -p uploads && \
  chown -R nodejs:nodejs uploads && \
  chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"]
