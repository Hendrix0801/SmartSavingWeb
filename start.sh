#!/bin/bash

# SmartSaving Web - 启动脚本
# Usage: ./start.sh

echo "================================================"
echo "  SmartSaving Web - 智能储蓄管理"
echo "================================================"

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Seed database if needed
echo ""
echo "[1/3] 初始化种子数据..."
cd "$DIR/server"
node seed.js

# Install dependencies if needed
echo ""
echo "[2/3] 安装依赖..."
cd "$DIR/server"
bun install 2>/dev/null || npm install
cd "$DIR/client"
bun install 2>/dev/null || npm install

# Start services
echo ""
echo "[3/3] 启动服务..."
echo ""

# Start backend in background
cd "$DIR/server"
node src/index.js &
SERVER_PID=$!

# Start frontend
cd "$DIR/client"
npx vite --host &
CLIENT_PID=$!

echo ""
echo "================================================"
echo "  🌐 前端: http://localhost:5173"
echo "  ⚙️  后端: http://localhost:3001"
echo "================================================"
echo ""
echo "默认账号:"
echo "  admin / admin123"
echo "  user1 / user123"
echo ""
echo "按 Ctrl+C 停止所有服务"

# Trap Ctrl+C to kill both processes
trap "echo ''; echo '正在停止服务...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for both processes
wait
