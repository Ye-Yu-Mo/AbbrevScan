#!/bin/bash

# 配置服务器信息
SERVER_USER=root
SERVER_IP=47.92.242.94
SERVER_PATH=/var/www/html/

# 1. 本地打包
echo ">>> Building project locally..."
cd doc-abbr-web || { echo "Directory not found!"; exit 1; }
npm run build || { echo "Build failed!"; exit 1; }

# 2. 上传 build 文件夹到服务器临时目录
echo ">>> Uploading build folder to server..."
scp -r build/ ${SERVER_USER}@${SERVER_IP}:/tmp/build

# 3. 在服务器上替换网站目录
echo ">>> Deploying on server..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    rm -rf ${SERVER_PATH}/*
    cp -r /tmp/build/* ${SERVER_PATH}/
    rm -rf /tmp/build
    echo "Deployment completed!"
EOF
