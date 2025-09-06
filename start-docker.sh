#!/bin/bash

# Script khởi chạy Docker Compose cho ClientOrderSystem
echo "🚀 Starting ClientOrderSystem with Docker Compose..."

# Kiểm tra Docker và Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose chưa được cài đặt!"
    exit 1
fi

# Build và start services
echo "📦 Building containers..."
docker-compose build

echo "🔥 Starting services..."
docker-compose up -d

# Hiển thị status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access URLs:"
echo "  📱 Frontend:  http://localhost:5173"
echo "  🔧 Backend:   http://localhost:3000"
echo "  🖨️  Print:     http://localhost:3003"
echo "  🗄️  PgAdmin:   http://localhost:5050"
echo ""
echo "🔍 Logs command: docker-compose logs -f [service_name]"
echo "🛑 Stop command: docker-compose down"
