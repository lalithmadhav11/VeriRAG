FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better Docker layer caching.
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source code.
COPY . .

EXPOSE 8080

CMD ["npm", "start"]
