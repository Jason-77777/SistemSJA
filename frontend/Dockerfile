# Step 1: Build tahap frontend
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve hasil build dengan NGINX
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Ekspos port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
