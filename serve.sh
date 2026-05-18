#!/bin/bash

# SmartSaving Web - 启动服务 + 公网隧道
# 外网朋友通过隧道 URL 即可访问
# 单端口模式：前后端都在 3001 端口

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "================================================"
echo "  SmartSaving Web - 启动服务"
echo "================================================"

# 防止 Mac 休眠（合盖保持在线）
caffeinate -dim &
CAFF_PID=$!

# 杀死旧进程
kill $(lsof -ti:3001) 2>/dev/null
pkill -f "lt --port" 2>/dev/null

# 构建前端
echo "🔨 构建前端..."
cd "$DIR/client" && npx vite build > /dev/null 2>&1

# 启动后端（同时托管前端静态文件）
cd "$DIR/server"
node src/index.js &
echo "✅ 服务已启动 (端口 3001)"

sleep 3

# 启动隧道
echo "⏳ 正在创建公网隧道..."
TUNNEL_URL=$(lt --port 3001 2>&1 | grep "your url" | sed 's/your url is: //')

echo ""
echo "================================================"
echo "  🌍 公网地址: $TUNNEL_URL"
echo "================================================"
echo ""
echo "把上面地址发给朋友就能访问了"
echo "对方第一次打开会看到 'You are about to visit'"
echo "点 'Click to Continue' 即可进入"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

wait
