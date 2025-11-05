FROM node:20-alpine AS base

# ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci 
# --omit=dev

COPY src ./src

EXPOSE 3000

CMD ["node", "src/server.js"]
