# Use a lightweight Node.js environment
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only the files needed for installing dependencies
# Note: We assume these exist in artifacts/api-server
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy the rest of your bot's code
COPY . .

# Build the TypeScript project
RUN pnpm build

# Start the bot using the compiled JavaScript
CMD ["node", "dist/index.js"]
