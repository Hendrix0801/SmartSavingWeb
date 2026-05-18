#!/bin/bash
# SmartSaving 一键部署脚本（腾讯云轻量服务器 Ubuntu）
# 用法：在腾讯云服务器上运行此脚本

set -e

echo "================================================"
echo "  SmartSaving 部署脚本"
echo "================================================"

# 1. 安装 Node.js
echo "[1/4] 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs git
node -v
npm -v

# 2. 克隆项目（如果还没上传的话）
# 如果代码已经上传到了服务器，跳过这步
# git clone https://github.com/xxx/SmartSavingWeb.git

# 假设代码在 /root/SmartSavingWeb
cd /root/SmartSavingWeb

# 3. 安装依赖
echo "[2/4] 安装依赖..."
cd server && npm install
cd ../client && npm install && npx vite build
cd ..

# 4. 初始化数据库
echo "[3/4] 初始化数据..."
cd server && node seed.js && cd ..

# 5. 启动服务（使用 pm2 守护进程）
echo "[4/4] 启动服务..."
npm install -g pm2
pm2 start server/src/index.js --name smartsaving
pm2 save
pm2 startup

echo ""
echo "================================================"
echo "  ✅ 部署完成！"
echo "  访问地址: http://服务器IP:3001"
echo "================================================"
echo ""
echo "常用命令:"
echo "  pm2 log smartsaving    # 查看日志"
echo "  pm2 restart smartsaving # 重启服务"
echo "  pm2 stop smartsaving   # 停止服务"
echo ""
