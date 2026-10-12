#!/bin/bash

# =======================================================
# Sutra: Vedic Journey - macOS & Linux Launcher Script
# =======================================================

echo "🌟 Launching Sutra: Vedic Journey on macOS..."

# Ensure Node.js and npm are available in PATH
if ! command -v node &> /dev/null; then
    # Try sourcing standard NVM or Homebrew paths if not found in current non-interactive shell
    export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"
fi

if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not found in your system PATH."
    echo "👉 Please install Node.js from https://nodejs.org or run 'brew install node'"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo "✅ npm found: $(npm -v)"

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📦 Installing project dependencies..."
    npm install --legacy-peer-deps
else
    echo "📦 Dependencies found."
fi

echo ""
echo "🚀 Starting Frontend (Vite) and Backend (Express API) concurrently..."
echo "🌐 Frontend will be accessible at: http://localhost:5173"
echo "⚙️ Backend API will be running on:  http://localhost:5001"
echo ""

npm run dev
