# 1. Use Node 20 (slim version to save memory on Railway)
FROM node:20-slim

# 2. Install pnpm globally (required for your workspace)
RUN npm install -g pnpm

# 3. Set the working directory
WORKDIR /app

# 4. Copy the lockfile and workspace config from the ROOT 
# (This is the "Gap" we are filling to make it build safely)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# 5. Copy the api-server files
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/api-server/ ./artifacts/api-server/

# 6. Copy the libraries your bot depends on (from your package.json)
COPY lib/ ./lib/

# 7. Install all dependencies
RUN pnpm install

# 8. Move into the server folder and build
WORKDIR /app/artifacts/api-server
RUN pnpm run build

# 9. Start the bot using your specific start script
CMD ["pnpm", "run", "start"]
