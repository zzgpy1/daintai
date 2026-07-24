#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 全球电台 - 一键部署工具${NC}"
echo "========================================="

check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠️ Docker 未安装${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ Docker: $(docker --version)${NC}"
    return 0
}

install_deps() {
    echo -e "${BLUE}📦 安装项目依赖...${NC}"
    npm install
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
}

build_project() {
    echo -e "${BLUE}🔨 构建项目...${NC}"
    npm run build
    echo -e "${GREEN}✓ 项目构建完成${NC}"
}

deploy_web() {
    echo -e "${BLUE}🌐 部署 Web 端...${NC}"
    if check_docker; then
        docker build -t global-radio:latest .
        docker-compose up -d
        echo -e "${GREEN}✓ Docker 部署完成${NC}"
        echo "访问地址: http://localhost"
    else
        WEB_DIR="/var/www/global-radio"
        sudo mkdir -p "$WEB_DIR"
        sudo cp -r dist/* "$WEB_DIR/"
        sudo cp nginx.conf /etc/nginx/sites-available/global-radio
        sudo ln -sf /etc/nginx/sites-available/global-radio /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl restart nginx
        echo -e "${GREEN}✓ Nginx 部署完成${NC}"
    fi
}

build_desktop() {
    echo -e "${BLUE}💻 打包桌面应用...${NC}"
    npm run electron:build
    echo -e "${GREEN}✓ 桌面应用打包完成${NC}"
    echo "输出目录: release/"
}

build_android() {
    echo -e "${BLUE}📱 打包 Android APK...${NC}"
    if ! command -v java &> /dev/null; then
        echo -e "${RED}❌ Java 未安装${NC}"
        return 1
    fi
    npm run android:build
    echo -e "${GREEN}✓ Android APK 打包完成${NC}"
}

show_menu() {
    echo ""
    echo -e "${BLUE}请选择部署方式:${NC}"
    echo "1) 完整部署 (Web + 桌面 + Android)"
    echo "2) 仅 Web 端部署"
    echo "3) 仅桌面应用打包"
    echo "4) 仅 Android APK 打包"
    echo "5) 退出"
    read -p "请输入选项 [1-5]: " choice
    
    case $choice in
        1) install_deps && build_project && deploy_web && build_desktop && build_android ;;
        2) install_deps && build_project && deploy_web ;;
        3) install_deps && build_project && build_desktop ;;
        4) install_deps && build_project && build_android ;;
        5) echo "再见！"; exit 0 ;;
        *) echo -e "${RED}无效选项${NC}"; exit 1 ;;
    esac
}

main() {
    check_node
    show_menu
    echo -e "${GREEN}🎉 部署完成！${NC}"
}

main
