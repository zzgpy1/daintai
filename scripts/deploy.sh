#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 开始部署 GlobalRadio..."

# 选择部署环境
echo "选择部署环境:"
echo "1) 生产环境 (production)"
echo "2) 预发布环境 (staging)"
echo "3) 开发环境 (development)"
read -p "请输入选项 [1-3]: " env_choice

case $env_choice in
  1)
    ENV="production"
    DOMAIN="global-radio.com"
    ;;
  2)
    ENV="staging"
    DOMAIN="staging.global-radio.com"
    ;;
  3)
    ENV="development"
    DOMAIN="dev.global-radio.com"
    ;;
  *)
    echo "无效选项"
    exit 1
    ;;
esac

echo "📦 安装依赖..."
npm ci

echo "🔨 构建项目 (环境: $ENV)..."
cp .env.$ENV .env.local
npm run build

echo "📤 部署到服务器..."
rsync -avz --delete dist/ $DEPLOY_USER@$DEPLOY_HOST:/var/www/global-radio-$ENV/

echo "🔄 重启服务..."
ssh $DEPLOY_USER@$DEPLOY_HOST "sudo systemctl restart nginx"

echo "✅ 部署完成!"
echo "访问地址: https://$DOMAIN"
