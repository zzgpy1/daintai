#!/bin/bash
# scripts/install-ci.sh - CI 环境安装脚本

set -e

echo "📦 安装依赖..."

# 重试安装
for i in {1..3}; do
  echo "尝试 $i/3..."
  if npm install --no-package-lock --legacy-peer-deps --no-audit --no-fund --ignore-scripts; then
    echo "✅ 安装成功！"
    exit 0
  fi
  echo "❌ 尝试 $i 失败，等待重试..."
  sleep 5
done

echo "❌ 所有尝试都失败！"
exit 1
