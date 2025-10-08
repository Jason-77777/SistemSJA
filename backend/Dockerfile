# Gunakan image Node.js resmi
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Copy file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file ke dalam container
COPY . .

# Set variabel environment untuk production
ENV PORT=3000
EXPOSE 3000

# Jalankan server
CMD ["npm", "start"]
