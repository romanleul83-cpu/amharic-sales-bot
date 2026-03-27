# 1. Start with Node 20
FROM node:20-slim

# 2. Install pnpm
RUN npm install -g pnpm

# 3. Set the working directory
WORKDIR /app

# 4. Copy ONLY the configuration files first (This is the clinical part)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.json ./

# 5. Copy the library and bot folders
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# 6. Install everything
RUN pnpm install --no-frozen-lockfile

# 7. Build the project
RUN pnpm run build

# 8. Start the bot
WORKDIR /app/artifacts/api-server
CMD ["pnpm", "run", "start"]
