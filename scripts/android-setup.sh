#!/bin/bash
# 用于CI/CD环境中初始化Android构建环境

set -e

echo "📱 初始化Android构建环境..."

# 检查是否已存在android目录
if [ ! -d "android" ]; then
    echo "❌ Android目录不存在，请先运行: npx cap add android"
    exit 1
fi

# 确保gradlew可执行
cd android
if [ -f "gradlew" ]; then
    chmod +x gradlew
    echo "✅ gradlew 权限已设置"
else
    echo "❌ gradlew 文件不存在，请确保Android平台已正确初始化"
    exit 1
fi

# 检查并创建必要的目录
mkdir -p app/src/main/assets
mkdir -p app/src/main/res

echo "✅ Android环境准备完成"
