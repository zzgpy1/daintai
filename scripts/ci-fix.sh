#!/bin/bash
# scripts/ci-fix.sh - CI 环境修复脚本

set -e

echo "🔧 修复 CI 构建环境..."

# 清理 npm 缓存
echo "🧹 清理 npm 缓存..."
npm cache clean --force

# 删除 node_modules 和 package-lock
echo "🗑️ 删除 node_modules 和 package-lock..."
rm -rf node_modules
rm -f package-lock.json

# 设置 npm 配置
echo "⚙️ 设置 npm 配置..."
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false
npm config set legacy-peer-deps true
npm config set no-audit true
npm config set no-fund true

# 安装依赖
echo "📦 安装依赖..."
npm install --no-package-lock --legacy-peer-deps --no-audit --no-fund

echo "✅ 修复完成！"
