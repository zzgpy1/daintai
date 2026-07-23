#!/bin/bash
# scripts/ensure-lockfile.sh

set -e

echo "🔍 检查 package-lock.json..."

if [ ! -f package-lock.json ]; then
    echo "⚠️  package-lock.json 不存在，正在生成..."
    npm install --package-lock-only
    echo "✅ package-lock.json 已生成"
else
    echo "✅ package-lock.json 已存在"
fi

# 可选：检查锁文件是否与 package.json 同步
echo "🔍 检查依赖是否同步..."
npm ci --dry-run || {
    echo "⚠️  依赖不同步，请运行 npm install 更新锁文件"
    exit 1
}

echo "✅ 锁文件检查完成"
