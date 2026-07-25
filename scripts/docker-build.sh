#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐳 GlobalRadio Docker 构建脚本${NC}"
echo "============================="

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装${NC}"
    exit 1
fi

# 获取版本号
VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}📦 当前版本: $VERSION${NC}"

# 构建镜像
echo -e "${BLUE}🔨 构建 Docker 镜像...${NC}"
docker build -f docker/Dockerfile -t superneed/global-radio:latest -t superneed/global-radio:$VERSION .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 镜像构建成功${NC}"
else
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
fi

# 显示镜像信息
echo -e "${BLUE}📋 镜像信息:${NC}"
docker images | grep global-radio

# 询问是否推送
read -p "是否推送到 Docker Hub? (y/N): " push
if [[ $push == "y" || $push == "Y" ]]; then
    echo -e "${BLUE}📤 推送镜像到 Docker Hub...${NC}"
    docker push superneed/global-radio:latest
    docker push superneed/global-radio:$VERSION
    echo -e "${GREEN}✅ 推送完成${NC}"
fi

echo -e "${GREEN}🎉 Docker 构建完成!${NC}"
echo ""
echo -e "${BLUE}📝 运行命令:${NC}"
echo "  docker run -d -p 8080:80 --name global-radio superneed/global-radio:latest"
