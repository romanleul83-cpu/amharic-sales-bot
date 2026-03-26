# 1. Start with Node 20
FROM node:20-slim

# 2. Install pnpm
RUN npm install -g pnpm

# 3. Set workdir to root
WORKDIR /app

# 4. Copy the workspace configuration and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# 5. Copy ALL the folders the bot needs to function
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# 6. Install everything (This links the Gemini integration to the bot)
RUN pnpm install

# 7. Move into the bot's folder to build it
WORKDIR /app/artifacts/api-server
RUN pnpm run build

# 8. Start the bot
CMD ["pnpm", "run", "start"]
