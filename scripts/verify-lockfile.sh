#!/bin/bash
set -e

echo "🔍 检查 package-lock.json..."

if [ ! -f "package-lock.json" ]; then
    echo "⚠️  package-lock.json 不存在，正在生成..."
    npm install --package-lock-only
    if [ ! -f "package-lock.json" ]; then
        echo "❌ 无法生成 package-lock.json"
        exit 1
    fi
    echo "✅ package-lock.json 已生成"
else
    echo "✅ package-lock.json 已存在"
fi

ls -la package-lock.json
echo "📦 Lockfile 大小: $(du -h package-lock.json | cut -f1)"
