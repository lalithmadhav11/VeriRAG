FROM node:20-alpine

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install dependencies first for better Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
