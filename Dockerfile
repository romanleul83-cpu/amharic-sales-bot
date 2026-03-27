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

# 6. Build the DB library manually (Clinical Fix for missing script)
RUN pnpm exec tsc -p lib/db/tsconfig.json --skipLibCheck

# 7. Build the main bot (Direct compilation)
RUN pnpm exec tsc -p artifacts/api-server/tsconfig.json --skipLibCheck

# 8. Start the bot
WORKDIR /app/artifacts/api-server
CMD ["pnpm", "run", "start"]
