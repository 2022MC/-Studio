FROM node:22-bookworm

# Install dependencies for yt-dlp (Python) and audio processing (FFmpeg)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install bot dependencies
RUN npm install --production

# Copy bot source code
COPY . .

# Start the bot
CMD ["npm", "start"]
