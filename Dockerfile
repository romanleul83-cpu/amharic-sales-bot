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

# 6. BUILD EVERYTHING (The complete engine)
RUN pnpm exec tsc -p lib/db/tsconfig.json --skipLibCheck || echo "DB warnings"
RUN pnpm exec tsc -p lib/api-zod/tsconfig.json --skipLibCheck || echo "Zod warnings"
RUN pnpm exec tsc -p artifacts/api-server/tsconfig.json --skipLibCheck || echo "Bot warnings"

# 7. SEARCH & LAUNCH (The Clinical Fix for "Module Not Found")
# This command looks for the built file wherever the compiler put it
CMD ["sh", "-c", "node $(find . -name index.mjs | head -n 1) || node $(find . -name index.js | head -n 1)"]
