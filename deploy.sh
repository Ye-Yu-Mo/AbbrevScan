#!/bin/bash

# 配置服务器信息
SERVER_USER=root
SERVER_IP=47.92.242.94
SERVER_PATH=/var/www/html/
BACKEND_PATH=/root/AbbrevScan/
VENV_PATH=/root/AbbrevScan/venv
UVICORN_PORT=8000

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

    # 停掉旧的 uvicorn 服务（假设用 pkill）
    pkill -f "uvicorn main:app" || echo "No existing uvicorn process."

    # 拉取最新代码
    git pull origin main

    # 激活虚拟环境
    source ${VENV_PATH}/bin/activate

    # 启动 uvicorn 后端服务（生产模式，多进程）
    nohup uvicorn main:app --host 0.0.0.0 --port ${UVICORN_PORT} > server.log 2>&1 &
    echo "后端启动成功!"
EOF

echo ">>> Deployment completed!"
