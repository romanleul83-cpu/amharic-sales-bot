# 1. Start with Node 20
FROM node:20-slim

# 2. Install pnpm
RUN npm install -g pnpm

# 3. Set the working directory to the very top (Root)
WORKDIR /app

# 4. Copy the "Manager" files from the Root
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# 5. Copy the "Worker" folders and the "Library" folders
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# 6. Install everything (pnpm will link the libraries automatically)
RUN pnpm install

# 7. Move into the bot's folder to build it
WORKDIR /app/artifacts/api-server
RUN pnpm run build

# 8. Start the bot
CMD ["pnpm", "run", "start"]
