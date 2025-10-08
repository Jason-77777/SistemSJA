FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve stage
FROM node:20-slim

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build

EXPOSE 80

CMD ["serve", "-s", "build", "-l", "80", "--no-clipboard"]