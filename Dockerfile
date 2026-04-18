# Build Stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy root lock/config files
COPY package*.json ./

# Install root dependencies (concurrently, etc.)
RUN npm install

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy source code
COPY . .

# Build client
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Only copy built artifacts and backend code
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/package.json ./package.json

# Re-install only production dependencies for the server
WORKDIR /app/server
RUN npm install --only=production

WORKDIR /app
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server/server.js"]
