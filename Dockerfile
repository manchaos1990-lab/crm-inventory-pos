# Use Node.js 20 Alpine for smaller image
FROM node:20-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including native modules that work on Linux)
RUN npm ci --only=production

# Remove build dependencies to reduce image size
RUN apk del python3 make g++

# Copy application code
COPY . .

# Create database directory
RUN mkdir -p db

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server.js"]
