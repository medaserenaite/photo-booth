FROM node:22-slim

# Install python and build tools for native modules (sharp, better-sqlite3)
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace config
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install all dependencies
RUN npm install

# Build client
COPY client/ ./client/
RUN npm run build

# Copy server
COPY server/ ./server/

# Copy frames and scripts
COPY frames/ ./frames/
COPY scripts/ ./scripts/

# Copy env example (actual .env is injected at runtime)
COPY .env.example .env.example

# Create required directories
RUN mkdir -p server/uploads server/data

# Run setup (copies frames, etc.)
RUN node scripts/setup.js

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
