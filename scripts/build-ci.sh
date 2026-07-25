#!/bin/bash
# scripts/build-ci.sh - CI 环境构建脚本

set -e

echo "🚀 开始 CI 构建..."

# 清理缓存
echo "🧹 清理缓存..."
npm cache clean --force
rm -rf node_modules
rm -f package-lock.json

# 设置 npm 配置
echo "⚙️ 配置 npm..."
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false
npm config set legacy-peer-deps true
npm config set no-audit true
npm config set no-fund true
npm config set package-lock false

# 安装依赖
echo "📦 安装依赖..."
npm install --no-package-lock --legacy-peer-deps --no-audit --no-fund --ignore-scripts

# 构建
echo "🔨 构建项目..."
npx vite build

echo "✅ 构建完成！"
