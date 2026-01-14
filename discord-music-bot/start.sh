#!/bin/bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 22
nvm use 22

# Add current directory to PATH so our wrapper is used
export PATH="$PWD:$HOME/Library/Python/3.14/bin:$PATH"

# Start Bot
echo "🎵 Starting Music Bot..."
npm start
