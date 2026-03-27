# 1. Start with Node 20
FROM node:20-slim

# 2. Install pnpm
RUN npm install -g pnpm

# 3. Set the working directory
WORKDIR /app

# 4. Copy the entire project (Clinical move: ensures nothing is missing)
COPY . .

# 5. Install everything
RUN pnpm install --no-frozen-lockfile

# 6. Build the libraries and the bot
RUN pnpm run build

# 7. Start the bot
WORKDIR /app/artifacts/api-server
CMD ["pnpm", "run", "start"]
