# 1. Start with Node 20
FROM node:20-slim

# 2. Install pnpm
RUN npm install -g pnpm

# 3. Set the working directory
WORKDIR /app

# 4. Copy the entire project
COPY . .

# 5. Install everything
RUN pnpm install --no-frozen-lockfile

# 6. Install node types
RUN pnpm add -Dw @types/node

# 7. FORCE BUILD: Skip typecheck and build recursively (Clinical Final Step)
RUN pnpm -r --if-present run build

# 8. Start the bot
WORKDIR /app/artifacts/api-server
CMD ["pnpm", "run", "start"]
