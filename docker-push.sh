#!/bin/bash

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🐳 构建并推送 Docker 镜像${NC}"

# 检查 Docker 登录状态
if ! docker system info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行或未登录${NC}"
    echo "请先运行: docker login"
    exit 1
fi

# 获取版本号
VERSION=${1:-latest}
IMAGE_NAME="superneed/global-radio"

echo -e "${YELLOW}📦 构建镜像: ${IMAGE_NAME}:${VERSION}${NC}"

# 构建镜像
docker build -t ${IMAGE_NAME}:${VERSION} .
docker tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:latest

# 推送镜像
echo -e "${YELLOW}⬆️ 推送镜像到 Docker Hub...${NC}"
docker push ${IMAGE_NAME}:${VERSION}
docker push ${IMAGE_NAME}:latest

echo -e "${GREEN}✅ 镜像推送完成!${NC}"
echo "镜像地址: ${IMAGE_NAME}:${VERSION}"
