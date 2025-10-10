# =============================================================
# DOCKERFILE FINAL v3 (DENGAN FONT)
# =============================================================

FROM node:20-slim

# Tambahkan repository 'contrib' dan 'non-free' untuk bisa menginstal paket font
RUN echo "deb http://deb.debian.org/debian stable main contrib non-free" > /etc/apt/sources.list

# Install dependensi Chromium DAN FONT
RUN apt-get update && \
    apt-get install -yq --no-install-recommends \
    chromium \
    # Font yang umum digunakan (Arial, Times New Roman, dll)
    ttf-mscorefonts-installer \
    # Font fallback yang bagus untuk berbagai karakter
    fonts-noto \
    # Library pendukung chromium
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 && \
    # Terima EULA untuk mscorefonts
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm install

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]