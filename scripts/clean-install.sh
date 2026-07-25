#!/bin/bash
# scripts/clean-install.sh

set -e

echo "🧹 Cleaning node_modules and cache..."

# 清理
rm -rf node_modules
rm -rf .cache
rm -f package-lock.json

npm cache clean --force

echo "📦 Fresh install..."

# 安装
npm install --legacy-peer-deps

# 生成 lock 文件
npm install --package-lock-only --legacy-peer-deps

echo "✅ Clean install completed!"
