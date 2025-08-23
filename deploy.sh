#!/bin/bash

# 配置服务器信息
SERVER_USER=root
SERVER_IP=47.92.242.94
SERVER_PATH=/var/www/html/
BACKEND_PATH=/root/AbbrevScan/
GO_PORT=8000

echo ">>> 构建前端项目..."
cd doc-abbr-web || { echo "未找到前端目录"; exit 1; }
npm run build || { echo "构建失败"; exit 1; }

echo ">>> 上传到服务器..."
scp -r build/ ${SERVER_USER}@${SERVER_IP}:/tmp/build

echo ">>> 部署前端项目..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    rm -rf ${SERVER_PATH}/*
    cp -r /tmp/build/* ${SERVER_PATH}/
    rm -rf /tmp/build
    echo "Front-end deployment completed!"
EOF

echo ">>> 部署后端项目..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    cd ${BACKEND_PATH} || { echo "Backend directory not found!"; exit 1; }

    # 停掉旧的 Go 服务
    pkill -f "abbrevscan-go" || echo "No existing Go process."

    # 拉取最新代码
    git pull origin main

    # 下载 Go 依赖
    go mod download

    # 构建 Go 二进制文件
    go build -o abbrevscan-go

    # 启动 Go 后端服务
    nohup ./abbrevscan-go > server.log 2>&1 &
    echo "Go 后端启动成功!"
EOF

echo ">>> Deployment completed!"
