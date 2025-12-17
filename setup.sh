#!/bin/bash
# Quick start script for development

echo "🚀 Project IMS - Development Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your database credentials"
fi

if [ ! -d node_modules ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

echo "✅ Backend ready"

# Frontend setup
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend
if [ ! -f .env.local ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
fi

if [ ! -d node_modules ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

echo "✅ Frontend ready"

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "To start development:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm start"
echo ""
