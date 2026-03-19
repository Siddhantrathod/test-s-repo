# Use an outdated node image to ensure Trivy finds container vulnerabilities
FROM node:14-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (may have vulnerable versions)
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
