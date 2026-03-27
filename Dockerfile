# 1. Use Node 20
FROM node:20-slim

# 2. Install pnpm
RUN npm install -g pnpm

# 3. Set work directory
WORKDIR /app

# 4. Copy everything
COPY . .

# 5. Install all dependencies
RUN pnpm install --no-frozen-lockfile

# 6. Build the DB library first (This is what was missing!)
RUN pnpm --filter "./lib/db" run build

# 7. Now build the main bot
RUN pnpm --filter "@workspace/api-server" run build -- --skipLibCheck

# 8. Start the bot
WORKDIR /app/artifacts/api-server
CMD ["pnpm", "run", "start"]
