#!/bin/bash
# scripts/install-deps.sh

set -e

echo "📦 Installing dependencies..."

# 检测是否存在 package-lock.json
if [ -f "package-lock.json" ]; then
  echo "✅ package-lock.json found, using npm ci..."
  npm ci --legacy-peer-deps || npm install --legacy-peer-deps
else
  echo "⚠️  package-lock.json not found, using npm install..."
  npm install --legacy-peer-deps
  # 生成 lock 文件
  npm install --package-lock-only --legacy-peer-deps
fi

echo "✅ Dependencies installed successfully!"
