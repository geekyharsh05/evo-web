# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema and config (needed for postinstall)
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Install dependencies (postinstall runs prisma generate)
RUN npm ci

# Copy source files and configs
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and prisma schema (needed for postinstall)
COPY package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Install production dependencies (postinstall runs prisma generate)
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma generated client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built TypeScript files
COPY --from=builder /app/dist ./dist

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the server
CMD ["node", "dist/server.js"]
