#!/bin/bash
# scripts/generate-lock.sh

echo "🔍 检查 package-lock.json..."

if [ ! -f package-lock.json ]; then
    echo "📦 package-lock.json 不存在，正在生成..."
    
    # 使用 legacy-peer-deps 忽略 peer 依赖冲突
    npm install --package-lock-only --legacy-peer-deps
    
    if [ -f package-lock.json ]; then
        echo "✅ package-lock.json 已生成"
    else
        echo "❌ 无法生成 package-lock.json"
        exit 1
    fi
else
    echo "✅ package-lock.json 已存在"
fi

# 验证 lock 文件是否有效
echo "🔍 验证 package-lock.json 有效性..."
if npm ls --package-lock-only --json > /dev/null 2>&1; then
    echo "✅ package-lock.json 有效"
else
    echo "⚠️ package-lock.json 可能有问题，重新生成..."
    rm -f package-lock.json
    npm install --package-lock-only --legacy-peer-deps
fi

echo "✅ 准备就绪"
